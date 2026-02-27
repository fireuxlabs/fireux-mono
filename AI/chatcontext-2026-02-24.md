## codex-threads/alignment.md

# Alignment Notes - useInterface composables

Updated: 2026-02-20
Scope: view-facing interface helpers for FireUX Firestore models.

Purpose:
- Keep view interface adapters thin and predictable.
- Avoid fallbacks or implicit selection logic in interface helpers.

Rules:
- use*Interface composables are view-layer adapters only. No writes.
- Do not hide missing data; surface nulls explicitly.
- Keep naming consistent with Firestore entity types.

Key files:
- packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface.ts
- packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/utils/view/usePlacesInterface.ts

Recent scan (2026-02-20):
- Commit 20b2754f adjusted company/place interface helpers alongside extension runtime updates.

#end

## codex-threads/asset-monitoring.md

# Asset Monitoring - Sizes and Transparency

Updated: 2026-02-20
Scope: visual asset quality for apps and marketing.

Focus:
- Ensure all wordmarks have true transparency.
- Keep sizes consistent for export and UI usage.

Open tasks:
- Export FireUX wordmark with transparent background.
- Audit Misebox, Cleanbox, Richies, and FireUX assets for background bleed.
- Capture per-app findings in this thread.

Notes:
- Prefer SVG where possible; otherwise use 2x PNG with alpha.

#end

## codex-threads/bringli.md

# FireUX - Bringli ecosystem (Codex)

Updated: 2026-02-20
Scope: implementation notes for Bringli domain.

Summary:
- Bringli routes must avoid collisions with supplier domain work.
- Treat supplier ownership as belonging to fireux-drop; Bringli consumes those APIs.

Current guardrails:
- Keep runtimeConfig.public.fireux.drop consistent across apps.
- Validate Bringli routes after supplier migration.

Recent scan (2026-02-20):
- No Bringli-specific commits since 2026-02-19.

#end

## codex-threads/cleanbox.md

# FireUX - Cleanbox ecosystem (Codex)

Status: Active
Updated: 2026-02-20
Scope: implementation-level decisions for Cleanbox apps and extensions.

Primary surfaces:
- projects/cleanbox/cleanbox-app
- projects/cleanbox/richies-reinigung

Notes:
- Cleanbox apps reuse FireUX extensions; avoid app-specific forks.
- Keep onboarding and fulfillment flows aligned with FireUX defaults.

Recent scan (2026-02-20):
- No Cleanbox-specific commits since 2026-02-19.

#end

## codex-threads/daniel-watson.md

# Daniel Watson - Working preferences (Codex)

Updated: 2026-02-20

Preferences:
- Prefer explicit instructions over inference.
- Avoid fallbacks or silent substitutions.
- Keep changes minimal and localized.
- Favor clear file-level guidance and links.

Working style:
- Short, skimmable summaries.
- Decisions recorded in AI/codex-threads and spec docs.

#end

## codex-threads/design-system.md

# FireUX Design System - Codex Thread

Updated: 2026-02-20
Scope: tokens, component naming, and UI conventions.

Priorities:
- Formalize token naming (color, spacing, radius).
- Keep semantic tokens separate from raw palette values.
- Avoid one-off colors or per-page overrides.

Notes:
- Prefer shared components in extensions over app-local variants.

#end

## codex-threads/droply.md

# FireUX - Droply module thread (Codex)

Updated: 2026-02-20
Scope: supplier domain ownership and module migration.

Decisions:
- fireux-drop is the supplier domain owner.
- Supplier models/composables/pages should move from Misebox to Drop.
- Provide temporary compatibility wrappers in Misebox.

Follow-ups:
- Verify Bringli routes after supplier migration.
- Align runtimeConfig.public.fireux.drop defaults across apps.

#end

## codex-threads/extensions.md

# FireUX Extensions - Recent Scan (Codex)

Updated: 2026-02-20
Scope: extension module changes and guardrails.

