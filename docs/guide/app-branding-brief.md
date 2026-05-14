---
title: App Branding Brief
description: Designer-facing asset requirements for FireUX app logos, wordmarks, icons, and cover images.
updated: 2026-05-14
---

# App Branding Brief
Authority: Tier2 (Operational)

This is the handoff brief for designers creating brand assets for a FireUX app.

## Required Files

Please provide these exact files:

| File | Size | Ratio | Background |
|---|---:|---:|---|
| `logo.png` | 512 x 512 px | 1:1 | Transparent |
| `thumbnail.png` | 512 x 512 px | 1:1 | Can be solid/brand background |
| `wordmark-light.png` | 768 x 192 px | 4:1 | Transparent |
| `wordmark-dark.png` | 768 x 192 px | 4:1 | Transparent |
| `cover.png` | 1280 x 720 px | 16:9 | Designed background/image |
| `favicon.ico` | 48 x 48 px or multi-size ICO | 1:1 | Transparent where possible |
| `pwa/icon-192.png` | 192 x 192 px | 1:1 | Solid or transparent |
| `pwa/icon-512.png` | 512 x 512 px | 1:1 | Solid or transparent |

SVG versions are welcome too:

```text
logo.svg
wordmark-light.svg
wordmark-dark.svg
```

## Transparent Background Rule

Logos and wordmarks must be exported on transparent backgrounds.

This is especially important for:

```text
logo.png
wordmark-light.png
wordmark-dark.png
logo.svg
wordmark-light.svg
wordmark-dark.svg
```

Do not place these on white, black, grey, or coloured rectangles. The app UI supplies the background.

## Asset Purpose

### Logo

`logo.png`

- Square icon or symbol.
- Used in app shells, cards, navigation, and small UI surfaces.
- Must work at small sizes.
- Transparent background.
- Keep the artwork inside a safe area of roughly 80% of the canvas.

### Thumbnail

`thumbnail.png`

- Square app preview image.
- Used in app indexes, app cards, and public showcase surfaces.
- Can include a brand background.
- Should be legible at small card sizes.
- Usually this can be logo plus brand colour background.

### Wordmarks

`wordmark-light.png`

- Used on dark backgrounds.
- Usually light/white text or mark.
- Transparent background.

`wordmark-dark.png`

- Used on light backgrounds.
- Usually dark text or mark.
- Transparent background.

Both wordmarks should fit a 4:1 horizontal ratio:

```text
768 x 192 px
```

Keep generous left/right padding so the wordmark does not touch the edge.

### Cover

`cover.png`

- Used for app cards, previews, marketing blocks, and public showcases.
- 16:9 ratio.
- Should communicate the product mood clearly.
- Text is optional, but avoid tiny text.
- Export at:

```text
1280 x 720 px
```

## Colour Notes

Please include a small text file:

```text
brand-colours.txt
```

With:

```text
Primary:
Secondary:
Accent:
Dark:
Light:
Notes:
```

Hex values are preferred.

## Export Checklist

Before handoff, confirm:

- Logos and wordmarks have transparent backgrounds.
- No accidental white/black rectangle behind transparent assets.
- PNGs are exported at the exact pixel sizes above.
- The logo remains clear at 32 px.
- The wordmark remains readable when scaled down.
- File names match exactly.
- Files are not named `final`, `copy`, `new`, or `export`.
- No `.DS_Store`, screenshots, or source design clutter in the pack.

## Delivery Structure

Please deliver a zip like:

```text
app-name-assets.zip
  img/
    app/
      logo.png
      thumbnail.png
      wordmark-light.png
      wordmark-dark.png
      cover.png
      favicon.ico
      brand-colours.txt
      pwa/
        icon-192.png
        icon-512.png
      logo.svg
      wordmark-light.svg
      wordmark-dark.svg
```

This structure can be copied directly into:

```text
projects/<ecosystem>/<app>/public/img/app/
```
