# Core Image System — Figma Build Spec

This page defines the canonical, source-of-truth FireUX core assets.  
Every ecosystem and every app will inherit from what is created here.

---

## Frame: core-brand

Include the following items, each placed exactly as described:

### 1. FireUX Logo (PNG)

- Export size: **512×512**
- Place logo centered on a transparent rectangle:
  - Name: `bg-logo`
  - Size: **512×512**
  - Fill: transparent

### 2. Wordmark Dark (PNG)

- Export size: **768×192**
- Place wordmark centered on a dark rectangle:
  - Name: `bg-dark`
  - Size: **768×192**
  - Fill: `#0F172A` (dark background)

### 3. Wordmark Light (PNG)

- Export size: **768×192**
- Place wordmark centered on a light rectangle:
  - Name: `bg-light`
  - Size: **768×192**
  - Fill: `#F8FAFC` (light background)

### 4. Wordmark Light (SVG)

- Vector preview only
- Place SVG at approx **350px width**
- No background rectangle
- Label: “SVG version”

This frame is complete when all **four** assets are present and aligned.

---

## Frame: core-auth-buttons

Place the Google-provided button assets exactly at their native size.  
Do **not** resize or normalise dimensions.

- `sign-in-light.svg` — **175×40**
- `sign-in-dark.svg` — **175×40**
- `sign-up-light.svg` — **179×40**
- `sign-up-dark.svg` — **179×40**

Stack vertically with clean spacing.  
These are authoritative and must remain untouched.

---

## Frame: core-defaults

Create the system-wide fallback images.  
Each should be a yellow rectangle using FireUX primary:

- Fill: `#EAB308`
- (Optional) centered text labels inside for clarity

### Required defaults:

1. **default-avatar.png**

   - Size: **512×512**
   - Square avatar fallback

2. **default-cover.png**

   - Size: **1280×720**
   - Cover images for blogs, jobs, recipes, etc.

3. **default-thumbnail.png**

   - Size: **256×256**
   - Small cards, thumbnails, lists

4. **default-icon.png**
   - Size: **512×512**
   - General fallback for icons/logos

These sizes were selected by analysing requirements across:

- ecosystems (cleanbox, misebox)
- apps (fireux-app, cleanbox-app, misebox-app)
- Firestore objects (profiles, blogs, jobs, places)
- components (cards, avatars, covers)

This ensures every area of the FireUX ecosystem has a guaranteed sensible fallback.

---

## Summary: What the Core Page Must Contain

Core Page
├─ Frame: core-brand
│ ├─ logo 512×512
│ ├─ wordmark-dark 768×192
│ ├─ wordmark-light 768×192
│ └─ wordmark-light.svg
│
├─ Frame: core-auth-buttons
│ ├─ sign-in-light.svg
│ ├─ sign-in-dark.svg
│ ├─ sign-up-light.svg
│ └─ sign-up-dark.svg
│
└─ Frame: core-defaults
├─ default-avatar 512×512
├─ default-cover 1280×720
├─ default-thumbnail 256×256
└─ default-icon 512×512

This is the **definitive specification** the designs will be built from in Figma.

---

If you want to proceed, I can now generate the Ecosystem Template page spec in the same format (Cleanbox/Misebox).
