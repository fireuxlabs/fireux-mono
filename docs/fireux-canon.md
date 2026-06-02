# FireUX Canon
Authority: Tier1 (Authoritative)
Updated: 2026-05-27
## Purpose
- Define FireUX-wide structural and behavioral rules that all extensions and apps follow.
- Resolve authority drift by making this file the source of truth for cross-domain canon.

## Pattern-First Constitution
- Every change starts by identifying the family it belongs to before inventing a local solution.
- Look for the repeated FireUX shape first; only create a delta when the existing family pattern cannot truthfully carry the behaviour.
- Deltas must be named as deltas. A product label, route label, demo fixture, or tenant copy difference is not automatically a new architecture.
- When a new repeated pattern is discovered, update this canon and the relevant runtime/extension docs in the same change or before the pattern is reused.
- When a local implementation reveals something that should be shared, fold it into the owning family instead of copying it app by app.
- The goal is deliberate repetition: the same concept should look and behave the same across apps, packages, and entities unless the domain has a real reason to differ.

## Canon Enforcement Contract
- FireUX canon is not a suggestion layer. If a shape is declared as current canon, the repo must contain enough working structure for a developer or user to find and exercise it.
- A proposed shape must be labelled `proposed`, `scaffold`, `TODO`, or `future`. Do not describe proposed routes, stores, or console families as current canon.
- No paper canon:
  - a console family is not current unless its route family exists
  - an app console entry is not current unless `consoles` exposes it
  - a public route is not current unless the page files exist
  - a storage/composable bucket is not current unless files live in the documented bucket
  - a data shape is not current unless either live/test/demo fixtures use it or the docs explicitly say it is migration-only
- The minimum enforcement ladder for current canon is:
  - Tier1 doc states the rule
  - route/file tree implements the shape
  - app config and app registry expose the shape when it is app-visible
  - validation or guard catches the drift that has already hurt us
  - old names are removed, blocked, or marked historical only
- When comparing families, compare real files and routes first. Do not infer a canon just because a related product has a similar word in its copy.
- If a family has a strong reference implementation, such as Kitchen for console entry and child operation shape, a new family should either match the reference or document the exact delta before adding user-facing routes.
- If a canon decision removes an accidental surface, replace it with the intended surface in the same patch when the user needs it to inspect or operate the app.
- Do not leave an app without a working path to inspect its own canon shape.
- Guards should start narrow and become stricter as each drift area is cleaned. A guard that is too broad to pass is not enforcement; it is noise.

## Fallback And Legacy Rule
- Display defaults are allowed when they are visibly non-canonical and named as defaults, empty states, or unavailable states.
- Hidden fallback truth is not allowed for identity, authority, routing, storage, config, SEO, publish state, or stored data.
- Runtime product paths must not keep legacy compatibility branches, outdated readers, or alternate route/data chains.
- Migration and dev drift tools may mention legacy only when their purpose is explicitly migration, inspection, or cleanup.
- Empty stored values are preferred over invented identity data.
- Public routes should return explicit unavailable or not-found states instead of guessing another canonical target.

Current learned examples:
- User identity:
  - `User` is the person.
  - `Professional`, `Chef`, and `Agent` are profile capabilities.
  - `AppUser` is app membership.
  - Console entities are operated workspaces.
- Product apps:
  - tenant and standalone product landings share one focused product shape.
  - ecosystem main apps use a broader ecosystem shape.
- Dashboard versus console:
  - dashboard is for the signed-in user and profile extensions.
  - console is for selected operational workspaces such as kitchens, suppliers, portfolios, and projects.
- Kitchen to menu:
  - Kitchen runs the operation.
  - Dish describes guest-facing food.
  - Menu presents selected dishes.
  - Menu is both-facing: managed in Kitchen Console and rendered publicly when published.
  - Menu storage is app-scoped under Kitchen; both-facing does not mean root `menus/{menuId}` truth.
  - QR points guests to one exact published menu URL.
  - Menu items require real `dish_id` links; public menus do not own dish copy.
  - App-local uploaded menu documents may use thin `/menus/**` routes, but they are not the Kitchen Menu stack or a root Kitchen Menu canon.
- App roles:
  - Admin runs the app.
  - Operator operates a console/workspace.
  - Developer builds and checks the app.
- Demo data:
  - demo records follow live/test shape.
  - demo mode is explicit.
  - live collection reads must not silently become demo reads.
- Entity stacks:
  - start from the standard model, fetch, collection, interface, component, and page seams before adding new entity-specific structure.
