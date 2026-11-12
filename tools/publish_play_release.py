#!/usr/bin/env python3
"""Prepare, test, and promote a verified Play release with resumable edit state.

No command changes Google Play without --commit. A typical release is:
  prepare --expected-track internal=1 --expected-track alpha=12 --expected-track production=17
  prepare --commit
  internal --commit
  promote --commit

The default status command only reads the saved local report. Uploads and edits
remain recorded under android-game/app/build/reports/play-release-VERSION/.
"""

import argparse
import copy
import fcntl
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import struct
import subprocess
import sys
import zipfile

import requests

from upload_play_store_assets import API, UPLOAD_API, PACKAGE_NAME, SERVICE_ACCOUNT, ROOT, PlayApi, access_token, segment


ANDROID = ROOT / "android-game"
TRACKS = ("internal", "alpha", "production")
SPEC = importlib.util.spec_from_file_location("release_verifier", ANDROID / "tools/verify-release.py")
verifier = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(verifier)


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def notes_for_version(text, version_code):
    sections = re.split(r"(?m)^## ", text)
    matches = [section for section in sections if re.search(rf"(?m)^Version code: {version_code}\s*$", section)]
    require(len(matches) == 1, f"Expected one changelog section for versionCode {version_code}")
    require('Localized Play Store "What\'s new":' in matches[0], "Missing localized Play release notes")
    localized = matches[0].split('Localized Play Store "What\'s new":', 1)[1]
    notes = []
    languages = ("en-US", "es-ES", "fr-FR") + (("ko-KR",) if version_code >= 19 else ())
    for language in languages:
        match = re.search(rf"(?ms)^{language}:\s*(.*?)(?=\n\n|\Z)", localized)
        require(match is not None, f"Missing {language} release notes")
        value = " ".join(match[1].split())
        require(0 < len(value) <= 500 and ";" not in value, f"Invalid {language} release notes")
        notes.append({"language": language, "text": value})
    return notes


def note_build_id(data, offset, size):
    cursor, end = offset, offset + size
    require(end <= len(data), "Truncated ELF note table")
    while cursor + 12 <= end:
        name_size, desc_size, kind = struct.unpack_from("<III", data, cursor)
        cursor += 12
        description_start = cursor + ((name_size + 3) & ~3)
        require(description_start + desc_size <= end, "Truncated ELF note contents")
        name = data[cursor:cursor + name_size]
        description = data[description_start:description_start + desc_size]
        cursor = description_start + ((desc_size + 3) & ~3)
        if kind == 3 and name.rstrip(b"\0") == b"GNU" and description:
            return description.hex()
    return None


def elf_build_id(data):
    require(len(data) >= 64 and data[:6] == b"\x7fELF\x02\x01", "Expected a 64-bit ELF symbol library")
    offset = struct.unpack_from("<Q", data, 32)[0]
    size, count = struct.unpack_from("<HH", data, 54)
    require(count == 0 or (size >= 56 and offset + size * count <= len(data)), "Truncated ELF program headers")
    for index in range(count):
        header = struct.unpack_from("<IIQQQQQQ", data, offset + index * size)
        if header[0] == 4:  # PT_NOTE
            build_id = note_build_id(data, header[2], header[5])
            if build_id:
                return build_id
    # Symbol-only ELF files may retain SHT_NOTE without program headers.
    offset = struct.unpack_from("<Q", data, 40)[0]
    size, count = struct.unpack_from("<HH", data, 58)
    require(count == 0 or (size >= 64 and offset + size * count <= len(data)), "Truncated ELF section headers")
    for index in range(count):
        section = struct.unpack_from("<IIQQQQIIQQ", data, offset + index * size)
        if section[1] == 7:  # SHT_NOTE
            build_id = note_build_id(data, section[4], section[5])
            if build_id:
                return build_id
    raise RuntimeError("Native library has no GNU build ID. Link with -Wl,--build-id=sha1 and rebuild the bundle and symbol ZIP")


def validate_symbols(bundle, symbols):
    with zipfile.ZipFile(bundle) as app, zipfile.ZipFile(symbols) as archive:
        expected = {f"{abi}/libinvertmatrix.so" for abi in verifier.MACHINES}
        require({item.filename for item in archive.infolist() if not item.is_dir()} == expected,
                "Native symbol ZIP must contain exactly the game library for both supported ABIs")
        for name in expected:
            require(elf_build_id(archive.read(name)) == elf_build_id(app.read(f"base/lib/{name}")),
                    f"Native symbols do not match the bundle: {name}")


