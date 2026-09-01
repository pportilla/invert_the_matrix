# Changelog

Summarized release notes for Invert the Matrix.

## Android 1.0.15 - 2026-09-01

Version code: 17

- Updated AndroidX Fragment from the resolved 1.1.0 dependency to the current
  stable 1.9.0 release.
- Updated AndroidX Activity from the resolved 1.0.0 dependency to the current
  stable 1.13.0 release.
- Removed the outdated-SDK warnings reported by Google Play for version code
  16 while retaining Android 16 targeting and the new goal/tap-effect UI.

Play Store "What's new":

Updated for Android 16 with a clearer all-white goal, on-demand tap-effect
help, and current supported AndroidX libraries.

Localized Play Store "What's new":

en-US: Updated for Android 16 with a clearer all-white goal, on-demand
tap-effect help, and current supported AndroidX libraries.

es-ES: Actualización para Android 16 con un objetivo más claro, ayuda del
efecto de toque disponible cuando se necesita y bibliotecas AndroidX actuales.

fr-FR: Mise à jour pour Android 16 avec un objectif plus clair, une aide sur
l’effet du toucher à la demande et des bibliothèques AndroidX actuelles.

## Android 1.0.14 - 2026-09-01

Version code: 16

- Updated the app to compile against and target Android 16 (API level 36).
- Preserved the existing native system Back behavior on Android 16 while the
  app transitions to the predictive-back callback API.
- Made the all-white goal explicit during puzzle gameplay.
- Replaced the always-visible pattern diagram with animated tap-effect help
  that opens only when requested, including accurate mixed-pattern previews.
- Added explicit no-backup rules for Android 12 and later device transfers.
- Kept the minimum supported version at Android 6 (API level 23).

Play Store "What's new":

Updated for Android 16. The all-white goal is now clear at a glance, while
animated tap-effect help stays hidden until you open it.

Localized Play Store "What's new":

en-US: Updated for Android 16. The all-white goal is now clear at a glance,
while animated tap-effect help stays hidden until you open it.

es-ES: Actualización para Android 16. El objetivo de dejar todas las casillas
en blanco ahora se ve de un vistazo, y la ayuda animada del efecto de toque se
mantiene oculta hasta que la abras.

fr-FR: Mise à jour pour Android 16. L’objectif de rendre toutes les tuiles
blanches est maintenant clair, et l’aide animée sur l’effet de toucher reste
masquée jusqu’à son ouverture.

## 1.0.13 - 2026-05-30

Version code: 15

- Added Achievements to the main menu.
- Android now opens the Google Play Games achievements view, syncing locally
  earned campaign achievements before launch.
- The web app shows matching campaign achievement progress from local progress.
- Enlarged the animated main menu board and kept Android large-screen support
  enabled.

Play Store "What's new":

Achievements are now available from the main menu. Android opens your Play Games
achievement status, the animated menu board is larger, and the app keeps
improved support for large screens and orientation changes.

Localized Play Store "What's new":

en-US: Achievements are now available from the main menu. Android opens your
Play Games achievement status, the animated menu board is larger, and the app
keeps improved support for large screens and orientation changes.

es-ES: Los logros ahora están disponibles desde el menú principal. Android abre
tu estado de logros de Play Games, el tablero animado del menú es más grande y
la app mantiene mejor soporte para pantallas grandes y cambios de orientación.

fr-FR: Les succès sont maintenant disponibles depuis le menu principal. Android
ouvre ton état des succès Play Games, le plateau animé du menu est plus grand et
l'app garde une meilleure prise en charge des grands écrans et des changements
d'orientation.

## 1.0.12 - 2026-05-30

Version code: 14

- First production release.
- Includes campaign levels, daily challenges, custom puzzles, Playground boards,
  hints, stars, and Play Games achievements.
- Supports English, Spanish, and French.

Play Store "What's new":

First production release of Invert the Matrix. Play campaign levels, daily
challenges, custom puzzles, and Playground boards with hints, stars,
achievements, and English, Spanish, and French support.

Localized Play Store "What's new":

en-US: First production release of Invert the Matrix. Play campaign levels,
daily challenges, custom puzzles, and Playground boards with hints, stars,
achievements, and English, Spanish, and French support.

es-ES: Primera versión de producción de Invert the Matrix. Juega niveles de
campaña, retos diarios, rompecabezas personalizados y tableros de Zona de
pruebas con pistas, estrellas, logros y soporte en inglés, español y francés.

fr-FR: Première version de production d'Invert the Matrix. Joue aux niveaux de
campagne, aux défis quotidiens, aux casse-têtes personnalisés et aux plateaux du
bac à sable avec indices, étoiles, succès et prise en charge de l'anglais, de
l'espagnol et du français.

## 1.0.11 - 2026-05-30

Version code: 13

- Added a separate setting for Playground tile numbers.
- Playground editor and Playground play boards now keep tile numbers hidden
  unless the Playground number setting is turned on.
- Kept the setting, changelog, and version copy aligned across web and Android.

Play Store "What's new":

