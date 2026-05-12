# fireux-sproochli Canon
Authority: Tier1 (Package canon)
Updated: 2026-05-12

## 1) Purpose
- Own reusable multilingual info-page primitives for QR-friendly FireUX pages.
- Provide shared types and helpers for language normalization, RTL direction, localized text resolution, translation cache merging, and public info-page response shaping.

## 2) Canonical Terms
- `InfoPage`: a multilingual public information page made of ordered sections and blocks.
- `InfoPlace`: the info-page owner/context used by Sproochli routes and responses.
- `InfoPlace` is not canonical `fireux-places` `Place`.

Current runtime types still export `Place` for the Sproochli info-page context. Treat that type as Sproochli `InfoPlace` semantics, not as FireUX canonical Place identity. Renaming or adding an `InfoPlace` export is future alignment, not implemented canon yet.

## 3) Route Identity
- Current app route shape is `/info/[placeSlug]/[pageSlug]`.
- `placeSlug` identifies the Sproochli info context for that route.
- `pageSlug` identifies the info page within that context.
- This route identity does not change the FireUX Place canon, where canonical Place identity remains separate and id-based unless that package declares otherwise.

## 4) Package vs App Boundary
- Package owns generic info-page language helpers, response helpers, and runtime config exposure under `runtimeConfig.public.fireux.sproochli`.
- The Sproochli app currently owns the prototype public route, sample content, page styling, and public JSON endpoint behavior.
- Domain meaning stays with the consuming app. This package must not import Misebox, kitchens, suppliers, menus, restaurants, QR generators, or app-specific product models.

## 5) Multilingual Responsibility
- Owner-written original content is the base truth.
- Certified translations may be supplied as explicit localized fields.
- Generated/cached translations may be merged into public responses when supplied by the app.
- The public response must expose the resolved language, requested language, text direction, and translation source.

## 6) Non-Goals
- Not the Sproochli product app shell.
- Not canonical `fireux-places`.
- Not an AI translation provider.
- Not an editor, QR generator, restaurant, menu, supplier, or kitchen package.

## 7) Future / Not Canon Yet
- Firestore storage paths, editor workflows, translation generation, QR creation, and package-owned public routes are not canon yet.
- If Sproochli later stores records, this canon must be updated before declaring collection paths or mutation entrypoints authoritative.
