# Runtime Contract
Authority: Tier1 (Authoritative)
Updated: 2026-05-25
## Purpose
- Define runtime selection, mode, collection path, and route policy across FireUX domains.

## Firestore Database Contract
- `1 Firebase project = 1 FireUX project`.
- FireUX may use multiple Firestore databases inside one Firebase project.
- Database meaning must be explicit and fixed by canon, not inferred from fallback behavior.
- Current FireUX project split:
  - `(default)` = bootstrap, control, mirror, and cross-app registry data
  - `fireux` = FireUX ecosystem runtime, catalog, and control-plane data
  - named standalone app databases such as `sproochli` and `buenohost` = standalone product data
- Runtime database selection must come from ecosystem/runtime config, not per-entity overrides.
- Entity fetch/write patterns stay the same; only the resolved Firestore database changes.
- Do not store day-to-day standalone app product data in `(default)`.
- Do not store standalone app product data in `fireux` once the app has its own named database.

## Firestore Collection Naming Contract
- Collection ids are storage vocabulary, not branding vocabulary.
- Canonical collection ids should be one simple lowercase plural word:
  - `apps`
  - `users`
  - `products`
  - `kitchens`
  - `documents`
- Do not prefix collection ids with app, ecosystem, or package names when the database or parent path already provides scope.
- Non-canon examples:
  - `go_qr_documents`
  - `qrdoc_documents`
  - `misebox_kitchens`
- Use parent paths for ownership/scope instead of naming scope into the collection:
  - `apps/{appId}/users`
  - `kitchens/{kitchenId}/menus`
- Multi-word collection ids are allowed only for support records that are already scoped beneath a parent or when a short single plural word would be misleading; prefer documenting the exception close to the owning package.

## Firebase Runtime Config Contract
- Ecosystem Firebase config owns shared Firebase project values:
  - `authDomain`
  - `projectId`
  - `storageBucket`
  - `messagingSenderId`
  - ecosystem default `apiKey`
  - ecosystem default Firestore `databaseId`
- App runtime config owns app web identity:
  - `APP_DOMAIN`
  - `NUXT_FIREBASE_APP_ID`
  - `NUXT_FIREBASE_MEASUREMENT_ID`
  - app `databaseId`
- App runtime config may also own `NUXT_FIREBASE_API_KEY`.
- `NUXT_FIREBASE_API_KEY` exists because Firebase web apps in the same Firebase project may use different API keys.
- Firebase app config resolution order for `apiKey` is:
  - app-level `NUXT_FIREBASE_API_KEY`
  - ecosystem-level Firebase `apiKey`
- Missing app-specific `apiKey` is allowed only when the app intentionally uses the ecosystem default key.
- New or migrated apps must be audited against the Firebase console web app snippet before deployment.

## FireUX App Config Contract
- Standard FireUX app `nuxt.config.ts` files should export `defineFireuxConfig(...)` directly.
- Use `defineNuxtConfig({ ...fireuxConfig, ...localOverrides })` only when the app needs local Nuxt overrides.
- Do not wrap a plain `defineFireuxConfig(...)` result in `defineNuxtConfig(fireuxConfig)`.
- This keeps app config simple and avoids Nuxt's deep config type expansion when no local override is needed.
- Standard app logo source is `/img/app/logo.png`; light/dark display variants use wordmarks, not separate logo files.
- Do not declare light/dark logo paths in `defineFireuxConfig(...)`.
- `modules` means the app installs shared package capability.
- `consoles` means the app exposes selected console workspaces.
- `profiles` means the app consumes those profile identities and their profile surfaces.
- Core provides the base app contract for global ecosystem apps, ecosystem tenant apps, and standalone FireUX apps.
- Ecosystems add domain capability.
- Tenants consume selected ecosystem capability.
- Standalone apps consume core directly plus installed packages.
- Core pages are grouped by how strongly FireUX provides them:
  - hard pages are always part of the core app shape
  - medium pages appear when the app role, user role, or enabled console/profile calls for them
  - soft pages are optional personal/product helpers and can stay hidden until the app has a real use for them
