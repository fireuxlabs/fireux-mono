# Dashboard vs Console + Named Runtime Canon
Authority: Tier3 (Tooling/history)
Updated: 2026-03-02
Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/docs/copilot-documentation/temporary-reports/dashboard-console.md
Date: 2026-03-01
Owner: Daniel Watson
Status: Draft (canon candidate)

## Why this exists

FireUX needs a repo-wide distinction between:
- **Dashboard**: human/account/workspace surfaces
- **Console**: operational surfaces bound to a **named runtime** (one per ecosystem)

This doc defines the contract so we can migrate routes safely and keep behavior consistent across ecosystems.

---

## Definitions

### Dashboard (human surface)
Dashboard is “my stuff”.
It is identity-scoped, cross-entity, and often multi-role.

Dashboard includes:
- account + profile
- settings, purchases, subscriptions
- admin/dev surfaces
- role workspaces (agent/professional/chef/supplier)
- **selectors** that set the named runtime

Canonical paths:
- `/dashboard`
- `/dashboard/user-profile`
- `/dashboard/settings`
- `/dashboard/subscriptions`
- `/dashboard/purchases`
- `/dashboard/favorites`
- `/dashboard/followers`
- `/dashboard/admin`
- `/dashboard/developer`
- `/dashboard/chef/*`
- `/dashboard/supplier/*`
- `/dashboard/agent/*`
- `/dashboard/professional/*`

Dashboard can *choose* runtime scope, but should not contain deep operational CRUD for that scope.

---

### Console (operational surface)
Console is “this operation”.
It is entity-scoped through a **named runtime** and is used to run an operation (kitchen, portfolio, supplier, etc).

Canonical paths:
- `/console` (runtime hub)
- `/console/<runtimeKey>/*` (runtime operations)

Console **does not** use `:id` in routes for selecting the operation.
Console **only** operates on the *currently selected runtime*.

---

## The Named Runtime Rule (hard rule)

Each ecosystem has exactly one **named runtime**.

Examples (v1 mapping):
- Misebox: `kitchen`
- Granite: `portfolio`
- Bringli: `supplier` (owned by fireux-drop)
- FireUX (flagship): `app`
- Cleanbox: UI “team” (implement as `company` runtime unless/until `team` is a real model)

**No primary/secondary runtime language.**
There is only “THE runtime” per ecosystem.

---

## No fallbacks (hard rule)

Console pages must never guess or auto-select a runtime.
If runtime is missing, the page must show an explicit empty-state + link to the dashboard selector.

Fallback policy: prohibited unless a human explicitly asks for it.

---

## Composable Contract (repo-wide)

Every named runtime must expose a consistent API:

### 1) `useRuntimeX()`
Responsible for:
- runtime id
- runtime mode (only if the domain uses modes)
- setting/clearing runtime selection

Must provide:
- `runtimeXId` (ref)
- `setRuntimeXId(id: string)`
- `clearRuntimeX()`
- (optional) `runtimeXMode`, `setRuntimeXMode(mode)`

### 2) `useRuntimeXData()`
Responsible for:
- prefetched doc/model for active runtime
- loading/error state

Must provide:
- `x` (ref | computed)
- `isLoading`
- `error`
- `isReady` (derived; true only when id + doc are present)

### 3) Optional `useRuntimeXGuard()` helper
Responsible for:
- computed guard flags used by layouts/pages
- target selector link

Suggested outputs:
- `hasScope`
- `selectScopeHref` (dashboard selector route)
- `emptyStateTitle`
- `emptyStateBody`

---

## Route Contract (repo-wide)

### Dashboard pages
- may list/select operations
- may call `setRuntimeXId(...)`
- may provide “switch” UX

### Console pages
- must read runtime via `useRuntimeX()` / `useRuntimeXData()`
- must not accept `:id` for selecting the operation
- must not perform implicit selection
- if missing scope, must render empty-state + link to selector

### Resource routes inside console
Resource detail routes are allowed when the resource is owned by the runtime:

✅ Allowed:
- `/console/kitchen/recipes/[id]` (recipe belongs to active kitchen)
- `/console/portfolio/properties/[id]` (property belongs to active portfolio)

