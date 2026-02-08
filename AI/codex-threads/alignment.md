# Alignment Notes — use*Interface (2026-02-07)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Scope: `use*Interface` siblings across core + extensions, with emphasis on `useProductInterface`.

## Canon (baseline expectations)
- Interfaces are deterministic: no “smart” fallback chains that hide missing data.
- Prefer single-source fields over “best-guess” fallbacks.
- `card()` is the canonical minimal view model; other views should not add hidden fallbacks.
- Products must follow the canon: keep `useProductInterface` minimal (name/description/image).

## Current Alignment Snapshot
**Lean interfaces (card + searchText only):**
- `useProductInterface`
- `useBlogInterface`
- `useJobInterface`
- `useAppInterface`
- `useUserInterface`

**Rich interfaces (card + pill/cell/preview/profile):**
- `usePlacesInterface`
- `useCompanyInterface`
- `useKitchenInterface`

**Profile interfaces (with hydration/secondary media):**
- `useAgentInterface`
- `useProfessionalInterface`

## Fallbacks to Flag (avoid by default)
### Places
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ""`
- Preview defaults:
  - `source: target.source ?? "fireux"`
  - `prop: brand_tagline || short_name || ""`

### Companies
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ""`
- Cell/Preview/Profile `prop` fallbacks:
  - `brand_tagline || website || shortName`
- Preview default:
  - `source: target.source ?? "fireux"`

