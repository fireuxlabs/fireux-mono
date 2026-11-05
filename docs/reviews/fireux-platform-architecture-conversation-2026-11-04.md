# FireUX platform and navigation discussion — 2026-11-04

Status: conversation handoff for Codex. **Discussion decisions, not implemented changes.** Do not interpret this as permission to refactor or ship.

## Objective
FireUX extends Nuxt and Nuxt UI with opinionated application experience, Firebase integration, and reusable components. Keep the developer experience familiar to Nuxt UI users: Vue components, props, slots, events, auto-import conventions, Nuxt UI styling and docs with live examples. Document **what FireUX adds**, not a duplicate of Nuxt UI. A component may compose Nuxt UI components rather than inherit them.

Core remains domain-agnostic: it must not encode kitchens, chefs, suppliers etc. Domain modules/extensions may exist and be discoverable from FireUX.app without moving domain logic into Core.

## Component and docs examples
- Proposed generic `FireDisclosureCard`: independently expandable card with title/summary and slot content. Currently motivated by three legal sections (Terms etc.) using the same component. Use Nuxt UI primitives; no legal-specific knowledge in the component. Naming is a proposal, not confirmed code.
- A Misebox ChefCard can compose a generic user card; don't duplicate Nuxt UI.
- Shared docs library should expose components, composables, concepts, packages/extensions, and ecosystem examples; each package owns its docs, central site aggregates. Potential URL `fireux.app/docs` vs `docs.fireux.app` unresolved.
- About pages: app owns its story and page, but can compose shared informational components from ecosystem and Core. Example Le Tap Berne → Misebox → FireUX, with appropriate support contacts. Potential `FireAboutPlatform` and `MiseboxAboutProvider` are illustrative names, not established components.

## FireUX.app as developer workspace
Developer creates and manages projects, attaches apps or ecosystems, metadata, team, Firebase connection, CRUD interfaces, notifications/observability. VS Code remains code editor; mini-editor is distant possibility. Hypothetical workflow, not claimed fully implemented. Example: project activity notification for a new user, separate from customer-facing notifications.

## Header review — decisions
Shared chrome (not part of nav review): logo/brand, guest Sign in vs signed-in avatar, subscription indicator, Workspace entry for workspace-enabled apps. Auth is opinionated default; apps may opt out.
- **Apps** stays: ecosystem app lists its own apps; FireUX.app lists apps across ecosystems.
- **Ecosystems** stays on parent FireUX.app only; child ecosystems don't list child ecosystems.
- **Projects** stays on FireUX.app: public `/projects` directory vs private workspace project management, same Project entity.
- **Modules** stays on FireUX.app: extension marketplace. Project context + module AI context can eventually explain fit and guide install (e.g. `fireux-kitchens`). Installation mechanics unresolved.

## Footer review
- **Pricing** stays; shared opinionated Core pricing composable with per-app terminology and feature descriptions.
- **Packages**: technical package library should move under developer Docs, not be an independent public footer link (decision; not yet implemented).
- **About** stays; each app owns page and composes parent informational components as desired.
- **Solutions** deferred to joint review with Search Demand, Tools, Operations, Capabilities.

## Pricing philosophy and team rule
**Pricing is primarily capability-based, not a charge based on number of things managed.**
- Free: limited functionality for one entity; **fixed five-member team per entity** as proposed product policy.
- Pro: complete capabilities for one entity.
- Business: multi-entity and larger-team tier.
- Team naming changes by domain: Project Team, Kitchen Team, Portfolio Team, dog-grooming team, etc. Five-person Free limit is *not* a self-service override; bespoke exception only by direct developer intervention. This is a discussion decision, not proof of enforcement in code.
- Repository observation: shared `packages/core/fireux-core/src/runtime/app/composables/pricing/usePricing.ts`; `useFireuxPricing.ts` and `useMiseboxPricing.ts` adapt profile. Existing displayed prices include Free CHF 0, Pro CHF 20/mo, Business CHF 100/mo plus CHF 20 per entity, branded App setup CHF 600 plus recurring fees. Verify current policy before implementation.

## Package boundary
Core provides extension integration, not extension domain content.
- **AI and Docs**: embedded platform capabilities in the discussed model.
- **Products and Blogs**: separate optional-style extensions deliberately included and locked into default new app scaffold, for sales and SEO; not embedded into Core. They can remain unused in UI.
- Ignition serves project creation; don't automatically require every generated app to install it.
- Repository observation: FireUX.app depends on `fireux-core`, `fireux-fireux`, `fireux-ai`, `fireux-docs`, `fireux-ignite`, `fireux-products`, `fireux-blogs`, and `fireux-misebox`. Dependencies of this app are **not** the same as default dependencies of all generated apps.
- Potential review: parent FireUX.app's direct `fireux-misebox` dependency vs parent independence; do not change without examining purpose.

## Outstanding conceptual audit
Review **Search Demand, Solutions, Capabilities, Operations, Tools** together as potentially linked stages; do not assume the exact hierarchy. Determine what each means in existing code, whether Core/extension/app owns it, and which deserve public navigation.
Then compare **child ecosystem apps and standalone child apps** (e.g. Misebox, Granite, others) to test whether navigation, pricing, About inheritance, and default packages behave consistently. **This is the immediate next task requested in conversation.**

## Suggested Codex continuation
1. Inspect current routes, nav metadata, footer/header implementations in FireUX.app and child ecosystem apps.
2. Compare actual code to decisions above; report gaps without silently implementing.
3. Inspect Search Demand → Solutions → Capabilities → Operations → Tools semantics and connections.
4. Propose smallest changes and get explicit go-ahead before edits.

Relevant paths checked during discussion:
- `projects/fireux/fireux-app/app/pages/{apps,ecosystems,projects,modules}/index.vue`
- `projects/fireux/fireux-app/app/pages/pricing/index.vue`
- `projects/fireux/fireux-app/app/pages/packages/index.vue`
- `packages/core/fireux-core/src/runtime/components/layouts/default/{Header,Footer}.vue`
- `packages/core/fireux-core/src/runtime/app/composables/pricing/usePricing.ts`
- `projects/fireux/fireux-app/package.json`