def versions(track):
    return sorted({int(code) for release in track.get("releases", []) for code in release.get("versionCodes", [])})


def track_payload(current, version_code, version_name, notes):
    require(current.get("track") in TRACKS, "Only existing internal, alpha, and production tracks may be updated")
    releases = current.get("releases", [])
    require(len(releases) <= 1, "Track has multiple releases. Review it in Play Console before replacing them")
    require(not releases or releases[0].get("status") == "completed", "Track has an unfinished rollout or draft. Review it before publishing")
    result = copy.deepcopy(current)
    release = copy.deepcopy(releases[0]) if releases else {}
    release.update(name=version_name, versionCodes=[str(version_code)], status="completed", releaseNotes=notes)
    release.pop("userFraction", None)
    result["releases"] = [release]
    return result


def check_snapshot(tracks, expected):
    by_name = {track["track"]: track for track in tracks}
    for name in TRACKS:
        require(name in by_name, f"Expected existing {name} track. This helper never creates tracks")
        require(versions(by_name[name]) == expected[name],
                f"{name} changed: expected {expected[name]}, found {versions(by_name[name])}. Inspect concurrent changes")
    return by_name


def check_bundle(bundle, state):
    require(int(bundle.get("versionCode", -1)) == state["versionCode"], "Play returned an unexpected bundle versionCode")
    require(bundle.get("sha256", "").lower() == state["bundleSha256"], "Play bundle SHA-256 differs from the verified local artifact")


def save(path, state):
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n")
    temporary.replace(path)


class ReleaseApi(PlayApi):
    def edit_url(self, edit_id, tail="", upload=False):
        return f"{UPLOAD_API if upload else API}/applications/{segment(self.package_name)}/edits/{segment(edit_id)}{tail}"

    def upload(self, edit_id, tail, path):
        with path.open("rb") as stream:
            response = requests.post(self.edit_url(edit_id, tail, upload=True), params={"uploadType": "media"},
                                     headers={**self.headers, "Content-Type": "application/octet-stream"}, data=stream, timeout=180)
        require(response.ok, f"Upload failed (HTTP {response.status_code}): {response.text[:1000]}")
        return response.json()

    def commit_safely(self, edit_id):
        # Do not silently cancel an unrelated review (the API's default).
        return self.request("POST", self.edit_url(edit_id, ":commit"),
                            params={"changesInReviewBehavior": "ERROR_IF_IN_REVIEW"})


def local_plan(args, existing):
    result = subprocess.run([sys.executable, str(ANDROID / "tools/verify-release.py"), "--artifact", str(args.bundle)], check=False)
    require(result.returncode == 0, "Release artifact verification failed")
    with zipfile.ZipFile(args.bundle) as archive:
        manifest = verifier.bundle_manifest(archive.read("base/manifest/AndroidManifest.xml"))
    require(manifest["applicationId"] == PACKAGE_NAME, "Unexpected app package")
    require(int(manifest["versionCode"]) == args.version_code, "Built artifact has the wrong requested versionCode")
    require(int(manifest["minSdk"]) >= 24, "This app keeps Play automatic protection enabled, which requires minSdk24 or higher")
    validate_symbols(args.bundle, args.symbols)
    expected = {}
    for item in args.expected_track:
        name, codes = item.split("=", 1)
        require(name in TRACKS and name not in expected, "Expected tracks must be internal, alpha, production, each once")
        expected[name] = sorted(int(code) for code in codes.split(",") if code)
    if not expected and existing:
        expected = existing["expectedTracks"]
    require(set(expected) == set(TRACKS), "Supply --expected-track internal=N --expected-track alpha=N --expected-track production=N")
    require(all(args.version_code > code for codes in expected.values() for code in codes),
            "New versionCode must exceed the expected releases on every track")
    state = {"package": PACKAGE_NAME, "versionCode": args.version_code, "versionName": manifest["versionName"],
             "bundle": str(args.bundle.resolve()), "bundleSha256": sha256(args.bundle),
             "symbols": str(args.symbols.resolve()), "symbolsSha256": sha256(args.symbols),
             "expectedTracks": expected, "releaseNotes": notes_for_version((ROOT / "CHANGELOG.md").read_text(), args.version_code)}
    if args.sha256:
        require(state["bundleSha256"] == args.sha256.lower(), "Artifact does not match --sha256")
    if existing:
        require(all(existing.get(key) == value for key, value in state.items()),
                "Prepared release inputs changed. Keep the original verified artifacts and state for this version")
        return existing
    state.update(edits={}, status="prepared_locally")
    return state