- Runtime components:
  - package-provided UI lives under `runtime/components/**`.
  - component names follow Nuxt path-based names from that directory.
  - do not add taxonomy folders or one-off aliases just to alter generated component names.

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
- Live console visibility is governed by `operator_ids`.
- If a user can see an entity in a live console, their uid must be in that entity's `operator_ids`.
- Canon docs override operational docs and tooling/history docs on conflict.
- App pages do not justify app-local storage on their own.
- Root-first entities may be filtered by explicit scope fields instead of being duplicated under app paths.
- `Project` is a root/core entity.
- Canonical project identity lives on the root `projects/<projectId>` record.
- Root project membership and ownership fields live on that root record, not on app overlays.
- Current canonical root project membership/ownership fields are:
  - `operator_ids`
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
- Canonical console family keys are singular. Cardinality is handled by the
  family entry surface, not by plural route buckets:
  - `project` -> `/console/project`
  - `property` -> `/console/property`
  - `kitchen` -> `/console/kitchen`
  - `portfolio` -> `/console/portfolio`
  - `supplier` -> `/console/supplier`
- Identity roots such as `User` and profile roots do not use `app_scope_state`; their app records are overlays for membership, capability, and presentation.
- Generic project collection and console project selection are not the same seam.
- `useProjectCollection()` stays generic.
- Console project visibility adds user/app scope above the generic collection rather than redefining it.
- Project, Ecosystem, and App are real system entities. Their management surfaces edit stored truth; they do not create separate stored identities.
- Project is a console-backed system root entity:
  - stored truth: `projects/{projectId}`
  - management surface: `/console/project` in `fireux-app`
  - authority: `operator_ids` on the root Project record
- Ecosystem is a system-level product/app grouping managed through Project/App context:
  - stored truth: `ecosystems/{ecosystemId}`
  - possible future/private app state: `apps/{appId}/ecosystems/{ecosystemId}` only when implemented
  - it may map to a Firebase project operationally, but Firebase is infrastructure backing, not entity definition
- App is a system root entity and active runtime singleton:
  - stored truth: `apps/{appId}`
  - active seam: `useApp()` resolves `FireUXConfig.appId`
  - Project/App console surfaces may manage the root App record
- App initialization is app-local, not parent-ecosystem-owned:
  - the active app reads initialization state from its own resolved runtime database
  - app admin authority lives in `apps/{appId}/users/{uid}.role == 'admin'`
  - an app is uninitialized when it has no app-local admin membership
  - onboarding creates or repairs the current app record, then creates the first app-local admin membership
  - `apps/{appId}.admin_ids` is a mirror for cards, guards, and cheap checks; it must not replace `AppUser` membership as authority
  - parent ecosystem/app registry records may list or discover apps, but they do not initialize child or standalone apps
- User identity is ecosystem-owned, not standalone-app-owned:
  - `users/{uid}` stores canonical identity: display name, handle, avatar, email, bio, and profile-level fields
  - profile root collections linked to users follow the same ecosystem identity database rule
  - standalone apps with their own runtime database still resolve root identity through the parent ecosystem identity database
  - `apps/{appId}/users/{uid}` stores app-local membership, role, premium state, console access, and presentation overrides only
  - `apps/{appId}/{profileCollection}/{uid}` stores app-local profile presentation/capability overlays only
  - tenant apps often share the same physical ecosystem database, so identity and app membership can live in the same database while remaining different model layers
  - standalone apps may split identity database and app database; this must not create a second canonical `users/{uid}` identity
- App fields can be grouped by who should handle them, but those groups do not create separate App records:
  - `admin`: Admin runs the app
  - `developer`: Developer builds and checks the app
  - `control`: App Control changes where the app belongs
  - `system`: System maintains calculated/internal fields
- `firestore/core/ecosystem` is the canonical root Ecosystem read/collection/interface/create seam.
- `firestore/system/ecosystem` is only for setup/control/bootstrap adapters and must not duplicate root Ecosystem entity access.
- `fireux/app` is app shell/context/orchestration space, not a bucket for App, Project, or Ecosystem entity truth.
- Tenant apps are child app surfaces inside a FireUX ecosystem, not independent ecosystem canons.
- Tenant apps may stay intentionally thin and do not justify new top-level domain/storage patterns on their own.
- Tenant apps consume selected ecosystem capability; they do not automatically receive every module, profile, or console surface from the parent ecosystem.
- Placeholder tenant branding/assets are canonical until tenant-specific assets are explicitly provided.
- Tenant visual treatment is resolved through app/runtime design packs. Core owns the resolver contract, ecosystems may provide inherited defaults, and tenants may provide local packs until promotion/migration gives the ecosystem a stored source of truth.
- Shared extensions consume surface design tokens such as `design_packs.public_menu`; they must not hardcode tenant-specific colours, fonts, or route styling.
- Existing tenant implementations do not define canon; shared tenant rules come from Tier1 and shared runtime.
- Standalone apps are FireUX-hosted product apps inside the `fireux` ecosystem.
- Standalone apps are not tenant children and are not ecosystem globals.
- Standalone apps consume core directly plus installed packages.
- Standalone apps may use shared core/runtime foundations but must not claim project control, tenant inheritance, or ecosystem-controller ownership.
- Phase 1 canon allows standalone apps only in the `fireux` ecosystem.
- Landing page kind canon is:
  - `ecosystem`: broad parent-brand landing page for an ecosystem main app.
  - `product`: focused single-product landing page for tenant and standalone apps.
