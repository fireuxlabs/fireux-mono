---
title: App Asset Dump
description: How to drop designer-provided app image packs into the repo and publish them to Firebase Storage.
updated: 2026-05-14
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

## Size Canon

Ask designers for:

```text
thumbnail.png          512 x 512
logo.png               512 x 512, transparent background if possible
wordmark-light.png     768 x 192, for dark backgrounds
wordmark-dark.png      768 x 192, for light backgrounds
cover.png              1280 x 720
favicon.ico            48 x 48 or multi-size ICO
pwa/icon-192.png       192 x 192
pwa/icon-512.png       512 x 512
```

Keep filenames exact. The sync scripts look for these names.

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
