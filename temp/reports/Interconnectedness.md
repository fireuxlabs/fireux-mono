# Interconnectedness
Authority: Tier2 (Operational discovery)
Updated: 2026-03-03

# FireUX Discovery Session — Consoles, Modules, Ecosystems, Apps (and how they connect)

> Purpose: capture the current shape of FireUX as implemented now, then test it for simplicity/reuse/legal-first/minimal coupling.
> Method: repository scan only; statements below include file/symbol evidence.

---

## 0) Rules of this discovery
- Inventory first, redesign later.
- Statements below are based on file paths, exported symbols, route files, and Nuxt config/module wiring.
- Entity vs console vs ecosystem vs tenant app are separated.
- Thin contracts are called out separately from ops/console surfaces.

---

## 1) Definitions (validated against repo)
### 1.1 Entity (Extension-level)
An entity is a reusable domain model owned by an extension package under `packages/extensions/*`.
Evidence: extension model files like:
- `packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts` (`KitchenCore`, `KitchenApp`)
- `packages/extensions/fireux-suppliers/src/runtime/models/profiles/Supplier/Supplier.model.ts` (`SupplierCore`, `SupplierApp`)
- `packages/extensions/fireux-properties/src/runtime/models/property.model.ts` (`Property`)

### 1.2 Console (UI surface / operational role)
A console is a route/layout surface for runtime operations (usually under `/console/*`, plus some dashboard profile consoles).
Evidence:
- Core console hub: `packages/core/fireux-core/src/runtime/pages/console/index.vue`
- Kitchen console layout: `packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-console.vue`
- Granite console layout: `packages/ecosystem/fireux-granite/src/runtime/layouts/granite-console.vue`

### 1.3 Ecosystem (vertical brand)
An ecosystem package is a Nuxt layer/module with brand runtime config + composition wiring.
Evidence:
- `packages/ecosystem/fireux-*/src/module.ts`
- `packages/ecosystem/fireux-*/src/config/firebase/ecosystem.config.ts`

### 1.4 App (tenant front-end)
An app is a Nuxt project instance (global or tenant role) with selected modules.
Evidence:
- `projects/*/*/nuxt.config.ts` via `defineFireuxConfig({ ecosystem, id, role, modules })`
- `packages/ecosystem/fireux-fireux/src/apps/apps/stitch/nuxt.config.ts`

---

## 2) Inventory: what exists right now (repo reality)
### 2.1 Packages map (real paths)

- Packages root tree:
```text
packages/
  core/
    fireux-core/
    fireux-ecosystem-controller/
    fireux-nuxtfire/
  extensions/
    fireux-blogs/
    fireux-companies/
    fireux-compliance/
    fireux-documents/
    fireux-suppliers/
    fireux-jobs/
    fireux-kitchens/
    fireux-orders/
    fireux-places/
    fireux-products/
    fireux-properties/
    fireux-tasks/
  ecosystem/
    fireux-bringli/
    fireux-cleanbox/
    fireux-fireux/
    fireux-granite/
    fireux-misebox/
```

- Extensions tree:
```text
packages/extensions/fireux-*/
  docs/ (contracts for: blogs, companies, drop, jobs, kitchens, orders, places, products)
  src/module.ts
  src/runtime/models/**
  src/runtime/composables/**
  src/runtime/pages/**
```

- Ecosystems tree:
```text
packages/ecosystem/fireux-*/
  src/module.ts
  src/config/firebase/ecosystem.config.ts
  src/config/module/**
  src/runtime/pages/**
  src/runtime/layouts/**
  src/runtime/composables/**

packages/ecosystem/fireux-fireux/src/apps/apps/stitch/
  nuxt.config.ts
  app/pages/console/**
```

- Apps tree:
```text
projects/
  bringli/bringli-app/
  cleanbox/cleanbox-app/
  cleanbox/richies-reinigung/
  fireux/fireux-app/
  fireux/tenant/
  granite/granite-app/
  misebox/misebox-app/
  misebox/la-tap-berne/
  misebox/niederhorn/
  templates/fireux-template/
```

Nuxt workspace evidence:
- `pnpm-workspace.yaml` includes `packages/*` and `projects/*/*`.
- Nuxt entry points are `projects/*/*/nuxt.config.ts` plus stitch app at `packages/ecosystem/fireux-fireux/src/apps/apps/stitch/nuxt.config.ts`.