- Ecosystem landing pages may explain the wider ecosystem, multiple modules/apps, parent-brand promise, and cross-product connections.
- Product landing pages should lead with one job-to-be-done, primary CTA, demo/public records when useful, benefits, how-it-works, and trust/proof signals.
- Tenant apps and standalone apps use the same product landing shape for now.
- Tenant product pages may show a small parent ecosystem badge/link.
- Standalone product pages should feel complete by themselves and must not rely on explaining FireUX or a parent ecosystem.
- Product landing heroes use a compact repeated shape:
  - optional product badge/label
  - one product-specific H1
  - exactly two hero CTAs
  - one short supporting sentence
- Product landing heroes should use Nuxt UI primitives first. Avoid ecosystem-style module overviews, three-way hero action grids, large bespoke hero visuals, and heavy scoped CSS until the product surface is stable.
- Simple public pages such as help, terms, privacy, and support pages should use the shared core simple page shell before inventing app-local layouts.
- App-local simple public pages own their copy and route meta; core owns the page frame, spacing, and return-link shape.
- Pricing pages should use the shared core pricing page shell before inventing app-local pricing layouts.
- App-local pricing pages own plan copy, product framing, routes, and SEO; core owns the pricing frame, header, spacing, plan sections, and CTA area.
- Ecosystem pricing pages should use the shared ecosystem pricing helper unless they have a real ecosystem-specific offer that differs from the default Free, Premium, Tenant App, and Ecosystem Partner framing.
- Pricing pages should keep visible UI concise for humans; SEO context belongs in page metadata, canonical links, and pricing structured data generated from the visible plan groups rather than extra filler copy in pricing cards.
- Public header navigation is for real product pages and user actions:
  - product landing/home
  - product or conversion pages
  - sibling-product bridge pages when they are intentional discovery routes
- Public footer navigation is for system/support/legal pages:
  - about
  - get started
  - pricing
  - solutions
  - help
  - terms
  - privacy
  - contact/support
  - other pages the product needs to expose but should not sell as primary navigation
- Solution pages are authored marketing/SEO/segue pages, not stored entity domains.
- Apps declare solution cards in `metaContent.solutions`; core owns the shared `/solutions` hub and a simple `/solutions/:slug` boilerplate page.
- App-local solution pages may override a core boilerplate child route when the solution needs a real tool, data flow, or richer product bridge.
- A solution index such as `/solutions` may group product applications and sibling-product bridges.
- Solution child pages such as `/solutions/food-menu-qr-code` are allowed when the search/user intent is meaningfully distinct.
- Do not create a solution collection, collection manager, featured-slugs admin surface, or `/dashboard/admin/solutions` until solutions become stored entities.
- In route meta, `nav.position: 'bottom'` marks a public landing/default link as footer navigation and must not appear in the top header.
- Admin index routes that should appear in `/dashboard/admin` declare `adminSurface` route meta. The dashboard discovers those surfaces from registered routes instead of hard-coding entity names.
- App-local admin pages are declared by the app's page files and do not need a `domains` opt-in.
- Domain provider packages may ship `/dashboard/admin/{domain}` pages, but those pages appear only when the app opts into the provider domain with `domains`.
- Domain admin pages are curation-only for now. They manage one comma-separated featured/pinned slug field in app-local public settings, not full CRUD.
- Featured public domain sections are selected by explicit slug arrays in app-local public settings, such as `apps/{appId}/settings/public.featured_app_slugs`, `featured_ecosystem_slugs`, and `featured_kitchen_slugs`.
- Canonical product app public pages are `/`, `/about`, `/get-started`, `/pricing`, `/help`, `/terms`, and `/privacy` by default. Product-capable apps should also expose `/products`. Missing pages should be an explicit product decision, not accidental drift.
- Product apps must not expose orphan console-family routes. If the app does not have a selected workspace/entity family, use public routes and a personal/provider dashboard instead of adding a console family.
- Product apps that do expose a console family must expose a real family route and a discoverable CTA. Do not point product CTAs at another product's console just because that route exists.
- Products and pricing are not the same surface:
  - `Product` is stored commerce truth: a buyable, subscribable, claimable, or commercially packaged thing.
  - `ProductPrice` stores the commercial terms for a `Product`.
  - A `pricing` page is app-local marketing/explanation copy for tiers, comparisons, or buying context.
  - A `pricing` page must not replace product records when the app has real things to buy.
- Product routes expose commercial records:
  - `/products`
  - `/products/{slug}`