Latest commit:
- 20b2754f (2026-02-19) updated multiple extension runtime files and pages.

Touched modules and files:
- fireux-blogs: useBlogCreateSubmit, useBlogDraftState
- fireux-companies: useCompanyInterface
- fireux-jobs: Job/Collection/Provider.vue
- fireux-kitchens: pages-config, read-only scenario broth-bloom, runtime kitchen document, kitchen fetch, console dishes/menu pages, kitchens/[id]/menu
- fireux-places: usePlacesInterface
- fireux-products: Product CTA component, admin licenses page
- scripts: migrate-tapberne-menu-items-to-dishes.mjs, migrate-tapberne-menus.mjs
- pnpm-lock.yaml updated

Guardrails:
- Keep extension runtime APIs stable; avoid breaking view contracts.
- Prefer explicit composable imports and consistent naming.

Open follow-ups:
- Align extension versions and compatibility ranges.
- Standardize Nuxt kit import style.
- Resolve blog route naming and README placeholders.

#end

## codex-threads/fallback.md

# Fallback Policy

Updated: 2026-02-20
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

## codex-threads/fireux-misebox.md

# FireUX - Misebox ecosystem (Codex)

Updated: 2026-02-20
Scope: Misebox app and related extensions.

Primary surfaces:
- projects/misebox/misebox-app
- projects/misebox/niederhorn

Notes:
- Misebox should consume shared FireUX extensions rather than fork.
- Supplier ownership is moving to fireux-drop; Misebox should wrap temporarily.

Recent scan (2026-02-20):
- No Misebox-specific commits since 2026-02-19.

#end

## codex-threads/kitchen-console.md

# Kitchen Console Contract (FireUX Kitchens)

Status: Active
Updated: 2026-02-20
Scope: runtime behavior and page responsibilities for kitchen console surfaces.

Why this exists:
- Keep one coherent kitchen system instead of ad-hoc flows.
- Ensure runtime kitchen selection is consistent across pages.

Runtime model (single source):
- Resolve the active kitchen through runtime state, not URL query params.
- Core composables:
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchen.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/state.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/shared.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchenData.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchenDocument.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/read-only-scenarios/index.ts

Runtime modes:
- read-only: scenario-resolved demo data
- dummy: dummy/scenario.ts
- test: Firestore test-kitchens/{kitchenId}
- live: Firestore kitchens/{kitchenId}

Collection path rule:
- read-only -> no Firestore collection
- live -> kitchens
- dummy + test -> test-kitchens

