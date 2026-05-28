# Play Store Assets

Generated assets for the Google Play listing.

Official requirements checked against Play Console Help:

- App icon: 512x512 PNG.
- Feature graphic: 1024x500 PNG with no alpha.
- Screenshots: PNG with no alpha. Phone screenshots use native Android captures so the app keeps real phone scale. Tablet assets are raw app captures.

Default English files:

- `icon/play-store-icon-512.png`
- `feature-graphic/feature-graphic-1024x500.png`
- `screenshots/phone/*.png`
- `screenshots/tablet-7-inch/*.png`
- `screenshots/tablet-10-inch/*.png`

Localized files:

- `localized/en-US/feature-graphic/feature-graphic-1024x500.png`
- `localized/en-US/screenshots/**`
- `localized/es-ES/feature-graphic/feature-graphic-1024x500.png`
- `localized/es-ES/screenshots/**`
- `localized/fr-FR/feature-graphic/feature-graphic-1024x500.png`
- `localized/fr-FR/screenshots/**`

Raw capture sources are kept under `source-screenshots/` for review. Native Android phone captures live under `source-screenshots/android-phone/` and are preserved by the generator.

Regenerate from the repo root with:

```sh
python3 tools/generate_play_store_assets.py
```

Upload through the Android Publisher API with:

```sh
python3 tools/upload_play_store_assets.py --commit
```

This uses `.secrets/play-games-service-account.json`. The Google Play Android Developer API must be enabled on that service account's Google Cloud project before upload.