def ensure_edit(api, state, path, stage):
    edit = state["edits"].get(stage)
    if edit:
        require(not edit.get("committed"), f"{stage} is already committed")
        try:
            api.request("GET", api.edit_url(edit["id"]))
        except RuntimeError as error:
            raise RuntimeError(f"Saved edit {edit['id']} is unavailable. Reconcile its outcome in Play Console before proceeding. State retained at {path}") from error
        require(not edit.get("commitAttempted"), "Previous commit outcome is uncertain. Reconcile the saved edit before another commit")
    else:
        edit = {"id": api.insert_edit(), "stage": stage}
        state["edits"][stage] = edit
        save(path, state)  # Persist the ID before any further network operation.
    tracks = api.request("GET", api.edit_url(edit["id"], "/tracks")).get("tracks", [])
    if "baselineTracks" not in edit:
        expected = copy.deepcopy(state["expectedTracks"])
        if stage == "promote":
            expected["internal"] = [state["versionCode"]]
        baseline = check_snapshot(tracks, expected)
        if stage == "promote":
            internal_edit = state["edits"]["internal"]
            for name in TRACKS:
                previous = internal_edit["stagedTracks"].get(name, internal_edit["baselineTracks"][name])
                require(baseline[name] == previous,
                        f"{name} configuration changed since the internal release. Review the saved snapshot before promotion")
        edit["baselineTracks"] = baseline
        edit["stagedTracks"] = {}
        save(path, state)
    else:
        current = {track["track"]: track for track in tracks}
        for name in TRACKS:
            expected_track = edit["stagedTracks"].get(name, edit["baselineTracks"][name])
            if current.get(name) == edit["baselineTracks"][name]:
                # A failed/uncertain PUT made no change. A later explicit command
                # may safely retry the exact saved version and notes.
                edit["stagedTracks"].pop(name, None)
            else:
                require(current.get(name) == expected_track, f"{name} no longer matches the saved edit snapshot")
        save(path, state)
    return edit


def ensure_upload(api, state, path, edit, allow_upload):
    bundles = api.request("GET", api.edit_url(edit["id"], "/bundles")).get("bundles", [])
    found = next((bundle for bundle in bundles if int(bundle["versionCode"]) == state["versionCode"]), None)
    if found:
        check_bundle(found, state)
    else:
        require(allow_upload, "The promoted bundle is missing from Play. Do not upload another copy during promotion")
        require(not edit.get("bundleUploadAttempted"), "Previous bundle upload is not yet visible. Reconcile it before retrying. No duplicate upload was attempted")
        edit["bundleUploadAttempted"] = True
        save(path, state)
        found = api.upload(edit["id"], "/bundles", Path(state["bundle"]))
        check_bundle(found, state)
        # Reconcile against a separate read before making any release changes.
        bundles = api.request("GET", api.edit_url(edit["id"], "/bundles")).get("bundles", [])
        confirmed = next((bundle for bundle in bundles if int(bundle["versionCode"]) == state["versionCode"]), None)
        require(confirmed is not None, "Uploaded bundle is not visible yet. Rerun to reconcile before committing")
        check_bundle(confirmed, state)
    edit["bundleVerified"] = True
    save(path, state)
    if not allow_upload:
        return
    if not edit.get("symbolsUploaded"):
        require(not edit.get("symbolsUploadAttempted"), "Native-symbol upload outcome is uncertain. Reconcile it in Play Console before committing")
        edit["symbolsUploadAttempted"] = True
        save(path, state)
        response = api.upload(edit["id"], f"/apks/{state['versionCode']}/deobfuscationFiles/nativeCode", Path(state["symbols"]))
        require(response.get("deobfuscationFile", {}).get("symbolType") == "nativeCode", "Play did not confirm native symbols")
        edit["symbolsUploaded"] = True
        save(path, state)