🚫 Not allowed:
- `/console/kitchen/:kitchenId/...` (runtime selection in URL)

---

## Entry Point Contract (important)

We need to define how a user enters “operations”.

### Recommended behavior (matches how kitchens currently feel)
1) **Dashboard is the default landing for authenticated users**
   - `/dashboard`
2) Dashboard offers “Select kitchen / portfolio / supplier / app”
   - selection sets runtime state via `useRuntimeX()`
3) Console becomes the operational surface
   - `/console` shows “Active operation” + quick links
   - `/console/<runtimeKey>/*` operates on active runtime

### `/console` (runtime hub) behavior
- If runtime is set: show summary + links to common console sections
- If runtime missing: show empty-state + link to dashboard selector
- Do not auto-select the first available operation

### Why kitchens felt good even before this doc
Kitchen dashboard already effectively behaved like:
- “choose kitchen on list/CTA”
- “operate kitchen in subpages”
This doc formalizes that into a reusable runtime contract across ecosystems.

---

## Migration Plan (low risk)

### Phase A — Reintroduce dashboard routes (copy + redirect)
1) Re-add `layouts/dashboard.vue` (can wrap current shell initially)
2) Create `/dashboard/*` pages by copying current `/console/*` account + profile pages
3) Add redirects from old console account/profile paths:
   - `/console/settings` -> `/dashboard/settings`
   - `/console/user-profile` -> `/dashboard/user-profile`
   - `/console/chef/*` -> `/dashboard/chef/*`
   - `/console/supplier/*` -> `/dashboard/supplier/*`
   - `/console/agent/*` -> `/dashboard/agent/*`
   - `/console/professional/*` -> `/dashboard/professional/*`

Keep runtime operations unchanged:
- `/console/kitchen/*`
- `/console/portfolio/*`

### Phase B — Navigation split
- Introduce `useDashboardNav()` vs `useConsoleNav()`
- Dashboard nav: account + workspace
- Console nav: runtime operations only

### Phase C — Compatibility redirects (one release cycle)
- Pre-rename compatibility:
  - `/dashboard/kitchen/*` -> `/console/kitchen/*`
- Post-rename compatibility:
  - `/console/settings` -> `/dashboard/settings`

### Phase D — Cleanup
- Remove duplicates after redirects are stable
- Update internal links (auth redirects, header links, onboarding deep links)

---

## Shared Middleware Policy (added 2026-03-01)

Route auth middleware is **core behavior**, not app-local behavior.

Decision:
- Keep auth/admin route guarding in core middleware:
  - `packages/core/fireux-core/src/runtime/middleware/fireux-auth.global.ts`
- Do not keep duplicate per-app copies when behavior is identical.
- App-local middleware is only allowed for app-unique logic.

Current state after this update:
- `packages/ecosystem/fireux-fireux/apps/stitch/app/middleware/stitch-auth.global.ts` was removed.
- No other app-level Nuxt route auth middleware exists in repo runtime sources.

---

## Open decisions (must be explicit)

### Cleanbox runtime naming
Option A (recommended now): implement runtime as `company`, label UI as “team”
- composable: `useRuntimeCompany()`
- routes: either `/console/company/*` (literal) or `/console/team/*` (friendly)

Option B (later): introduce a first-class Team model and runtime

### FireUX flagship runtime
Do we call it `app` or `tenant`?
- Prefer `app` in routes and composables for clarity (aligns with existing appId usage).

---

## Success criteria

- Users never land in a console page with an implicit/guessed operation.
- Console never needs `:id` to function.
- Dashboard and Console are cleanly separated in nav and layout.
- Runtime composables are consistent across domains and ecosystems.
- Auth/admin route guarding is centralized in core middleware (no per-app duplication).

And on your “entry point” note (business-wise): kitchens worked because the selection step was naturally separate from the operational pages, even if we didn’t call it “runtime responsibility” yet. This doc makes that separation explicit so Granite/Bringli/Cleanbox can feel just as solid without reinventing the pattern.
