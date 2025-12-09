# FIReUX Design System – Figma Workflow Guide for Copilot

**Version:** 1.1  
**Last Updated:** 2025-11-27  
**Role:** Canonical instructions for how FIReUX uses Figma  
**Audience:** GitHub Copilot + AI Assistants working in this repository

---

## 0. Purpose of This Document

This document explains how the FireUX Design Kit works:

- how brand images are created in Figma
- how they are exported
- how they land in the `figma-export/` staging folder
- how they map into the `/img` buckets used throughout the mono-repo

Copilot must follow the rules described here when generating:

- image-related code
- Figma layer names
- brand asset specifications
- instructions for designers
- automated checks (for example, `guard-assets` scripts)
- guidance for the user

This keeps the FireUX ecosystem consistent and predictable. For storage, file locations, and runtime rules, Copilot must also follow `images.md` (FireUX Image System — Specification).

---

## 1. Figma File Structure (Canonical)

The FireUX Design Kit uses **exactly three pages** in Figma:

1. `FIReUX Variables`
2. `Ecosystem Template`
3. `App Template`

No extra pages are required for the base kit.

### 1.1 FIReUX Variables (Page 1)

Permanent home of all FireUX colour tokens.

**Contains:**

- Tailwind/Nuxt UI primary colour families (red → pink/rose)
- Tailwind/Nuxt UI neutral families (slate, gray, zinc, neutral, stone)
- Shades `50 → 900` for each family
- All colours stored as **local Figma variables**

Variables are grouped roughly as:

- `color.primary.*`
- `color.neutral.*`
- `color.semantic.*` (future)
- `color.app.*` (per app/tenant, future)

**Important rules:**

- Treat **primary** and **neutral** families as the main building blocks.
- **Black and white are not part of the primary/neutral palette** for branding decisions.
- Alpha variants (for example, `primary-alpha`, `neutral-alpha`) exist but are reserved for future refinement.

#### 1.1.1 Nuxt UI Token Mapping

Nuxt UI uses high-level tokens which map to the local Figma variables:

- `--ui-primary` → `primary-500` (light mode) / `primary-400` (dark mode)
- `--ui-neutral` → `neutral-500`

For FireUX (core brand):

- The **primary** family has been changed from Nuxt UI’s default green to **yellow**.
- The **neutral** family has been changed from `slate` to **`zinc`**.
- Alpha families remain at their defaults for now (TODO in future).

Example Nuxt app config that should conceptually match this page:

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'yellow',
      neutral: 'zinc',
    },
  },
})
```

It should conceptually match the palette defined in this Figma page.

This page does not contain:

- logos
- brand images
- templates

It is purely the design-token source of truth.

### 1.2 Ecosystem Template (Page 2)

Defines the exact frames required for each ecosystem (FireUX, Misebox, Cleanbox, etc.).

```
ecosystem-brand
├── ecosystem-logo (512×512)
├── ecosystem-avatar (512×512)
├── ecosystem-wordmark-dark (768×192)
├── ecosystem-wordmark-light (768×192)
└── ecosystem-wordmark-light-svg (vector only)
```

Rules:

- Only these five layers exist on this page.
- All names use kebab-case exactly as written.
- Initial rectangles can be filled using `--ui-primary-400` (or the environment’s primary tone).
- Designers replace the rectangles with real artwork before export.
- Ecosystem wordmarks should export with transparent backgrounds. Any background plate happens at layout time.

Each ecosystem gets its own file based on this template.

### 1.3 App Template (Page 3)

Defines the asset layout for every app and tenant.

```
app-brand
├── app-logo (512×512)
├── app-wordmark-dark (768×192)
├── app-wordmark-light (768×192)
└── app-wordmark-light-svg (vector)

app-surfaces
├── app-cover (1280×720)
└── app-thumbnail (256×256)