- Pricing routes explain commercial structure:
  - `/pricing`
  - optional child routes such as `/pricing/apps`, `/pricing/users`, or `/pricing/partners` only when the explanation needs separate pages.
  - FireUX ecosystem creation pricing lives at `/ecosystems/pricing`; individual ecosystem pricing belongs to that ecosystem's main app, such as `misebox.app/pricing`.
- Pricing routes should stay presentation/explanation surfaces. They may link to Products or Checkout, but should not become product storage or payment logic.
- Ecosystem main apps intended to sell access, subscriptions, tenant app setup, hosting, services, or operator plans should expose both Products and Pricing.
- Ecosystem main-app pricing defaults to Free, Premium, Tenant App, and Ecosystem Partner. Partner pricing must be framed as revenue share for bringing other businesses into the ecosystem, not a cheaper self-serve tenant-app path.
- Ecosystem main-app pricing should group Free and Premium under `Users`, and Tenant App and Ecosystem Partner under `Systems`, unless the ecosystem has a real custom commercial model.
- Tenant apps may have products, such as memberships, merch, events, vouchers, deposits, or app-specific services. Tenant apps usually should not expose a pricing page unless the tenant has a real tier/package comparison to explain.
- Standalone apps intended to make money should expose both Products and Pricing.
- Public top nav should include `Products` for product-capable ecosystem and standalone apps.
- Public footer nav should include `Pricing` beside Help, Terms, and Privacy by default.
- Public top nav may include `Pricing` only when pricing comparison is a primary buyer decision page.
- App meta is for identity, positioning, product language, SEO language, CTAs, lists, and conceptual entities.
- App meta must not be used as a route registry or demo route holder.
- Concrete demo slugs and sample entity routes belong in app-local demo fixtures and smoke tooling, not in app meta.
- Stable route patterns belong to routing/page canon, app registries, or docs for that app family.
- Product language should be allowed to evolve independently from demo records and route wiring.
- Source material from real people, such as a host manual, is evidence. Do not invent missing fields to make it fit a data shape; add source notes and questions instead.

## Communication Canon
- Chat, enquiries, leads, and support messages belong to one shared communication engine.
- `Conversation` is the root communication record.
- `ConversationMessage` is the message child record.
- Canonical storage is:
  - `conversations/{conversationId}`
  - `conversations/{conversationId}/messages/{messageId}`
- Product apps provide labels and related entity context; they must not invent app-local chat storage for the same pattern.
- Current conversation kinds are:
  - `property_enquiry`
  - `guest_support`
  - `provider_lead`
  - `general`
- The first universal chat pattern is admin chat:
  - public `/chat` lets any visitor start a `general` conversation about the current app.
  - admins answer from `/dashboard/chat`.
  - the related entity is the current app: `related_entity.family = 'apps'`.
- Chat UI should use Nuxt UI chat primitives where available, while FireUX owns the Firestore conversation shape.
- Conversation status/update/archive are explicit seams. Archive is the removal posture for now; do not introduce hard-delete conversation canon without a new decision.
- Conversation UI can stay page-local until a second repeated chat/enquiry surface proves the reusable organism shape.
- Public enquiry forms may create conversations, but private follow-up, reads, and replies must be participant-scoped or server-mediated before shipping.
- BuenoHost uses conversations for property enquiries and guest support so public property pages can collect direct-booking interest without exposing private guest-guide details.
- Find My SEO should converge provider leads onto conversations when moving beyond demo-only lead capture.
- Sproochli may use conversations for visitor/operator support, translation requests, or owner follow-up.

## Entity Stack Canon
- Entity stack DNA:
  - `XModel` stores truth.
  - `useX()` is the singular family entry seam.
  - `useXFetch()` reads one.
  - `useXCollection()` reads many.
  - `useXInterface()` shapes UI.
  - `useXCreate()` creates.
  - `useXUpdate()` patches.
  - `useXPublish()` makes public/indexable publication explicit where the entity supports publishing.
  - `useXSeo()` owns public metadata and JSON-LD where the entity has public pages.
  - `useXDelete()` removes.
  - `useXConsole()` selects and operates a workspace.
  - dashboard/profile routes manage identity.
- Entities should start from the standard FireUX stack before adding domain-specific seams:
  - `XModel`, `X`, `XCreateInput`, `XUpdateInput`
  - `composables/fireux/firestore/<entity>/useX.ts`
  - `composables/fireux/firestore/<entity>/fetch/`
  - `composables/fireux/firestore/<entity>/mutations/`
  - `composables/fireux/firestore/<entity>/utils/`
  - `useXFetch()`, `useXCollection()`, `useXInterface()`
  - `useXCreate()`, `useXUpdate()`, `useXPublish()`, and `useXDelete()` where writes/publication exist
  - `useXSeo()` where public entity metadata/JSON-LD exists
  - `X/Collection/Manager.vue` where browse/manage UI exists
  - `X/Cards/*` or equivalent shared surfaces for `Pill`, `Cell`, `Preview`, and `Profile`