Playground tile numbers now have their own setting. Playground boards stay
number-free unless that setting is turned on, while the regular tile-number
setting still controls the rest of the game.

Localized Play Store "What's new":

en-US: Playground tile numbers now have their own setting. Playground boards
stay number-free unless that setting is turned on, while the regular
tile-number setting still controls the rest of the game.

es-ES: Los números en casillas de Zona de pruebas ahora tienen su propio ajuste.
Los tableros de Zona de pruebas no muestran números salvo que ese ajuste esté
activado, mientras que el ajuste normal de números en casillas sigue
controlando el resto del juego.

fr-FR: Les nombres des tuiles du bac à sable ont maintenant leur propre
réglage. Les plateaux du bac à sable restent sans nombres sauf si ce réglage
est activé, tandis que le réglage habituel des nombres sur les tuiles contrôle
toujours le reste du jeu.

## 1.0.10 - 2026-05-30

Version code: 12

- Prepared the Android release with version code 12.
- Confirmed release bundles keep uploadable native symbols for Play Console
  crash reports.
- Refreshed the in-app changelog for the latest Play Store build.

Play Store "What's new":

The Android release is ready with version code 12, native debug symbols for Play
Console crash reports, and refreshed changelog notes for the latest Play Store
build.

Localized Play Store "What's new":

en-US: The Android release is ready with version code 12, native debug symbols
for Play Console crash reports, and refreshed changelog notes for the latest
Play Store build.

es-ES: La versión de Android está lista con código de versión 12, símbolos
nativos de depuración para los informes de fallos de Play Console y notas
actualizadas del historial de cambios para la última compilación de Play Store.

fr-FR: La version Android est prête avec le code de version 12, les symboles de
débogage natifs pour les rapports de plantage Play Console et des notes
d'historique mises à jour pour la dernière compilation Play Store.

## 1.0.9 - 2026-05-21

Version code: 11

- Added Playground, a hand-built board editor for creating custom boards,
  placing lock icons and empty holes, sharing compact puzzle codes, loading
  codes, and playing without a completion modal.
- Reworked Campaign into a 5x5 group map with 9 levels per group, white borders
  on available groups, group-star unlocks, and matching progress migration
  across web and Android.
- Polished menu headers across the app with consistent section logos, quieter
  back and text-size controls, thinner top bars, and text-size scaling for menu
  content.
- Replaced rough handcrafted menu, Playground, lock, and text-size visuals with
  cleaner web and Android assets.
- Added Android Play Games achievement ID resources and tooling for generating
  localized achievement metadata and import assets, while keeping local service
  account secrets ignored.
- Fixed Playground puzzle code generation with compact share codes and backward
  compatibility for older codes.

Play Store "What's new":

Playground lets you build boards by hand, share compact puzzle codes, and play
them directly. Campaign now uses a 5x5 group map with clearer unlocks. Menus,
logos, lock icons, and text-size controls received a broad polish pass across
web and Android.

## 1.0.8 - 2026-05-16

Version code: 10

- The Daily Challenges screen now separates today's puzzle cards from Easy,
  Medium, Hard, and Global leaderboard entries for a cleaner route into each
  mode.
- Custom Level setup now uses visual pulse-pattern chips, removes the unique
  solution toggle, and always generates with unique-solution preference enabled.
- Gameplay and completion screens have clearer spacing, button labels, pattern
  badges, and small-screen layout behavior across web and Android.
- About/settings navigation and the GitHub credit were tightened so the same
  version history flow works consistently in both apps.

Play Store "What's new":

The Daily Challenges screen now has cleaner puzzle cards and leaderboard entries. Custom Level setup adds visual pattern chips and always prefers unique-solution puzzles. Gameplay, completion, About, and settings screens received layout polish across web and Android.

## 1.0.7 - 2026-05-14

Version code: 9

- Settings now hide platform-specific controls: the web app no longer shows
  vibration, and both apps no longer show animation or colorblind-symbol
  toggles.
- Added an About screen with pportilla GitHub credit, the current version, and
  version history.

## Android 1.0.6 - 2026-05-13

Version code: 8

- Release bundles keep uploadable native symbols for Play Console crash reports.

## Android 1.0.5 - 2026-05-13

Version code: 7

- Expanded The Math guide with solution uniqueness, tap-count vectors that
  change no board tiles, and the cross-pattern invertibility test.

## Android 1.0.4 - 2026-05-13

Version code: 6

- Campaign/generated minimums and hint plans now use the shortest provable
  solution.

## Android 1.0.3 - 2026-05-13

Version code: 5

- Settings controls are vertically centered more naturally.

## Android 1.0.2 - 2026-05-13

Version code: 4

- Final hints wait 0.5 seconds before showing completion, so the last key press
  remains visible.
- Hint taps are throttled to one use per 0.5 seconds.

## Android 1.0.1 - 2026-05-13

Version code: 3

- Daily Challenge can be replayed, while Play Games leaderboards keep only the
  first try.
- First counted daily tries hide Reset/Hint and warn that exiting records `0`.
- Existing daily scores are preserved as already-recorded leaderboard attempts.