app-pwa
├── app-icon-192 (192×192)
└── app-icon-512 (512×512)
```

Rules:

- These eight items are required for each app.
- All names use kebab-case exactly as written.
- Initial blocks may be coloured with `--ui-primary-400` to preview branding.
- Logos and wordmarks should export with transparent backgrounds unless an intentional solid plate is required.
- Any extra app imagery must be exported into `/img/app/assets/*` (no spec on names or sizes there).

---

## 2. How Copilot Should Respond to Designer Questions

When asked about:

- required assets
- Figma structure
- layer names
- image sizes
- filenames
- where to export assets

Copilot MUST answer using:

- the three Figma page templates above
- exact kebab-case layer names
- the pixel-perfect dimensions listed in `images.md`
- the fallback rules from `images.md` (§6)
- the staging flow described in this document (§3)

Copilot must not invent:

- new filenames
- new sizes
- new folders
- extra pages for the base kit

If a user suggests a conflicting name or size, Copilot should correct them back to the canonical spec.

---

## 3. Figma → `figma-export/` → Repo Flow

Designers export from Figma into a staging folder, not directly into `packages/` or `projects/`.

```
figma-export/
├── core/
│   ├── brand/
│   ├── auth/
│   └── defaults/
├── ecosystems/
│   ├── fireux-fireux/
│   ├── fireux-misebox/
│   └── fireux-cleanbox/
└── apps/
    ├── fireux-app/
    ├── misebox-app/
    ├── niederhorn-app/
    ├── cleanbox-app/
    ├── cleanbox-team-app/
    └── cleanbox-tenant-app/
```

Copilot’s responsibilities:

- assume this folder is present (inside the repo but ignored, symlinked, or added to the workspace)
- reference this path when writing copy/move scripts or task lists
- treat `figma-export/` as staging only; production assets live under `/img/**`

### 3.1 Mapping Rules for Copilot (Staging → Production)

- `figma-export/core/brand/*` → `packages/core/fireux-core/src/runtime/public/img/core/brand/*`
- `figma-export/core/auth/*` → `packages/core/fireux-core/src/runtime/public/img/core/auth/*`
- `figma-export/core/defaults/*` → `packages/core/fireux-core/src/runtime/public/img/core/defaults/*`
- `figma-export/ecosystems/<ecosystem>/*` → `packages/ecosystem/<ecosystem>/src/runtime/public/img/ecosystem/*`
- `figma-export/apps/<app>/*` → `projects/<ecosystem>/<app>/public/img/app/*`

Copilot must preserve filenames and subfolder structure when proposing automation.

---

## 4. Export Rules

Exports from Figma MUST match the required specs from `images.md`.

### 4.1 PNG assets (fixed sizes)

- 512×512 — logos, avatars
- 768×192 — wordmarks (dark and light)
- 1280×720 — cover images
- 256×256 — thumbnails
- 192×192 — PWA icon (small)
- 512×512 — PWA icon (large)

### 4.2 SVG assets (vector, no background)

Allowed SVGs:

- `wordmark-light.svg`
- `ecosystem-wordmark-light.svg`
- `app-wordmark-light.svg`

Requirements:

- no background rectangles
- no clipping masks
- no embedded rasters
- exported as clean vectors

---

## 5. Mapping Figma → Repository Buckets

When reasoning about final destinations, Copilot must always map exports to the correct buckets:

- Core assets → `/img/core/*`
- Ecosystem assets → `/img/ecosystem/<ecosystem>/*`
- App assets → `/img/app/<app>/*`

Within those:

- `logo.png`, `wordmark-*.png`, `cover.png`, `thumbnail.png`, `icon-*.png`, and `wordmark-light.svg` must follow the locations and sizes in `images.md`.
- Any extra imagery belongs under `/img/app/assets/*`.

No other place in the repo is permitted for image storage.

---

## 6. Rules Copilot Must Enforce

Whenever writing code or instructions involving images, Copilot must ensure:

- filenames match exactly those defined in `images.md`
- PNGs use the exact pixel sizes specified; PWA icons are squares
- files live in `/img/core`, `/img/ecosystem/<ecosystem>`, or `/img/app/<app>` only
- the three-page limit (for the base kit) remains in place
- kebab-case naming is preserved for all frames and layers
- SVG usage stays limited to the specified wordmark-light variants
- Google Auth buttons remain unchanged in `/img/core/auth`
- `figma-export/` is treated as staging and never as the production source

If user instructions conflict with these rules, Copilot should gently correct them back to spec.

---

## 7. How Copilot Should Help with Real Work

Copilot may be asked to:

- create asset lists for new apps or ecosystems
- validate that an ecosystem file has all five required layers
- validate that an app file has all eight required layers
- generate placeholder descriptions (for example, “make app-cover a marketing hero image”)
- show where to place exported files in the repo, starting from `figma-export/`
- generate Figma-ready task lists such as:
  - “Create ecosystem-logo at 512×512 using primary-500”
  - “Export app-icon-192 and app-icon-512 as square PNGs”
- warn about mismatched sizes or wrong folders
- generate or update `guard-assets-structure.mjs` checks
- produce scripts for syncing from `figma-export/` into the canonical `/img` buckets

For all such requests, Copilot must reference:

- this `figma.md` guide, and
- the `images.md` FireUX Image System specification.

These two documents together are the single source of truth for images and Figma workflows in the FireUX ecosystem.