---

## 3) Consoles: list them and where they live

### 3.1 Console list (current + intended)

#### Console: Core Console Hub
- Actor: authenticated app operator
- Routes:
  - `packages/core/fireux-core/src/runtime/pages/console/index.vue` (`/console`)
- Components:
  - `LayoutsConsoleNavbar`, core console layout components under `packages/core/fireux-core/src/runtime/components/layouts/console/*`
- Runtime composable:
  - `useRuntimeApp` from `packages/core/fireux-core/src/runtime/composables/fireux/app/runtime-app/useRuntimeApp.ts`
- Context:
  - `runtimeAppId`, `runtimeAppMode` from `useRuntimeAppSelection()` in `.../runtime-app/state.ts`
  - hub route discovery via `router.getRoutes()` in `pages/console/index.vue`
- Depends on extensions:
  - none directly (core-only)
- Depends on other consoles:
  - none (discovers hubs by route path only)

#### Console: App Console (FireUX)
- Actor: global app admin/operator
- Routes:
  - `projects/fireux/fireux-app/app/pages/console/app/index.vue` (`/console/app`)
- Components:
  - core console layout/navbar components
- Runtime composable:
  - `useRuntimeApp`
- Context:
  - app id/name/role/modules (`useRuntimeApp` + `useFireUXConfig`)
- Depends on extensions:
  - none directly (reads runtime app + available routes)
- Depends on other consoles:
  - none

#### Console: Kitchen Console (Misebox)
- Actor: chef/kitchen operations
- Routes:
  - `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/*.vue`
  - tenant overrides for home page at:
    - `projects/misebox/misebox-app/app/pages/console/kitchen/index.vue`
    - `projects/misebox/la-tap-berne/app/pages/console/kitchen/index.vue`
    - `projects/misebox/niederhorn/app/pages/console/kitchen/index.vue`
- Components:
  - kitchen layout: `packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-console.vue`
  - ops components in `packages/extensions/fireux-kitchens/src/runtime/components/organisms/**`
- Runtime composable:
  - `useRuntimeKitchen` (`.../app/kitchen-runtime/useRuntimeKitchen.ts`)
- Context:
  - `id`, `mode`, `collectionPath`, `doc`, `data`
  - modes map to `kitchens/{id}` or `test-kitchens/{id}` via `resolveRuntimeKitchenCollectionPath`
- Depends on extensions:
  - fireux-kitchens primary
  - supplier reads via canonical supplier collections (`suppliers`, `apps/{appId}/suppliers`) through `useKitchenSupplierFetch`
- Depends on other consoles:
  - none

#### Console: Portfolio Console (Granite)
- Actor: portfolio/landlord ops
- Routes:
  - `packages/ecosystem/fireux-granite/src/runtime/pages/console/portfolio/index.vue`
  - `packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/properties.vue`
  - `packages/extensions/fireux-compliance/src/runtime/pages/console/portfolio/compliance.vue`
  - `packages/extensions/fireux-documents/src/runtime/pages/console/portfolio/documents.vue`
  - `packages/extensions/fireux-tasks/src/runtime/pages/console/portfolio/tasks.vue`
- Components:
  - granite layout: `packages/ecosystem/fireux-granite/src/runtime/layouts/granite-console.vue`
- Runtime composable:
  - `useRuntimePortfolio` (`fireux-properties/.../portfolio-runtime/useRuntimePortfolio.ts`)
- Context:
  - `runtimePortfolio.id`, `runtimePortfolio.mode`, read-only scenario support
- Depends on extensions:
  - fireux-properties, fireux-compliance, fireux-documents, fireux-tasks
- Depends on other consoles:
  - none

#### Console: Stitch Console (FireUX tenant app)
- Actor: stitch provider/request manager
- Routes:
  - `packages/ecosystem/fireux-fireux/src/apps/apps/stitch/app/pages/console/index.vue`
  - `.../console/providers/index.vue`
  - `.../console/providers/[id].vue`
  - `.../console/requests/index.vue`
  - `.../console/requests/[id].vue`
- Components:
  - uses core `layout: 'console'` and `LayoutsConsoleNavbar`
- Runtime composable:
  - no `useRuntime*` wrapper; uses app auth/user composables (`useAuth`, `useUser`) + stitch composables
