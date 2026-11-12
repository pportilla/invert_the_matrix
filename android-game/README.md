# Invert the Matrix Android

This folder contains the native Android version of the game. It uses
`android.app.NativeActivity`, C++ gameplay/rendering code, Skia, OpenGL ES,
native touch handling, and file-backed progress storage. Small Java bridge
classes handle Android system navigation and window insets, initialize Google
Play Games, and expose leaderboard actions to the C++ layer.

## Build Configuration

- `compileSdk` / `targetSdk`: 36
- `minSdk`: 24 (Android 7 and later)
- Android Gradle Plugin: 9.2.1
- Gradle wrapper: 9.4.1
- NDK: `28.2.13676358`
- Build tools: `36.0.0`
- Debug application id suffix: `.debug`
- Release bundle output:
  `app/build/outputs/bundle/release/app-release.aab`

The native library is built by Gradle from `app/src/main/cpp/main.cpp`. The
build expects:

- Android SDK installed locally under `local-sdk/`
- Skia checked out locally under `third_party/skia/`

Both directories are intentionally ignored by git.

Android 7 (API level 24) is the minimum supported Android version because the
app retains Google Play's enabled automatic protection.

## Local Setup

Install Android SDK packages into the project-local SDK:

```sh
mkdir -p local-sdk
export ANDROID_HOME="$PWD/local-sdk"
export ANDROID_SDK_ROOT="$PWD/local-sdk"
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"
sdkmanager --sdk_root="$ANDROID_SDK_ROOT" \
  platform-tools \
  'platforms;android-36' \
  'build-tools;36.0.0' \
  'ndk;28.2.13676358'
```

Fetch Skia:

```sh
mkdir -p third_party
git clone https://skia.googlesource.com/skia.git third_party/skia
git -C third_party/skia checkout 2514f6b5f92bc7f95315db47a7562b6e77b33f02
```

## Build

Build the debug APK:

```sh
./gradlew :app:assembleDebug
```

Build the release bundle:

```sh
./gradlew :app:bundleRelease
```

For a Play upload, use the complete release check:

```sh
./gradlew :app:assembleDebug :app:verifyPlayRelease
```

This builds the signed release bundle and APK, runs Android release lint, and
inspects both artifacts with `tools/verify-release.py`. It rejects stale version
metadata, a target below API 36, a minimum below API 24 required by this app's
automatic protection, missing ABIs, unsigned or debug-signed releases,
and native libraries that are not aligned for 16 KB memory pages. It also checks
the bundle's APK alignment setting and the release APK's ZIP alignment. The
verifier needs Python 3, a JDK, and the local Android build tools. To inspect an
existing bundle without rebuilding:

```sh
python3 tools/verify-release.py --artifact app/build/outputs/bundle/release/app-release.aab
```

Native compiler/linker inputs are tracked by Gradle. Release signing is required
even when running `bundleRelease` directly. Debug builds still work without the
private upload key.

## Play release procedure

1. Check the highest version code already uploaded in Play Console. Increase
   `versionCode` above it, and keep `versionName`, both apps' About screens, and
   English, Spanish, and French release notes aligned.
2. Run the complete release check above. Review
   `app/build/reports/lint-results-release.html`.
3. Smoke-test the debug and optimized release APKs on emulators. Cover Android
   15 and 16, gesture and three-button Back, screen cutouts, rotation, background
   and resume, a campaign puzzle, daily exit confirmation, and settings. Verify
   the shared About copy in the web app too. Use a 16 KB image to check native
   loading when available. Never target a connected phone implicitly.
4. Upload `app/build/outputs/bundle/release/app-release.aab` to an internal test
   track. Native symbols are in
   `app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip`.
   Confirm Play Games sign-in and achievements using a configured tester.
5. Review Play's pre-launch report, then promote that tested version to
   production. Update every track named in the policy warning, including older
   closed or internal test releases. Confirm each reviewed version shows API 36
   or higher and that Play removes the warning.

The verifier cannot see Play Console's uploaded version codes, verify Play
Games credentials, or publish a release. Those checks remain part of rollout.

## Target API maintenance

Google updates the target API policy on an annual release cycle. There is no
permanent target setting that avoids future migrations. Review the policy and
new Android behavior changes each year after the stable Android release, with
time to test before Play's deadline. Review a target change as a code change,
run the emulator matrix, and raise the minimum target in both the Gradle release
guard and the verifier when the policy changes. Keep tool versions pinned until
their upgrades have been tested.

