# Play Store Assets

Generated assets for the Google Play listing.

Official requirements checked against Play Console Help:

- App icon: 512x512 PNG.
- Feature graphic: 1024x500 PNG with no alpha.
- Screenshots: PNG with no alpha; phone, 7-inch tablet, and 10-inch tablet sets included.

Files:

- `icon/play-store-icon-512.png`
- `feature-graphic/feature-graphic-1024x500.png`
- `screenshots/phone/*.png`
- `screenshots/tablet-7-inch/*.png`
- `screenshots/tablet-10-inch/*.png`
- `listing-description.md`

Regenerate from the repo root with:

```sh
python3 tools/generate_play_store_assets.py
```