- Context:
  - scoped by current uid/admin status
- Depends on extensions:
  - fireux-core + stitch app-local models/composables
- Depends on other consoles:
  - none

#### Console-like Surface: Supplier Dashboard Console (not `/console/*`)
- Actor: supplier profile owner
- Routes:
  - `packages/extensions/fireux-suppliers/src/runtime/pages/dashboard/supplier/index.vue`
  - `.../dashboard/supplier/profile.vue`
  - `.../dashboard/supplier/my-stock.vue`
- Components:
  - supplier profile cards/edit components in drop extension
- Runtime composable:
  - profile stack composables (`useSupplier`, `useProfileEnsure`), not `useRuntimeSupplier`
- Context:
  - authenticated profile id (`profileId: 'supplier'` in page meta)
- Depends on extensions:
  - fireux-suppliers + fireux-core profile APIs
- Depends on other consoles:
  - none

Known-console verification:
- Kitchen Console (Misebox): yes (`/console/kitchen/*`).
- Supplier Console (Misebox): implemented as dashboard profile console (`/dashboard/supplier/*`), not `/console/supplier/*`.
- Granite Portfolio/Properties/Compliance: yes (`/console/portfolio*`).

---

## 4) Modules (extensions): list them and the level they operate at

### 4.1 Extension inventory

#### Extension: fireux-blogs
- Entities: `BlogPost` (`docs/contract.md`)
- UI primitives: yes (`Pill/Cell/Preview/Profile` in contract)
- Console ops surface: admin pages (`/admin/blogs/*`), not a `/console/*` hub
- SEO surface: yes (`/blog`, `/blog/[slug]`, `seo_index_blogs`, module hook)
- Collections: `blogs/{slug}`
- Depends on: `fireux-core`

#### Extension: fireux-companies
- Entities: `Company` (`company.model.ts`, place-bound)
- UI primitives: yes (contract)
- Console ops surface: no `/console/*`; pages are `/companies/*`
- SEO surface: yes (`seo_index_companies`, module hook)
- Collections: `companies/{companyId}`
- Depends on: `fireux-core`, place hydration reads

#### Extension: fireux-compliance
- Entities: `ComplianceRecord`, `ComplianceItemType`
- UI primitives: yes (`useComplianceInterface().card`)
- Console ops surface: yes (`/console/portfolio/compliance`)
- SEO surface: none declared in module hooks
- Collections: `portfolios/{portfolioId}/compliance-records`
- Depends on: `fireux-properties`, `fireux-tasks`, `fireux-core`

#### Extension: fireux-documents
- Entities: `Document`, `DocumentLink`
- UI primitives: yes (`useDocumentInterface().card`)
- Console ops surface: yes (`/console/portfolio/documents`)
- SEO surface: none declared in module hooks
- Collections:
  - `portfolios/{portfolioId}/documents`
  - `portfolios/{portfolioId}/document-links`
- Depends on: `fireux-properties`, `fireux-tasks`, `fireux-core`

#### Extension: fireux-suppliers
- Entities: `Supplier` (`SupplierCore`, `SupplierApp`)
- UI primitives: yes (`useSupplierInterface` in drop + kitchen-facing mapper)
- Console ops surface: supplier dashboard profile console (`/dashboard/supplier/*`), supplier admin/detail pages
- SEO surface: yes (`seo_index_suppliers`, module hook)
- Collections:
  - `suppliers/{supplierId}`
  - `apps/{appId}/suppliers/{supplierId}` overlay
- Depends on: `fireux-core`

#### Extension: fireux-jobs
- Entities: `Job`, `Agent`, `Professional`
- UI primitives: yes (contract)
- Console ops surface: dashboard profile surfaces (`/dashboard/agent/*`, `/dashboard/professional/*`)
- SEO surface: yes (`seo_index_jobs`, `seo_index_agents`, `seo_index_professionals`)
- Collections: `jobs`, `agents`, `professionals` (+ app overlays for profiles)
- Depends on: `fireux-core`, `fireux-kitchens`, `fireux-companies`, `fireux-places`

