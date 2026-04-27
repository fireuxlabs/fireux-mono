# FireUX Canon
Authority: Tier1 (Authoritative)
Updated: 2026-04-27
## Purpose
- Define FireUX-wide structural and behavioral rules that all extensions and apps follow.
- Resolve authority drift by making this file the source of truth for cross-domain canon.

## Structural Canon
- Extensions own domain logic and contracts.
- Apps consume extension domains; apps do not fork extension canon behavior.
- Runtime state is the single source of truth for active selection context.
- Console families are route buckets, not stored entities.
- Runtime targets are the selected root entities inside those families.
- Console workspaces are operational shells around runtime targets; the workspace itself is not a root entity.
- Do not introduce an extra abstract `collection` layer when `family`, `target`, and `child records` already explain the model.
- `/console/X` is the family entry page, not the operational home of one already-selected target.
- `/console/X/overview` is the workspace overview for the selected runtime target.
- In `live` mode, `/console/X` should show the current user's real targets for that family.
- Canon docs override operational docs and tooling/history docs on conflict.
- App pages do not justify app-local storage on their own.
- Root-first entities may be filtered by explicit scope fields instead of being duplicated under app paths.
- `Project` is a root/core entity.
- Canonical project identity lives on the root `projects/<projectId>` record.
- Root project membership and ownership fields live on that root record, not on app overlays.
- Current canonical root project membership/ownership fields are:
  - `team_ids`
  - `owner_user_id`
- Current canonical public routing field on the root project is:
  - `slug`
- App-scoped project overlays may exist for console/app behavior, but they must not also own or duplicate root team membership.
- Root-plus-app families must make the root facade relationship explicit with:
  - `app_scope_state`: `root_only`, `parent_app`, or `dedicated_app`
  - `app_scope_app_id`: the app id that hosts the app-scoped record, or empty for `root_only`
- `app_scope_state` describes storage/topology, not access authority.
- Current root-plus-app families are:
  - `Kitchen`
  - `Supplier`
  - `Portfolio`
  - `Project`
- Identity roots such as `User` and profile roots do not use `app_scope_state`; their app records are overlays for membership, capability, and presentation.
- Generic project collection and console project selection are not the same seam.
- `useProjectCollection()` stays generic.
- Console project visibility adds user/app scope above the generic collection rather than redefining it.
- Tenant apps are child app surfaces inside a FireUX ecosystem, not independent ecosystem canons.
- Tenant apps may stay intentionally thin and do not justify new top-level domain/storage patterns on their own.
- Placeholder tenant branding/assets are canonical until tenant-specific assets are explicitly provided.
- Existing tenant implementations do not define canon; shared tenant rules come from Tier1 and shared runtime.
- Standalone apps are FireUX-hosted product apps inside the `fireux` ecosystem.
- Standalone apps are not tenant children and are not ecosystem globals.
- Standalone apps may use shared core/runtime foundations but must not claim project control or ecosystem-controller ownership.
- Phase 1 canon allows standalone apps only in the `fireux` ecosystem.

## Behavioral Canon
- No silent fallbacks for selection, routing, or identity decisions.
- Interface composables are view-only (format/mapping for UI surfaces).
- Writes must be explicit through mutation composables.
- Missing required state/data must be surfaced explicitly, not inferred.
- Runtime source canon is:
  - `live`
  - `test`
  - `demo`
- Runtime activity canon is:
  - `static`
  - `simulation`
- Console showcase flows are currently:
  - source: `demo`
  - activity: `static`
- App/ecosystem ownership filtering must be explicit through stored fields, not implied by collection path alone.
- Real-mode family entry must not behave like a raw collection browser.
- Real-mode target visibility should come from explicit overlay governance and only use root hints where the family contract allows it.
- App branding is app-local for every app role.
- The canonical brand asset path is `/public/img/app/*` for global, tenant, and standalone apps.

## Create vs Ensure Canon
- `createX` means intentional creation of a real target.
- `ensureX` means bootstrap/setup-if-missing.
- `createX` belongs to explicit user actions:
  - create forms
  - create systems
  - intentional creation buttons
- `ensureX` belongs to:
  - test target entry
  - repair/recovery
  - setup flows that must be safe to run repeatedly
- Do not hide creation behind auth/bootstrap.
- Sign-in establishes identity; it does not create domain records by itself.
- When a family canon says test mode is one target per signed-in user, the family entry page may call `ensureX` on entry to `test` mode.

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
