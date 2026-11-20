# Kitchen Core independence — source-only checkpoint

**Date:** 2026-11-20
**Status:** Source audit complete; implementation **not** started; no tests executed in this review; no live data modified.
**Depends on:** [FireUX Core reset](../handoffs/2026-11-20-fireux-core-reset-build-order.md) and [Kitchen real-world build order](../handoffs/2026-11-20-kitchen-real-world-build-order.md).
**Decision:** Verify one independently usable managed Kitchen, then clean the proven filesystem and model slice, **before** Items and Menus.

## What the current source proves

1. **The canonical root is already sparse.** `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/model.ts` requires `id`, `identity` (slug/status/visibility) and `created`. `updated`, `context`, `guidance_ids`, `theme`, `orders`, `services` and `tables` are optional. `kitchen/utils/read-kitchen-document.ts` validates sparse roots; the `src/test/kitchen-document.test.mjs` source includes a sparse canonical fixture. Do not remove optional configuration just for aesthetics; first inspect its true consumers and writer ownership.
2. **A truly bare Kitchen document can already be contributed.** `kitchen/server/index/onboarding/directory.ts` creates a Kitchen with only identity and stamps (plus a same-id Place for name-only contribution). It does **not** create a Menu, Team record, or management grant. This is a *directory contribution*, **not** proof that the person can manage the Kitchen through Workspace. `src/test/kitchen/kitchen-directory-contribution.test.ts` explicitly checks the absence of Team association.
3. **Both signed-in management creation paths currently couple Kitchen creation to Menus.** `kitchen/server/index/onboarding/create-shell.ts` and `complete.ts` call `createKitchenSystemMenus` on a new root and create/link a Team record plus access grants. `kitchen/server/index/onboarding/guest.ts` also creates a starter Menu. `src/test/kitchen/kitchen-management-defaults.test.mjs` explicitly expects one default Menu for a new management root and no further default creation for an existing Kitchen.
4. **There is a real downstream consumer of the starter Menu.** `menu/server/document/authority.ts` selects a guest's `main` Menu. Misebox Menu Hosting and guest document flows rely on that contract. Do **not** simply delete starter Menu creation globally.
5. **The basic update path is already separate.** `kitchen/server/identity/update.ts` and `identity/update-input.ts` guard patches to identity, services and table-count fields; `kitchen/composables/useKitchenRead.ts` reads the canonical root, with optional same-id Place hydration. `kitchen/composables/workspace/useKitchenWorkspace.ts` binds a guarded selected Kitchen to Workspace. Source inspection is not an end-to-end signed-in workflow proof.

## Next bounded Codex slice — after Core/User/Workspace gate

**Goal:** Create or adopt one managed Kitchen that has zero Items, Menus, Services and Orders; reopen and edit it through a real Workspace without missing-grant or stale-selection issues.

- Trace and test exact independent Kitchen root creation, owner App membership/Kitchen grant, Team roster semantics, reader and Workspace selection. **Retain effective authorization**; a person must not gain management merely because they contributed a directory listing.
- Preserve existing App/Place identity relationship, including name-only same-ID Place creation, without making Google Places mandatory.
- Separate optional *management bootstrap defaults* (especially starter Menu) from *Kitchen Core existence* **only after** identifying the intended call-site policies. The Menu Hosting/guest path may still explicitly request a starter Menu. Avoid a new universal bootstrap engine.
- Review if Team record is required for authority or is merely a presentation/roster item. If separating it, preserve exact account linkage, grants, protected mutation checks and existing access behaviour. No blanket deletion.
- Prove with focused tests: new empty managed Kitchen; root canonical read; protected edit/reload; empty Workspace; switch between two Kitchens; denied or revoked member; idempotent retry; explicit Menu Hosting path still obtains its required Menu. Validate through a maintained Misebox App or relevant fixture.
- Only **after** this root journey passes, inspect path/namespace/shape consistency and remove demonstrated redundant source wiring. Do not move downstream Items or Menus in this first slice.
- Record actual test commands/results and any genuine unresolved dependencies. The existing tests assert starter Menu defaults, so revise them only to match a deliberate new product rule, never to mask a regression.

**Do not infer from this audit that end-to-end Kitchen independence is already proven.** No code, credentials, provider settings, database records, deploys or Rules may be changed through this documentation task. **Do not auto-execute** via Walking Bridge; a separate, specifically authorized trigger is required.