#### Extension: fireux-kitchens
- Entities: `Kitchen`, `Ingredient`, `KitchenMiseTask`, `Dish`, `Menu`, `Chef`
- UI primitives: yes (contract + multiple `use*Interface` composables)
- Console ops surface: yes (`/console/kitchen/*`, `kitchen-console` layout)
- SEO surface: yes (`seo_index_kitchens`, `seo_index_chefs`, module hook)
- Collections:
  - live `kitchens/{kitchenId}`
  - test `test-kitchens/{kitchenId}`
  - global `ingredients/{ingredientId}`
  - runtime subcollections e.g. `/suppliers`, `/orders`, `/menus`, `/dishes`, `/recipes`, `/mise`
- Depends on: `fireux-core`, `fireux-orders`

#### Extension: fireux-orders
- Entities: `Order`
- UI primitives: checkout-focused; not full Pill/Cell surface
- Console ops surface: no
- SEO surface: noindex policy (contract)
- Collections: `orders/{orderId}`
- Depends on: `fireux-core`

#### Extension: fireux-places
- Entities: `Place`
- UI primitives: yes (`usePlacesInterface`, place cards)
- Console ops surface: no `/console/*`; place CRUD pages
- SEO surface: yes (`seo_index_places`, module hook)
- Collections: `places/{placeId}`
- Depends on: `fireux-core`

#### Extension: fireux-products
- Entities: `Product`, `ProductPrice`
- UI primitives: yes (contract)
- Console ops surface: admin routes (`/admin/products/*`), not `/console/*`
- SEO surface: yes (`seo_index_products`, module hook)
- Collections:
  - `apps/{appId}/products/{productId}`
  - `apps/{appId}/products/{productId}/prices/{priceId}`
- Depends on: `fireux-core`

#### Extension: fireux-properties
- Entities: `Portfolio`, `Property`, `Unit`
- UI primitives: yes (`usePortfolioInterface`, property cards)
- Console ops surface: yes (`/console/portfolio/properties`)
- SEO surface: no module SEO hook currently
- Collections:
  - `portfolios/{portfolioId}`
  - `portfolios/{portfolioId}/properties/{propertyId}`
  - `portfolios/{portfolioId}/properties/{propertyId}/units/{unitId}`
- Depends on: `fireux-core`

#### Extension: fireux-tasks
- Entities: `Task`
- UI primitives: yes (`useTaskInterface().card`)
- Console ops surface: yes (`/console/portfolio/tasks`)
- SEO surface: no module SEO hook currently
- Collections: `portfolios/{portfolioId}/tasks`
- Depends on: `fireux-core`, `fireux-properties`

Thin-contract vs ops surface notes:
- Thin/view contracts live in `use*Interface` composables (e.g. `useSupplierInterface`, `useTaskInterface`, `useDocumentInterface`).
- Ops surfaces live in page/layout routes (`/console/*`, `/dashboard/*`) and should consume thin cards instead of cross-importing other console pages.

---

## 5) Ecosystems: list them and what they compose

#### Ecosystem: fireux-misebox
- Extensions used:
  - ecosystem package deps: `fireux-core`, `fireux-suppliers`, `fireux-places`
  - tenant/global apps add modules via `nuxt.config.ts`, especially `fireux-kitchens` and others
- Consoles exposed:
  - kitchen console (`/console/kitchen/*`)
  - supplier dashboard console-like surface (`/dashboard/supplier/*`)
- App(s)/tenants:
  - `projects/misebox/misebox-app`
  - `projects/misebox/la-tap-berne`
  - `projects/misebox/niederhorn`
- Notes:
  - market-facing + management mixed; global app includes places/companies/kitchens/orders/drop/jobs/products/blogs.

#### Ecosystem: fireux-granite
- Extensions used:
  - ecosystem deps: `fireux-properties`, `fireux-compliance`, `fireux-documents`, `fireux-tasks`
  - app uses same module set in `projects/granite/granite-app/nuxt.config.ts`
- Consoles exposed:
  - portfolio console (`/console/portfolio*`)
- App(s)/tenants:
  - `projects/granite/granite-app`
- Notes:
  - management-focused.

#### Ecosystem: fireux-cleanbox
- Extensions used:
  - app modules: `fireux-jobs`, `fireux-products`, `fireux-blogs` (global app)
- Consoles exposed:
  - core `/console` hub, no dedicated `/console/<domain>` routes currently
- App(s)/tenants:
  - `projects/cleanbox/cleanbox-app`
  - `projects/cleanbox/richies-reinigung`
- Notes:
  - market-facing + profile dashboards.

