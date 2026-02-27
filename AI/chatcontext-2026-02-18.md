# AI/codex-threads/alignment.md

# Alignment Notes — use*Interface (2026-02-07)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/codex-threads/asset-monitoring.md

# Asset Monitoring — Sizes & Transparency (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/codex-threads/bringli.md

# FireUX — Bringli Ecosystem (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/codex-threads/cleanbox.md

# FireUX — Cleanbox Ecosystem (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below \ is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-18
Purpose:
- Track implementation-level decisions for Cleanbox ecosystem and apps.
- Keep this focused on code/runtime structure, not long-form strategy.

#end

# AI/codex-threads/daniel-watson.md

# Daniel Watson — Skills & Positioning (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/codex-threads/design-system.md

# FireUX Design System — Codex Thread


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/codex-threads/droply.md

# FireUX — Droply Module Thread (Codex)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/codex-threads/extensions.md

# FireUX — Extensions Scan (Codex Thread)


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/codex-threads/fallback.md

# Fallback Policy

Updated: 2026-02-18
Fallbacks are prohibited unless explicitly requested by a human.

Why:
- Silent fallbacks can hide holes and cause incorrect state selection.
- AI systems tend to fill gaps; humans must decide when and how to fill them.

Rules:
- Do not introduce fallback logic, default selection, or silent substitution.
- Require explicit user choice for selection and routing decisions.
- If data is missing, surface it clearly and stop rather than infer.

Applies to all AI-assisted changes in this repo.

#end

# AI/codex-threads/fireux-misebox.md

# FireUX – Misebox Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/codex-threads/kitchen-console.md

# Kitchen Console Contract (FireUX Kitchens)

Status: Active
Updated: 2026-02-18
Scope: Runtime behavior + page responsibilities for `kitchen-console`

## Why this exists
This file defines exactly what each kitchen console page does, why it exists, and which entities it may read or write.

Primary goal:
- Keep one coherent kitchen system instead of many ad-hoc flows.

## Runtime model (single source)
Kitchen console pages must resolve the active kitchen through runtime state, not URL query params.

