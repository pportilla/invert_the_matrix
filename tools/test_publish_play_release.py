"""Offline regression tests for the Google Play release helper."""

import copy
from pathlib import Path
import struct
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
import zipfile

import publish_play_release as release


NOTES = [{"language": language, "text": "Release notes"} for language in ("en-US", "es-ES", "fr-FR")]


def track(name, version):
    return {"track": name, "releases": [{"name": "previous", "versionCodes": [str(version)],
                                       "status": "completed", "releaseNotes": NOTES,
                                       "inAppUpdatePriority": 2, "countryTargeting": {"countries": ["ES"], "includeRestOfWorld": True}}]}


def note_elf(build_id=b"test-build-id", sections_only=False, owner=b"GNU\0"):
    header_size = 64 if sections_only else 56
    offset = 64 + header_size
    note = struct.pack("<III", len(owner), len(build_id), 3)
    note += owner + b"\0" * (-len(owner) % 4)
    note += build_id + b"\0" * (-len(build_id) % 4)
    data = bytearray(offset) + note
    data[:6] = b"\x7fELF\x02\x01"
    if sections_only:
        struct.pack_into("<Q", data, 40, 64)
        struct.pack_into("<HH", data, 58, 64, 1)
        struct.pack_into("<IIQQQQIIQQ", data, 64, 0, 7, 0, 0, offset, len(note), 0, 0, 4, 0)
    else:
        struct.pack_into("<Q", data, 32, 64)
        struct.pack_into("<HH", data, 54, 56, 1)
        struct.pack_into("<IIQQQQQQ", data, 64, 4, 0, offset, 0, 0, len(note), len(note), 4)
    return bytes(data)


