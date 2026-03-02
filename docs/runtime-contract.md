# Runtime Contract
Authority: Tier1 (Authoritative)
Updated: 2026-03-02
## Purpose
- Define runtime selection, mode, collection path, and route policy across FireUX domains.

## Runtime Selection Rules
- Console/runtime entity selection is state-based.
- Console pages must resolve active context from runtime state, not route query selection.
- Query params may carry view/context options for public pages, but not canonical console entity selection.
- No silent selection fallbacks:
  - Do not auto-switch entities/modes when required state is missing.
  - Surface missing selection explicitly.

## Runtime Mode Rules (Kitchen Runtime)
- Supported modes:
  - `live`
  - `test`
  - `dummy`
  - `read-only`
- Mode behavior:
  - `live`: Firestore-backed production collection.
  - `test`: Firestore-backed sandbox collection.
  - `dummy`: local fixture-like behavior mapped to test-safe collection strategy.
  - `read-only`: scenario/data pack mode with no Firestore writes.

## Collection Path Policy (Kitchen Runtime)
- `live` -> `kitchens/{kitchenId}`
- `test` -> `test-kitchens/{kitchenId}`
- `dummy` -> `test-kitchens/{kitchenId}` (or equivalent test-safe path)
- `read-only` -> no Firestore collection path (scenario-backed)

## Route Policy (ID vs Slug)
- Internal routes may use `[id]`.
- Public/indexable entity routes should use `[slug]` where the entity is published for discovery/SEO.
- Current canonical mapping:
  - Blogs public detail route: slug-based.
  - Products public detail route: slug-based.
  - Users public profile route: handle-based (`/u/[handle]`) resolved via handle index.
  - Console/admin/internal routes: id-based.
  - Entities without a published slug contract remain id-based until their extension contract defines slug rollout.

## Route Identity Policy Addendum (Slug vs ID)
- Every public/indexable entity must declare exactly one strategy in its extension contract:
  - `slug == doc id` (public slug is the Firestore doc id at publish time)
  - `slug -> id` (public slug resolves to stable doc id via indexed lookup)
- Internal/admin/console routes remain id-based.
- Public link generators must follow the declared strategy; id-based public links are invalid when strategy is slug.

### Compact Entity Strategy Map
| Extension | Entity | Public Param | Strategy |
| --- | --- | --- | --- |
| fireux-blogs | BlogPost | slug | slug == doc id |
| fireux-products | Product | slug | slug == doc id |
| fireux-core | User | handle | handle -> uid via `handles/{handle}` |
| fireux-places | Place | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-companies | Company | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-kitchens | Kitchen | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-jobs | Job | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-jobs | Agent | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-jobs | Professional | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-kitchens | Chef | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-drop | Supplier | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-kitchens | Ingredient | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-orders | Order | n/a (internal) | id-only internal |

### Enforcement
- CI must fail if:
  - a public page is added without a strategy entry.
  - a public URL generator uses id while strategy requires slug.
  - a public user route bypasses handle resolution and exposes uid routes as canonical.

## Selection vs Formatting
- Selection/routing/identity must never rely on silent fallback chains.
- Deterministic field precedence inside one resolved entity is permitted when documented in Tier1 canon/contracts.

## Conflicts Resolved
- Previous broad “[id] for all object pages” guidance is replaced by the mixed route policy above (public slug, internal id).
- Kitchen live/test split is canonicalized here and supersedes ambiguous one-collection summaries.
- Runtime selection canon is state-based for consoles; query-selection statements in Tier3 AI/history docs are non-authoritative.

## TBD Decisions (Deano)
- Slug rollout scope for currently id-based public entities (jobs/places/companies/kitchens):
  - Default: phase by extension
  - Note: products/blog already slug-first
- SEO enforcement timing:
  - Default: after Kitchen MVP polish (next sprint after console stability)
  - Includes: robots/meta noindex, sitemap, JSON-LD helpers, canonical URLs
- AI/** tracking policy:
  - Default: keep AI/** ignored
  - Optional later: track `AI/README.md` + `AI/codex-threads/index.md` only
