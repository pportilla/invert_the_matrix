#!/usr/bin/env python3
"""Verify the built Android artifact before uploading it to Google Play.

Only Python's standard library is needed. AAB signature verification uses the
JDK's jarsigner/keytool. APK inspection uses Android SDK aapt2/apksigner/zipalign.
No credentials are read, no devices are accessed, and nothing is uploaded.
"""

import argparse
import datetime
import hashlib
import os
from pathlib import Path
import re
import shutil
import struct
import subprocess
import sys
import zipfile


ROOT = Path(__file__).resolve().parents[1]
ANDROID_NS = "http://schemas.android.com/apk/res/android"
PAGE_SIZE = 16384
MACHINES = {"arm64-v8a": 183, "x86_64": 62}


class VerificationError(Exception):
    pass


def require(condition, message):
    if not condition:
        raise VerificationError(message)


def varint(data, offset):
    value = 0
    for shift in range(0, 70, 7):
        require(offset < len(data), "Truncated protobuf varint")
        byte = data[offset]
        offset += 1
        value |= (byte & 127) << shift
        if not byte & 128:
            return value, offset
    raise VerificationError("Invalid protobuf varint")


def protobuf(data):
    """Read only the protobuf wire types needed by AAPT2 and BundleConfig."""
    fields = {}
    offset = 0
    while offset < len(data):
        tag, offset = varint(data, offset)
        number, wire_type = tag >> 3, tag & 7
        require(number > 0, "Invalid protobuf field")
        if wire_type == 0:
            value, offset = varint(data, offset)
        elif wire_type in (1, 2, 5):
            if wire_type == 2:
                length, offset = varint(data, offset)
            else:
                length = 8 if wire_type == 1 else 4
            require(offset + length <= len(data), "Truncated protobuf field")
            value = data[offset:offset + length]
            offset += length
        else:
            raise VerificationError(f"Unsupported protobuf wire type {wire_type}")
        fields.setdefault(number, []).append(value)
    return fields


def first(fields, number, default=b""):
    return fields.get(number, [default])[0]


def xml_element(node):
    # AOSP tools/aapt2/Resources.proto: XmlNode.element=1, XmlElement
    # name=3, attribute=4, child=5. XmlAttribute name=2, value=3.
    node_fields = protobuf(node)
    if 1 not in node_fields:
        return None
    element = protobuf(first(node_fields, 1))
    name = first(element, 3).decode("utf-8")
    attributes = {}
    for encoded in element.get(4, []):
        attr = protobuf(encoded)
        key = (first(attr, 1).decode("utf-8"), first(attr, 2).decode("utf-8"))
        value = first(attr, 3).decode("utf-8")
        if not value and 6 in attr:
            item = protobuf(first(attr, 6))
            if 7 in item:
                primitive = protobuf(first(item, 7))
                for field in (6, 7, 8):
                    if field in primitive:
                        value = str(first(primitive, field))
                        break
            elif 2 in item:
                value = first(protobuf(first(item, 2)), 1).decode("utf-8")
        require(key not in attributes, f"Duplicate manifest attribute {key[1]}")
        attributes[key] = value
    children = [xml_element(child) for child in element.get(5, [])]
    return name, attributes, [child for child in children if child is not None]


def bundle_manifest(data):
    element = xml_element(data)
    require(element is not None and element[0] == "manifest", "AAB has no manifest root")
    _, attrs, children = element
    sdk = [child for child in children if child[0] == "uses-sdk"]
    apps = [child for child in children if child[0] == "application"]
    require(len(sdk) == 1 and len(apps) == 1, "Missing or duplicate uses-sdk/application")
    return {
        "applicationId": attrs.get(("", "package")),
        "versionCode": attrs.get((ANDROID_NS, "versionCode")),
        "versionName": attrs.get((ANDROID_NS, "versionName")),
        "minSdk": sdk[0][1].get((ANDROID_NS, "minSdkVersion")),
        "targetSdk": sdk[0][1].get((ANDROID_NS, "targetSdkVersion")),
        "debuggable": apps[0][1].get((ANDROID_NS, "debuggable"), "false") in ("true", "1"),
    }