- Normal root entity folders should be boring and predictable:

```text
composables/fireux/firestore/<entity>/
  useX.ts
  fetch/
    useXFetch.ts
    useXCollection.ts
    search/            optional, if search is real read behaviour
  mutations/
    useXCreate.ts
    useXUpdate.ts
    useXPublish.ts    optional, only for public/indexable publication
    useXDelete.ts
    validation/        optional, only for write-specific validation
  utils/
    useXSeo.ts         optional, only for public entity metadata/JSON-LD
    view/
      useXComputed.ts
      useXInterface.ts
    validation/        shared entity validation
    normalize/         optional
    paths/             optional
```

- One entity family has one top-level family entry seam. Use singular `useX.ts`; plural/read-many behaviour belongs to `useXCollection`, not a competing `useXs` barrel.
- `useXComputed` owns derived entity truth such as status/display booleans; `useXInterface` owns UI projections such as `pill`, `cell`, `preview`, and `profile`.
- `useXInterface` may compose already-read root, scoped/overlay, provider, or hydrated records into a stable surface shape. It must not perform hidden fetches; fetch and collection own transport.
- Validation belongs in `utils/validation` when shared by UI/read/write surfaces, and in `mutations/validation` only when it protects create/update/delete/ensure behaviour.
- Missing stack seams should be treated as alignment opportunities, not proof that the entity needs a new architecture.
- Hydrated/read-time composites belong in fetch, entity helper, or interface seams, not in stored model files.
- If an entity cannot follow the standard stack, document which family it belongs to and why the delta is real.
- `pnpm audit:usex` is report-only tooling for spotting repeated stack seams, missing seams, local deltas, and naming drift. It is not a blocking guard until the repo is intentionally tightened.
- `src/runtime` means code that ships into the Nuxt/package runtime; it is not an ownership bucket by itself.
- Inside runtime, ownership is by surface and family: app shell/context, entity stack, console workspace, route, component, or server seam.
- Create/edit/post/publish state belongs to the entity family first.
- Publishable entities such as `Product`, `BlogPost`, and `Job` may have lifecycle state and authoring flows, but those remain part of the Product, Blog, or Job stack unless the flow coordinates whole-app setup or multiple entity families.
- Entity pages and components call entity-owned publication seams such as `useKitchenPublish()` or `useProductPublish()`. Those seams may delegate shared write mechanics to core `usePublish()`, but readiness rules, public flags, and canonical route meaning stay entity-owned.
- Entity mutation seams should use model storage metadata for collection paths where available. `useXUpdate` patches, `useXPublish` publishes, and `useXDelete` owns the removal posture.
- Public entity pages call entity-owned SEO seams such as `useKitchenSeo()` or `useProductSeo()`. Those seams may delegate shared metadata mechanics to core `useSeo()`, but title/description fields, JSON-LD type, route path, and public/indexable truth stay entity-owned.
- `app/` is only for app-level orchestration, not normal entity authoring state.
- Entity authoring helpers that are not raw Firestore belong in the entity-owned composable family, such as `composables/fireux/product/create`, `composables/fireux/blog/editor`, or component-local create/edit helpers.

## Firestore Operation Families
- Firestore operation is the primary family. Transport and record location are variants inside the operation, not new top-level families.
- The Firestore operation map is:
  - Create: `useXCreate`, with `useFirestoreCreate` and `useFirestoreApiCreate` as lower-level helpers.
  - Read: `useXFetch`, `useXCollection`, `useFirestoreRead`.
  - Update: `useXUpdate`, `useFirestoreUpdate`.
  - Delete: `useXDelete`, `useFirestoreDelete`.
- Direct/client Firestore operations use VueFire or the client SDK from runtime composables.
- Server/API-mediated Firestore operations use a client composable to call a Nuxt API route; the server route owns privileged authority, storage, provider work, cross-app behavior, or public-safe response shaping.
- Server/API-mediated operations are still Firestore operations. They are transport variants, not separate entity families.
- `useFirestoreCreate` is a boring direct-client create primitive. It handles collection path, generated vs known document id, stamp options, database id, and stripping persisted `id`.
- `useFirestoreCreate` must not own idempotent setup behavior, provision behavior, server/API transport, storage upload, external provider logic, slug validation, entity validation, or overlay composition.
- `useXCreate` is the entity-owned Create seam. It decides whether the Create behavior is out of the box, idempotent, or with provision, then delegates plain Firestore writes to lower-level helpers.
- Record location language must describe where truth lives:
  - root record: `ingredients/{ingredientId}`, `kitchens/{kitchenId}`.
  - parent-scoped record: a record stored directly under its owning parent when that is the canon path.
  - app-scoped record: `apps/{appId}/kitchens/{kitchenId}/menus/{menuId}`.
  - root plus app overlay: root truth plus app relationship or overlay record.
  - child record: sections, items, messages, and similar records under a parent record.
  - hydrated read shape: read-time data composed from records; it is not a stored family.