- Current hard core pages:
  - auth
  - legal
  - dashboard, settings, and user profile
  - Admin, visible to admins
  - Developer, visible to the configured developer user
  - dev tools
  - users and public user profiles
  - purchases and subscriptions
- Blog and products are hard FireUX product surfaces, but their implementation is package-owned rather than copied into `fireux-core`.
- Current medium core pages:
  - Console entry points when `consoles` enables a workspace
  - Apps for global/project/app management surfaces
  - Profile extension dashboard pages when `profiles` enables that profile identity
- Current soft core pages:
  - chat
  - favorites
  - followers
- Installing a module must not automatically expose every profile or console surface from that module.
- Do not add a second app-facing page registry until a real repeated route family needs it. Prefer deriving visibility from `role`, `modules`, `consoles`, and `profiles`.

## App Initialization Contract
- App initialization is resolved inside the active app's own runtime database.
- The active app identity is still `apps/{appId}`, but app admin authority is the app membership overlay:
  - `apps/{appId}/users/{uid}.role == 'admin'`
- An app is initialized only when at least one app-local admin membership exists.
- If the app record exists but the app-local admin set is empty, the app is still uninitialized and should show the initialization/repair surface.
- Onboarding must:
  - ensure the current `apps/{appId}` record in the active runtime database
  - ensure the signed-in initializer's root `users/{uid}` record
  - ensure `apps/{appId}/users/{uid}` with `role: 'admin'`
  - repair mirrors such as `apps/{appId}.admin_ids` from membership, not treat mirrors as authority
- `apps/{appId}.admin_ids` is allowed as a denormalized mirror for fast cards, guards, and diagnostics.
- Parent ecosystem, control-plane, or registry records may discover apps, but they must not decide whether a standalone or tenant app is initialized.
- Do not use parent app admin lists as fallbacks for child/standalone app initialization.

## Entity Loading Contract
- Entity index pages delivered through `Index.vue` + `CollectionManager` must use the normal client-side Firestore read path.
- Canon path:
  - `useFirestore()` / shared Firestore composables
  - resolved database comes from ecosystem/runtime config
- Root-first entities may still be app- or ecosystem-filtered at read time through explicit scope fields such as:
  - `source_app_id`
  - `source_ecosystem_id`
  - `owner_type`
  - `owner_id`
  - `visibility`
- Non-canon for entity index pages:
  - endpoint-first SSR collection loading
  - per-entity server proxy replacements for normal Firestore reads
- Server endpoints remain valid for:
  - FireUX handshake (`/api/fireux-console`)
  - payment/Stripe flows
  - place lookup services
  - notifications, proxies, and other true service seams

## Communication Runtime Contract
- Conversations are shared root records with app and related entity context.
- Canon path:
  - `conversations/{conversationId}`
  - `conversations/{conversationId}/messages/{messageId}`
- Apps may create public enquiry conversations directly only while rules and product state allow it.
- Shipping apps must restrict conversation reads/writes to participants, app operators, or trusted server endpoints.
- Public product pages should use conversation creation instead of exposing private operational details such as access codes, lockbox notes, or stay-specific guest instructions.
- `/chat` is the shared public chat entry point when an app exposes it.
- `/dashboard/chat` is the signed-in user's chat area. It is not Admin-only.

## Project Root Contract
- `Project` is a root/core entity.
- Canonical root project data lives at:
  - `projects/<projectId>`
- Root project identity, ownership, and team membership live on that root record.
- Current canonical root project fields are:
  - `operator_ids`
  - `owner_user_id`
  - `slug`
- `team_ids` is transitional compatibility only and is not the current console authority field.
- App-scoped project overlays may exist for app/console behavior, but they must not also own or duplicate root operator authority.
- `useProjectFetch()` = one project.
- `useProjectCollection()` = many projects.
- Public `/projects` must use the generic project collection.
- Console `/console/project` must use a user-scoped project view on top of the generic seam rather than redefining the generic collection.

## Tenant App Contract
- Tenant apps are canonical thin child apps hosted inside a FireUX ecosystem.
- Default tenant shape is:
  - core public/auth/dashboard shell
  - core hard pages
  - no ecosystem profile or console family by default
