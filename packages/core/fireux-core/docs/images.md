# FireUX Image System — Specification

**Version:** 1.4  
**Last Updated:** 2025-11-24  
**Status:** Canonical Source of Truth

This document defines the complete image architecture for the FireUX mono-repo: directory rules, required assets for core → ecosystem → app → tenant, PNG pixel sizes, SVG vector rules, Figma templates, fallback behaviour, the Figma export staging folder, and enforcement. All FireUX packages and apps MUST follow this specification.

---

## 0. Overview of the Image System

FireUX uses three strictly controlled image buckets:

```
/img/core/...         ← global FireUX system
/img/ecosystem/...    ← each ecosystem (fireux-misebox, fireux-cleanbox, ...)
/img/app/...          ← each app and tenant
```

No other directories are permitted. Apps fall back to ecosystem → core when an asset is missing.

> Note: fresh exports land in the `figma-export/` staging folder first (see §9) before being copied into these canonical buckets.

---

## 1. Directory Structure (Strict Rules)

Every image MUST live in exactly one of:

1. `/img/core/` — global branding and defaults provided by fireux-core
2. `/img/ecosystem/<ecosystem>/` — branding for a specific ecosystem
3. `/img/app/<app>/` — branding for individual apps and tenants

Nothing outside these three buckets is allowed. Apps always resolve images using the fallback order defined in §6.

> Staging reminder: export assets to `figma-export/` first, then promote them into these production paths after verification.

---

## 2. Core Image Requirements

**Path:** `packages/core/fireux-core/src/runtime/public/img/core/`

Core provides foundational brand assets and global fallbacks.

### 2.1 Core PNG Brand Assets (fixed pixel sizes)

```
/img/core/brand/logo.png               (512×512)
/img/core/brand/wordmark-dark.png      (768×192)
/img/core/brand/wordmark-light.png     (768×192)
```

### 2.2 Core SVG Brand Asset (vector, infinite scale)

```
/img/core/brand/wordmark-light.svg     (vector, scalable — no pixel constraints)
```

Requirements:

- exported as pure vector
- no raster layers
- no background rectangles
- no clipping masks

### 2.3 Google Auth Buttons (official, immutable)

```
/img/core/auth/sign-in-light.svg       (175×40)
/img/core/auth/sign-in-dark.svg        (175×40)
/img/core/auth/sign-up-light.svg       (179×40)
/img/core/auth/sign-up-dark.svg        (179×40)
```

These are official Google assets and MUST remain unchanged:

- no colour edits
- no size changes
- no renaming
- no recompression

### 2.4 Global Default Fallbacks

```
/img/core/defaults/default-avatar.png      (512×512)
/img/core/defaults/default-cover.png       (1280×720)
/img/core/defaults/default-thumbnail.png   (256×256)
```

Default FireUX fallback background colour: `#F5DFA8` (soft warm neutral).

---

## 3. Ecosystem Image Requirements

**Path:** `packages/ecosystem/<ecosystem-name>/src/runtime/public/img/ecosystem/`

Each ecosystem (FireUX, Misebox, Cleanbox, etc.) must supply its own identity layer.

### 3.1 Ecosystem PNG Assets (required)

```
/img/ecosystem/logo.png                (512×512)
/img/ecosystem/avatar.png              (512×512)
/img/ecosystem/wordmark-dark.png       (768×192)
/img/ecosystem/wordmark-light.png      (768×192)
```

### 3.2 Ecosystem SVG Asset (vector)

```
/img/ecosystem/wordmark-light.svg      (vector, scalable — no pixel constraints)
```

Requirements:

- no background rectangle
- exported at natural vector size
- can be scaled arbitrarily by the app

No ecosystem-level defaults exist; if an ecosystem asset is missing, resolution will fall through to core defaults as described in §6.

---

## 4. App Image Requirements

**Path:** `projects/<ecosystem>/<app>/public/img/app/`

Each app and tenant must supply its own brand layer.

### 4.1 App PNG Brand Assets (required)

```
/img/app/logo.png                (512×512)
/img/app/wordmark-dark.png       (768×192)
/img/app/wordmark-light.png      (768×192)
/img/app/cover.png               (1280×720)
/img/app/thumbnail.png           (256×256)
```

### 4.2 App SVG Brand Asset (vector)

```
/img/app/wordmark-light.svg      (vector, scalable — no pixel constraints)
```

As with core and ecosystem SVGs:

- no backgrounds
- no clipping masks
- pure vector only

### 4.3 App PWA Icons (strict squares)

```
/img/app/pwa/icon-192.png        (192×192)
/img/app/pwa/icon-512.png        (512×512)
```

