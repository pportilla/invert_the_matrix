"""Regression tests for rejection paths in the release artifact gate.

Run with python3 -m unittest discover -s tools -p 'test_verify_release.py'.
"""

import importlib.util
from pathlib import Path
import struct
import tempfile
import unittest
from unittest.mock import patch
import zipfile


SPEC = importlib.util.spec_from_file_location("verify_release", Path(__file__).with_name("verify-release.py"))
verify = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(verify)


def integer(value):
    output = bytearray()
    while value > 127:
        output.append((value & 127) | 128)
        value >>= 7
    output.append(value)
    return bytes(output)


def field(number, value):
    if isinstance(value, int):
        return integer(number << 3) + integer(value)
    if isinstance(value, str):
        value = value.encode()
    return integer((number << 3) | 2) + integer(len(value)) + value


def element(name, attrs, children=()):
    data = field(3, name)
    for namespace, key, value in attrs:
        data += field(4, field(1, namespace) + field(2, key) + field(3, value))
    for child in children:
        data += field(5, child)
    return field(1, data)


def library(alignment=16384, machine=183, address=0, relro_end=None):
    count = 1 if relro_end is None else 2
    data = bytearray(64 + 56 * count)
    data[:6] = b"\x7fELF\x02\x01"
    struct.pack_into("<HH", data, 16, 3, machine)
    struct.pack_into("<Q", data, 32, 64)
    struct.pack_into("<HH", data, 54, 56, count)
    struct.pack_into("<IIQQQQQQ", data, 64, 1, 5, 0, address, 0, len(data), len(data), alignment)
    if relro_end is not None:
        struct.pack_into("<IIQQQQQQ", data, 120, 0x6474E552, 4, 0, 0, 0, 0, relro_end, 1)
    return bytes(data)


