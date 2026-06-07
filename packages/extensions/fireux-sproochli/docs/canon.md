# fireux-sproochli Canon
Authority: Tier1 (Package canon)
Updated: 2026-06-07

## 1) Purpose
- Own reusable multilingual info-page primitives for QR-friendly FireUX pages.
- Provide shared types and helpers for language normalization, RTL direction, localized text resolution, translation cache merging, and public info-page response shaping.

## 2) Canonical Terms
- `InfoPage`: a multilingual public information page made of ordered sections and blocks.
- `InfoPlace`: the info-page owner/context used by Sproochli routes and responses.
- `InfoPlace` is not canonical `fireux-places` `Place`.
- `Maintainer`: a person trusted to keep Sproochli content accurate. This term covers BNB hosts, apartment managers, restaurant/menu managers, shop owners, and local info editors.

Current runtime types still export `Place` for the Sproochli info-page context. Treat that type as Sproochli `InfoPlace` semantics, not as FireUX canonical Place identity. Renaming or adding an `InfoPlace` export is future alignment, not implemented canon yet.

## 3) Route Identity
- Current app route shape is `/info/[placeSlug]/[pageSlug]`.
- `placeSlug` identifies the Sproochli info context for that route.
- `pageSlug` identifies the info page within that context.
- This route identity does not change the FireUX Place canon, where canonical Place identity remains separate and id-based unless that package declares otherwise.

## 4) Package vs App Boundary
- Package owns generic info-page language helpers, response helpers, and runtime config exposure under `runtimeConfig.public.fireux.sproochli`.
- Package owns generic public language UI/helpers, including the Sproochli language picker and translated-text resolver.
- Package owns provider-client helpers for Sproochli tool calls, including provider URL resolution and Menu translation response/request types.
- The public consuming-app helper seam is `fireux-sproochli/runtime/sproochli`.
- Consuming apps must not import deep paths under `fireux-sproochli/runtime/composables/fireux/sproochli`; those paths are package internals and may move.
- The Sproochli app owns prototype public routes, sample content, page styling, public JSON endpoint behavior, and provider-style tool/API surfaces.
- Current Sproochli tool/API seam:
  - `/tools/menu` embeds the Menu translation provider tool.
  - `/api/tools/menu` returns the Menu tool contract.
  - `/api/tools/menu/translate` generates translated text, cache IDs, and source hashes.
  - The tool contract uses the shared FireUX `ToolProviderToolContract` family.
  - The tool accepts consuming-app menu text. It does not own Misebox Kitchen/Menu/Dish truth.
- Domain meaning stays with the consuming app. This package must not import Misebox, kitchens, suppliers, menus, restaurants, QR generators, or app-specific product models.
- Sproochli may generate language/copy packs for consuming apps, but those packs remain stored in the owning app or ecosystem database unless a separate Sproochli service-job record is explicitly introduced.
- Tool provider rule: Sproochli hosts Sproochli, the same way Go QR hosts Go QR. Consuming apps call the provider endpoint for translation generation and then write their own storage truth.
- Consuming apps may call Sproochli provider-client helpers, but they must not duplicate supported language registries, provider host URLs, or Sproochli response contracts.

## 5) Multilingual Responsibility
- Owner-written original content is the base truth.
- Certified translations may be supplied as explicit localized fields.
- Generated/cached translations may be merged into public responses when supplied by the app.
- The public response must expose the resolved language, requested language, text direction, and translation source.
- Public language pickers may group options as:
  - original
  - attached
  - cache
  - public
  - on-demand
- Guest-facing language pickers should not expose technical cache labels; admin/debug views may show labels for inspection.

## 6) Non-Goals
- Not the Sproochli product app shell.
- Not canonical `fireux-places`.
- Not an editor, QR generator, restaurant, menu, supplier, or kitchen package.
- The reusable package is not the AI translation provider. The Sproochli app provider endpoint is the translation generation host.

## 7) Future / Not Canon Yet
- The Sproochli app owns its product storage path: `sproochli_sites/{siteId}` with `maintainers`, `pages`, `sections`, and `translation_cache` subcollections.
- The shared package does not yet own mutation entrypoints for those records.
- Translation generation, translation mutation endpoints, QR creation, and package-owned public routes are not canon yet.
