# Images Sync (Temp)

## Repo Image Structure

- `packages/core/fireux-core/src/runtime/public/img/core/brand/`
  - `logo.png`
  - `wordmark-dark.png`
  - `wordmark-light.png`
  - `wordmark-light.svg`
- `packages/core/fireux-core/src/runtime/public/img/core/defaults/`
  - `default-avatar.png`
  - `default-cover.png`
  - `default-image.png`
  - `default-thumbnail.png`
- `packages/core/fireux-core/src/runtime/public/img/core/auth/`
  - `sign-in-dark.svg`
  - `sign-in-light.svg`
  - `sign-up-dark.svg`
  - `sign-up-light.svg`
- `projects/fireux/fireux-app/public/img/app/`
  - `cover.png`
  - `logo.png`
  - `thumbnail.png`
  - `wordmark-dark.png`
  - `wordmark-light.png`
  - `wordmark-light.svg`
  - `pwa/icon-192.png`
  - `pwa/icon-512.png`
  - `stack/firebase-black.png`
  - `stack/firebase-white.png`
  - `stack/github-black.png`
  - `stack/github-white.png`
  - `stack/nuxt-black.png`
  - `stack/nuxt-white.png`
  - `stack/pwa-black.png`
  - `stack/pwa-white.png`
  - `stack/stripe-black.png`
  - `stack/stripe-white.png`
- `projects/fireux/tennant/public/img/app/`
  - `cover.png`
  - `logo.png`
  - `thumbnail.png`
  - `wordmark-dark.png`
  - `wordmark-light.png`
  - `wordmark-light.svg`
  - `pwa/icon-192.png`
  - `pwa/icon-512.png`

## Figma Export Staging

- `figma-export/core/brand/`
  - Mirrors production brand set (wordmarks, marks).
- `figma-export/core/defaults/`
  - `default-avatar.png`
  - `default-cover.png`
  - `default-thumbnail.png`
- `figma-export/apps/fireux-app/`
  - Same filenames as `projects/fireux/fireux-app/public/img/app/*`.
- `figma-export/apps/tennant/`
  - Same filenames as `projects/fireux/tennant/public/img/app/*`.

## Runtime References (direct `/img/*` usage)

- `packages/core/fireux-core/src/runtime/components/logo/Brand.vue`
  - `/img/app/wordmark-light.png`
  - `/img/app/wordmark-dark.png`
- `packages/core/fireux-core/src/runtime/composables/firebase/useImageStorage.ts`
  - `/img/core/defaults/default-image.png`
- `packages/core/fireux-core/src/runtime/composables/firestore/objects/Blog/useBlogPostUtils.ts`
  - `/img/core/defaults/default-image.png`
  - `/img/core/brand/wordmark-dark.png`
  - `/img/core/brand/logo.png`
- `packages/core/fireux-core/src/runtime/server/api/app.get.ts`
  - `/img/core/brand/wordmark-light.png`
  - `/img/core/brand/wordmark-dark.png`
  - `/img/og-image.png`
- `packages/core/fireux-core/src/runtime/server/api/app/theme.get.ts`
  - `/img/core/brand/wordmark-light.png`
  - `/img/core/brand/wordmark-dark.png`
- `packages/extensions/fireux-places/src/runtime/server/api/places/logo.get.ts`
  - `/img/logo.svg`
  - `/img/logo.png`
- `automation/migrations/backfill-core-avatars.ts`
  - `/img/core/defaults/default-image.png`

## Fallback Images

- Primary fallback source kept in repo at `packages/core/fireux-core/src/runtime/public/img/core/defaults/*` (mirrors staging under `figma-export/core/defaults/*`).
- External archive for quick restores lives at `/Users/danielwatson/Desktop/Projects Assets/figma-export/core/defaults`.
- Any component or API relying on `/img/core/defaults/default-image.png` assumes these files remain available; keep staging and repo copies in sync when exporting new defaults.