def publish(api, state, path, stage):
    if state["edits"].get(stage, {}).get("committed"):
        print(f"{stage} already committed. No changes made")
        return
    if stage == "promote":
        require(state["edits"].get("internal", {}).get("committed"), "Commit and test the internal release before promoting")
    edit = ensure_edit(api, state, path, stage)
    ensure_upload(api, state, path, edit, allow_upload=stage == "internal")
    names = ("internal",) if stage == "internal" else ("production", "alpha")
    for name in names:
        payload = track_payload(edit["baselineTracks"][name], state["versionCode"], state["versionName"], state["releaseNotes"])
        if name not in edit["stagedTracks"]:
            # Persist the intended payload so a lost response can be reconciled by GET.
            edit["stagedTracks"][name] = payload
            save(path, state)
            response = api.request("PUT", api.edit_url(edit["id"], f"/tracks/{name}"), json=payload)
            edit["stagedTracks"][name] = response
            save(path, state)
    # Confirm the exact server state after all writes and before committing.
    ensure_edit(api, state, path, stage)
    for name in names:
        confirmed = edit["stagedTracks"].get(name)
        require(confirmed is not None and versions(confirmed) == [state["versionCode"]],
                f"{name} has not confirmed the requested release. No commit was attempted")
        releases = confirmed.get("releases", [])
        require(len(releases) == 1 and releases[0].get("status") == "completed"
                and releases[0].get("name") == state["versionName"]
                and sorted(releases[0].get("releaseNotes", []), key=lambda note: note["language"])
                == sorted(state["releaseNotes"], key=lambda note: note["language"]),
                f"{name} release metadata differs from the prepared plan. No commit was attempted")
    api.validate_edit(edit["id"])
    edit["commitAttempted"] = True
    save(path, state)
    try:
        response = api.commit_safely(edit["id"])
    except RuntimeError as error:
        if "CHANGES_ALREADY_IN_REVIEW" in str(error) or "changes in review" in str(error).lower():
            edit["commitAttempted"] = False
            state["status"] = f"{stage}_blocked_by_existing_review"
            save(path, state)
        raise
    edit.update(committed=True, commitResponse=response)
    state["status"] = f"{stage}_committed"
    save(path, state)
    print(f"Committed {stage} edit {edit['id']} for versionCode {state['versionCode']}")
    print("Google Play review and availability may still be pending. Check Publishing overview.")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("command", nargs="?", choices=("status", "prepare", "internal", "promote"), default="status")
    parser.add_argument("--commit", action="store_true", help="Allow the requested Google Play upload/track changes")
    parser.add_argument("--version-code", type=int, default=int(verifier.gradle_expectations(ANDROID / "app/build.gradle", "release")["versionCode"]))
    parser.add_argument("--bundle", type=Path, default=ANDROID / "app/build/outputs/bundle/release/app-release.aab")
    parser.add_argument("--symbols", type=Path, default=ANDROID / "app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip")
    parser.add_argument("--sha256", help="Optional expected AAB SHA-256")
    parser.add_argument("--expected-track", action="append", default=[], metavar="TRACK=VERSION", help="Required baseline for each of internal, alpha, production on first prepare")
    parser.add_argument("--service-account", type=Path, default=SERVICE_ACCOUNT)
    args = parser.parse_args(argv)
    directory = ANDROID / "app/build/reports" / f"play-release-{args.version_code}"
    path = directory / "state.json"
    if args.command == "status":
        require(not args.commit, "status never commits")
        print(path.read_text() if path.exists() else f"No prepared release report at {path}")
        return 0
    directory.mkdir(parents=True, exist_ok=True)
    with (directory / "state.lock").open("w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        state = json.loads(path.read_text()) if path.exists() else None
        require(args.command == "prepare" or state is not None, "Run prepare before changing a track")
        state = local_plan(args, state)
        save(path, state)
        print(f"Plan: {state['versionName']} ({state['versionCode']}), SHA-256 {state['bundleSha256']}")
        print(f"Report: {path}")
        if not args.commit:
            print(json.dumps({"command": args.command, "baseline": state["expectedTracks"], "releaseNotes": state["releaseNotes"]}, indent=2, ensure_ascii=False))
            print("No Google Play changes made. Add --commit to execute this command.")
            return 0
        api = ReleaseApi(PACKAGE_NAME, access_token(args.service_account))
        if args.command == "prepare":
            edit = ensure_edit(api, state, path, "internal")
            ensure_upload(api, state, path, edit, allow_upload=True)
            print(f"Uploaded and verified bundle and symbols in saved edit {edit['id']}. No tracks committed")
        else:
            publish(api, state, path, args.command)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (RuntimeError, OSError, ValueError, KeyError, requests.RequestException, struct.error, zipfile.BadZipFile) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)