- `public` is route, rendering, or publication terminology. Do not use `public` as a Firestore storage-location family label.
- Published routes render eligible records. The stored record should still be described as root, parent-scoped, app-scoped, overlay, child, or hydrated.

### Public Entity Route Add-Ons

- Shared public entity roots use plural collection/detail routes first, such as `/properties` and `/properties/:publicKey`.
- Console entity routes use singular family routes, such as `/console/property` and `/console/property/overview`.
- Public entity operation bridges use `/operator`, such as `/properties/:publicKey/operator`.
- Do not use `/admin` as a public entity route word. Admin means app/platform administration; operator means access to operate this public target.
- App-specific public experiences sit under an explicit child noun, such as `/properties/:slug/info`.
- Child pages use stable semantic ids, such as `/properties/:slug/info/:infoId`.
- Current public key canon:
  - Kitchen: `slug`
  - Ecosystem: `slug`
  - Property: `slug`
  - Project: `slug`
  - Supplier: `id`
  - Portfolio: `id`
- Do not encode a special child home page by filtering it out inside pages. Promote that split into named helpers, for example `getXHome()` and `getXSections()`, so public pages, layouts, smoke routes, and QR targets all share the same source shape.

### Entity Mode Matrix

| Mode | Canon meaning | Expected seams | Current examples |
| --- | --- | --- | --- |
| Root entity | Canonical stored thing | `XModel`, `useXFetch`, `useXCollection`, `useXInterface`, writes where allowed, collection/card surfaces where browsable | `App`, `Blog`, `Chef`, `Company`, `Ecosystem`, `Job`, `Kitchen`, `Portfolio`, `Product`, `Professional`, `Supplier`, `User` |
| Console workspace entity | Root entity that can be selected and operated | root stack plus `useXConsole`/selection and `/console/<family>` surfaces | `Kitchen`, `Supplier`, `Portfolio`, `Project` |
| Identity/profile capability | Something a signed-in user can be or manage about themself | dashboard/profile routes, profile fetch/create/update, no console family by default | `Professional`, `Chef`, `Agent`, base `Profile` |
| App membership overlay | App-specific role/capability for a user | `useAppUserCollection`, app-user update helpers, app membership UI; not a root entity stack | `AppUser` |
| System management entity/context | Stored system entity that may also be managed through Project/App context | root entity seam plus explicit management surface; stored truth is not duplicated | `Project`, `Ecosystem`, `App` |
| Scoped child entity | Operational record owned by a parent workspace/entity | scoped collection/fetch helpers, interface/card surfaces only where needed, writes through parent-aware mutations | `Task`, `Document`, `Compliance`, `PropertyUnit`, `PortfolioTask`, `PortfolioDocument`, `KitchenMise`, `KitchenOrder`, `Dish`, `MenuSection`, `MenuItem`, `Recipe` |
| Both-facing scoped child entity | Scoped child stored under a parent, with both console management and public published rendering | scoped storage/read/write seams plus public route/publish/SEO surfaces; no root duplicate truth | `Menu` |
| Root plus scoped usage | Root truth linked into a workspace by a scoped usage record | root model/collection/interface plus scoped relationship helper | `Ingredient` root plus `KitchenIngredient` usage records |
| System/adapter seam | Runtime helper around stack behaviour, not an entity | adapter/create/selection helpers; no full entity UI stack required | `Console`, `Firestore`, selection helpers |

### Entity CTA Family Matrix

Entity index CTA surfaces classify the management path, not the marketing copy.

| CTA family | Canon meaning | Current examples |
| --- | --- | --- |
| `console` | Main selectable workspace/root thing managed through a console or project/operator surface | `Project`, `Ecosystem`, `App`, `Module`, `Kitchen`, `Supplier`, `Portfolio`, `Property` |
| `console-managed` | Child or operational record managed inside a selected console/root thing | `Menu`, `Dish`, `Recipe`, `Ingredient`, `Mise`, `Station`, `Team`, `KitchenOrder`, supplier catalogue items, `Client`, `Unit`, `Document`, `ComplianceRecord`, `Task` |
| `admin-managed` | App-admin published or commercial entity | `BlogPost`, `Product` |
| `profile-managed` | Person/account identity entity | `User`, `Chef`, `Agent`, `Professional` |
| `domain-managed` | Public domain record without a dedicated console workspace today | `Place`, `Company`, `Job` |
| `utility-managed` | App-local tool output that is not yet a shared entity stack | Go QR uploaded docs and QR pages |

Pricing pages, help pages, about pages, and app-authored page copy are surfaces, not entity families, unless a future product deliberately promotes them into entity stacks.