#### Ecosystem: fireux-bringli
- Extensions used:
  - app module: `fireux-suppliers`
  - ecosystem runtime config also enables places flags (`fireux.places`), but places module is not listed in app modules
- Consoles exposed:
  - core `/console` hub only (if runtime scope routes exist)
- App(s)/tenants:
  - `projects/bringli/bringli-app`
- Notes:
  - market-facing with supplier directory emphasis.

#### Ecosystem: fireux-fireux
- Extensions used:
  - `projects/fireux/fireux-app`: `fireux-products`, `fireux-blogs`
  - `projects/fireux/tenant`: none
  - stitch app: tenant role (`stitch-app`) with dedicated local console pages
- Consoles exposed:
  - app console (`/console/app`) in fireux-app
  - stitch console (`/console/providers`, `/console/requests`)
- App(s)/tenants:
  - `projects/fireux/fireux-app`
  - `projects/fireux/tenant`
  - `packages/ecosystem/fireux-fireux/src/apps/apps/stitch`
- Notes:
  - brand + app tooling + tenant examples.

---

## 6) Critical interconnectedness questions (answer from code)

### 6.1 Supplier / Kitchen relationship (current)
- Where relationship is stored:
  - Kitchen-side link collection: `<kitchenCollectionPath>/{kitchenId}/suppliers`
  - Evidence: `resolveKitchenCollectionPath(...)=\`${basePath}/${kitchenId}/suppliers\`` in `useKitchenSupplierFetch.ts`.
- Supplier canonical source:
  - root `suppliers` and tenant overlay `apps/{appId}/suppliers`
  - merged at read-time in `useKitchenSupplierFetch.ts` (`canonicalCorePath`, `canonicalAppPath`, `canonicalSupplierById`).
- Join shape:
  - link docs may carry `supplier_id`, `source_supplier_id`, `supplier_profile_id`, etc.
  - resolver: `resolveSupplierReferenceId(...)` in `useKitchenSupplierFetch.ts`.
- Thin contract kitchen should use:
  - `SupplierSurface`/`SupplierCard.Card` from `packages/extensions/fireux-kitchens/.../useSupplierInterface.ts`.
  - kitchen supplier page consumes runtime merged supplier rows and renders via `SupplierCollectionManager`.
- Does Kitchen import Supplier Console code?
  - No.
  - Kitchen console imports kitchen composables/components only; no imports from drop dashboard pages/components.

### 6.2 Place-based canon alignment
- Entities currently place-backed/hydrated:
  - `Kitchen` is place-backed thin record and `Kitchen` type hydrates place fields (`kitchen.model.ts`).
  - `Company` is place-bound (`company.model.ts`: Firestore `companies/{placeId}`, `CompanyView` hydrates place fields).
  - `Supplier` is not place-backed in current model.
- Rule for Google icon URLs:
  - Yes, explicit sanitization exists: `sanitizeLogoAvatar()` rejects `mapfiles/place_api/icons` URLs.
  - Evidence:
    - `usePlaceLogos.ts` `sanitizeLogoAvatar`
    - `usePlaceSave.ts` applies sanitizer before persistence/upload.
  - Additional note: legacy field `place_image` still appears in adapters/search types as fallback, but canonical persistence target is `image_url`.

### 6.3 Console gating per tenant
- Where “tenant exposes console” is defined:
  - App-level module selection in each `nuxt.config.ts` (`defineFireuxConfig({ modules: [...] })`).
  - Runtime app/tenant context in `runtimeConfig.public.fireux` from `defineFireuxConfig`.
  - Route/nav visibility checks on module/ecosystem via `nav.visibility` and `useNav` (`isNavVisibleForScope`).
  - Console entry CTA requires `/console` plus at least one `/console/*` route (`useConsoleEntryCta`).
- Smallest canonical flag set (as implemented):
  - `runtimeConfig.public.fireux.role` (`global|tenant`)
  - `runtimeConfig.public.fireux.modules[]`
  - per-entity overlay `console_enabled` fields in app-layer models (`AppApp`, `KitchenApp`, `SupplierApp`, `PortfolioApp`)

### 6.4 SEO boundary
- Core/public SEO-safe collections (canonical or index projection):
  - canonical entities: `blogs`, `products`, `places`, `companies`, `jobs`, `suppliers`, `kitchens`, etc.
  - transitional index projections: `seo_index_*` collections (module hooks + `seo-sitemaps.ts` fallback).
