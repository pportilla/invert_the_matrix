# Third-Party Native Dependencies

The Android build expects a local Skia checkout at `android-game/third_party/skia`.
That checkout is intentionally ignored by git because it is large and should be
recreated on each development machine.

The local build this project was prepared with used:

- Skia remote: `https://skia.googlesource.com/skia.git`
- Skia commit: `2514f6b5f92bc7f95315db47a7562b6e77b33f02`

From `android-game/`, recreate it with:

```sh
mkdir -p third_party
git clone https://skia.googlesource.com/skia.git third_party/skia
git -C third_party/skia checkout 2514f6b5f92bc7f95315db47a7562b6e77b33f02
```

Gradle will run Skia's `bin/fetch-gn`, generate the Android Skia build, and then
compile `app/src/main/cpp/main.cpp` into the app's native library.
