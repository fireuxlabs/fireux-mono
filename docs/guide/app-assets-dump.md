---
title: App Asset Dump
description: How to drop designer-provided app image packs into the repo and publish them to Firebase Storage.
updated: 2026-05-19
---

# App Asset Dump
Authority: Tier2 (Operational)

Use this guide when a designer gives us a logo/wordmark/image pack for a FireUX app. The goal is boring repeatability:

```text
designer asset pack
-> app public folder
-> audit
-> Firebase Storage
-> app catalog media URLs
```

For the designer-facing brief, use `docs/guide/app-branding-brief.md`.

## Folder Canon

Each app keeps its source image pack in:

```text
projects/<ecosystem>/<app>/public/img/app/
```

Required files:

```text
thumbnail.png
logo.png
wordmark-light.png
wordmark-dark.png
cover.png
```

Recommended optional files:

```text
favicon.ico
pwa/icon-192.png
pwa/icon-512.png
logo.svg
wordmark-light.svg
wordmark-dark.svg
brand-colours.txt
```

SVG files are useful for designers and future exports, but the app catalog and Storage sync currently publish the PNG set above.

## App-Owned Fonts

Most FireUX apps should use the shared system font stack. Add app-owned font
files only when the brand/site genuinely needs a non-default typeface.

When an app owns a font, keep it in:

```text
projects/<ecosystem>/<app>/public/fonts/<family>/
```

Use provider-readable filenames so Nuxt Fonts can resolve local fonts from
`public/`:

```text
montserrat-400.woff2
montserrat-700.woff2
montserrat-800.ttf
```

Include the font license in the same family folder:

```text
OFL.txt
```

Do not add font binaries only to create raster logo exports. If the runtime site
does not use the font, keep the exported PNG/SVG wordmarks under
`public/img/app` and record the source font in `brand-colours.txt`.

## Size Canon

Ask designers for:

```text
thumbnail.png          1200 x 630
logo.png               512 x 512, transparent background if possible
wordmark-light.png     768 x 192, for dark backgrounds
wordmark-dark.png      768 x 192, for light backgrounds
cover.png              16:9, minimum 1280 x 720
favicon.ico            48 x 48 or multi-size ICO
pwa/icon-192.png       192 x 192
pwa/icon-512.png       512 x 512
```

Keep filenames exact. The sync scripts look for these names.

`thumbnail.png` is the enforced preview/social image. Export it at 1200 x 630,
and keep the main artwork safe when cropped into square card/avatar surfaces.

## Drop-In Workflow

When a new pack arrives:

1. Unzip it somewhere outside the repo, usually `~/Downloads`.
2. Copy the files into the app public folder.
3. Keep only intentional assets. Do not keep `.DS_Store`, screenshots, exports-in-progress, or old alternates in `public/img/app`.
4. If the pack includes `favicon.ico`, also copy it to:

```text
projects/<ecosystem>/<app>/public/favicon.ico
```

The app-local public folder is the source of truth for the asset pack in Git.

## Publish Workflow

Run the media audit first:

```sh
node scripts/audit-app-media.mjs --ecosystem <ecosystemId>
```

Then sync one app:

```sh
node scripts/sync-app-media-from-public.mjs --ecosystem <ecosystemId> --app <appId> --apply
```

The sync uploads to Firebase Storage:

```text
apps/<appId>/media/thumbnail
apps/<appId>/media/logo
apps/<appId>/media/wordmark-light
apps/<appId>/media/wordmark-dark
apps/<appId>/media/cover
```

It writes canonical URLs to:

```text
apps/<appId>.media.thumbnail_url
apps/<appId>.media.logo_url
apps/<appId>.media.wordmark_light_url
apps/<appId>.media.wordmark_dark_url
apps/<appId>.media.cover_url
```

For standalone apps with their own database, the sync must write both:

```text
fireux/apps/<appId>
<appDatabase>/apps/<appId>
```

That lets the FireUX app catalog and the standalone app shell initialize from the same current media.

## Sproochli Example

Sproochli uses:

```text
projects/fireux/sproochli/public/img/app/
```

Publish with:

```sh
node scripts/audit-app-media.mjs --ecosystem fireux-fireux
node scripts/sync-app-media-from-public.mjs --ecosystem fireux-fireux --app sproochli --apply
```

Expected Storage prefix:

```text
apps/sproochli/media/
```

Expected app docs:

```text
fireux/apps/sproochli
sproochli/apps/sproochli
```

## Common Failure Modes

- The app blocks on initialization because the standalone database is missing `apps/<appId>`.
- The app shows old logos because Storage was not synced after replacing `public/img/app`.
- The FireUX catalog looks correct but the standalone app still has old media because only `fireux/apps/<appId>` was updated.
- The sync cannot find assets because filenames or app folder names drifted from the registry.
- Designer exports include spaces or suffixes such as `logo final.png`; rename them before syncing.