def bundle_alignment(data):
    # google/bundletool src/main/proto/config.proto:
    # BundleConfig.optimizations=2, uncompress_native_libraries=2,
    # enabled=1, alignment=2. PAGE_ALIGNMENT_16K=2, PAGE_ALIGNMENT_64K=3.
    optimizations = protobuf(first(protobuf(data), 2))
    native = protobuf(first(optimizations, 2))
    require(first(native, 1, 0) == 1, "AAB must enable uncompressed native libraries")
    alignment = first(native, 2, 0)
    require(alignment in (2, 3), "AAB does not request 16KB or greater APK native-library alignment")
    return 16384 if alignment == 2 else 65536


def elf_alignment(data, abi):
    require(len(data) >= 64 and data[:4] == b"\x7fELF", f"{abi}: invalid ELF library")
    require(data[4] == 2 and data[5] == 1, f"{abi}: expected a 64-bit little-endian ELF")
    require(struct.unpack_from("<H", data, 16)[0] == 3, f"{abi}: ELF is not a shared object")
    machine = struct.unpack_from("<H", data, 18)[0]
    require(machine == MACHINES[abi], f"{abi}: library has the wrong ELF architecture")
    phoff = struct.unpack_from("<Q", data, 32)[0]
    phentsize, phnum = struct.unpack_from("<HH", data, 54)
    require(phentsize >= 56 and phnum > 0, f"{abi}: ELF has no valid program headers")
    require(phoff + phentsize * phnum <= len(data), f"{abi}: truncated ELF program headers")
    alignments = []
    for index in range(phnum):
        kind, _, offset, address, _, size, memory_size, alignment = struct.unpack_from(
            "<IIQQQQQQ", data, phoff + index * phentsize
        )
        if kind == 1:  # PT_LOAD
            require(size <= memory_size and offset + size <= len(data), f"{abi}: invalid LOAD segment")
            require(alignment >= PAGE_SIZE and alignment & (alignment - 1) == 0,
                    f"{abi}: LOAD alignment is {alignment}, expected at least {PAGE_SIZE}")
            require((address - offset) % alignment == 0, f"{abi}: LOAD offset/address are misaligned")
            alignments.append(alignment)
        elif kind == 0x6474E552:  # PT_GNU_RELRO
            require((address + memory_size) % PAGE_SIZE == 0, f"{abi}: RELRO end is not 16KB aligned")
    require(alignments, f"{abi}: ELF contains no LOAD segments")
    return min(alignments)


def run_tool(command):
    result = subprocess.run(command, capture_output=True, text=True, env={**os.environ, "LC_ALL": "C", "TZ": "UTC"})
    return result.returncode, result.stdout + result.stderr


def jdk_tool(name):
    java_home = os.environ.get("JAVA_HOME")
    candidate = Path(java_home) / "bin" / name if java_home else None
    found = str(candidate) if candidate and candidate.is_file() else shutil.which(name)
    require(found, f"Missing JDK tool {name}. Install the JDK used to build this app")
    return [found, "-J-Duser.language=en", "-J-Duser.country=US", "-J-Duser.timezone=UTC"]


def sdk_tool(name, sdk):
    versions = (sdk / "build-tools").glob("*")
    candidates = sorted(versions, key=lambda path: tuple(int(n) for n in re.findall(r"\d+", path.name)), reverse=True)
    for directory in candidates:
        if (directory / name).is_file():
            return str(directory / name)
    found = shutil.which(name)
    require(found, f"Missing Android SDK {name}. Pass --sdk with your SDK directory")
    return found


