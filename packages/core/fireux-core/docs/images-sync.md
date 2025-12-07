# FireUX Image Sync Map (Canonical – v1.0)

Purpose: keep repository image assets aligned with Figma exports and FireUX Image Spec v1.4.

---

## 1. Repo Image Structure (Current State)

### 1.1 Core Assets (`packages/core/fireux-core/src/runtime/public/img/`)

- `core/brand/`
  - `logo.png`
  - `wordmark-dark.png`
  - `wordmark-light.png`
  - `wordmark-light.svg`
- `core/defaults/`
  - `default-avatar.png`
  - `default-cover.png`
  - `default-thumbnail.png`
- `core/auth/`
  - `sign-in-dark.svg`
  - `sign-in-light.svg`
  - `sign-up-dark.svg`
  - `sign-up-light.svg`
- `og-image.png` (1200×630 OG/social fallback)

### 1.2 App Assets

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

---

## 2. Figma Export Staging

Authoritative staging directory: `/Users/danielwatson/Desktop/Projects Assets/figma-export/`

- `core/brand/*` → `packages/core/fireux-core/src/runtime/public/img/core/brand/*`
- `core/defaults/*` → `packages/core/fireux-core/src/runtime/public/img/core/defaults/*`
- `apps/<app>/*` → `projects/<ecosystem>/<app>/public/img/app/*`

Every staged file name must match the promoted repo file exactly; no prefixes or suffixes.

---

## 3. Runtime References (Direct `/img/*` Usage)

- `packages/core/fireux-core/src/runtime/components/logo/Brand.vue`
  - `/img/app/wordmark-light.png`
  - `/img/app/wordmark-dark.png`
- `packages/core/fireux-core/src/runtime/composables/fireux/firebase/useImageStorage.ts`
  - `/img/core/defaults/default-thumbnail.png`
- `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/Blog/useBlogPostUtils.ts`
  - `/img/core/defaults/default-thumbnail.png`
  - `/img/core/brand/wordmark-dark.png`
  - `/img/core/brand/logo.png`
- `packages/core/fireux-core/src/runtime/server/api/app.get.ts`
  - `/img/core/brand/wordmark-light.png`
  - `/img/core/brand/wordmark-dark.png`
  - `/img/og-image.png`
- `packages/core/fireux-core/src/runtime/server/api/app/theme.get.ts`
  - `/img/core/brand/wordmark-light.png`
  - `/img/core/brand/wordmark-dark.png`
- `automation/migrations/backfill-core-avatars.ts`
  - `/img/core/defaults/default-thumbnail.png`

_(Remote logo discovery in `fireux-places` crawls external sites; it does not rely on repository image paths.)_

---

## 4. Reconciliation Status

- ✅ Core defaults, branding, and authentication art match the spec.
- ✅ FireUX and Tennant app bundles (logos, wordmarks, cover, PWA icons, stack assets) align with staging exports.
- ✅ Shared OG fallback now lives at `/img/og-image.png` in repo.
- ✅ Legacy `default-image.png` removed and all fallbacks reference `default-thumbnail.png`.
- ⚠️ Ensure future apps add their `/img/app/*` tree following the same naming template before shipping.

---

## 5. Copilot Sync Policy

- Figma export directory is the single source of truth.
- Repo assets must match Figma exports in filename, dimensions, and directory placement.
- Allowed directories:
  - Core → `/img/core/...`
  - Ecosystem → `/img/ecosystem/...`
  - App → `/img/app/...`
- No additional buckets or legacy names (e.g., `default-image.png`) unless the spec is updated first.
- When syncing, Copilot should:
  1. Diff staging vs repo.
  2. Promote new exports.
  3. Remove obsolete files.
  4. Update documentation if conventions change.
- Any new fallback assets must be documented here and in the FireUX Image Spec before use.
