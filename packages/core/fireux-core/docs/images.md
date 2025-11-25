# FireUX Image System — Specification

**Version:** 1.0  
**Last updated:** 2025-11-24  
**Status:** Canonical Source of Truth

This document defines the **image structure**, **naming rules**, **minimum required assets**,  
and **Figma templates** for the entire FireUX mono-repo (core → ecosystem → app → tenant).

All packages, ecosystems, and apps MUST follow this specification.

---

# 1. Directory Structure

All images in the mono-repo must live under these 3 buckets:

```
/img/core/…         ← provided by fireux-core (shared globally)
/img/ecosystem/…    ← provided by each ecosystem package
/img/app/…          ← provided by each app (project)
```

No package or project may place images outside these 3 buckets.

---

# 2. Core Image Requirements

**Path:** `packages/core/fireux-core/src/runtime/public/img/core/`

Core provides ONLY the universal, shared assets needed by all FireUX apps.

## 2.1 Required Files

### Brand

```
/img/core/brand/logo.png               (512×512 PNG)
/img/core/brand/wordmark-dark.png      (768×192 PNG)
/img/core/brand/wordmark-light.png     (768×192 PNG)
/img/core/brand/wordmark-light.svg     (vector, no enforced size)
```

### Auth Buttons (Google official assets)

```
/img/core/auth/sign-in-light.svg       (175 × 40)
/img/core/auth/sign-in-dark.svg        (175 × 40)
/img/core/auth/sign-up-light.svg       (179 × 40)
/img/core/auth/sign-up-dark.svg        (179 × 40)
```

These must remain **pixel-perfect** and **unmodified**.

### Defaults

These are used when an ecosystem or app does NOT provide its own.

```
/img/core/defaults/default-avatar.png      (512×512)
/img/core/defaults/default-cover.png       (1280×720)
/img/core/defaults/default-thumbnail.png   (256×256)
```

Default background colour used for placeholders: **#EAB308**.

---

# 3. Ecosystem Image Requirements

**Path:** `packages/ecosystem/<ecosystem-name>/src/runtime/public/img/ecosystem/`

Every ecosystem MUST supply its own identity.

## 3.1 Required Files

```
/img/ecosystem/logo.png            (512×512 PNG)
/img/ecosystem/avatar.png          (512×512 PNG)
/img/ecosystem/wordmark.png        (≥256×64 PNG, aspect ≥3:1)
```

## 3.2 Optional Ecosystem Files

```
/img/ecosystem/logo.svg
/img/ecosystem/wordmark-light.svg
/img/ecosystem/wordmark-dark.svg
```

These SVGs are allowed but not enforced.

---

# 4. App Image Requirements

**Path:** `projects/<ecosystem>/<app-name>/public/img/app/`

Every app (main app + each tenant app) MUST implement the following.

## 4.1 Required Files

```
/img/app/logo.png            (512×512 PNG)
/img/app/wordmark.png        (≥256×64 PNG)
/img/app/cover.png           (1280×720 PNG)
/img/app/thumbnail.png       (256×256 PNG)
```

These may override ecosystem visuals, which may override core.

## 4.2 PWA Icons

PWA icons are **app-only**, never core or ecosystem.

```
/img/app/pwa/icon-192.png    (192×192 PNG)
/img/app/pwa/icon-512.png    (512×512 PNG)
```

These MUST be square.

## 4.3 Optional Additional App Assets

(Free choice per app)

```
/img/app/stack/…           ← tech stack (fireux-app only)
/img/app/restaurant/…      ← misebox-app only
/img/app/cleaning/…        ← cleanbox-app only
```

---

# 5. Figma Template Requirements

Figma must contain the following frames, sizes, and naming conventions.

The naming MUST be **kebab-case**.

---

# 5.1 Core Page (Figma Page 1)

### Frame: `core-brand`

```
core-brand (FRAME)
├── bg-logo-square (512×512, transparent)
├── logo-512 (placed on bg-logo-square)
├── bg-wordmark-dark (768×192, #0F172A)
├── wordmark-dark-768
├── bg-wordmark-light (768×192, #F8FAFC)
├── wordmark-light-768
└── wordmark-light-svg (vector, ~350px width)
```

### Frame: `core-auth-buttons`

```
core-auth-buttons (FRAME)
├── sign-in-light (175×40)
├── sign-in-dark (175×40)
├── sign-up-light (179×40)
└── sign-up-dark (179×40)
```

### Frame: `core-defaults`

```
core-defaults (FRAME)
├── default-avatar (512×512, #EAB308)
├── default-cover (1280×720, #EAB308)
└── default-thumbnail (256×256, #EAB308)
```