- Tenant apps must consume shared runtime/app contracts rather than defining tenant-local project control behavior.
- Tenant apps consume selected ecosystem capability through app config; they do not automatically receive every module, profile, or console surface from the parent ecosystem.
- Tenant apps must ship and use their own local app assets under `/public/img/app`.
- Runtime URLs for local app assets must use `/img/app/*`; never render or store browser-facing `public/img/*` or bare filenames.
- Standard app asset dimensions are enforced during setup and sync: `logo.png` exactly `512x512`, `thumbnail.png` exactly `1200x630`, wordmarks at least `256x64` with aspect at least `3:1`, `cover.png` `16:9` at least `1280x720`, favicon square at least `32x32`, and PWA icons exactly `192x192`/`512x512`.
- Syncable app media must also exist in the app's dedicated Storage space under `apps/{appId}/media/*`; Firestore stores the download URLs under `apps/{appId}.media`.
- Shared core brand assets may act as runtime fallback visuals, but they are not the canonical tenant branding path.

## Standalone App Contract
- Standalone apps are FireUX-hosted product apps inside the `fireux` ecosystem.
- Standalone apps are not tenant children and are not the ecosystem global/main app.
- Standalone apps consume core directly plus the packages they install.
- Standalone apps may use shared runtime/app contracts and shared core modules, but they do not inherit tenant or ecosystem product surfaces.
- Standalone apps are public/non-tenant by default:
  - indexable unless a page explicitly opts out
  - no tenant auth chrome
  - app-local branding/assets expected when available
- Standalone app local brand assets follow the same path canon as tenants: files in `/public/img/app`, URLs as `/img/app/*`.
- Standalone apps must not auto-load ecosystem-controller-only governance surfaces.
- Phase 1 canon allows standalone apps only in the `fireux` ecosystem.

## Runtime Selection Rules
- Console/runtime entity selection is state-based.
- Console pages must resolve active context from runtime state, not route query selection.
- Query params may carry view/context options for public routes, but not canonical console entity selection.
- No silent selection fallbacks:
  - Do not auto-switch entities/modes when required state is missing.
  - Surface missing selection explicitly.

## Console Vocabulary
- `console family` = the top-level console bucket exposed by app config.
  - Current canon:
    - `project`
    - `property`
    - `kitchen`
    - `portfolio`
    - `supplier`
  - Current route mapping:
    - `project` -> `/console/project`
    - `property` -> `/console/property`
    - `kitchen` -> `/console/kitchen`
    - `portfolio` -> `/console/portfolio`
    - `supplier` -> `/console/supplier`
  - `runtime target` = the selected root entity inside a console family.
  - Example:
    - selected `Project`
    - selected `Property`
    - selected `Kitchen`
    - selected `Portfolio`
    - selected `Supplier`
- `console workspace` = the console shell plus runtime mode around a selected target.
- `child records` = records beneath the selected runtime target.
- Cardinality does not introduce a new architecture layer.
  - A family may often resolve to one target (`supplier`) or many (`kitchen`, `portfolio`, `project`).
  - The canon remains:
    - choose family
    - select target
    - enter workspace
    - operate on child records
- `collection` is a storage term and must not be used as the primary business/runtime term for this console model.

## Console Canon Enforcement
- A console family is current only when all of these exist:
  - route family under `runtime/pages/console/<routeSegment>` or the owning app's `app/pages/console/<routeSegment>`
  - app config lists the canonical family key in `consoles` when the app should expose it
  - app registry smoke routes include at least the family entry when the app is part of local smoke coverage
  - Tier1 package/app docs list the family key, route segment, and current child routes
- If the route family does not exist, the family is proposed, not current.
- If `consoles` does not list the family, the app must not present a user-facing CTA to that console family.
- If a product needs a console to inspect its canon, keep or add the minimal scaffold route before removing accidental old console access.
- Console family route segments are singular. A console can manage multiple targets,
  but that is handled by `/console/<family>` target listing, not by plural route
  segment naming.
- Route shape under `pages/console/<family>` follows the Kitchen reference:
  - simple current or scaffold pages may be single files such as `overview.vue`, `create.vue`, or `team.vue`
  - complex pages use child directories with `index.vue` plus detail files, such as `menus/index.vue` and `menus/[menuId].vue`
