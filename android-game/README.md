# Invert the Matrix Android

This folder contains the native Android version of the game. It uses
`android.app.NativeActivity`, C++ gameplay/rendering code, Skia, OpenGL ES,
native touch handling, and file-backed progress storage. Small Java bridge
classes initialize Google Play Games and expose leaderboard actions to the C++
layer.

## Build Configuration

- `compileSdk` / `targetSdk`: 35
- `minSdk`: 23
- Android Gradle Plugin: 9.2.1
- Gradle wrapper: 9.4.1
- NDK: `28.2.13676358`
- Build tools: `37.0.0`
- Debug application id suffix: `.debug`
- Release bundle output:
  `app/build/outputs/bundle/release/app-release.aab`

The native library is built by Gradle from `app/src/main/cpp/main.cpp`. The
build expects:

- Android SDK installed locally under `local-sdk/`
- Skia checked out locally under `third_party/skia/`

Both directories are intentionally ignored by git.

## Local Setup

Install Android SDK packages into the project-local SDK:

```sh
mkdir -p local-sdk
export ANDROID_HOME="$PWD/local-sdk"
export ANDROID_SDK_ROOT="$PWD/local-sdk"
sdkmanager --sdk_root="$ANDROID_SDK_ROOT" \
  "platform-tools" \
  "platforms;android-35" \
  "build-tools;37.0.0" \
  "ndk;28.2.13676358"
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
