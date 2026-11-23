# Kitchen Core independence

**Date:** 2026-11-20
**Status:** Phase A Slice 01 verified in local Misebox. Production rollout remains separate.
**Depends on:** [Core local cutover evidence](2026-11-20-fireux-core-reset-stage-0.md#stage-6-clean-cutover-evidence) and [Kitchen real-world build order](../handoffs/2026-11-20-kitchen-real-world-build-order.md).
**Decision:** Verify one independently usable managed Kitchen, then clean the proven filesystem and model slice, **before** Items and Menus.

## Initial source audit (2026-11-20)

1. **The canonical root is already sparse.** `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen.model.ts` requires `id`, `identity` (slug/status/visibility) and `created`. `updated`, `context`, `guidance_ids`, `theme`, `orders`, `services` and `tables` are optional. `kitchen/utils/read-kitchen-document.ts` validates sparse roots; the `src/test/kitchen-document.test.mjs` source includes a sparse canonical fixture. Do not remove optional configuration just for aesthetics; first inspect its true consumers and writer ownership.
2. **A truly bare Kitchen document can already be contributed.** `kitchen/server/index/onboarding/directory.ts` creates a Kitchen with only identity and stamps (plus a same-id Place for name-only contribution). It does **not** create a Menu, Team record, or management grant. This is a _directory contribution_, **not** proof that the person can manage the Kitchen through Workspace. `src/test/kitchen/kitchen-directory-contribution.test.ts` explicitly checks the absence of Team association.
3. **Both signed-in management creation paths currently couple Kitchen creation to Menus.** `kitchen/server/index/onboarding/create-shell.ts` and `complete.ts` call `createKitchenSystemMenus` on a new root and create/link a Team record plus access grants. `kitchen/server/index/onboarding/guest.ts` also creates a starter Menu. `src/test/kitchen/kitchen-management-defaults.test.mjs` explicitly expects one default Menu for a new management root and no further default creation for an existing Kitchen.
4. **There is a real downstream consumer of the starter Menu.** `menu/server/document/authority.ts` selects a guest's `main` Menu. Misebox Menu Hosting and guest document flows rely on that contract. Do **not** simply delete starter Menu creation globally.
5. **The basic update path is already separate.** `kitchen/server/identity/update.ts` and `identity/update-input.ts` guard patches to identity, services and table-count fields; `kitchen/composables/useKitchenRead.ts` reads the canonical root, with optional same-id Place hydration. `kitchen/composables/workspace/useKitchenWorkspace.ts` binds a guarded selected Kitchen to Workspace. Source inspection is not an end-to-end signed-in workflow proof.

## Operator product decision — Workspace-first manifestation, not onboarding (20 Nov 2026)

**North star:** Across industries, give the user an immediately usable **blank management Workspace** rather than an onboarding questionnaire, setup wizard, or forced sequence. On the left, show the capabilities they can choose to manage. They can ignore most of them. In Kitchen, begin with a neutral default label such as **“My Kitchen 1”** and allow the user to rename it, optionally associate a Google Place, and progressively add Items or any other capabilities when useful. **Do not force a Place search, Team setup, Menu creation, or completed profile before showing the Workspace.**

Call the user action **manifesting a Kitchen from the Workspace**, not onboarding into a Kitchen. Preserve secure server-owned identity, membership and Kitchen mutation authority behind the experience; those checks do not need to become a visible series of onboarding questions. Treat owner access as a distinct authority concern from a Kitchen Team roster record. No automatic Team member or starter Menu simply to satisfy a blank Kitchen root, unless an explicit downstream workflow requires it.

**Entry behaviour:** A person choosing to open a Kitchen Workspace must reach the Workspace directly, with an honest empty state and obvious first action, rather than being routed through marketing, account-setup or Kitchen-onboarding screens first. The operator is also considering whether `misebox.app/` itself should foreground the Workspace; this is a **product-routing/SEO decision to assess separately** because the current root route is a public Kitchen-and-Menu directory, while `/workspace/kitchen` already uses an unauthenticated, unselected Workspace entrance. Do not silently replace the public index or break discovery.

**State decision to verify:** An empty Workspace shell is not automatically a stored, owned Kitchen. Before implementing auto-manifestation, explicitly decide when a real canonical Kitchen record is created and when account authentication becomes necessary for protected writes. An unauthenticated page view should not accidentally create an unlimited collection of live Kitchen records. Allow appropriate guest preview or first-intent creation only if backed by an authorized, recoverable flow. Do not silently turn public directory contribution into management rights.

**Acceptance:** The user can open Kitchen Workspace immediately, understand what it can manage, create or manifest one Kitchen through the smallest permitted interaction, rename and reopen it with trusted authority, and add zero optional capabilities. Sign-in and permissions remain real, but needless questions and blocking setup steps do not.

## Slice 01 acceptance criteria

**Goal:** Create or adopt one managed Kitchen that has zero Items, Menus, Services and Orders; reopen and edit it through a real Workspace without missing-grant or stale-selection issues.

- Trace and test exact independent Kitchen root creation, owner App membership/Kitchen grant, Team roster semantics, reader and Workspace selection. **Retain effective authorization**; a person must not gain management merely because they contributed a directory listing.
- Preserve existing App/Place identity relationship, including name-only same-ID Place creation, without making Google Places mandatory.
- Separate optional _management bootstrap defaults_ (especially starter Menu) from _Kitchen Core existence_ **only after** identifying the intended call-site policies. The Menu Hosting/guest path may still explicitly request a starter Menu. Avoid a new universal bootstrap engine.
- Review if Team record is required for authority or is merely a presentation/roster item. If separating it, preserve exact account linkage, grants, protected mutation checks and existing access behaviour. No blanket deletion.
- Prove with focused tests: new empty managed Kitchen; root canonical read; protected edit/reload; empty Workspace; switch between two Kitchens; denied or revoked member; idempotent retry; explicit Menu Hosting path still obtains its required Menu. Validate through a maintained Misebox App or relevant fixture.
- Only **after** this root journey passes, inspect path/namespace/shape consistency and remove demonstrated redundant source wiring. Do not move downstream Items or Menus in this first slice.
- Record actual test commands/results and any genuine unresolved dependencies. The existing tests assert starter Menu defaults, so revise them only to match a deliberate new product rule, never to mask a regression.

## Slice 01 local evidence (2026-11-22)

| Source                                                                                 | Responsibility                                                                                                         | Evidence                                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/workspace/kitchen/index.vue` and `kitchen/components/Workspace/Home/Create.vue` | The native Workspace route opens the existing Kitchen creation form.                                                   | Reuses the extracted Workspace layout and the same modal-to-domain-form relationship as Project. Kitchen offers both name-only and existing-Place creation. |
| `kitchen/server/index/onboarding/create-shell.ts` and `complete.ts`                    | Create the Kitchen and membership-bound grant in one transaction. Name-only creates a same-ID Place.                   | The real Nuxt endpoints created both forms in a named Firestore emulator with zero child collections. Both retried without creating a second Kitchen.       |
| `kitchen/composables/workspace/useKitchenWorkspace.ts` and `useKitchenRead.ts`         | Live membership grants determine the available collection and selected root. Place supplies its owned identity fields. | The focused Workspace selection and projection checks cover the App-scoped read, refresh state and stale selection.                                         |
| `kitchen/server/identity/update.ts`                                                    | Trusted Kitchen edits validate the current App membership and grant.                                                   | The owner updated the listing URL and read it back. An unrelated member was denied.                                                                         |
| `menu/server/document/prepare.ts`                                                      | Menu Hosting creates the first draft on an explicit publish attempt.                                                   | Three concurrent preparations produced a single draft. An unrelated member was denied. Guest recovery remains a separate tested command.                    |

Signed-in Chrome used an isolated copy of Misebox with the real Kitchen routes
and the candidate Rules on the named emulator database. The browser created a
name-only Kitchen, opened it through the extracted Workspace, switched to the
Kitchen created from an existing Place, and retained selection across reload.
It saved and reloaded the listing URL. Removing the selected Kitchen's grant
cleared its identity from the page, and the next write returned `403`.

The focused suite passed 162 cases, and scoped lint and whitespace checks
passed. Full Misebox typechecking reports five errors in existing Stock/Waste,
Finance and User Detail files outside this slice. Production Rules rollout
remains a separate release decision.