class PlayReleaseTests(unittest.TestCase):
    def test_preupload_plan_rejects_minimum_api_23_even_if_generic_verification_passes(self):
        manifest = {"applicationId": release.PACKAGE_NAME, "versionCode": "18", "minSdk": "23"}
        args = SimpleNamespace(bundle=Path("unused.aab"), version_code=18)
        with patch.object(release.subprocess, "run", return_value=SimpleNamespace(returncode=0)), \
                patch.object(release.zipfile, "ZipFile"), \
                patch.object(release.verifier, "bundle_manifest", return_value=manifest):
            with self.assertRaisesRegex(RuntimeError, "automatic protection"):
                release.local_plan(args, None)

    def test_reads_gnu_build_id_from_program_notes(self):
        self.assertEqual(release.elf_build_id(note_elf()), b"test-build-id".hex())

    def test_reads_symbol_only_elf_section_notes(self):
        self.assertEqual(release.elf_build_id(note_elf(sections_only=True)), b"test-build-id".hex())

    def test_android_note_is_not_mistaken_for_a_gnu_build_id(self):
        with self.assertRaisesRegex(RuntimeError, "Link with -Wl,--build-id=sha1"):
            release.elf_build_id(note_elf(owner=b"Android\0"))

    def test_rejects_truncated_elf_note_data(self):
        with self.assertRaisesRegex(RuntimeError, "Truncated"):
            release.elf_build_id(note_elf()[:-5])

    def test_rejects_symbols_from_different_native_build(self):
        with tempfile.TemporaryDirectory() as directory:
            bundle, symbols = Path(directory) / "app.aab", Path(directory) / "symbols.zip"
            with zipfile.ZipFile(bundle, "w") as app, zipfile.ZipFile(symbols, "w") as archive:
                for abi in release.verifier.MACHINES:
                    app.writestr(f"base/lib/{abi}/libinvertmatrix.so", note_elf(b"app-build"))
                    archive.writestr(f"{abi}/libinvertmatrix.so", note_elf(b"stale-build", sections_only=True))
            with self.assertRaisesRegex(RuntimeError, "do not match"):
                release.validate_symbols(bundle, symbols)

    def test_release_payload_retains_track_configuration(self):
        current = track("alpha", 12)
        unchanged = copy.deepcopy(current)
        payload = release.track_payload(current, 18, "1.0.16", NOTES)
        self.assertEqual(payload["releases"][0]["versionCodes"], ["18"])
        self.assertEqual(payload["releases"][0]["countryTargeting"], current["releases"][0]["countryTargeting"])
        self.assertEqual(payload["releases"][0]["inAppUpdatePriority"], 2)
        self.assertEqual(current, unchanged)

    def test_never_constructs_new_or_unknown_tracks(self):
        with self.assertRaisesRegex(RuntimeError, "existing"):
            release.track_payload(track("beta", 12), 18, "1.0.16", NOTES)
        with self.assertRaisesRegex(RuntimeError, "never creates"):
            release.check_snapshot([track("production", 17), track("internal", 1)],
                                   {"production": [17], "internal": [1], "alpha": [12]})

    def test_refuses_concurrent_release_change(self):
        with self.assertRaisesRegex(RuntimeError, "production changed"):
            release.check_snapshot([track("production", 19), track("internal", 1), track("alpha", 12)],
                                   {"production": [17], "internal": [1], "alpha": [12]})

    def test_does_not_replace_an_in_progress_rollout(self):
        current = track("production", 17)
        current["releases"][0]["status"] = "inProgress"
        with self.assertRaisesRegex(RuntimeError, "unfinished"):
            release.track_payload(current, 18, "1.0.16", NOTES)

    def test_does_not_discard_multiple_active_releases(self):
        current = track("production", 17)
        current["releases"].append(copy.deepcopy(current["releases"][0]))
        with self.assertRaisesRegex(RuntimeError, "multiple releases"):
            release.track_payload(current, 18, "1.0.16", NOTES)

    def test_changelog_notes_are_complete_for_current_version(self):
        notes = release.notes_for_version((release.ROOT / "CHANGELOG.md").read_text(), 18)
        self.assertEqual([item["language"] for item in notes], ["en-US", "es-ES", "fr-FR"])
        self.assertTrue(all(item["text"] and ";" not in item["text"] for item in notes))

    def test_cannot_reuse_bundle_with_same_version_and_different_bytes(self):
        with self.assertRaisesRegex(RuntimeError, "SHA-256"):
            release.check_bundle({"versionCode": 18, "sha256": "a" * 64},
                                 {"versionCode": 18, "bundleSha256": "b" * 64})

    def test_existing_matching_bundle_is_never_uploaded_again(self):
        state = {"versionCode": 18, "bundleSha256": "a" * 64}
        api = Mock()
        api.request.return_value = {"bundles": [{"versionCode": 18, "sha256": "a" * 64}]}
        edit = {"id": "saved-edit", "bundleUploadAttempted": True}
        with tempfile.TemporaryDirectory() as directory:
            release.ensure_upload(api, state, Path(directory) / "state.json", edit, allow_upload=False)
        api.upload.assert_not_called()
        self.assertTrue(edit["bundleVerified"])

    def test_unknown_upload_outcome_does_not_trigger_duplicate_upload(self):
        state = {"versionCode": 18, "bundleSha256": "a" * 64}
        api = Mock()
        api.request.return_value = {"bundles": []}
        with self.assertRaisesRegex(RuntimeError, "No duplicate upload"):
            release.ensure_upload(api, state, Path("unused"), {"id": "saved", "bundleUploadAttempted": True}, allow_upload=True)
        api.upload.assert_not_called()

    def test_commit_never_cancels_existing_review(self):
        api = release.ReleaseApi(release.PACKAGE_NAME, "test-token-not-a-credential")
        api.request = Mock(return_value={"id": "saved"})
        api.commit_safely("saved")
        self.assertEqual(api.request.call_args.kwargs["params"], {"changesInReviewBehavior": "ERROR_IF_IN_REVIEW"})

    def test_promotion_detects_configuration_change_even_without_new_version(self):
        baseline = {name: track(name, code) for name, code in (("internal", 1), ("alpha", 12), ("production", 17))}
        internal = release.track_payload(baseline["internal"], 18, "1.0.16", NOTES)
        state = {"versionCode": 18, "expectedTracks": {"internal": [1], "alpha": [12], "production": [17]},
                 "edits": {"internal": {"committed": True, "baselineTracks": baseline, "stagedTracks": {"internal": internal}}}}
        current = copy.deepcopy(baseline)
        current["internal"] = internal
        current["production"]["releases"][0]["inAppUpdatePriority"] = 4
        api = Mock()
        api.insert_edit.return_value = "new-edit"
        api.request.return_value = {"tracks": list(current.values())}
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaisesRegex(RuntimeError, "configuration changed"):
                release.ensure_edit(api, state, Path(directory) / "state.json", "promote")

    def test_uncertain_commit_is_not_silently_attempted_again(self):
        state = {"edits": {"internal": {"id": "saved", "commitAttempted": True}}}
        api = Mock()
        api.request.return_value = {"id": "saved"}
        with self.assertRaisesRegex(RuntimeError, "outcome is uncertain"):
            release.ensure_edit(api, state, Path("unused"), "internal")
        api.insert_edit.assert_not_called()
        api.commit_safely.assert_not_called()

    def test_does_not_commit_when_track_readback_still_shows_old_release(self):
        baseline = {name: track(name, code) for name, code in (("internal", 1), ("alpha", 12), ("production", 17))}
        edit = {"id": "saved", "baselineTracks": baseline, "stagedTracks": {}, "symbolsUploaded": True}
        state = {"versionCode": 18, "versionName": "1.0.16", "bundleSha256": "a" * 64,
                 "releaseNotes": NOTES, "edits": {"internal": edit}}
        api = release.ReleaseApi(release.PACKAGE_NAME, "test-token-not-a-credential")

        def request(method, url, **kwargs):
            if method == "PUT":
                return kwargs["json"]
            if url.endswith("/tracks"):
                return {"tracks": list(baseline.values())}
            if url.endswith("/bundles"):
                return {"bundles": [{"versionCode": 18, "sha256": "a" * 64}]}
            return {"id": "saved"}

        api.request = Mock(side_effect=request)
        api.validate_edit = Mock()
        api.commit_safely = Mock()
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaisesRegex(RuntimeError, "has not confirmed"):
                release.publish(api, state, Path(directory) / "state.json", "internal")
        api.validate_edit.assert_not_called()
        api.commit_safely.assert_not_called()


if __name__ == "__main__":
    unittest.main()