- Family child routes should be concrete domain operation nouns. Generic names such as `pages` are suspicious unless the domain child is explicitly named that way by Tier1 canon.
- Reference comparisons must use real route trees:
  - list the existing children
  - identify missing children
  - patch the route scaffold before claiming alignment
- `index` and `overview` are shared console semantics:
  - `/console/X` = family index/target entry
  - `/console/X/overview` = selected target overview
  - do not count them as domain-specific child operation canon when comparing families

## Console Entity Bucket Canon
- Usual Firestore entity composable stacks are deliberately boring:
  - `firestore/<entity>/fetch/**` owns root entity reads.
  - `firestore/<entity>/mutations/**` owns root entity writes.
  - `firestore/<entity>/utils/**` owns root entity helpers, view/interface, identity, and validation.
- `firestore/<entity>` means root entity data access. It must not become a dumping ground for console operations or runtime state.
- Console-backed root-plus-app families use four buckets:
  - Root entity = public/business identity.
  - App overlay = who can operate that entity inside one app.
  - Console runtime = selected target plus mode.
  - Child records = operational records beneath the selected target.
- Generic storage shape:
  - `<entities>/{entityId}`
  - `apps/{appId}/<entities>/{entityId}`
  - `apps/{appId}/<entities>/{entityId}/<childCollection>/{childId}`
- Generic model naming:
  - root entity: `Kitchen`, `Supplier`, `Portfolio`, `Project`
  - app overlay: `AppKitchen`, `AppSupplier`, `AppPortfolio`, `AppProject`
  - avoid mixed architecture names such as `RuntimeKitchen`, `KitchenFacade`, or `KitchenConsoleEntity`
- Generic runtime shape:
  - `ConsoleMode = live | demo | test`
  - console selection stores family, selected target id, and mode
  - runtime selection is UI/application state, not storage
- Generic folder shape:
  - `app/console/**` owns the shared generic console spine.
  - `firestore/<entity>/**` owns the usual root entity stack: `fetch/`, `mutations/`, and `utils/`.
  - `console/<entity>/useXConsole.ts` owns the selected target runtime adapter for that entity.
  - `console/<entity>/useXConsoleIndex.ts` owns the target selector/index seam for that entity.
  - `console/<entity>/useXConsoleOverview.ts` owns the selected target overview seam for that entity.
  - `console/<entity>/useXSelection.ts` owns the selected id/mode helper for that entity.
  - `console/<entity>/operations/**` owns console operation data and workflows around a selected target, including child records such as menu, mise, orders, team, station, or suppliers.
- No mixed-bucket runtime folders:
  - do not create `app/<entity>-console`
  - do not create `firestore/runtime-<entity>`
  - do not create `firestore/runtime-kitchen`
  - do not create vague architecture buckets such as `facade`, `stack`, `manager`, `processor`, or `handler` under `firestore/<entity>`
  - console operation helpers must live under `console/<entity>/operations`, not under the usual root entity stack
  - `console/<entity>/operations` may contain flexible child operation folders, but must not contain vague architecture buckets such as `runtime-*`, `facade`, `stack`, `manager`, `processor`, `handler`, or `resolver`
  - do not invent generic console resolver/facade composables such as `useChildEntityConsoleResolver`, `useConsoleChildResolver`, `useRuntimeX`, or `useXFacade`

## Family Entry Semantics
- `/console` = choose family.
- `/console/X` = family entry page for that family.
- `/console/X` is not the operational overview of one already-selected target.
- `/console/X` is the overview of available targets for the active family in the active mode.
- `/console/X/overview` = selected-target workspace overview for that family.
- `/console/X/overview` is only meaningful once a runtime target has been selected.
- Meaning by mode:
  - `demo`: show curated demo targets for that family.
  - `test`: show Firestore-backed test targets for that family.
  - `live`: show the current user's real targets for that family.
- The family entry page answers:
  - which mode is active
  - which targets are available in that mode
  - which target should be entered
  - whether the user needs to create or claim a target
- The overview page answers:
  - which target is active
  - which workspace sections are available for that target
  - where the operator should go next

