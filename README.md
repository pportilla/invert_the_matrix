# Invert the Matrix

Invert the Matrix is a puzzle game about turning a board of modular states back
to zero. It is a playful take on Lights Out: tapping a tile applies a fixed
pulse pattern, the board wraps modulo the selected number of states, and the
solver/generator treats each puzzle as a small linear algebra problem.

A working browser version is available at:
https://pportilla.github.io/invert_the_matrix/

This repository contains two versions of the same game:

- `web-app/` is the browser version. It is static HTML/CSS with TypeScript-built
  JavaScript.
- `android-game/` is the native Android version. It uses `NativeActivity`, C++,
  Skia, and OpenGL ES. Android-only integrations, such as Google Play Games
  sign-in and leaderboards, live here.

The core gameplay should stay in parity across both apps. Campaign rules, daily
puzzle generation, custom puzzle options, hints, unlocks, settings, copy, and
visual game states should be changed in both implementations in the same task.
Platform services such as Play Games leaderboards should remain Android-only.

## Features

- Campaign mode with ordered unlocks, star targets, personal bests, and hint
  tracking.
- Custom puzzle generation with board size, state count, pulse pattern,
  difficulty, locked tiles, irregular boards, and unique-solution preference.
- Daily challenge tiers with deterministic same-day puzzles.
- Solver-backed hints that apply the next move and mark that attempt as a
  zero-star solve.
- Settings for sound, number labels, guide text size, and Android haptic
  feedback.
- In-game explanations of the linear algebra behind the generator.
- Android Play Games leaderboards for daily challenge scoring.

## Android App

Requirements:

- Linux development environment
- JDK 17 or newer
- Android SDK with platform 35, build tools 37.0.0, and NDK
  `28.2.13676358`
- Skia source checked out at `android-game/third_party/skia`
- `ninja`, `python3`, and standard C/C++ build tools

This repository does not commit the Android SDK or Skia checkout. The Gradle
project expects a local SDK under `android-game/local-sdk` and Skia under
`android-game/third_party/skia`.

Install Android SDK packages into the project-local SDK:

```sh
cd android-game
mkdir -p local-sdk
export ANDROID_HOME="$PWD/local-sdk"
export ANDROID_SDK_ROOT="$PWD/local-sdk"

# Use your installed Android command line tools, or place them under
# local-sdk/cmdline-tools/latest first.
sdkmanager --sdk_root="$ANDROID_SDK_ROOT" \
  "platform-tools" \
  "platforms;android-35" \
  "build-tools;37.0.0" \
  "ndk;28.2.13676358"
```

Fetch Skia:

```sh
cd android-game
mkdir -p third_party
git clone https://skia.googlesource.com/skia.git third_party/skia
git -C third_party/skia checkout 2514f6b5f92bc7f95315db47a7562b6e77b33f02
```

Build a debug APK:

```sh
cd android-game
./gradlew :app:assembleDebug
```

Build a release bundle:

```sh
cd android-game
./gradlew :app:bundleRelease
```

The release artifact is written to:

```text
android-game/app/build/outputs/bundle/release/app-release.aab
```

## Android Signing and Play Games

Release signing is configured through
`android-game/signing/keystore.properties`. The real file and keystore are
ignored by git. To prepare a signed release locally:

```sh
cd android-game
cp signing/keystore.properties.example signing/keystore.properties
```

Then edit `signing/keystore.properties` so it points to your local upload
keystore. Do not commit the real file or keystore.

Google Play Games support is Android-only. The web app has no leaderboard or
Play Services dependency. Android resource IDs for Play Games live in
`android-game/app/src/main/res/values/strings.xml`; update those values to match
your Play Console project and leaderboards before publishing your own app.

## License

Invert the Matrix is licensed under the MIT License. See `LICENSE` for the full
license text.
