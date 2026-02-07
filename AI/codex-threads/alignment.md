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

## Watchlist (48h)
- Product interface + product create/validation paths change frequently; keep `useProductInterface` lean.
- Entity collection managers changed recently; re-validate no new fallback chains were added.

#end