def check_bundle_signature(path, archive, release):
    code, output = run_tool(jdk_tool("jarsigner") + ["-verify", "-strict", "-verbose", str(path)])
    # Android upload certificates are normally self-signed. Jarsigner uses bit
    # 4 for both an untrusted chain and certificate validity errors, so validate
    # dates separately below instead of ignoring all signature warnings.
    require(code in (0, 4) and re.search(r"^jar verified[,.]", output, re.M), "AAB JAR signature verification failed")
    verified = set()
    for line in output.splitlines():
        match = re.match(r"^([smk? X|]{1,8})\s+\d+\s+\w{3} \w{3}\s+\d+ \d\d:\d\d:\d\d \w+ \d{4} (.+)$", line)
        if match and "s" in match[1]:
            verified.add(match[2])
    unsigned = [info.filename for info in archive.infolist()
                if not info.is_dir() and not re.fullmatch(r"META-INF/(?:MANIFEST\.MF|[^/]+\.(?:SF|RSA|DSA|EC))", info.filename, re.I)
                and info.filename not in verified]
    require(not unsigned, f"AAB contains unverified entries: {', '.join(unsigned[:3])}")
    code, certificate = run_tool(jdk_tool("keytool") + ["-printcert", "-jarfile", str(path)])
    require(code == 0, "Could not inspect AAB signing certificate")
    dates = re.findall(r"Valid from: (.+?) until: (.+)", certificate)
    require(dates, "AAB has no signing certificate validity dates")
    now = datetime.datetime.now(datetime.timezone.utc)
    for start, end in dates:
        start = datetime.datetime.strptime(start, "%a %b %d %H:%M:%S UTC %Y").replace(tzinfo=datetime.timezone.utc)
        end = datetime.datetime.strptime(end, "%a %b %d %H:%M:%S UTC %Y").replace(tzinfo=datetime.timezone.utc)
        require(start <= now <= end, "AAB signing certificate is expired or not yet valid")
    if release:
        require(not re.search(r"^Owner:.*CN=Android Debug(?:,|$)", certificate, re.M | re.I), "Release uses an Android debug signing key")
    fingerprints = re.findall(r"SHA256:\s*([A-Fa-f0-9:]+)", certificate)
    require(fingerprints, "No SHA-256 signing certificate fingerprint found")
    return [value.replace(":", "").lower() for value in fingerprints]


def apk_manifest(path, sdk):
    code, output = run_tool([sdk_tool("aapt2", sdk), "dump", "badging", str(path)])
    require(code == 0, "aapt2 could not inspect APK")
    package = re.search(r"^package: name='([^']+)' versionCode='([^']+)' versionName='([^']*)'", output, re.M)
    minimum = re.search(r"^(?:sdkVersion|minSdkVersion):'(\d+)'", output, re.M)
    target = re.search(r"^targetSdkVersion:'(\d+)'", output, re.M)
    require(package and minimum and target, "APK manifest is missing package/version/SDK metadata")
    return dict(applicationId=package[1], versionCode=package[2], versionName=package[3],
                minSdk=minimum[1], targetSdk=target[1], debuggable="application-debuggable" in output)


def check_apk_signature(path, sdk, release):
    code, output = run_tool([sdk_tool("apksigner", sdk), "verify", "--verbose", "--print-certs", str(path)])
    require(code == 0, "APK signature verification failed")
    if release:
        require(not re.search(r"certificate DN:.*CN=Android Debug(?:,|$)", output, re.I | re.M), "Release uses an Android debug signing key")
    fingerprints = re.findall(r"^(?:Signer #\d+|V[\d.]+ Signer(?: #\d+)?):? certificate SHA-256 digest:\s*([a-fA-F0-9]+)", output, re.M)
    require(fingerprints, "APK has no signing certificate fingerprint")
    return [value.lower() for value in fingerprints]


def gradle_expectations(path, variant):
    text = path.read_text()
    result = {}
    for field in ("applicationId", "versionCode", "versionName", "minSdk", "targetSdk"):
        pattern = rf'^\s*{field}\s*(?:=\s*)?(?:"([^"\n]+)"|([0-9]+))\s*$'
        match = re.search(pattern, text, re.M)
        require(match, f"Cannot read literal {field} from {path}. Keep release metadata explicit")
        result[field] = match[1] or match[2]
    if variant == "debug":
        for field, suffix in (("applicationId", "applicationIdSuffix"), ("versionName", "versionNameSuffix")):
            match = re.search(rf'^\s*{suffix}\s*(?:=\s*)?"([^"\n]+)"\s*$', text, re.M)
            if match:
                result[field] += match[1]
    return result