### Kitchens
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ""`
- Cell/Preview/Profile `prop` fallbacks:
  - `brand_tagline || website || shortName`
- Preview default:
  - `source: target.source ?? "fireux"`

### Jobs
- Subtitle uses only `workplace.short_address` (empty if missing).

### Agent
- Headline/summary fallback chains:
  - `agent_headline || title`
  - `agent_summary || bio_short`
- Placement tags fallback:
  - `agent_placement_types || tags`
- Contact fallbacks:
  - `agent_contact_* || contact_*`

### Professional
- Display name depends on hydrated user (no fallback).
- Title uses `job_title` only (no extra fallback).

## Drift Rules
- Drift managers should behave consistently across entities.
- Dev drift should flag only props that fall outside the canonical shape.

## Product Stack Slice Alignment (Create + Index + Solutions)
Scope reviewed:
- `packages/extensions/fireux-products/src/runtime/components/organisms/entities/Product/Create/System.vue`
- `packages/extensions/fireux-products/src/runtime/components/organisms/entities/Product/Create/Write.vue`
- `packages/extensions/fireux-products/src/runtime/pages/products/index.vue`
- `packages/extensions/fireux-products/src/runtime/components/organisms/entities/Product/Solutions.vue`

### Similarities (already aligned with canon)
- Create flow is deterministic: `handleCreate()` blocks on missing name and gates success/reset on `response.success`.
- Page composition is cleanly layered: index page composes solution entry points + collection manager without hidden data transforms.
- Solution cards map through `useProductInterface().card()` before render, keeping the product view model canon-first.

### Diffs to Flag (align candidates)
- `Create/System.vue`: toast acquisition uses runtime fallback (`globalThis as any`) rather than a canonical composable import.
  - Why align: this introduces interface drift and weak typing for a shared UX primitive.
  - Target: standardize on a single toast access pattern across entity create stacks.
- `Create/System.vue`: `createProduct()` call is not wrapped in `try/finally`.
  - Why align: if `createProduct()` throws, `isCreating` can remain `true` and lock submit UX.
  - Target: canonical async guard pattern (`try/catch/finally`) for all create stack submit handlers.
- `Create/System.vue`: clear action uses browser `confirm(...)`.
  - Why align: native confirm is inconsistent with app UI patterns and hard to theme/localize.
  - Target: use shared modal/confirm UX component pattern used by other stacks.
- `Create/Write.vue`: shipping stage is commented out (`<!-- <ProductCreateShipping /> -->`).
  - Why align: stack stage removal-by-comment creates structural drift and uncertainty about intended order.
  - Target: either remove the stage contract explicitly or gate it via feature/runtime config instead of commented markup.
- `pages/products/index.vue`: two near-duplicate descriptions diverge (`pageDescription` vs `definePageMeta.description`).
  - Why align: copy drift creates avoidable inconsistency across SEO/header metadata.
  - Target: one canonical description source for page header + meta.

### Diffs that look intentional (do not force-align)
- `Solutions.vue` hard-codes solution routing for `fireux-app` and `fireux-template`.
  - Keep if these are contractual core offers with dedicated pages; this is specialization, not accidental drift.
- `Write.vue` runtime-configurable `productKinds` fallback list.
  - Keep as extension/runtime variability; this is expected stack-level configurability.

## use*Interface Alignment Batch (2026-02-08)
Scope:
- `usePlacesInterface`
- `useCompanyInterface`
- `useKitchenInterface`
- Profile collection managers that consume interface `searchText` (`Professional`, `Chef`, `Supplier`)

### Completed (aligned)
- Collection managers now use canonical interface search functions instead of bespoke `searchTextFor` builders:
  - `Professional/Collection/Manager.vue`
  - `Chef/Collection/Manager.vue`
  - `Supplier/Collection/Manager.vue`
- Removed pill fallback chains in rich object interfaces:
  - `title: base.title || base.name` -> `title: base.title`
  - `subtitle: base.subtitle || ...` -> `subtitle: base.subtitle`
- Removed `prop` fallback chains in company/kitchen/place object interfaces:
  - now `prop` is sourced directly from `brand_tagline`.
- Removed preview-source defaulting (`?? "fireux"`) in place/company/kitchen interfaces.
  - Preview card components now accept optional `source` to match canonical deterministic mapping.

### Remaining interface drifts to evaluate next
- Agent profile interface still has multiple legacy fallback chains (headline, summary, placement tags, contact fields).
- Chef/Supplier interfaces still intentionally include legacy fallback paths for headline/summary/org fields.
  - Decide whether to preserve as compatibility mode or tighten to single-source canon.

## Watchlist (48h)
- Product interface + product create/validation paths change frequently; keep `useProductInterface` lean.
- Entity collection managers changed recently; re-validate no new fallback chains were added.

## Kitchens DevEntitySystem Alignment (2026-02-08)
Scope reviewed:
- `packages/extensions/fireux-kitchens/src/runtime/pages/dev/fireux-kitchens.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/dev/Kitchen/System.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/dev/Ingredient/System.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/dev/Chef/System.vue`

### Similarities (aligned now)
- All three systems (`DevKitchenSystem`, `DevIngredientSystem`, `DevChefSystem`) now use:
  - a dedicated model surface (`DevModel` inside `UCard`)
  - a collection surface with `DevDriftToolbar`
  - drift copy payload builders (`buildDriftPayload` + `buildCopyPayload`)
  - `driftMode: 'extras-only'` drift behavior
- `/dev/fireux-kitchens` now contains only kitchens-owned entities:
  - kitchens, ingredients, chefs (supplier removed from this page)

### Diffs (why kitchen shows more UI surfaces)
- `DevKitchenSystem` includes `DevKitchenDummy`, which renders all card surfaces:
  - Pill, Cell, Preview, Profile
- `DevIngredientSystem` does not yet include an ingredient dummy/card-surface block.
  - It currently shows only model + drifted collection manager.
  - Kitchens extension also does not yet have ingredient card components (`Pill/Cell/Preview/Profile`) or a kitchens `useIngredientInterface`.
- `DevChefSystem` does not yet include a chef dummy/card-surface block.
  - It currently shows only model + drifted collection manager.
  - Chef card components exist, but no dev dummy surface section is mounted yet.

### Alignment Target (DevEntitySystem principle)
- Canon for each `Dev*System` (entity-owned):
  - Surface A: Dummy card surfaces (Pill, Cell, Preview, Profile)
  - Surface B: Model view (`DevModel`)
  - Surface C: Drifted collection manager (`DevDriftToolbar` + manager)
- Priority to close gaps:
  - P1: Add `DevChefDummy` and mount it in `DevChefSystem`
  - P2: Add kitchens-owned ingredient card stack + `DevIngredientDummy`, then mount in `DevIngredientSystem`

## System-Wide Dev*System Alignment Scan (2026-02-08)
Scope:
- Repo-wide scan for `defineOptions({ name: 'Dev*System' })`
- Dev pages under `runtime/pages/dev/*`

### Dev*System inventory (current)
- `DevProductSystem`
- `DevPlaceSystem`
- `DevJobSystem`
- `DevProfessionalSystem`
- `DevAgentSystem`
- `DevKitchenSystem`
- `DevIngredientSystem`
- `DevChefSystem`
- `DevSupplierSystem` (kitchens handoff-only; no longer mounted on `/dev/fireux-kitchens`)

### Similarities (aligned across systems)
- Entity-owned systems consistently use:
  - model surface (`DevModel`)
  - drift toolbar (`DevDriftToolbar`)
  - collection manager surface
- Drift logic is mostly on `useDevDriftFilter` with `buildDriftPayload` + `buildCopyPayload`.
- Modern pattern (`driftMode: 'extras-only'`) is used by:
  - product, place, kitchen, ingredient, chef

### Diffs (system-wide)
- Dummy card-surface coverage is uneven:
  - Full Pill/Cell/Preview/Profile dummy: `DevProductSystem`, `DevPlaceSystem`, `DevKitchenSystem`, `DevJobSystem`
  - Partial dummy (Pill/Cell/Preview only): `DevAgentSystem`, `DevProfessionalSystem`
  - No dummy yet: `DevIngredientSystem`, `DevChefSystem`
  - Handoff only: `DevSupplierSystem` (no model/drift; points to Misebox owner)
- Required-path drift checks are uneven:
  - Uses `requiredPaths`: product (`slug`), place (`place_type`), kitchen (`name`), ingredient (`name`, `unit`)
  - No `requiredPaths` currently: job, professional, agent, chef

### Dev pages not yet using Dev*System wrappers
- Inline (non-`Dev*System`) dev pages still exist and should be considered in alignment scope:
  - `fireux-companies` dev page
  - `fireux-blogs` dev page
  - `fireux-misebox` dev page (supplier owner)
  - core dev pages (`apps`, `users`, etc.)
- These pages currently use an older/manual drift payload style (`driftById` + handcrafted payload), not the newer helper-builder pattern.

### System-wide alignment target
- Canon for each entity dev stack:
  - Surface A: dummy card surfaces (Pill, Cell, Preview, Profile) when card suite exists
  - Surface B: model surface (`DevModel`)
  - Surface C: drifted collection surface (`DevDriftToolbar` + collection manager)
- Canon for drift implementation:
  - use `useDevDriftFilter` with `buildDriftPayload` + `buildCopyPayload`
  - default to `driftMode: 'extras-only'`
  - define `requiredPaths` per entity (explicit contract fields)

#end