Selection rule:
- /kitchens CTA sets runtimeKitchenId and runtimeKitchenMode in state.
- /console/kitchen/* pages consume that state.
- Do not rely on ?mode= or ?id= in console URLs.

Canonical entity graph:
- Kitchen (kitchens/{id} or test-kitchens/{id})
- Ingredient catalog, KitchenIngredient, KitchenRecipe
- KitchenMiseTask, KitchenDish, KitchenMenu
- Chef profile, KitchenTeamMember
- Supplier, KitchenSupplier
- IncomingOrder, PurchaseOrder (prototypes)

Console route map:
- /console/kitchen
- /console/kitchen/ingredients
- /console/kitchen/mise
- /console/kitchen/recipes
- /console/kitchen/dishes
- /console/kitchen/menu
- /console/kitchen/team
- /console/kitchen/stations
- /console/kitchen/training
- /console/kitchen/haccaaap
- /console/kitchen/suppliers
- /console/kitchen/orders
- /console/kitchen/purchase-orders
- /console/kitchen/supplier/[id]

Page contracts:

Kitchen (/console/kitchen)
Purpose: show runtime kitchen identity and debug surface.
Reads: Kitchen.
Writes: none.

Ingredients (/console/kitchen/ingredients)
Purpose: manage kitchen ingredient attachment and visibility.
Reads: Ingredient, KitchenIngredient.
Writes: KitchenIngredient.

Mise (/console/kitchen/mise)
Purpose: manage prep tasks and mise lists.
Reads: KitchenMiseTask, KitchenRecipe.
Writes: KitchenMiseTask.

Recipes (/console/kitchen/recipes)
Purpose: manage recipes and ingredient lines.
Reads: KitchenRecipe, KitchenIngredient.
Writes: KitchenRecipe.

Dishes (/console/kitchen/dishes)
Purpose: manage dish definitions and recipe links.
Reads: KitchenDish, KitchenRecipe.
Writes: KitchenDish.

Menu (/console/kitchen/menu)
Purpose: manage menu groupings and active dishes.
Reads: KitchenMenu, KitchenDish.
Writes: KitchenMenu.

Team (/console/kitchen/team)
Purpose: manage kitchen team assignments.
Reads: Chef, KitchenTeamMember.
Writes: KitchenTeamMember.

Stations (/console/kitchen/stations)
Purpose: track station/service flow status.
Reads: KitchenStation, KitchenMiseTask.
Writes: KitchenStation.

Training (/console/kitchen/training)
Purpose: surface training/checklists.
Reads: KitchenTraining.
Writes: KitchenTraining.

Haccaaap (/console/kitchen/haccaaap)
Purpose: compliance and safety logs.
Reads: KitchenCompliance.
Writes: KitchenCompliance.

Suppliers (/console/kitchen/suppliers)
Purpose: manage supplier links and metadata.
Reads: Supplier, KitchenSupplier.
Writes: KitchenSupplier.

Orders (/console/kitchen/orders)
Purpose: view incoming orders (prototype).
Reads: IncomingOrder.
Writes: none.

Purchase Orders (/console/kitchen/purchase-orders)
Purpose: manage outgoing supplier orders (prototype).
Reads: PurchaseOrder.
Writes: PurchaseOrder.

Supplier detail (/console/kitchen/supplier/[id])
Purpose: detail supplier profile and linked ingredients.
Reads: Supplier, KitchenSupplier, KitchenIngredient.
Writes: KitchenSupplier.

Recent scan (2026-02-20):
- Commit 20b2754f updated kitchen pages config, read-only scenario broth-bloom, runtime kitchen document/fetch helpers, and menu/dishes pages.

#end

## codex-threads/kitchens.md

# Kitchens Roadmap (FireUX)

Status: Active
Updated: 2026-02-20
Scope: roadmap only (actionable order). No scenarios or examples.

Phase 0 - Anchor and guardrails
- Choose the anchor scenario (one line product promise).
- Lock the MVP entity set (ingredient, recipe, kitchen, chef).
- Decide the route surface (for example /kitchen/*).
- Decide auth assumptions (public vs auth-only).
- Define the kitchen UI language (cards, lists, status chips).

Phase 0.5 - Test kitchen environment
- Treat test kitchens as the primary safe sandbox for console prototyping.
- Require explicit kitchen selection; no automatic fallback between real and test kitchens.
- Keep test-kitchens collection separate from kitchens; never merge silently.
- Surface clear UI labels when a test kitchen is active.
- Use test kitchens to validate flows without affecting real kitchens.

Phase 1 - MVP slice: ingredients and recipes
- Ingredients list with CRUD (name, unit, cost per unit).
- Recipe detail with ingredient rows and quantities.
- Basic cost and quantity summary (no edge cases).
- Clean, screenshot-ready UI; remove unfinished actions.

Phase 2 - Kitchen profile and team
- Kitchen profile page with core attributes and helper copy.
- Chef profile list under apps/{appId}/chefs.
- Role labels and responsibilities (no permissions system).

Phase 3 - Mise en place and prep lists
- Daily and weekly prep list view (group by station or recipe).
- Checklist state with simple completion tracking.
- Prep notes and owner assignment (single field).

Phase 4 - Menu and dish modeling
- Menu entity (active window, meal period, status).
- Dishes reference recipes; menus reference dishes.
- Read-only menu view with cost rollup.

Phase 5 - Inventory awareness (light)
- Ingredient stock field plus reorder threshold.
- Low-stock alerts (UI only, no automation).
- Optional supplier link placeholder (no ordering workflow).

Phase 6 - Station and service flow
- Station board (prep, line, pass) with status columns.
- Order and plate tickets as lightweight items (no full order system).
- Touch-friendly layout option for kitchen screens.

Phase 7 - Ordering and procurement (add-on)
- Supplier entities and purchase orders.
- Receiving log and variance tracking.
- Cost reconciliation tied to recipes and menus.

Phase 8 - Reporting and operational insights
- Food cost trends, waste tracking, prep variance.
- Menu profitability snapshot and prep time estimates.
- Exportable reports or shareable summaries.

Phase 9 - Ecosystem integrations
- Connect to fireux-products, fireux-places, fireux-companies.
- Tenant-level defaults and shared component recipes.
- Extension docs, runtime contract, and onboarding copy.

Phase 10 - Continuous improvement
- Tighten UI tokens, accessibility, and copy.
- Add guardrails based on real usage feedback.
- Ship small, high-signal slices; avoid platform creep.

Canon decision - ingredient identity
Rule:
- Ingredient identity is named by kitchen usage, not by supplier naming or taxonomy.

Implications:
- If prep, ordering, or costing differs, it is a different ingredient.
- Supplier SKUs map to ingredients; ingredients do not derive from SKUs.

Recent scan (2026-02-20):
- Commit 20b2754f updated kitchen console menu and dishes pages plus runtime kitchen helpers.

#end

## codex-threads/monorepo-install-incident.md

# Monorepo Install Incident (2026-02-06)

Updated: 2026-02-20
Summary:
- pnpm dev:* commands failed with sh: nuxi: command not found.
- pnpm install left partial installs and failed in workspace postinstall.
- Impact was monorepo-wide (not only fireux-app).

Root causes:
- Network or DNS failures to npm registry created partial dependency state.
- Workspace postinstall scripts ran nuxi prepare in full runtime mode.
- Some apps/templates require env vars (for example APP_DOMAIN) at config load time, so postinstall could fail and break the whole install.

Fix applied:
- Updated app postinstall scripts to run nuxi prepare with CI=1 in the child process.

Files updated:
- projects/cleanbox/cleanbox-app/package.json
- projects/cleanbox/richies-reinigung/package.json
- projects/fireux/fireux-app/package.json
- projects/fireux/tenant/package.json
- projects/misebox/misebox-app/package.json
- projects/misebox/niederhorn/package.json

Verification:
- pnpm install
- pnpm -r --filter './projects/*/*' exec nuxi --version
- pnpm dev:fireux --host