def check_metadata(actual, expected, min_target, release):
    for field, value in expected.items():
        require(actual.get(field) == str(value), f"Packaged {field} is {actual.get(field)!r}, expected {value!r}. Rebuild the artifact")
    require(int(actual["targetSdk"]) >= min_target, f"Packaged targetSdk must be at least {min_target}")
    require(int(actual["versionCode"]) > 0, "Packaged versionCode must be positive")
    require(not release or not actual["debuggable"], "Release artifact is debuggable")
    require(not release or int(actual.get("minSdk", "0")) >= 24,
            "Play automatic protection for this app requires release minSdk24 or higher")


def verify(args):
    path = args.artifact.resolve()
    require(path.is_file(), f"Artifact not found: {path}. Build it first")
    require(path.suffix.lower() in (".aab", ".apk"), "Artifact must be an .aab or .apk")
    is_bundle = path.suffix.lower() == ".aab"
    release = args.variant == "release"
    expected = gradle_expectations(args.gradle_file, args.variant)
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        require(len(names) == len(set(names)), "Artifact contains duplicate ZIP entries")
        if is_bundle:
            actual = bundle_manifest(archive.read("base/manifest/AndroidManifest.xml"))
            packaging_alignment = bundle_alignment(archive.read("BundleConfig.pb"))
            fingerprints = check_bundle_signature(path, archive, release)
        else:
            actual = apk_manifest(path, args.sdk)
            fingerprints = check_apk_signature(path, args.sdk, release)
            code, _ = run_tool([sdk_tool("zipalign", args.sdk), "-c", "-P", "16", "4", str(path)])
            require(code == 0, "APK ZIP entries are not 16KB page aligned")
            packaging_alignment = PAGE_SIZE
        check_metadata(actual, expected, args.min_target, release)
        if args.expected_cert_sha256:
            required = args.expected_cert_sha256.replace(":", "").lower()
            require(bool(re.fullmatch(r"[a-f0-9]{64}", required)), "Expected certificate SHA-256 must contain 64 hexadecimal digits")
            require(required in fingerprints, "Signing certificate does not match the expected upload certificate")
        libraries = {}
        pattern = r"[^/]+/lib/([^/]+)/([^/]+\.so)" if is_bundle else r"lib/([^/]+)/([^/]+\.so)"
        for name in names:
            match = re.fullmatch(pattern, name)
            if not match:
                continue
            abi = match[1]
            require(abi in MACHINES, f"Unexpected native ABI: {abi}")
            alignment = elf_alignment(archive.read(name), abi)
            libraries.setdefault(abi, []).append((name, alignment))
        require(set(libraries) == set(MACHINES), "Artifact must contain arm64-v8a and x86_64 native libraries")
        for abi, entries in libraries.items():
            require(any(name.endswith("/libinvertmatrix.so") for name, _ in entries), f"Missing game library for {abi}")
    print(f"PASS: {path}")
    print(f"  {actual['applicationId']} {actual['versionName']} (versionCode {actual['versionCode']})")
    print(f"  targetSdk {actual['targetSdk']}, minSdk {actual['minSdk']}, signature verified")
    print(f"  Native APK packaging alignment: {packaging_alignment} bytes")
    for abi, entries in sorted(libraries.items()):
        print(f"  {abi}: {len(entries)} native library/libraries, LOAD alignment >= {min(value for _, value in entries)} bytes")
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    print(f"  Artifact SHA-256: {digest.hexdigest()}")
    if not args.expected_cert_sha256 and release:
        print("  Upload certificate identity must match Play Console. Use --expected-cert-sha256 to pin it.")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artifact", type=Path, default=ROOT / "app/build/outputs/bundle/release/app-release.aab")
    parser.add_argument("--variant", choices=("release", "debug"), default="release")
    parser.add_argument("--min-target", type=int, default=36, help="Reviewed minimum API requirement, default 36")
    parser.add_argument("--gradle-file", type=Path, default=ROOT / "app/build.gradle", help="Expected literal app metadata")
    parser.add_argument("--sdk", type=Path, default=Path(os.environ.get("ANDROID_HOME") or os.environ.get("ANDROID_SDK_ROOT") or ROOT / "local-sdk"))
    parser.add_argument("--expected-cert-sha256", help="Expected public upload-certificate SHA-256 fingerprint")
    args = parser.parse_args(argv)
    try:
        verify(args)
    except (VerificationError, OSError, ValueError, KeyError, struct.error, zipfile.BadZipFile) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