## Dev Runtime Authority Rule
- This section is dev runtime authority and app correctness, not a Firestore security-rules implementation task.
- `live` family entry must show authorized operator targets, not all documents in the backing collection.
- Authorized operator targets means targets where the current user's uid is present in `operator_ids`.
- Client-side filtering after a broad root collection read is not authority.
- Console live source reads must query authority first, then fetch only exact authorized target docs.
- Canon authority source for real-mode access is:
  - `operator_ids`
  - `join_requests` as optional workflow state
  - and any family-specific canonical claim rule explicitly allowed in a Tier1 extension contract
- `team_ids` may remain as transitional compatibility for older records, but it must not be documented as current canon.
- Root ownership and relationship fields may support discovery or migration, but they do not replace operator authority unless the Tier1 family contract explicitly says so.
- Family-specific guidance:
  - `project`: root `projects/{projectId}.operator_ids` is current authority; `owner_user_id` is a root ownership hint only.
  - app-scoped console entities use `apps/{appId}/{family}/{targetId}.operator_ids` as the live authority source.
  - `property`: property console governance is scaffolded; do not borrow another app's console family to operate properties.
  - `kitchen`: overlay governance or allowed claim rules; chef/profile linkage is not enough.
  - `portfolio`: overlay governance is primary; `owner_label` is presentation only.
  - `supplier`: overlay governance is primary; supplier/operator relationship is not enough.
- Mutation composables must re-check console authority before writes; page-level visibility is not enough.
- Firestore rules parity is a later production/ship task; dev/preflight work should still avoid training the runtime into unsafe read/write patterns.

## Root App Scope State
- Root-plus-app families must store the root facade's app relationship explicitly:
  - `app_scope_state`
  - `app_scope_app_id`
- Allowed `app_scope_state` values:
  - `root_only`: only the public root record exists
  - `parent_app`: an app-scoped record exists under a parent app
  - `dedicated_app`: the entity has or has moved to its own dedicated app
- `app_scope_app_id` is empty for `root_only`.
- `app_scope_app_id` points to the app that hosts the app-scoped record for `parent_app` and `dedicated_app`.
- These fields are topology metadata only; access still comes from the app-hosted overlay governance rule.
- This rule applies to operational root-plus-app families such as Kitchen, Supplier, Portfolio, and Project.
- It does not apply to User or identity profile records; their app records are overlays.

## Runtime Mode Rules (Console Runtimes)
- Supported modes:
  - `live`
  - `demo`
  - `test`
- Mode behavior:
  - `live`: Firestore-backed production collections.
  - `demo`: scenario/data-pack mode with no Firestore writes.
  - `test`: Firestore-backed test collections.
- Runtime source canon is:
  - `live`
  - `demo`
  - `test`
- Runtime activity canon is:
  - `static`
  - `simulation`
- Current console showcase scenarios are:
  - source: `demo`
  - activity: `static`
- Future time-based demo systems, such as service playback, are:
  - source: `demo`
  - activity: `simulation`
- UI labels may still say:
  - `Demo`
  - `Real`
  - `Test`

## Mutation Entry Canon (`createX` vs `ensureX`)
- `createX` is the intentional creation entrypoint for a real target.
- `createX` is used by user-facing create flows such as:
  - create forms
  - create systems
  - other explicit "make a new X" actions
- `createX` intentionally creates or ensures the root record.
- For root-plus-app families, when an app context exists, the shared `useConsoleEnsure` seam may also ensure the app-hosted console overlay.
- Route mode affects entry and return UX; it must not be described as the only determinant of whether an app overlay exists.
- `ensureX` is the idempotent bootstrap/setup-if-missing entrypoint.
- `ensureX` is used for:
  - `test` mode entry
  - repair/recovery
  - setup/bootstrap flows that must tolerate "already exists"
- Auth must stay identity-only.
- Auth must not auto-create domain records on sign-in.
- Family entry pages may call `ensureX` when the canon says the family has one personal test target per signed-in user.
- Current family-entry test canon:
  - `projects/test` ensures one `test-projects/{uid}`
  - `kitchen/test` ensures one `misebox-simulation/kitchens/{uid}`
  - `portfolio/test` ensures one `test-portfolios/{uid}`
  - `supplier/test` ensures one `test-suppliers/{uid}`