PWA icon requirements:

- MUST be perfect squares
- MUST be centred and legible at small sizes
- SHOULD have transparent backgrounds when possible

### 4.4 App Assets Bucket (unrestricted)

```
/img/app/assets/*
```

Use this bucket for:

- tech stack panels
- screenshots
- marketing visuals
- tenant/client imagery
- any other non-mandatory imagery

There are no enforced validation rules inside `assets/`. Only the brand assets, surfaces, and PWA icons are enforced.

---

## 5. Figma Templates

All Figma layers and frames MUST use kebab-case naming.

Colour systems in Figma should:

- use canonical brand colours (Tailwind/Nuxt UI-based)
- ignore black and white as “primary” colours
- avoid inventing extra, undocumented colour tokens

The templates below describe the expected structure of each page in the FireUX Figma files.

### 5.1 Core Template

```
core-brand
├── bg-logo-square (512×512)
├── logo-512
├── bg-wordmark-dark (768×192)
├── wordmark-dark-768
├── bg-wordmark-light (768×192)
├── wordmark-light-768
└── wordmark-light-svg

core-auth-buttons
├── sign-in-light
├── sign-in-dark
├── sign-up-light
└── sign-up-dark

core-defaults
├── default-avatar
├── default-cover
└── default-thumbnail
```

- `bg-*` layers are simple background rectangles for export framing.
- `*-svg` layers are vector-only assets without backgrounds.

### 5.2 Ecosystem Template

```
ecosystem-brand
├── ecosystem-logo (512×512)
├── ecosystem-avatar (512×512)
├── ecosystem-wordmark-dark (768×192)
├── ecosystem-wordmark-light (768×192)
└── ecosystem-wordmark-light-svg
```

Only these five layers should exist in the ecosystem brand frame. Additional ecosystem imagery belongs in that ecosystem’s app `assets/` buckets.

### 5.3 App Template

```
app-brand
├── app-logo (512×512)
├── app-wordmark-dark (768×192)
├── app-wordmark-light (768×192)
└── app-wordmark-light-svg

app-surfaces
├── app-cover (1280×720)
└── app-thumbnail (256×256)

app-pwa
├── app-icon-192 (192×192)
└── app-icon-512 (512×512)
```

All additional app-specific imagery belongs under `/img/app/assets/*` and does not change the template above.

---

## 6. Fallback Resolution Order

When FireUX code requests an image, resolution MUST follow this order:

1. App-level: `/img/app/...`
2. Ecosystem-level: `/img/ecosystem/...`
3. Core-level defaults: `/img/core/defaults/...`

This guarantees:

- apps override ecosystems
- ecosystems override core
- core always provides a stable minimum

If all three levels fail, the caller should handle the missing asset in code (for example, by rendering a solid background with text).

---

## 7. Enforcement Rules

Automation MUST validate:

- filenames match exactly the names in this spec
- files are placed in the correct folder
- PNG assets match their specified pixel sizes
- only the whitelisted SVGs exist and they contain no raster content or backgrounds
- PWA icons are perfect squares (192×192, 512×512)
- Google Auth buttons are not modified in any way
- path resolution logic follows the app → ecosystem → core order

Relevant scripts:

- `guard-assets-structure.mjs`
- `env-check.ts`
- `useImageStorage.ts`

---

## 8. Future Extensions

Planned but not yet enforced:

- multi-density assets (1×, 2×, 3×)
- compression and optimisation rules
- WebP alternatives
- CDN proxying for all buckets
- light/dark variants per ecosystem and app

---

## 9. Figma Export Staging Folder (`figma-export/`)

Designers export assets into a staging area kept outside the canonical `/img/**` buckets. The expected structure:

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

This folder may live beside the mono-repo (symlinked in), inside the repo but git-ignored, or added to the VS Code workspace as an external folder. Automation and Copilot must treat it as read-only staging.

### 9.1 Mapping `figma-export/` → Production Buckets

- `figma-export/core/brand/*` → `packages/core/fireux-core/src/runtime/public/img/core/brand/*`
- `figma-export/core/auth/*` → `packages/core/fireux-core/src/runtime/public/img/core/auth/*`
- `figma-export/core/defaults/*` → `packages/core/fireux-core/src/runtime/public/img/core/defaults/*`
- `figma-export/ecosystems/<ecosystem>/*` → `packages/ecosystem/<ecosystem>/src/runtime/public/img/ecosystem/*`
- `figma-export/apps/<app>/*` → `projects/<ecosystem>/<app>/public/img/app/*`

Copilot should preserve filenames and subfolders during promotion and never invent alternate destinations.

---

END OF SPEC (Version 1.4)