### Create And Edit Mode Matrix

| Mode | Canon meaning | Current examples |
| --- | --- | --- |
| `quick-create` | User completes a small form and immediately creates the record | `Company`, `Place`, `Ingredient`, simple profile/entity creates |
| `idempotent-create` | Create-if-missing and safe to rerun | `User`, `Profile`, `App`, `Ecosystem`, console target setup where canon allows |
| `draft-preview-create` | Local entity-family draft state, preview, then publish/create | `Product`, `BlogPost`, `Job` |
| `onboarding-create` | Multi-step setup that may produce an entity plus supporting config/assets | `App`, product flows only when they coordinate whole-app setup or multiple entity families |
| `simple-edit` | One document or root record is patched directly through `useXUpdate` or entity update helpers | `Company`, `Place`, `Kitchen`, `Supplier`, `Portfolio`, `Job`, `Blog`, `Dish`, `Recipe` |
| `split-overlay-edit` | Edit is split because root truth and overlay truth are different records | `User` core/app edit, profile capability edits, root/scoped usage entities |
| `scoped-console-edit` | Edits happen inside a selected workspace and must carry parent/console context | `Kitchen`, `Supplier`, `Portfolio`, project/portfolio child records |

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
- `/public` is filesystem-only; rendered/runtime URLs must start with `/img/...`.
- App brand/media values in config or Firestore must be either external absolute URLs or canonical public-image URLs such as `/img/app/thumbnail.png`; bare filenames such as `thumbnail.png` and `wordmark-dark.png` are compatibility input only and must be normalized before rendering.
- Standard app asset requirements are enforced by `/api/internal/app/env-check` and app media sync:
  - `logo.png`: PNG, exactly `512x512`
  - `thumbnail.png`: PNG, exactly `1200x630`
  - `wordmark-light.png` and `wordmark-dark.png`: PNG, at least `256x64`, aspect at least `3:1`
  - `cover.png`: PNG, `16:9`, at least `1280x720`
  - `favicon.ico`: ICO or PNG, square, at least `32x32`
  - `pwa/icon-192.png`: PNG, exactly `192x192`
  - `pwa/icon-512.png`: PNG, exactly `512x512`
- Syncable app media uses dedicated Storage objects under `apps/{appId}/media/{thumbnail|logo|wordmark-light|wordmark-dark|cover}` and writes the resolved download URLs to `apps/{appId}.media`.

## Demo Data Canon
- Demo data is never canon by itself.
- Demo data must bend toward the desired live/test shape; runtime code must not bend around stale demo data.
- `test` data is separate from demo data:
  - `test` is writable and proves the intended live shape.
  - `demo` is curated, read-only, and used for development, demos, UX exploration, and explicit preflight product surfaces.
- Demo identity must keep person, profile, app membership, and operated entity separate:
  - a demo user is a person
  - a demo professional, chef, or agent is a profile capability that person can use in a given context
  - a demo app user is where that person belongs
  - a demo console entity is what that person operates
- Demo profile records should reference shared demo users by `userId`; do not inline root identity fields into product-owned provider/profile records unless the record is intentionally a UI-only view payload.
- `useUserCollection()` and `useAppUserCollection()` read live Firestore by default. Demo user lists must not silently replace live collection reads.
- Add demo collection source modes only as explicit options, following the existing `source: 'live' | 'test' | 'demo'` pattern.
- Console/runtime demo data must live in the owning domain package as a demo scenario registry.
- Current accepted demo scenario registry shapes are:
  - `packages/*/src/runtime/composables/fireux/app/**/demo-scenarios.ts`
  - `packages/*/src/runtime/composables/fireux/app/**/**/*-demo-scenarios/index.ts`
  - `packages/*/src/runtime/composables/fireux/app/**/demo-scenarios/**`
- Repo-level `demo/*.demo.ts` files are for demo entity/view payloads, dev surfaces, examples, and explicit preflight product records.
- Repo-level `demo/*.demo.ts` files are not Firestore storage, Nuxt Content, canonical runtime models, or console scenario registries.
- App-local `app/content/*` is for app copy and metadata, not entity demo records.
- App-specific demo records live under `app/demo/*.ts` when they are only useful to that app surface.
- Do not place demo guides, public menus, sample info pages, provider cards, avatars, logos, or entity records in `app/content`.
- Demo file naming is:
  - repo-level fixtures: `demo/<domain>.demo.ts`
  - app-local fixtures: `projects/<ecosystem>/<app>/app/demo/<domain>.ts`
  - package runtime scenarios: `demo-scenarios` or `<domain>-demo-scenarios` under the owning runtime package.