- Test target creation happens on entry to that family's console page in `test` mode, not in auth/bootstrap middleware.

## Console Data Source Canon
- `live` / real is the source-of-truth target shape.
- `test` is the writable proving ground for the intended real shape.
- `demo` is a read-only aid for development, demos, and UX exploration.
- Runtime code must not bend to preserve stale demo data.
- If demo and test disagree, prefer the test/real shape and update demo.
- Family-entry test data should prove the same minimum target shape used by live.
- Demo/test/live targets should expose the same minimum console target shape to `useConsoleIndex`, header, and overview:
  - stable `id`
  - display `name` or `title`
  - optional `subtitle`
  - optional `image_url`
  - runtime `mode`
  - source information
  - app overlay authority when the family is app-scoped

## Demo Data Policy
- Runtime demo data must come from domain-owned demo scenario registries.
- Accepted registry locations are package-owned `demo-scenarios.ts`, `demo-scenarios/**`, or `<domain>-demo-scenarios/**` files under runtime app/composable code.
- Demo data is not canon by itself.
- Demo scenario fields are not canon unless promoted into Tier1 or package contract docs.
- Demo data must bend toward the desired live/test shape.
- Dev fixture files under repo `demo/*.demo.ts` are repo-level demo entity/view payloads.
- Repo-level `demo/*.demo.ts` may feed dev surfaces, examples, and explicit preflight product pages, but not console/runtime source selection.
- Repo-level `demo/*.demo.ts` must not be treated as Firestore storage, Nuxt Content, or runtime model canon.
- App-local `app/content/*` is for app copy, metadata, and static page content; do not put entity demo records there.
- Console/runtime behavior must never depend on `demo/**`.

## Collection Path Policy (Kitchen Console)
- Kitchen root target paths:
  - `live` -> `kitchens/{kitchenId}`
  - `demo` -> no Firestore collection path (scenario-backed)
  - `test` -> `misebox-simulation/kitchens/{kitchenId}`
- Published kitchen menu routes use root kitchen menu records and their child records:
  - `kitchens/{kitchenId}/menus/{menuId}`
  - `kitchens/{kitchenId}/dishes/{dishId}`
- Kitchen console operations use app-scoped children:
  - `apps/{appId}/kitchens/{kitchenId}/ingredients/{ingredientId}`
  - `apps/{appId}/kitchens/{kitchenId}/mise/{taskId}`
  - `apps/{appId}/kitchens/{kitchenId}/recipes/{recipeId}`
  - `apps/{appId}/kitchens/{kitchenId}/orders/{orderId}`
  - `apps/{appId}/kitchens/{kitchenId}/team/{memberId}`
  - `apps/{appId}/kitchens/{kitchenId}/stations/{stationId}`
  - `apps/{appId}/kitchens/{kitchenId}/suppliers/{supplierId}`
- Published menu and dish copy is translated directly from menu/dish text.
- Published menu route code must not depend on private working `mise` or console operation lines.
- Future nutrition/production support may link dishes to ingredients, mise, or recipes, but those links are enrichment/operations data rather than public menu translation canon.

## Route Policy (ID, Slug, Handle)
- Internal/admin/console routes may use `[id]`.
- Public/indexable entity routes may use `[slug]` only when the entity contract declares a public slug strategy.
- Tenant apps remain non-indexable by default unless a Tier1/Tier1-extension contract explicitly publishes a tenant route class.
- Entities without a published slug contract remain id-based until their extension contract defines slug rollout.

## Public Slug Identity Policy
- Default FireUX slug canon is `slug == doc id`.
- For a slug-id entity, public route identity is the Firestore document id:
  - `/products/[slug]` reads `products/{slug}`
  - `/blog/[slug]` reads `blogs/{slug}` or the contract-declared blog collection equivalent
  - `/places/[slug]` reads `places/{slug}` only if Place declares slug-id mode