- [Google Play target API requirements](https://developer.android.com/google/play/requirements/target-sdk)
- [Android 16 behavior changes](https://developer.android.com/about/versions/16/behavior-changes-16)
- [Native 16 KB page support](https://developer.android.com/guide/practices/page-sizes)

To install an Android 16 test image from this directory:

```sh
local-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root="$PWD/local-sdk" \
  'system-images;android-36;google_apis;x86_64'
local-sdk/cmdline-tools/latest/bin/avdmanager create avd \
  --name invert_matrix_skia_x86_api36 \
  --package 'system-images;android-36;google_apis;x86_64' --device pixel_6
```

Start either the existing API 35 AVD or this API 36 AVD on the reserved test
ports, one at a time:

```sh
env ANDROID_HOME="$PWD/local-sdk" ANDROID_SDK_ROOT="$PWD/local-sdk" \
  local-sdk/emulator/emulator -avd invert_matrix_skia_x86_api36 \
  -ports 5584,5585 -no-snapshot-load -no-snapshot-save \
  -no-audio -no-boot-anim -gpu swiftshader_indirect -no-window
```

In a second terminal, always specify the emulator serial:

```sh
local-sdk/platform-tools/adb -s emulator-5584 wait-for-device
local-sdk/platform-tools/adb -s emulator-5584 install -r app/build/outputs/apk/debug/app-debug.apk
local-sdk/platform-tools/adb -s emulator-5584 shell am start -n invert_the_matrix.myapp.debug/android.app.NativeActivity
local-sdk/platform-tools/adb -s emulator-5584 logcat -d -t 300
local-sdk/platform-tools/adb -s emulator-5584 emu kill
```

## Release Signing

Release signing is configured from `signing/keystore.properties`. The real file
and keystore are ignored by git.

```sh
cp signing/keystore.properties.example signing/keystore.properties
```

Edit the copied file with your local keystore path, alias, and passwords. Keep
the upload keystore and passwords backed up privately; losing the upload key can
block future app updates until Play support resets it.

## Play Games

Google Play Games support is Android-only. The web app does not contain Play
Services or leaderboard code.

The Android app initializes Play Games from `InvertMatrixApp`, submits daily
challenge scores through `PlayGamesBridge`, and reads the Play Games app and
leaderboard IDs from `app/src/main/res/values/strings.xml`.

## Repeatable Play publishing helper

From the repository root, `tools/publish_play_release.py` validates the signed
bundle, matches native symbol build IDs, and reads all three release-note
translations from `CHANGELOG.md`. Its default `status` command reads the saved
local report. Commands without `--commit` make no Google Play changes.

For version 18, after the build and emulator checks pass, the verified starting
versions are internal 1, alpha 12, and production 17:

```sh
python3 tools/publish_play_release.py prepare --version-code 18 \
  --expected-track internal=1 --expected-track alpha=12 --expected-track production=17
python3 tools/publish_play_release.py prepare --commit
python3 tools/publish_play_release.py internal --commit
# Test the internal release before promotion.
python3 tools/publish_play_release.py promote --commit
```

The helper requires the existing private service account used by
`tools/upload_play_store_assets.py`. It saves edit IDs, hashes, and track
snapshots under the ignored `android-game/app/build/reports/play-release-18/`
directory. Promotion updates the existing production and alpha tracks while
retaining internal version 18. It stops on concurrent changes, an existing
review, or an uncertain upload/commit outcome. Preserve the saved report and
reconcile uncertain outcomes in Play Console before proceeding. An API commit
does not establish that Google's review has completed or the app is live.

Before each API commit, verify that Publishing overview contains no unrelated
pending changes. Do not rely on **Save for later** for API commits. Its selection
reset after a page reload during release validation, and API submission has not
been verified to honor that selection. Revert unrelated pending changes only
with the user's authorization while preserving existing published settings, or
submit manually in Console after verifying the selected changes. Recheck before
both internal release and production promotion. `ERROR_IF_IN_REVIEW` protects
an existing review but does not detect unrelated changes awaiting review. Make
Console changes before creating an API edit, as they can invalidate an open edit.

Run the helper's offline tests from the repository root:

```sh
python3 -m unittest discover -s tools -p 'test_publish_play_release.py'
```