- Demo export naming should make the demo status explicit:
  - types: `Demo<Entity>`
  - lists: `demo<Entity>List`
  - UI/view surfaces: `demo<Entity>SurfaceList`, `demo<Entity>PreviewList`, or similarly explicit names.
  - scenario helpers: `getDemo<Entity>()`, `getDemo<Entity>s()`, and `getDemo<Entity>Scenarios()` where applicable.
- Demo entity media should be URL-backed in demo data unless the task is specifically testing a local asset pipeline.
- App brand assets stay in `/public/img/app/*`; entity demo avatars/logos should not be stored under app `public` folders by default.
- Use storage-shaped field names when a demo record intentionally mirrors storage (`image_url`, `avatar_url`, `logo_url`).
- Use view-shaped field names when a demo record intentionally feeds UI cards/surfaces (`imageUrl`, `avatarUrl`, `logoUrl`).

## Firebase Web App Config Canon
- Firebase project values are ecosystem-level unless the Firebase console proves otherwise:
  - `authDomain`
  - `projectId`
  - `storageBucket`
  - `messagingSenderId`
  - default Firestore `databaseId`
- Firebase web app identity is app-level:
  - `NUXT_FIREBASE_APP_ID`
  - `NUXT_FIREBASE_MEASUREMENT_ID`
  - `APP_DOMAIN`
  - app Firestore `databaseId`
- Firebase web app `apiKey` is override-capable at app level.
- Do not assume one API key per Firebase project. Firebase web apps in the same project can use different API keys.
- Runtime config must resolve `apiKey` with app override first, then ecosystem default:
  - app env `NUXT_FIREBASE_API_KEY`
  - ecosystem Firebase default `apiKey`
- Ecosystem defaults are fallbacks for apps in that ecosystem, not proof that every app uses that key.
- New app setup must capture the Firebase console web app snippet and record app-specific values in app env/deploy configuration.
- Production deploy configuration must be checked app by app across every ecosystem; local `.env` files are not the deployed source of truth.

## Create Canon
- Detailed entity creation rules live in `docs/entity-creation.md`.
- Every `useXCreate` belongs to the Create family.
- Create is the default: a user action or system action creates entity truth from supplied input.
- Some Create seams are idempotent:
  - idempotent means create-if-missing, safe to rerun, and continuing when the record already exists.
- Some Create seams include provision behavior:
  - provision means a required resource or provider result is prepared before entity truth is complete.
- `createX` belongs to explicit user actions:
  - create forms
  - create systems
  - intentional creation buttons
- Do not hide creation behind auth/bootstrap.
- Sign-in establishes identity; it does not create domain records by itself.
- When a family canon says test mode is one target per signed-in user, the family entry page may call idempotent `createX` on entry to `test` mode.
- `useXCreate()` remains the entity-owned seam for Create behavior. Pages and tools call the entity seam.
- Create behavior should be described as:
  - out of the box: plain entity creation; this is the default and does not need an explicit plan.
  - idempotent: creation includes create-if-missing behavior and is safe to rerun.
  - with provision: creation depends on storage, a provider, or another prepared resource.
- Create descriptors are not families:
  - transport: client or server.
  - location: root, scoped, or overlay.
  - id: generated or known.
  - steps: single or multi.
- `createDocument(collectionPath, data, opts)` in `useFirestoreCreate` means generated id.
- `setDocument(collectionPath, id, data, opts)` in `useFirestoreCreate` means known id.
- Do not split new top-level create families for upload, server-provisioned, provider-hydrated, generated-id, known-id, or overlay flows.
- `fireux-core/runtime/composables/fireux/firestore/operations/createStrategy` is the current create-specific vocabulary helper.
- `createStrategy` describes non-default Create family alignment with `family`; optional descriptors such as `transport`, `location`, `id`, and `steps` should be added only when they clarify a non-obvious seam.
- Do not add a `CreatePlan` just to say a normal create is out of the box.
- Do not broaden or rename `createStrategy` until another operation needs a real shared strategy.

## Endpoint Canon
- Entity index pages that are rendered through `Index.vue` + `CollectionManager` are client-side Firestore surfaces.
- Entity index pages may add an entity-owned growth layer between CTA and CollectionManager when the family needs richer public presentation:
  - `EntityIndexCta`
  - optional `<Entity>Main` layer, such as `EcosystemMain`
  - `<Entity>CollectionManager`
- The `Main` layer may contain family-specific featured, pricing, project/operator, or explainer components, but it must not replace the CollectionManager browse surface.
- Ecosystem records are managed through Project Console; Ecosystem is not its own console family.
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
  - Relevant `packages/extensions/fireux-*/docs/contract.md` or `packages/extensions/fireux-*/docs/canon.md`

## Conflicts Resolved
- Authority is now explicit: Tier1 canon/contract docs override Tier2/Tier3 docs.
- “No fallbacks” policy is clarified:
  - Prohibited: silent selection/routing/identity fallbacks.
  - Allowed: deterministic field precedence documented in Tier1/Tier1-extension contracts.
