# FireUX Canon
Authority: Tier1 (Authoritative)
Updated: 2026-05-15
## Purpose
- Define FireUX-wide structural and behavioral rules that all extensions and apps follow.
- Resolve authority drift by making this file the source of truth for cross-domain canon.

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
- Canon docs override operational docs and tooling/history docs on conflict.
- App pages do not justify app-local storage on their own.
- Root-first entities may be filtered by explicit scope fields instead of being duplicated under app paths.
- `Project` is a root/core entity.
- Canonical project identity lives on the root `projects/<projectId>` record.
- Root project membership and ownership fields live on that root record, not on app overlays.
- Current canonical root project membership/ownership fields are:
  - `team_ids`
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
- Canonical console family keys are plural where the runtime uses a collection-like key:
  - `projects` -> `/console/projects`
  - `kitchens` -> `/console/kitchen`
  - `portfolios` -> `/console/portfolio`
  - `suppliers` -> `/console/supplier`
- Identity roots such as `User` and profile roots do not use `app_scope_state`; their app records are overlays for membership, capability, and presentation.
- Generic project collection and console project selection are not the same seam.
- `useProjectCollection()` stays generic.
- Console project visibility adds user/app scope above the generic collection rather than redefining it.
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

## Demo Data Canon
- Demo data is never canon by itself.
- Demo data must bend toward the desired live/test shape; runtime code must not bend around stale demo data.
- `test` data is separate from demo data:
  - `test` is writable and proves the intended live shape.
  - `demo` is curated, read-only, and used for development, demos, UX exploration, and explicit preflight product surfaces.
- Console/runtime demo data must live in the owning domain package as a demo scenario registry.
- Current accepted demo scenario registry shapes are:
  - `packages/*/src/runtime/composables/fireux/app/**/demo-scenarios.ts`
  - `packages/*/src/runtime/composables/fireux/app/**/**/*-demo-scenarios/index.ts`
  - `packages/*/src/runtime/composables/fireux/app/**/demo-scenarios/**`
- Repo-level `demo/*.demo.ts` files are for demo entity/view payloads, dev surfaces, examples, and explicit preflight product records.
- Repo-level `demo/*.demo.ts` files are not Firestore storage, Nuxt Content, canonical runtime models, or console scenario registries.
- App-local `app/content/*` is for app copy, metadata, and static page content, not entity demo records.
- Demo file naming is:
  - repo-level fixtures: `demo/<domain>.demo.ts`
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
