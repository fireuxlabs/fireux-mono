# Runtime Contract
Authority: Tier1 (Authoritative)
Updated: 2026-03-12
## Purpose
- Define runtime selection, mode, collection path, and route policy across FireUX domains.

## Firestore Database Contract
- `1 Firebase project = 1 FireUX project`.
- FireUX may use multiple Firestore databases inside one Firebase project.
- Database meaning must be explicit and fixed by canon, not inferred from fallback behavior.
- Current FireUX project split:
  - `(default)` = project control data and standalone-app data
  - `fireux` = FireUX ecosystem runtime data
- Runtime database selection must come from ecosystem/runtime config, not per-entity overrides.
- Entity fetch/write patterns stay the same; only the resolved Firestore database changes.

## Entity Loading Contract
- Entity index pages delivered through `Index.vue` + `CollectionManager` must use the normal client-side Firestore read path.
- Canon path:
  - `useFirestore()` / shared Firestore composables
  - resolved database comes from ecosystem/runtime config
- Root-first entities may still be app- or ecosystem-filtered at read time through explicit scope fields such as:
  - `source_app_id`
  - `source_ecosystem_id`
  - `owner_type`
  - `owner_id`
  - `visibility`
- Non-canon for entity index pages:
  - endpoint-first SSR collection loading
  - per-entity server proxy replacements for normal Firestore reads
- Server endpoints remain valid for:
  - FireUX handshake (`/api/fireux-console`)
  - payment/Stripe flows
  - place lookup services
  - notifications, proxies, and other true service seams

## Project Control Contract
- Project control data lives in `(default)` at:
  - `project/<firebaseProjectId>`
- Current minimal required fields:
  - `main_app_id`
  - `main_ecosystem_id`
- These fields define which app and ecosystem speak for the project.
- A global/main app may ensure this doc exists during app initialization.
- Tenant apps must not create or claim the project control doc.

## Runtime Selection Rules
- Console/runtime entity selection is state-based.
- Console pages must resolve active context from runtime state, not route query selection.
- Query params may carry view/context options for public pages, but not canonical console entity selection.
- No silent selection fallbacks:
  - Do not auto-switch entities/modes when required state is missing.
  - Surface missing selection explicitly.

## Runtime Mode Rules (Console Runtimes)
- Supported modes:
  - `live`
  - `test`
  - `read-only`
- Mode behavior:
  - `live`: Firestore-backed production collections.
  - `test`: Firestore-backed sandbox/test collections.
  - `read-only`: scenario/data-pack mode with no Firestore writes.

### Legacy Input Alias
- `dummy` is not a canonical runtime mode.
- Runtime normalizers may accept `dummy` as backward-compatible input and map it to `read-only`.
- New state, routes, and UI labels must only use `live`, `test`, `read-only`.

## Read-only Data Policy
- Runtime read-only data must come from domain `read-only-scenarios/` registries.
- Dev fixture files under repo `dummy/**` are optional developer tooling only.
- Console/runtime behavior must never depend on `dummy/**`.

## Collection Path Policy (Kitchen Runtime)
- `live` -> `kitchens/{kitchenId}`
- `test` -> `test-kitchens/{kitchenId}`
- `read-only` -> no Firestore collection path (scenario-backed)

## Route Policy (ID vs Slug)
- Internal routes may use `[id]`.
- Public/indexable entity routes should use `[slug]` where the entity is published for discovery/SEO.
- Current canonical mapping:
  - Blogs public detail route: slug-based.
  - Products public detail route: slug-based.
  - Users public profile route: handle-based (`/users/[handle]`) resolved from `users.handle`.
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
| fireux-core | User | handle | handle -> uid via canonical `users.handle` |
| fireux-places | Place | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-companies | Company | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-kitchens | Kitchen | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-jobs | Job | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-jobs | Agent | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-jobs | Professional | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-kitchens | Chef | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
| fireux-suppliers | Supplier | slug (target) | slug -> id (TBD (Deano decision): migration not started) |
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
- Runtime selection canon is state-based for consoles; query-selection statements in Tier3 history docs are non-authoritative.

## TBD Decisions (Deano)
- Slug rollout scope for currently id-based public entities (jobs/places/companies/kitchens):
  - Default: phase by extension
  - Note: products/blog already slug-first
- SEO enforcement timing:
  - Default: after Kitchen MVP polish (next sprint after console stability)
  - Includes: robots/meta noindex, sitemap, JSON-LD helpers, canonical URLs
- Tier3 AI memory location:
  - Default: keep Tier3 memory under `docs/ai/**`
  - Tier3 memory is tracked for auditability but is non-authoritative