- App/private overlays:
  - `apps/{appId}/...` overlays for app/private governance (`AppApp`, `KitchenApp`, `SupplierApp`, profile overlays).
- Indexable pages:
  - public hubs/entities from module SEO hooks (`ctx.addHub`, `ctx.addStaticPath`).
  - console/admin/auth are default disallow + noindex patterns in core SEO config (`/console/**`, `/admin/**`).
  - robots and sitemap runtime read `runtimeConfig.public.fireux.seo`.

---

## 7) Pain points / risk register
- Cross-import bloat risks:
  - `fireux-compliance` and `fireux-documents` depend on `fireux-tasks`; can drift into bidirectional behavior coupling.
  - Kitchen supplier merge currently knows multiple supplier id alias fields (`supplier_id`, `source_supplier_id`, `supplier_profile_id`, `drop_supplier_id`) in one fetch composable.
- Circular dependency risks:
  - Extension deps are mostly acyclic, but there is tight portfolio cluster coupling: properties <-> compliance/documents/tasks.
- Confusing naming risks (global/tenant/ecosystem/app):
  - “app” appears at multiple layers: Nuxt app project, core app entity, app overlay (`/apps/{appId}/apps/{appId}`).
- Permission model drift:
  - Some console-like surfaces use `/dashboard/*` + profileId metadata while others use `/console/*`; policy boundaries can diverge.
- Duplicate UI patterns needing canonization:
  - kitchen home page duplicated in three tenant app files with only title differences.
- Open questions:
  - `useRuntimeKitchenData` currently returns `supplierIngredients: []` for Firestore mode while suppliers page expects supplier-ingredient data. Is this intentionally deferred or missing fetch wiring?
  - Bringli ecosystem runtime enables places flags but bringli app only includes `fireux-suppliers` module. Is places intentionally inactive there?

---

## 8) Candidate improvements (after inventory)
- Must-fix for simplicity:
  1) Normalize supplier link contract to one stable key (`supplier_id`) at kitchen link level; keep other ids as migration-only.
  2) Extract duplicated tenant kitchen home page into one shared component/override prop.
  3) Standardize “console surface” classification: either `/console/*` or explicitly documented `/dashboard/*` profile consoles.
- Nice-to-have later:
  1) Add Tier1 contracts for `fireux-properties`, `fireux-compliance`, `fireux-documents`, `fireux-tasks`.
  2) Promote explicit thin contract type for Kitchen↔Supplier (e.g. `SupplierDirectoryItem`) and enforce in `useKitchenSupplierFetch` output.
  3) Reduce extension cross-dependencies in Granite stack by moving shared projections into one thin shared package/composable boundary.

---

## 9) Deliverables
1) Map of reality: completed above with paths, symbols, and route/runtime wiring.
2) Must-fix for simplicity: listed in Section 8.
3) Nice-to-have later: listed in Section 8.

---

## Evidence Index (quick pointers)
- Workspace/package structure: `pnpm-workspace.yaml`, `packages/**`, `projects/**`
- Core runtime/console:
  - `packages/core/fireux-core/src/runtime/pages/console/index.vue`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/runtime-app/*`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/routing/useConsoleEntryCta.ts`
- Kitchen runtime and supplier linking:
  - `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchen.ts`
  - `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/suppliers/fetch/useKitchenSupplierFetch.ts`
  - `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/suppliers.vue`
- Supplier model/surfaces:
  - `packages/extensions/fireux-suppliers/src/runtime/models/profiles/Supplier/Supplier.model.ts`
  - `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Supplier/utils/view/useSupplierInterface.ts`
- Portfolio runtime and console cluster:
  - `packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts`
  - `packages/ecosystem/fireux-granite/src/runtime/pages/console/portfolio/index.vue`
- Place image canon behavior:
  - `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/mutations/usePlaceSave.ts`
  - `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/utils/view/usePlaceLogos.ts`
- SEO boundaries:
  - `packages/core/fireux-core/src/config/app/seo.ts`
  - `packages/core/fireux-core/src/runtime/server/robots.txt.get.ts`
  - `packages/core/fireux-core/src/runtime/server/utils/seo-sitemaps.ts`
  - extension `src/module.ts` SEO hooks in `packages/extensions/fireux-*`