class ReleaseGateTests(unittest.TestCase):
    def test_reads_built_bundle_manifest(self):
        ns = verify.ANDROID_NS
        manifest = element("manifest", [("", "package", "game.test"),
                           (ns, "versionCode", "18"), (ns, "versionName", "1.0.16")], [
            element("uses-sdk", [(ns, "minSdkVersion", "23"), (ns, "targetSdkVersion", "36")]),
            element("application", [(ns, "debuggable", "false")])])
        actual = verify.bundle_manifest(manifest)
        self.assertEqual(actual["targetSdk"], "36")
        self.assertEqual(actual["applicationId"], "game.test")
        self.assertFalse(actual["debuggable"])

    def test_reads_compiled_integer_when_raw_manifest_value_is_absent(self):
        compiled = field(7, field(6, 36))  # Item.prim.int_decimal_value
        attr = field(1, verify.ANDROID_NS) + field(2, "targetSdkVersion") + field(6, compiled)
        node = field(1, field(3, "uses-sdk") + field(4, attr))
        self.assertEqual(verify.xml_element(node)[1][(verify.ANDROID_NS, "targetSdkVersion")], "36")

    def test_rejects_truncated_protobuf(self):
        with self.assertRaises(verify.VerificationError):
            verify.protobuf(b"\x0a\x10short")

    def test_rejects_old_target_even_when_gradle_matches_it(self):
        actual = dict(targetSdk="35", versionCode="18", debuggable=False)
        with self.assertRaisesRegex(verify.VerificationError, "at least 36"):
            verify.check_metadata(actual, {"targetSdk": "35"}, 36, True)

    def test_rejects_stale_artifact(self):
        actual = dict(targetSdk="36", versionCode="17", debuggable=False)
        with self.assertRaisesRegex(verify.VerificationError, "Rebuild"):
            verify.check_metadata(actual, {"versionCode": "18"}, 36, True)

    def test_rejects_debuggable_release(self):
        actual = dict(targetSdk="36", versionCode="18", debuggable=True)
        with self.assertRaisesRegex(verify.VerificationError, "debuggable"):
            verify.check_metadata(actual, {}, 36, True)
        verify.check_metadata(actual, {}, 36, False)

    def test_protected_play_release_requires_minimum_api_24(self):
        actual = dict(targetSdk="36", versionCode="18", minSdk="23", debuggable=False)
        with self.assertRaisesRegex(verify.VerificationError, "minSdk24"):
            verify.check_metadata(actual, {}, 36, True)
        actual["minSdk"] = "24"
        verify.check_metadata(actual, {}, 36, True)

    def test_rejects_bundle_config_that_would_generate_4kb_apks(self):
        with self.assertRaisesRegex(verify.VerificationError, "16KB"):
            verify.bundle_alignment(field(2, field(2, field(1, 1) + field(2, 1))))
        self.assertEqual(verify.bundle_alignment(field(2, field(2, field(1, 1) + field(2, 2)))), 16384)

    def test_accepts_16kb_and_64kb_elf_load_alignment(self):
        self.assertEqual(verify.elf_alignment(library(), "arm64-v8a"), 16384)
        self.assertEqual(verify.elf_alignment(library(65536, 62), "x86_64"), 65536)

    def test_rejects_4kb_elf_load_alignment(self):
        with self.assertRaisesRegex(verify.VerificationError, "LOAD alignment"):
            verify.elf_alignment(library(4096), "arm64-v8a")

    def test_rejects_wrong_architecture_and_misaligned_segments(self):
        for data, message in [(library(machine=62), "architecture"),
                              (library(address=4096), "offset/address"),
                              (library(relro_end=4096), "RELRO")]:
            with self.subTest(message=message), self.assertRaisesRegex(verify.VerificationError, message):
                verify.elf_alignment(data, "arm64-v8a")

    def test_rejects_missing_elf_program_headers(self):
        with self.assertRaisesRegex(verify.VerificationError, "truncated"):
            verify.elf_alignment(library()[:64], "arm64-v8a")

    def test_rejects_unsigned_entry_even_if_jarsigner_verifies_other_entries(self):
        # A correctly signed manifest alone must not hide an added unsigned file.
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "test.aab"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("base/manifest/AndroidManifest.xml", "unsigned")
            with zipfile.ZipFile(path) as archive, patch.object(verify, "jdk_tool", return_value=["jarsigner"]), \
                    patch.object(verify, "run_tool", return_value=(0, "jar verified.\n")):
                with self.assertRaisesRegex(verify.VerificationError, "unverified entries"):
                    verify.check_bundle_signature(path, archive, True)

    def test_rejects_failed_signature_verification(self):
        with patch.object(verify, "jdk_tool", return_value=["jarsigner"]), \
                patch.object(verify, "run_tool", return_value=(1, "Invalid signature file digest")):
            with self.assertRaisesRegex(verify.VerificationError, "signature verification failed"):
                verify.check_bundle_signature(Path("unused"), None, True)

    def test_rejects_expired_future_and_debug_upload_certificates(self):
        cases = [
            ("Release", "Sat Jan 01 00:00:00 UTC 2000", "Sun Jan 01 00:00:00 UTC 2017", "expired"),
            ("Release", "Fri Jan 01 00:00:00 UTC 2100", "Sat Jan 01 00:00:00 UTC 2101", "not yet valid"),
            ("Android Debug", "Sat Jan 01 00:00:00 UTC 2000", "Fri Jan 01 00:00:00 UTC 2100", "debug signing key"),
        ]
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "test.aab"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("base/manifest/AndroidManifest.xml", "signed")
            output = "sm 6 Thu Jan 01 00:00:00 UTC 1981 base/manifest/AndroidManifest.xml\njar verified, with signer errors.\n"
            for owner, start, end, error in cases:
                certificate = f"Owner: CN={owner}, O=Android\nValid from: {start} until: {end}\nSHA256: {'AB' * 32}\n"
                with self.subTest(owner=owner, start=start), zipfile.ZipFile(path) as archive, \
                        patch.object(verify, "jdk_tool", return_value=["tool"]), \
                        patch.object(verify, "run_tool", side_effect=[(4, output), (0, certificate)]):
                    with self.assertRaisesRegex(verify.VerificationError, error):
                        verify.check_bundle_signature(path, archive, True)

    def test_rejects_apk_debug_certificate_at_end_of_dn(self):
        output = "Verifies\nV2 Signer: certificate DN: C=US, O=Android, CN=Android Debug\n"
        output += f"V2 Signer: certificate SHA-256 digest: {'ab' * 32}\n"
        with patch.object(verify, "sdk_tool", return_value="apksigner"), \
                patch.object(verify, "run_tool", return_value=(0, output)):
            with self.assertRaisesRegex(verify.VerificationError, "debug signing key"):
                verify.check_apk_signature(Path("unused"), Path("unused"), True)

    def test_apk_certificate_identity_excludes_play_source_stamp(self):
        output = f"V3.0 Signer: certificate SHA-256 digest: {'ab' * 32}\n"
        output += f"Source Stamp Signer: certificate SHA-256 digest: {'cd' * 32}\n"
        with patch.object(verify, "sdk_tool", return_value="apksigner"), \
                patch.object(verify, "run_tool", return_value=(0, output)):
            self.assertEqual(verify.check_apk_signature(Path("unused"), Path("unused"), True), ['ab' * 32])

    def test_reads_pinned_build_tools_36_apksigner_format(self):
        output = f"Signer #1 certificate SHA-256 digest: {'ab' * 32}\n"
        with patch.object(verify, "sdk_tool", return_value="apksigner"), \
                patch.object(verify, "run_tool", return_value=(0, output)):
            self.assertEqual(verify.check_apk_signature(Path("unused"), Path("unused"), False), ['ab' * 32])


if __name__ == "__main__":
    unittest.main()
