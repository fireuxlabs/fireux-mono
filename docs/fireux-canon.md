# FireUX Canon
Authority: Tier1 (Authoritative)
Updated: 2026-05-18
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
  - an app console entry is not current unless `consoleFamilies` exposes it
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
- Demo data:
  - demo records follow live/test shape.
  - demo mode is explicit.
  - live collection reads must not silently become demo reads.
- Entity stacks:
  - start from the standard model, fetch, collection, interface, component, and page seams before adding new entity-specific structure.

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
- Project, Ecosystem, and App are real system entities. Their management surfaces are facades over stored truth, not separate stored identities.
- Project is a console-backed system root entity:
  - stored truth: `projects/{projectId}`
  - management surface: `/console/project` in `fireux-app`
  - authority: `operator_ids` on the root Project record
- Ecosystem is a system-level product/app grouping managed through Project/App context:
  - stored truth: `ecosystem/{ecosystemId}`
  - possible future/private app state: `apps/{appId}/ecosystem/{ecosystemId}` only when implemented
  - it may map to a Firebase project operationally, but Firebase is infrastructure backing, not entity definition
- App is a system root entity and active runtime singleton:
  - stored truth: `apps/{appId}`
  - active seam: `useApp()` resolves `FireUXConfig.appId`
  - Project/App console surfaces may manage App through facades over root App truth
- `firestore/core/ecosystem` is the canonical root Ecosystem read/collection/interface/ensure seam.
- `firestore/system/ecosystem` is only for setup/control/bootstrap adapters and must not duplicate root Ecosystem entity access.
- `fireux/app` is app shell/context/orchestration space, not a bucket for App, Project, or Ecosystem entity truth.
- Tenant apps are child app surfaces inside a FireUX ecosystem, not independent ecosystem canons.
- Tenant apps may stay intentionally thin and do not justify new top-level domain/storage patterns on their own.
- Placeholder tenant branding/assets are canonical until tenant-specific assets are explicitly provided.
- Existing tenant implementations do not define canon; shared tenant rules come from Tier1 and shared runtime.
- Standalone apps are FireUX-hosted product apps inside the `fireux` ecosystem.
- Standalone apps are not tenant children and are not ecosystem globals.
- Standalone apps may use shared core/runtime foundations but must not claim project control or ecosystem-controller ownership.
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
- Product apps must not expose orphan console-family routes. If the app does not have a selected workspace/entity family, use public routes and a personal/provider dashboard instead of adding a console family.
- Product apps that do expose a console family must expose a real family route and a discoverable CTA. Do not point product CTAs at another product's console just because that route exists.
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
- The first universal chat pattern is app admin chat:
  - public `/chat` lets any visitor start a `general` conversation about the current app.
  - app admins answer from `/dashboard/chat`.
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
  - `useXDelete()` removes.
  - `useXEnsure()` bootstraps.
  - `useXConsole()` selects and operates a workspace.
  - dashboard/profile routes manage identity.
- Entities should start from the standard FireUX stack before adding domain-specific seams:
  - `XModel`, `X`, `XCreateInput`, `XUpdateInput`
  - `composables/fireux/firestore/<entity>/useX.ts`
  - `composables/fireux/firestore/<entity>/fetch/`
  - `composables/fireux/firestore/<entity>/mutations/`
  - `composables/fireux/firestore/<entity>/utils/`
  - `useXFetch()`, `useXCollection()`, `useXInterface()`
  - `useXCreate()`, `useXUpdate()`, and `useXDelete()` where writes exist
  - `useXEnsure()` only where bootstrap/setup-if-missing is intended
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
    useXDelete.ts
    useXEnsure.ts      optional, only for setup-if-missing behaviour
    validation/        optional, only for write-specific validation
  utils/
    view/
      useXComputed.ts
      useXInterface.ts
    validation/        shared entity validation
    normalize/         optional
    paths/             optional