- When a `slug` field exists on a slug-id entity, it is a mirrored public/display field and must equal the Firestore document id.
- For a field-slug entity, public route identity is an explicit `slug` field while stored identity remains the document id.
- Field-slug mode is allowed only when the entity contract declares it and defines the lookup/write rule.
- Field-slug routes must not silently fall back to document id for public URLs.
- Public `[slug]` routes must not query by slug field directly by default.
- Public `[slug]` routes must not silently fall back through chains such as:
  - `slug || id`
  - `id || slug`
  - `where('slug', '==', routeParam)`
  - `where('slug', '==', routeParam) || doc(routeParam)`
- Public slug and document id must not diverge.
- Ad hoc `where('slug', '==', routeParam)` lookups are not canonical.
- Compatibility fallbacks are allowed only during a named migration window documented in Tier1/Tier1-extension canon, and must not be hidden in generic public route helpers.

## Reserved Slug Policy
- Root public identities, such as user handles, must validate against reserved top-level route keys.
- Entity public slugs must validate against reserved static/action segment keys for their namespace.
- Shared slug validation must use the repo slug utilities rather than local regex copies.
- Reserved-scope meanings:
  - `root`: top-level route keys such as `users`, `products`, `console`, `api`
  - `entity`: namespace action/static segments such as `create`, `edit`, `settings`, `me`
  - `none`: no reserved route check, for internal/non-route ids only

## Public Route Strategy Types
- Every public/indexable identity must declare exactly one strategy in its extension contract:
  - `slug-id`: public slug equals Firestore document id.
  - `field-slug`: public slug is an explicit field while stored identity remains document id.
  - `handle-index`: public handle resolves to a stable user id through the declared user handle index/field contract.
  - `id-only`: public route is not slug based.
- Public link generators, SEO paths, sitemap entries, and JSON-LD URLs must follow the declared strategy.
- A `slugField` sitemap/config option is compatibility-only and must not define canonical route identity.

### Compact Entity Strategy Map
| Extension | Entity | Public Param | Strategy |
| --- | --- | --- | --- |
| fireux-blogs | BlogPost | slug | slug-id |
| fireux-products | Product | slug | slug-id |
| fireux-core | User | handle | handle-index |
| fireux-core | Project | id | id-only |
| fireux-core | App | id | id-only |
| fireux-core | Ecosystem | id | id-only |
| fireux-places | Place | id | id-only |
| fireux-companies | Company | id | id-only |
| fireux-kitchens | Kitchen | slug | field-slug |
| fireux-kitchens | Recipe publication | slug | slug-id |
| fireux-kitchens | Chef | id | id-only |
| fireux-kitchens | Ingredient | id | id-only |
| fireux-suppliers | Supplier | id | id-only |
| fireux-properties | Portfolio | id | id-only |
| fireux-jobs | Job | id | id-only |
| fireux-jobs | Agent | id | id-only |
| fireux-jobs | Professional | id | id-only |
| fireux-orders | Order | n/a | id-only |

### Enforcement
- CI/check scripts should fail if:
  - a public page is added without a strategy entry.
  - a public URL generator uses id while strategy requires slug.
  - a slug-id route queries by `slug` field instead of document id.
  - a public helper silently falls back between slug and id.
  - a public user route bypasses handle resolution and exposes uid routes as canonical.

## Selection vs Formatting
- Selection/routing/identity must never rely on silent fallback paths.
- Deterministic field precedence inside one resolved entity is permitted when documented in Tier1 canon/contracts.

## Conflicts Resolved
- Previous broad “[id] for all object pages” guidance is replaced by the mixed route policy above (public slug, internal id).
- Kitchen live/demo split is canonicalized here and supersedes ambiguous one-collection summaries.
- Runtime selection canon is state-based for consoles; query-selection statements in Tier3 history docs are non-authoritative.

## TBD Decisions (Deano)
- Slug rollout scope for currently id-based public entities (jobs/places/companies/kitchens):
  - Default: phase by extension
  - Note: products/blog already slug-first
- SEO enforcement timing:
  - Default: after Kitchen MVP polish (next sprint after console stability)
  - Includes: robots/meta noindex, sitemap, JSON-LD helpers, canonical URLs
- Tier3 AI memory location:
  - Default: keep Tier3 memory under `docs/ai/**`
  - Tier3 memory is tracked for auditability but is non-authoritative