---

# 5.2 Ecosystem Template Page (Figma Page 2)

This page is duplicated for each ecosystem.

### Frame: `ecosystem-brand`

```
ecosystem-brand (FRAME)
├── ecosystem-logo (512×512)
├── ecosystem-avatar (512×512)
└── ecosystem-wordmark (≥256×64)
```

### Frame: `ecosystem-defaults`

(If ecosystem wants to override core)

```
ecosystem-default-avatar (optional)
ecosystem-default-cover (optional)
ecosystem-default-thumbnail (optional)
```

---

# 5.3 App Template Page (Figma Page 3)

This page is duplicated for each app.

### Frame: `app-brand`

```
app-brand (FRAME)
├── app-logo (512×512)
├── app-wordmark (≥256×64)
├── app-cover (1280×720)
└── app-thumbnail (256×256)
```

### Frame: `app-pwa`

```
app-pwa (FRAME)
├── app-icon-192 (192×192)
└── app-icon-512 (512×512)
```

### Frame: `app-defaults`

(Only if overriding ecosystem defaults)

```
app-default-avatar (optional)
app-default-cover (optional)
app-default-thumbnail (optional)
```

---

# 6. Fallback Resolution Order

When an app requests an image, the system resolves in this order:

```
1. app  →  /img/app/…
2. ecosystem  →  /img/ecosystem/…
3. core  →  /img/core/defaults/…
```

This ensures:

- apps can fully customize
- ecosystems can standardize branding
- core always guarantees a minimum spec

---

# 7. Reference: Current App Implementations

Use this snapshot to verify every shipped app supplies the required assets.

## Cleanbox SaaS (`projects/cleanbox/cleanbox-app`)

- **Missing:** `/public/img/app/logo.png`
- **Missing:** `/public/img/app/wordmark.png`
- **Missing:** `/public/img/app/cover.png`
- **Missing:** `/public/img/app/thumbnail.png`
- `/public/icon-192x192.png` (current bitmap 144×193 — needs 192×192)
- `/public/icon-512x512.png` (current bitmap 144×193 — needs 512×512)

## Cleanbox Tenant — Richies Reinigung (`projects/cleanbox/richies-reinigung`)

- **Missing:** `/public/img/app/logo.png`
- **Missing:** `/public/img/app/wordmark.png`
- **Missing:** `/public/img/app/cover.png`
- **Missing:** `/public/img/app/thumbnail.png`
- `/public/icon-192x192.png` (current bitmap 144×193 — needs 192×192)
- `/public/icon-512x512.png` (current bitmap 144×193 — needs 512×512)

## Misebox SaaS (`projects/misebox/misebox-app`)

- **Missing:** `/public/img/app/logo.png`
- **Missing:** `/public/img/app/wordmark.png`
- **Missing:** `/public/img/app/cover.png`
- **Missing:** `/public/img/app/thumbnail.png`
- `/public/icon-192x192.png` (current bitmap 144×193 — needs 192×192)
- `/public/icon-512x512.png` (current bitmap 144×193 — needs 512×512)

## Misebox Tenant — Niederhorn (`projects/misebox/niederhorn`)

- **Missing:** `/public/img/app/logo.png`
- **Missing:** `/public/img/app/wordmark.png`
- **Missing:** `/public/img/app/cover.png`
- **Missing:** `/public/img/app/thumbnail.png`
- `/public/icon-192x192.png` (current bitmap 144×193 — needs 192×192)
- `/public/icon-512x512.png` (current bitmap 144×193 — needs 512×512)

## FireUX Marketing App (`projects/fireux/fireux-app`)

- **Missing:** `/public/img/app/logo.png`
- **Missing:** `/public/img/app/wordmark.png`
- **Missing:** `/public/img/app/cover.png`
- **Missing:** `/public/img/app/thumbnail.png`
- **Missing:** `/public/icon-192x192.png`
- **Missing:** `/public/icon-512x512.png`
- `/public/img/app/stack/*` (marketing badges only; not part of the critical contract)

> Keep this list in sync when new apps/tenants ship or when an app gains additional brand surfaces.

---

# 8. Enforcement

Future automation scripts:

- `guard-assets-structure.mjs`
- `env-check.ts`
- `useImageStorage.ts`

MUST validate that:

- dimensions match
- filenames match the spec
- no images live outside the 3 buckets
- fallbacks follow the correct order

---

# 9. Future Extensions

This spec will eventually expand with:

- multi-density icons (1×, 2×, 3×)
- image compression rules
- CDN proxying
- optional WebP alternatives

---

# END OF SPEC