```

- One entity family has one top-level family entry seam. Use singular `useX.ts`; plural/read-many behaviour belongs to `useXCollection`, not a competing `useXs` barrel.
- `useXComputed` owns derived entity truth such as status/display booleans; `useXInterface` owns UI projections such as `pill`, `cell`, `preview`, and `profile`.
- Validation belongs in `utils/validation` when shared by UI/read/write surfaces, and in `mutations/validation` only when it protects create/update/delete/ensure behaviour.
- Missing stack seams should be treated as alignment opportunities, not proof that the entity needs a new architecture.
- Hydrated/read-time composites belong in fetch, entity helper, or interface seams, not in stored model files.
- If an entity cannot follow the standard stack, document which family it belongs to and why the delta is real.
- `pnpm audit:usex` is report-only tooling for spotting repeated stack seams, missing seams, local deltas, and naming drift. It is not a blocking guard until the repo is intentionally tightened.
- `src/runtime` means code that ships into the Nuxt/package runtime; it is not an ownership bucket by itself.
- Inside runtime, ownership is by surface and family: app shell/context, entity stack, console workspace, route, component, or server seam.
- Create/edit/post/publish state belongs to the entity family first.
- Publishable entities such as `Product`, `BlogPost`, and `Job` may have lifecycle state and authoring flows, but those remain part of the Product, Blog, or Job stack unless the flow coordinates whole-app setup or multiple entity families.
- `app/` is only for app-level orchestration, not normal entity authoring state.
- Entity authoring helpers that are not raw Firestore belong in the entity-owned composable family, such as `composables/fireux/product/create`, `composables/fireux/blog/editor`, or component-local create/edit helpers.

### Public Entity Route Add-Ons

- Shared public entity roots use plural collection/detail routes first, such as `/properties` and `/properties/:publicKey`.
- Console entity routes use singular family routes, such as `/console/property` and `/console/property/overview`.
- Public entity operation bridges use `/operator`, such as `/properties/:publicKey/operator`.
- Do not use `/admin` as a public entity route word. Admin means app/platform administration; operator means access to operate this public target.
- App-specific public experiences sit under an explicit child noun, such as `/properties/:slug/info`.
- Child pages use stable semantic ids, such as `/properties/:slug/info/:infoId`.
- Current public key canon:
  - Kitchen: `slug`
  - Property: `slug`
  - Project: `slug`
  - Supplier: `id`
  - Portfolio: `id`
- Do not encode a special child home page by filtering it out inside pages. Promote that split into named helpers, for example `getXHome()` and `getXSections()`, so public pages, layouts, smoke routes, and QR targets all share the same source shape.

### Entity Mode Matrix

| Mode | Canon meaning | Expected seams | Current examples |
| --- | --- | --- | --- |
| Root entity | Canonical stored thing | `XModel`, `useXFetch`, `useXCollection`, `useXInterface`, writes where allowed, collection/card surfaces where browsable | `App`, `Blog`, `Chef`, `Company`, `Dish`, `Ecosystem`, `Job`, `Kitchen`, `Portfolio`, `Product`, `Professional`, `Recipe`, `Supplier`, `User` |
| Console workspace entity | Root entity that can be selected and operated | root stack plus `useXConsole`/selection and `/console/<family>` surfaces | `Kitchen`, `Supplier`, `Portfolio`, `Project` |
| Identity/profile capability | Something a signed-in user can be or manage about themself | dashboard/profile routes, profile fetch/ensure/update, no console family by default | `Professional`, `Chef`, `Agent`, base `Profile` |
| App membership overlay | App-specific role/capability for a user | `useAppUserCollection`, app-user update helpers, app membership UI; not a root entity stack | `AppUser` |
| System management entity/context | Stored system entity that may also be managed through Project/App context | root entity seam plus explicit management facade; stored truth is not duplicated by the facade | `Project`, `Ecosystem`, `App` |
| Scoped child entity | Operational record owned by a parent workspace/entity | scoped collection/fetch helpers, interface/card surfaces only where needed, writes through parent-aware mutations | `Task`, `Document`, `Compliance`, `PropertyUnit`, `PortfolioTask`, `PortfolioDocument`, `KitchenMise`, `KitchenOrder` |
| Root plus scoped usage | Root truth linked into a workspace by a scoped usage record | root model/collection/interface plus scoped relationship helper | `Ingredient` root plus `KitchenIngredient` usage records |
| System/adapter seam | Runtime helper around stack behaviour, not an entity | adapter/ensure/selection helpers; no full entity UI stack required | `Console`, `Firestore`, selection helpers |

### Create And Edit Mode Matrix

| Mode | Canon meaning | Current examples |
| --- | --- | --- |
| `quick-create` | User completes a small form and immediately creates the record | `Company`, `Place`, `Ingredient`, simple profile/entity creates |
| `ensure-create` | Setup-if-missing and safe to rerun | `User`, `Profile`, `App`, `Ecosystem`, console target setup where canon allows |
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
  - Relevant `packages/extensions/fireux-*/docs/contract.md` or `packages/extensions/fireux-*/docs/canon.md`

## Conflicts Resolved
- Authority is now explicit: Tier1 canon/contract docs override Tier2/Tier3 docs.
- “No fallbacks” policy is clarified:
  - Prohibited: silent selection/routing/identity fallbacks.
  - Allowed: deterministic field precedence documented in Tier1/Tier1-extension contracts.
