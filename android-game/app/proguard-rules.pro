# Keep one tiny DEX marker so Google Play anti-tamper protection can process
# the native-only app bundle.
-keep class invert_the_matrix.myapp.DexMarker { *; }
-keep class invert_the_matrix.myapp.InvertMatrixApp { *; }
-keep class invert_the_matrix.myapp.PlayGamesBridge { *; }