Core runtime composables:
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchen.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/state.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/shared.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchenData.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchenDocument.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/read-only-scenarios/index.ts`

Runtime modes:
- `read-only`: uses `runtime-kitchen/read-only-scenarios/index.ts` (scenario-resolved demo data)
- `dummy`: use `dummy/scenario.ts`
- `test`: use Firestore `test-kitchens/{kitchenId}`
- `live`: use Firestore `kitchens/{kitchenId}`

Collection path rule:
- `read-only` -> no Firestore collection (scenario data only)
- `live` -> `kitchens`
- `dummy` + `test` -> `test-kitchens`

Selection rule:
- `/kitchens` CTA sets `runtimeKitchenId` and `runtimeKitchenMode` in state.
- `/console/kitchen/*` pages consume that state.
- Do not rely on `?mode=` / `?id=` in console URLs.

## Canonical entity graph

Kitchen core:
- `Kitchen` (`kitchens/{id}` or `test-kitchens/{id}`)

Production stack:
- Global `Ingredient` (catalog)
- `KitchenIngredient` (kitchen-local attachment + stock/procurement fields)
- `KitchenRecipe`
- `KitchenMiseTask`
- `KitchenDish`
- `KitchenMenu`

Team stack:
- `Chef` profile
- `KitchenTeamMember` link/assignment

Supplier stack:
- Global supplier profile (`suppliers/*`, external/global surface)
- `KitchenSupplier` (`{kitchen}/suppliers/{supplierId}`)

Order stack (currently UI prototypes):
- `IncomingOrder` (customer/service tickets)
- `PurchaseOrder` (supplier replenishment orders)

Dependency flow:
1. Ingredient catalog -> KitchenIngredient
2. KitchenIngredient -> Recipe lines and Mise tasks
3. Recipe + Mise -> Dish
4. Dish -> Menu
5. Menu -> service/station activation
6. Supplier links attach to KitchenIngredient (`supplier_id`)

Ingredient identity canon:
- `Ingredient.id` is a stable name slug (`kebab(name)`), not unit-suffixed.
- `Ingredient` is benign identity metadata and does not carry lifecycle status.
- Packaging/format variants (`block`, `sliced`, `grated`, `kg`, `case`, etc.) belong to supplier catalog/offering records, not ingredient identity.

## Console route map

Base route:
- `/console/kitchen`

Main pages:
- `/console/kitchen` (Kitchen)
- `/console/kitchen/ingredients`
- `/console/kitchen/mise`
- `/console/kitchen/recipes`
- `/console/kitchen/dishes`
- `/console/kitchen/menu`
- `/console/kitchen/team`
- `/console/kitchen/stations`
- `/console/kitchen/training`
- `/console/kitchen/haccaaap`
- `/console/kitchen/suppliers`
- `/console/kitchen/orders` (Orders In)
- `/console/kitchen/purchase-orders` (Orders Out)

Supplier detail page:
- `/console/kitchen/supplier/[id]`

## Page contracts

### 1) Kitchen (`/console/kitchen`)
Purpose:
- Show runtime kitchen identity and debug surface.

Why:
- Confirms the active singleton kitchen context before any operational action.

Entities:
- Read: `Kitchen`
- Write: none

Notes:
- This page is identity/status, not operational editing.

### 2) Ingredients (`/console/kitchen/ingredients`)
Purpose:
- Manage kitchen ingredient attachment and visibility.

Why:
- Ingredients are the base of all downstream kitchen logic.

Entities:
- Read: `Ingredient`, `KitchenIngredient`, `KitchenMenu`, `KitchenDish`, `KitchenRecipe`, `KitchenMiseTask`
- Write:
  - create `KitchenIngredient` from selected global ingredient
  - in dummy mode, mutate local dummy list

Behavior:
- Section A: create ingredient form (test/live only)
- Section B: My ingredients (`KitchenIngredient` collection)
- Section C: Global ingredients (`Ingredient` catalog)
- warning chip logic:
  - `Unused`: ingredient never appears in recipe/mise/dish chain
  - `Off menu`: appears somewhere but not on active menu path

UI rule:
- Pill view warning: icon only
- Cell view warning: descriptive text

### 3) Mise en Place (`/console/kitchen/mise`)
Purpose:
- Show mise/prep tasks for the active kitchen.

Why:
- Mise is where prep execution is coordinated before service.

Entities:
- Read: `KitchenMiseTask`
- Write: none (currently)

Notes:
- Uses `useKitchenMenuStackFetch` in test/live.
- Uses `getReadOnlyKitchenScenario()` from `read-only-scenarios/index.ts` in `read-only` mode.
- Dummy stack is still sourced from `dummy/scenario.ts`.

### 4) Recipes (`/console/kitchen/recipes`)
Purpose:
- Read-only recipe stack view.

Why:
- Keeps recipe details visible while menu/dish modeling evolves.

Entities:
- Read: `KitchenRecipe` (currently from dummy scenario)
- Write: none

Notes:
- Marked read-only for now.

### 5) Dishes (`/console/kitchen/dishes`)
Purpose:
- Show operational dish lineup.

Why:
- Dishes are the service-facing composition layer between recipe/mise and menu.

Entities:
- Read: `KitchenDish` (currently dummy)
- Write: none

Notes:
- Dish spec belongs on dish object.

### 6) Menus (`/console/kitchen/menu`)
Purpose:
- Organize menus as a collection output (`[menu]`).

Why:
- Menu is external-facing service contract and future integration anchor.

Entities:
- Read: `KitchenMenu`
- Write: none (currently)

Notes:
- `menu.model.ts` includes Google projection-compatible shape.
- Multiple menus are supported (brunch, mains, etc.).

### 7) Team (`/console/kitchen/team`)
Purpose:
- Show team roster for current kitchen.

Why:
- Kitchen execution requires role/station ownership context.

Entities:
- Read: `KitchenTeamMember`/`Chef` (currently dummy team surface)
- Write: none (currently)

### 8) Stations (`/console/kitchen/stations`)
Purpose:
- Show station activity derived from active menus.

Why:
- Station visibility helps service coordination and staffing.

Entities:
- Read: `KitchenMenu` (stations, active windows)
- Write: none

Behavior:
- Computes station list from menu `stations[]`
- Uses menu active window (`starts_at`/`ends_at`) and `active` flag

### 9) Training (`/console/kitchen/training`)
Purpose:
- Track training modules and progression placeholders.

Why:
- Onboarding and consistency need explicit training status.

Entities:
- Read: kitchen context + local module list
- Write: none

### 10) HACCAAAP (`/console/kitchen/haccaaap`)
Purpose:
- Show safety/compliance check placeholders.

Why:
- Kitchen compliance needs visible windows + ownership.

Entities:
- Read: kitchen context + local check list
- Write: none

### 11) Suppliers (`/console/kitchen/suppliers`)
Purpose:
- Manage supplier entities at kitchen level and route into supplier-ingredient linking.

Why:
- Procurement in kitchens needs local supplier relationships even when global profiles are incomplete.

Entities:
- Read:
  - test/dummy: `KitchenSupplier`
  - live: global supplier profiles (`suppliers/*`)
- Write:
  - test: create `KitchenSupplier` (`id`, `name`, `category`)
  - dummy: mutate local dummy supplier list

Behavior:
- Supplier card click navigates to kitchen supplier detail page:
  - `/console/kitchen/supplier/[id]`

### 12) Kitchen Supplier Detail (`/console/kitchen/supplier/[id]`)
Purpose:
- Manage ingredient linkage for one kitchen supplier.

Why:
- This is where supplier-to-ingredient assignment actually happens.

Entities:
- Read: `KitchenSupplier`, `KitchenIngredient`
- Write: linkage writes are planned; currently view/selection surfaces

Behavior:
- Collection manager 1: ingredients linked to this supplier
- Collection manager 2: other ingredients, toggle modes:
  - `All ingredients`
  - `Unlinked ingredients`

### 13) Orders In (`/console/kitchen/orders`)
Purpose:
- Incoming customer/service orders.

Why:
- Distinguishes fulfillment workload from procurement workload.

Entities:
- Read: currently local placeholder list
- Write: none

Target entity direction:
- `KitchenIncomingOrder` under kitchen context

### 14) Orders Out (`/console/kitchen/purchase-orders`)
Purpose:
- Outgoing supplier purchase orders (stock replenishment).

Why:
- Explicitly separate purchasing from customer tickets.

Entities:
- Read: currently local placeholder list
- Write: none

Target entity direction:
- `KitchenPurchaseOrder` under kitchen context

## Cross-page interaction rules

Ingredient -> production chain:
- `KitchenIngredient` should only be considered "on menu" when it reaches an active menu dish through:
  - direct dish ingredient ids, or
  - recipe lines attached to dish/mise chain, or
  - mise chain attached to active menu dishes

Supplier linkage:
- Kitchen supplier linkage is maintained on `KitchenIngredient.supplier_id`.
- Supplier detail page is the primary linkage UI.
- Empty supplier fields should stay empty until explicitly linked.

Menu activation:
- Active menu windows (`starts_at`, `ends_at`, `active`, `status`) drive station and service relevance.

Runtime safety:
- Dummy-first development is valid.
- Test should mirror dummy shape where possible.
- Live should use same contracts with stricter data expectations.

## Current implementation status (important)

Live/test-backed today:
- runtime kitchen resolution
- ingredients page (kitchen/global collections + attach)
- menu stack fetch (`menus`, `dishes`, `recipes`, `mise`)
- suppliers page create/list behavior
- supplier detail linkage views
- orders in/out pages (dummy-backed operational stack)

Dummy-first or placeholder today:
- recipes, dishes, team
- training, haccaaap

This is acceptable while building canon flow first, then backfilling create/update forms.

## Immediate next model work (recommended)

1. Add canonical `KitchenIncomingOrder` model + collection manager.
2. Add canonical `KitchenPurchaseOrder` model + collection manager.
3. Implement writes on supplier detail page to set/unset `KitchenIngredient.supplier_id`.
4. Move recipes/dishes/team off dummy-only reads to the same runtime fetch pattern used by menu/mise/ingredients.
5. Keep a single runtime contract and avoid route/query-driven kitchen switching.

# end

#end

# AI/codex-threads/kitchens.md

# Kitchens Roadmap (FireUX)

Status: Active
Updated: 2026-02-18
Scope: Roadmap only (actionable order). No scenarios or examples.

## Phase 0 — Anchor + Guardrails
- Choose the anchor scenario (one line product promise).
- Lock the MVP entity set (ingredient, recipe, kitchen, chef).
- Decide the route surface (e.g., `/kitchen/*`).
- Decide auth assumptions (public vs auth-only).
- Define the kitchen UI language (cards, lists, status chips).

## Phase 0.5 — Test Kitchen Environment
- Treat test kitchens as the primary safe sandbox for console prototyping.
- Require explicit kitchen selection; no automatic fallback between real and test kitchens.
- Keep test-kitchens collection separate from kitchens; never merge silently.
- Surface clear UI labels when a test kitchen is active.
- Use test kitchens to validate flows without affecting real kitchens.

## Phase 1 — MVP Slice: Ingredients + Recipes
- Ingredients list with CRUD (name, unit, cost per unit).
- Recipe detail with ingredient rows and quantities.
- Basic cost/quantity summary (no edge cases).
- Clean, screenshot-ready UI; remove unfinished actions.

## Phase 2 — Kitchen Profile + Team
- Kitchen profile page with core attributes and helper copy.
- Chef profile list under `apps/{appId}/chefs`.
- Role labels and responsibilities (no permissions system).

## Phase 3 — Mise en Place + Prep Lists
- Daily/weekly prep list view (group by station or recipe).
- Checklist state with simple completion tracking.
- Prep notes and owner assignment (single field).

## Phase 4 — Menu + Dish Modeling
- Menu entity (active window, meal period, status).
- Dishes reference recipes; menus reference dishes.
- Read-only menu view with cost rollup.

## Phase 5 — Inventory Awareness (Light)
- Ingredient stock field + reorder threshold.
- Low-stock alerts (UI only, no automation).
- Optional supplier link placeholder (no ordering workflow).

## Phase 6 — Station + Service Flow
- Station board (prep, line, pass) with status columns.
- Order/plate tickets as lightweight items (no full order system).
- Touch-friendly layout option for kitchen screens.

## Phase 7 — Ordering + Procurement (Add-on)
- Supplier entities and purchase orders.
- Receiving log and variance tracking.
- Cost reconciliation tied to recipes and menus.

## Phase 8 — Reporting + Operational Insights
- Food cost trends, waste tracking, prep variance.
- Menu profitability snapshot and prep time estimates.
- Exportable reports or shareable summaries.

## Phase 9 — Ecosystem Integrations
- Connect to `fireux-products`, `fireux-places`, `fireux-companies`.
- Tenant-level defaults and shared component recipes.
- Extension docs, runtime contract, and onboarding copy.

## Phase 10 — Continuous Improvement
- Tighten UI tokens, accessibility, and copy.
- Add guardrails based on real usage feedback.
- Ship small, high-signal slices; avoid platform creep.

## Canon Decision — Ingredient Identity
Rule
- Ingredient identity is named by kitchen usage, not by supplier naming or taxonomy.

Implications
- If prep, ordering, or costing differs, it is a different ingredient.
- Supplier SKUs map to ingredients; ingredients do not derive from SKUs.

Guardrails
- No parent/child ingredient trees.
- No auto-generated ingredients from supplier catalogs.
- Keep names canonical and stable for recipe and costing consistency.

Stop rule
- If substitution does not rename the dish, keep the ingredient.
- If substitution changes prep behavior, split the ingredient.

## Report — Test Kitchens vs Kitchens

Summary
- kitchens: canonical collection for real kitchens (Place-bound).
- test-kitchens: separate collection for user test kitchens (user-id keyed, not Place-bound).
- Do not silently switch between them; selection must be explicit.

Collections and models
- kitchens collection: Place-bound doc id (kitchens/{placeId}).
- test-kitchens collection: doc id is the user id; one test kitchen per user.
- Test kitchens are user-scoped and not tied to a Place id.

Selection behavior (current)
- Explicit kitchenId in route query selects the kitchen.
- Configured default kitchen id can select a kitchen.
- No implicit fallback to test kitchens or other kitchens.

Creation / enforcement
- Test kitchens are created per user id (explicit creation flow, not automatic).
- Migration script exists to copy kitchens into test-kitchens when needed.

UX and safety requirements
- Always show which kitchen is active.
- Prevent silent switching between real and test kitchens.
- When no selection exists, block or prompt; do not guess.


## Recent Scan — 2026-02-18
- Commits `83075adc` + `a79e3fbd` refactored read-only kitchen scenarios into `runtime-kitchen/read-only-scenarios` with shared builders + new supplier packs; legacy `runtime/dev/read-only-scenarios` files were removed.
- Runtime kitchen state/composables (`useRuntimeKitchen`, `useRuntimeKitchenContext`, `useRuntimeKitchenData`, `useRuntimeKitchenDocument`) were reworked to align with scenario sourcing and console read-only flows.
- Supplier UI surfaces and console dev systems were refreshed to match the new scenario data and interface wiring.

#end

# AI/codex-threads/monorepo-install-incident.md

# Monorepo Install Incident (2026-02-06)

Updated: 2026-02-18
## Summary

- `pnpm dev:*` commands failed with `sh: nuxi: command not found`.
- `pnpm install` was leaving a partial install and failing in workspace `postinstall`.
- Impact was monorepo-wide (not only `fireux-app`).

## Root Causes

- Network/DNS failures to npm registry during reinstall created partial dependency state.
- Workspace `postinstall` scripts ran `nuxi prepare` in full runtime mode.
- Some apps/templates require env vars (for example `APP_DOMAIN`) at config load time, so `postinstall` could fail and break the whole install.

## Fix Applied

- Updated app `postinstall` scripts to run `nuxi prepare` with `CI=1` in the child process:

```json
"postinstall": "node -e \"if(process.env.CI||process.env.GITHUB_ACTIONS) process.exit(0); require('child_process').execSync('nuxi prepare',{stdio:'inherit',env:{...process.env,CI:'1'}});\""
```

- This keeps type generation in place while skipping strict runtime env requirements during install.

## Files Updated

- `projects/cleanbox/cleanbox-app/package.json`
- `projects/cleanbox/richies-reinigung/package.json`
- `projects/fireux/fireux-app/package.json`
- `projects/fireux/tenant/package.json`
- `projects/misebox/misebox-app/package.json`
- `projects/misebox/niederhorn/package.json`

## Verification

```bash
pnpm install
pnpm -r --filter './projects/*/*' exec nuxi --version
pnpm dev:fireux --host
pnpm dev:misebox --host
```

Expected:

- Install completes successfully.
- Each app resolves `nuxi` correctly.
- Dev servers boot normally.

## Guardrails

- Any new Nuxt app in this monorepo should use the same `postinstall` pattern.
- Avoid requiring production runtime env vars during install-time `nuxi prepare`.
- Treat registry/DNS errors and postinstall env failures as separate incident classes.

#end

# AI/codex-threads/onboarding.md

# Onboarding Thread (New)

Updated: 2026-02-18
Goal: simplify onboarding so it works the same whether run locally (developer/machine) or in the browser (client).

Key decisions
- Onboarding lives at `/onboarding` and is the single entry point.
- Product pages (`/products/[slug]`) are marketing-only.
- Module pages (`/modules/[id]`) are marketing-only.
- Onboarding pulls from the same product objects in Firestore (no separate module registry).

Open questions
- Should onboarding be admin-only or public?
- Should onboarding be scoped by appId/tenant automatically or selectable?
- Do we need a short onboarding “mode” selector: local vs browser?

Next steps
- Define the minimal onboarding steps that are the same in both modes.
- Define which steps diverge (e.g., asset upload to Firestore vs local file paths).
- Decide where onboarding progress is stored (Firestore vs local storage vs both).

#end

# AI/codex-threads/packages.md

# FireUX — Packages Map (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/codex-threads/product-fulfillment.md

# Product Fulfillment Thread Handoff

Updated: 2026-02-18
This thread is now scoped to **post-purchase fulfillment** only.

## Scope
- App onboarding and fulfillment checklists
- Asset collection and validation
- Build/review/launch fulfillment flow
- Local-first vs Firestore-first ingestion

## Out of Scope (handled in products/stripe thread)
- Stripe setup and debugging
- Product creation UX and defaults
- Multi-create starter actions
- Stripe ID persistence rules

## Current separation rule
- `products` thread: create/sell/charge.
- `product-fulfillment` thread: deliver/build/launch.

#end

# AI/codex-threads/products.md

# FireUX — Products & Revenue (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/codex-threads/tasks.md

# Tasks (2026-02-09)

Updated: 2026-02-18
## Product stack alignment (fireux-products)
- [ ] Standardize toast access in Product Create System (replace runtime fallback with canonical composable).
- [ ] Wrap `createProduct()` in `try/catch/finally` to ensure `isCreating` always resets.
- [ ] Replace browser `confirm(...)` with shared modal/confirm UX pattern.
- [ ] Decide on Product Create shipping stage (remove explicitly or gate via feature/runtime config).
- [ ] Consolidate products index description so page header and meta share one source.
- [ ] Re-validate entity collection managers for new fallback chains.

## Asset monitoring
- [ ] Export FireUX wordmark with true transparency (remove opaque background).
- [ ] Add per-app asset findings (Misebox, Cleanbox, Richies, FireUX) to the asset monitoring thread.

## Bringli + Drop supplier ownership
- [ ] Promote `fireux-drop` from scaffold to Supplier domain owner.
- [ ] Move Supplier models/composables/components/pages from Misebox to Drop.
- [ ] Add temporary compatibility wrappers in Misebox for one release cycle.
- [ ] Verify Bringli routes render without collisions after Supplier migration.
- [ ] Confirm Bringli runtime defaults for `runtimeConfig.public.fireux.drop`.

## Extension system cleanup
- [ ] Update `fireux-products/package.json` description (remove TODO).
- [ ] Replace template README in `fireux-products` with real ownership guardrails.
- [ ] Choose a single module configKey style (domain keys vs `fireuxX`) and align docs.
- [ ] Document Stripe support and server surface in `fireux-products` runtime contract.
- [ ] Decide server route registration policy and wire Stripe endpoints if explicit registration wins.
- [ ] Decide product routes injection policy (inject all vs rely on runtime layer).
- [ ] Standardize Nuxt kit import style across extensions (`@nuxt/kit` vs `nuxt/kit`).
- [ ] Align `fireux-jobs` package version with module meta version.
- [ ] Align extension `compatibility.nuxt` with peerDependency ranges.
- [ ] Remove redundant `addImportsDir` calls where `configureComposables` already registers.
- [ ] Resolve route naming inconsistency (`fireux-blog-*` vs plural package naming).
- [ ] Add missing TypeScript reference for `fireux-companies` in `packages/extensions/tsconfig.json`.
- [ ] Replace template READMEs/TODO descriptions in `fireux-blogs` and `fireux-drop`.
- [ ] Review peerDependencies for thin modules (e.g., `fireux-drop`) and tighten if needed.

## Design system
- [ ] Formalize token naming (colors, spacing, radii).
- [ ] Document canonical component recipes (CTA blocks, hero layouts, testimonials).

## Kitchen module planning
- [ ] Pick the anchor scenario for the kitchen module.
- [ ] Confirm the default module set for new apps.
- [ ] Draft a full spec for the chosen kitchen scenario (roles, objects, flows, screens).

## Onboarding flow
- [ ] Decide if onboarding is admin-only or public.
- [ ] Decide if onboarding scope is auto appId/tenant or user-selectable.
- [ ] Decide if a local-vs-browser mode selector is required.
- [ ] Define minimal onboarding steps shared by both modes.
- [ ] Define the steps that diverge by mode (local paths vs Firestore assets).
- [ ] Decide where onboarding progress is stored (Firestore, local storage, or both).

## CV/portfolio proof points
- [ ] Collect deployment proof (live URLs, screenshots, demo videos).
- [ ] Gather metrics (load time, build time, feature count, app/tenant count).
- [ ] Document client outcomes (e.g., Richies milestones).
- [ ] Confirm public GitHub links, if any.
- [ ] Answer target role/title and engagement preference (contract vs full-time).
- [ ] Identify 1-2 shareable live URLs.

#end

# AI/gpt-chats/cleanbox-app.md

# cleanbox-app


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/gpt-chats/fireux-app.md

# fireux-app


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/gpt-chats/fireux-cleanbox.md

# FireUX – Cleanbox Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/gpt-chats/fireux-fireux.md

# FireUX – FireUX Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/gpt-chats/fireux-misebox.md

# FireUX – Misebox Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/gpt-chats/fireux-tenant.md

# fireux-tenant


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/gpt-chats/fireux.md

# FireUX Project — AI Working Contract


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/gpt-chats/jobs.md

# FireUX Jobs — Canonical Package Contract


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/gpt-chats/misebox-app.md

# misebox-app


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/gpt-chats/places.md

# FireUX Places — Canonical Package Contract


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/gpt-chats/richies.md

# Richie’s Reinigung


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `

#end

# AI/todo

FireUX components handoff (2026-02-09)
Updated: 2026-02-18

Goal
- Restore runtime page component rendering after entities/objects flattening.

Status
- Added component auto-registration for ./runtime/components to enable Organisms* names.
- Updated products index to use OrganismsProductSolutions and OrganismsProductCollectionManager.

Next checks
- Confirm products index renders with Organisms prefix in dev runtime.
- If still broken, verify component names in other index pages (places/jobs/kitchens) and align with Organisms* or Product* naming.
- Scan other module components-config files for mismatched pathPrefix/prefix vs template usage.
- Re-check for stale import refs after refactor (focus on products, places, kitchens).

Notes
- packages/extensions/fireux-products/src/config/module/components-config.ts now registers ./runtime/components (pathPrefix true, no prefix) and Product-prefixed components.
- packages/extensions/fireux-products/src/runtime/pages/products/index.vue uses Organisms* tags.
- No stale refs found in root package.json or fireux-products package.json.

#end