#end

## codex-threads/onboarding.md

# Onboarding Thread

Updated: 2026-02-20
Goal: simplify onboarding so it works the same locally and in the browser.

Key decisions:
- Onboarding lives at /onboarding and is the single entry point.
- Product pages (/products/[slug]) are marketing-only.
- Module pages (/modules/[id]) are marketing-only.
- Onboarding pulls from the same product objects in Firestore (no separate module registry).

Open questions:
- Should onboarding be admin-only or public?
- Should onboarding be scoped by appId/tenant automatically or selectable?
- Do we need a short onboarding mode selector: local vs browser?

Next steps:
- Define the minimal onboarding steps that are the same in both modes.
- Define which steps diverge (asset upload to Firestore vs local file paths).
- Decide where onboarding progress is stored (Firestore vs local storage vs both).

#end

## codex-threads/packages.md

# FireUX - Packages Map (Codex)

Updated: 2026-02-20
Scope: high-level package map for implementation work.

Core extension packages (packages/extensions):
- fireux-products, fireux-places, fireux-jobs, fireux-kitchens, fireux-blogs, fireux-companies
- fireux-drop (supplier domain ownership)

Apps and projects (projects/*/*):
- fireux-app, fireux-tenant, cleanbox-app, richies-reinigung, misebox-app, niederhorn

Shared tooling:
- scripts/ for migrations and data fixes
- pnpm-workspace.yaml and pnpm-lock.yaml for dependency state

Notes:
- Extensions provide runtime composables, components, and pages.
- Apps consume extensions; avoid app-level forks when possible.

#end

## codex-threads/product-fulfillment.md

# Product Fulfillment Thread Handoff

Updated: 2026-02-20
This thread is scoped to post-purchase fulfillment only.

Scope:
- App onboarding and fulfillment checklists
- Asset collection and validation
- Build, review, and launch fulfillment flow
- Local-first vs Firestore-first ingestion

Out of scope (handled in products/stripe thread):
- Stripe setup and debugging
- Product creation UX and defaults
- Multi-create starter actions
- Stripe ID persistence rules

Current separation rule:
- products thread: create, sell, charge
- product-fulfillment thread: deliver, build, launch

#end

## codex-threads/products.md

# FireUX - Products and Revenue (Codex)

Updated: 2026-02-20
Scope: implementation details for products, pricing, and licensing.

Key surfaces:
- packages/extensions/fireux-products/src/runtime/components/organisms/Product/CTA.vue
- packages/extensions/fireux-products/src/runtime/pages/admin/licenses/index.vue
- packages/extensions/fireux-products/src/runtime/pages/products/index.vue

Guardrails:
- Keep create and checkout flows explicit; avoid hidden defaults.
- Prefer shared modal/confirm patterns over browser confirm.
- Keep licensing admin isolated from public product pages.

Recent scan (2026-02-20):
- Commit 20b2754f updated Product CTA and admin licenses page.

#end

## codex-threads/tasks.md

# Tasks

Updated: 2026-02-20

Product stack alignment (fireux-products):
- [ ] Standardize toast access in Product Create System (replace runtime fallback with canonical composable).
- [ ] Wrap createProduct() in try/catch/finally so isCreating always resets.
- [ ] Replace browser confirm(...) with shared modal/confirm UX pattern.
- [ ] Decide on Product Create shipping stage (remove or gate via feature/runtime config).
- [ ] Consolidate products index description so page header and meta share one source.
- [ ] Re-validate entity collection managers for new fallback chains.

Asset monitoring:
- [ ] Export FireUX wordmark with true transparency.
- [ ] Add per-app asset findings (Misebox, Cleanbox, Richies, FireUX) to the asset monitoring thread.

Bringli and Drop supplier ownership:
- [ ] Promote fireux-drop from scaffold to Supplier domain owner.
- [ ] Move Supplier models/composables/components/pages from Misebox to Drop.
- [ ] Add temporary compatibility wrappers in Misebox for one release cycle.
- [ ] Verify Bringli routes render without collisions after Supplier migration.
- [ ] Confirm Bringli runtime defaults for runtimeConfig.public.fireux.drop.

Extension system cleanup:
- [ ] Update fireux-products/package.json description (remove TODO).
- [ ] Replace template README in fireux-products with real ownership guardrails.
- [ ] Choose a single module configKey style (domain keys vs fireuxX) and align docs.
- [ ] Document Stripe support and server surface in fireux-products runtime contract.
- [ ] Decide server route registration policy and wire Stripe endpoints if explicit registration wins.
- [ ] Decide product routes injection policy (inject all vs rely on runtime layer).
- [ ] Standardize Nuxt kit import style across extensions (@nuxt/kit vs nuxt/kit).
- [ ] Align fireux-jobs package version with module meta version.
- [ ] Align extension compatibility.nuxt with peerDependency ranges.
- [ ] Remove redundant addImportsDir calls where configureComposables already registers.
- [ ] Resolve route naming inconsistency (fireux-blog-* vs plural package naming).
- [ ] Add missing TypeScript reference for fireux-companies in packages/extensions/tsconfig.json.
- [ ] Replace template READMEs/TODO descriptions in fireux-blogs and fireux-drop.
- [ ] Review peerDependencies for thin modules (for example fireux-drop) and tighten if needed.

Design system:
- [ ] Formalize token naming (colors, spacing, radii).

#end

## gpt-chats/cleanbox-app.md

# cleanbox-app

Updated: 2026-02-20
Summary:
- Cleanbox app is a FireUX project that consumes shared extensions.
- Focus on consistent onboarding and fulfillment flows.

Current focus:
- Keep Cleanbox app aligned with FireUX defaults.
- Avoid app-specific forks of shared components.

#end

## gpt-chats/fireux-app.md

# fireux-app

Updated: 2026-02-20
Summary:
- FireUX app is the flagship admin and runtime experience.
- It consumes FireUX extensions (products, places, jobs, kitchens).

Current focus:
- Keep extension-driven pages stable and explicit.
- Use shared onboarding and licensing flows.

#end

## gpt-chats/fireux-cleanbox.md

# FireUX - Cleanbox ecosystem

Updated: 2026-02-20
Summary:
- Cleanbox is a FireUX ecosystem app with its own branding.
- It uses shared FireUX extensions rather than bespoke modules.

Current focus:
- Maintain consistent UX with the core FireUX app.
- Keep onboarding and fulfillment aligned.

#end

## gpt-chats/fireux-fireux.md

# FireUX - FireUX ecosystem

Updated: 2026-02-20
Summary:
- FireUX ecosystem includes the flagship app and core extensions.
- Domains include products, places, jobs, kitchens, blogs, and companies.

Current focus:
- Consolidate runtime contracts across extensions.
- Keep kitchen console and product licensing flows stable.

#end

## gpt-chats/fireux-misebox.md

# FireUX - Misebox ecosystem

Updated: 2026-02-20
Summary:
- Misebox is a FireUX ecosystem app for kitchen-centric workflows.
- It should consume shared extensions, not fork them.

Current focus:
- Align supplier ownership with fireux-drop.
- Keep kitchen console flows consistent with core runtime state.

#end

## gpt-chats/fireux-tenant.md

# fireux-tenant

Updated: 2026-02-20
Summary:
- fireux-tenant is the tenant-facing experience for FireUX deployments.
- It should rely on shared extensions and onboarding flows.

Current focus:
- Keep tenant UX consistent with FireUX admin decisions.
- Avoid duplicating extension logic.

#end

## gpt-chats/fireux.md

# FireUX Project - GPT context

Updated: 2026-02-20
Summary:
- FireUX is a monorepo of domain extensions and apps.
- Extensions provide composables, components, and pages used by apps.

Primary domains:
- products, places, jobs, kitchens, blogs, companies

Current focus:
- Kitchen console runtime consistency.
- Product licensing and CTA surfaces.
- Consistent interface helpers for companies and places.

#end

## gpt-chats/jobs.md

# FireUX Jobs - GPT context

Updated: 2026-02-20
Summary:
- FireUX Jobs provides job collection and listing surfaces.
- It is consumed by FireUX apps as an extension.

Recent note:
- Job collection provider component was updated in the latest scan.

#end

## gpt-chats/misebox-app.md

# misebox-app

Updated: 2026-02-20
Summary:
- Misebox app focuses on kitchen and prep workflows.
- It should mirror core FireUX kitchen runtime decisions.

Current focus:
- Keep kitchen console behavior consistent.
- Align supplier ownership with fireux-drop.

#end

## gpt-chats/places.md

# FireUX Places - GPT context

Updated: 2026-02-20
Summary:
- FireUX Places provides place/location data and views.
- It is consumed by FireUX apps as an extension.

Recent note:
- Places interface helper updated in the latest scan.

#end

## gpt-chats/richies.md

# Richies Reinigung

Updated: 2026-02-20
Summary:
- Richies Reinigung is a Cleanbox ecosystem app.
- It should rely on shared FireUX extensions and onboarding.

Current focus:
- Keep app-specific branding while preserving shared flows.

#end

