# FireUX Canon
Authority: Tier1 (Authoritative)
Updated: 2026-03-12
## Purpose
- Define FireUX-wide structural and behavioral rules that all extensions and apps follow.
- Resolve authority drift by making this file the source of truth for cross-domain canon.

## Structural Canon
- Extensions own domain logic and contracts.
- Apps consume extension domains; apps do not fork extension canon behavior.
- Runtime state is the single source of truth for active selection context.
- Canon docs override operational docs and tooling/history docs on conflict.
- FireUX project control data must be minimal and explicit.
- The canonical project control doc path is `project/<firebaseProjectId>`.
- Current required control fields are:
  - `main_app_id`
  - `main_ecosystem_id`
- A global/main app may ensure the project control doc exists.
- Tenant apps must not claim or overwrite project control ownership.

## Behavioral Canon
- No silent fallbacks for selection, routing, or identity decisions.
- Interface composables are view-only (format/mapping for UI surfaces).
- Writes must be explicit through mutation composables.
- Missing required state/data must be surfaced explicitly, not inferred.

## Endpoint Canon
- Entity index pages that are rendered through `Index.vue` + `CollectionManager` are client-side Firestore surfaces.
- Canon examples:
  - `/apps`
  - `/users`
  - `/modules`
  - `/ecosystems`
- These entity index pages must not switch to endpoint-first loading unless the canon for that entity is explicitly changed in Tier1.
- Public/server endpoints are reserved for real service seams, for example:
  - `GET /api/fireux-console`
  - Stripe/payment hooks
  - place lookup services
  - notifications/dev/proxy endpoints
- Public projection endpoints such as `/api/public/*` are not the canonical loading path for entity index pages delivered by `CollectionManager`.

## Deterministic Field Precedence (Allowed Exception)
- Deterministic field precedence is allowed when documented for one entity shape.
- Example:
  - Place display name: `short_name` then `name`.
- Deterministic precedence must be explicit, stable, and local to that entity contract.

## Surface Vocabulary
- Shared UI vocabulary: `Pill`, `Cell`, `Preview`, `Profile`.
- Entities may implement a subset when appropriate.
- Core entities are expected to implement the full surface set unless explicitly exempted in their contract.

## Expansion Gate
- New top-level patterns, route classes, or collection strategies require a canon update in this file and related Tier1 contracts before merge.
- If a change alters domain/runtime behavior, update Tier1 docs in the same PR.

## Canon Update Rule
- Structural, routing, identity, and selection rule changes must update:
  - `docs/fireux-canon.md`
  - `docs/runtime-contract.md`
  - Relevant `packages/extensions/fireux-*/docs/contract.md`

## Conflicts Resolved
- Authority is now explicit: Tier1 canon/contract docs override Tier2/Tier3 docs.
- “No fallbacks” policy is clarified:
  - Prohibited: silent selection/routing/identity fallbacks.
  - Allowed: deterministic field precedence documented in Tier1/Tier1-extension contracts.
