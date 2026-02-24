# Apps Canon Report

Scope: current worktree state for `/apps` routing and app ID assignment/uniqueness in FireUX runtime (core + ecosystem-controller).

This report is intentionally route-first and does not propose redirects, aliases, or fallback paths.

## 0) Apps Canon v1 (Locked)

### Canonical Routes (Post-Cleanup Target / Current Worktree)

| Route | Owner | Purpose |
|---|---|---|
| `/apps` | `fireux-ecosystem-controller` | Directory / multi-app browsing |
| `/apps/:id` | `fireux-ecosystem-controller` | Single app detail |
| `/dev/apps` | `fireux-core` | Dev inspection / drift / dummy surfaces |
| `/docs/apps` | ecosystem docs | Documentation only |

This is the intended top-of-system shape:
- no aliases
- no singular `/app/*` namespace
- no redirect stubs
- no back-compat routes

### Routes That Must Not Exist (Under This Canon)

- `fireux-core/src/runtime/pages/apps/index.vue` (removed)
- `fireux-core/src/runtime/pages/apps/[id].vue` (removed)
- `/app/*` singular namespace routes (none present in current core/controller runtime pages)
- `/apps/learn-more` (removed)
- redirect-only `/apps/*` shims (none present in current route pages)

### Operational Truths (Locked From Now On)

- Only `fireux-ecosystem-controller` ships `/apps` + `/apps/:id`.
- `fireux-core` never ships `/apps` pages.
- Global apps mount `fireux-ecosystem-controller` via `defineFireuxConfig(...)` (module expression by app role), so the controller-owned `/apps` routes are actually present at runtime.
- `fireux-core` can still own the underlying composables, models, Firestore operations, UI components, onboarding, etc.
- `fireux-core` owns `/dev/apps` only.
- Docs are `/docs/apps` only.
- Route ownership rule: If a route is shipped by `fireux-ecosystem-controller`, it must not exist in `fireux-core` or any `projects/*/pages` override.

This is the enforcement model:
- one owner per route
- no duplication
- no redirects
- no aliases
- no “future proofing” shims

### Remaining Canon-Break Risk (What Could Reintroduce Drift)

Because `fireux-ecosystem-controller` is now the sole route owner, this canon only breaks if:

1. a project adds `projects/*/pages/apps/*` overrides again
2. core reintroduces `packages/core/fireux-core/src/runtime/pages/apps/*`
3. controller + project both ship `/apps` and Nuxt merges routes unexpectedly

Practical takeaway:
- enforce by filesystem shape (do not allow extra route files to exist)

### Enforcement Checks (Repo Root)

```bash
# 1) Prove only controller owns /apps routes
ls -la packages/core/fireux-core/src/runtime/pages/apps || true
ls -la packages/core/fireux-ecosystem-controller/src/runtime/pages/apps || true

# 2) Find any project overrides that would shadow canon
find projects -path "*/pages/apps*" -print

# 3) Find any stray learn-more or app singular routes
rg -n "apps/learn-more|/app/" packages projects || true

# 4) Show any Nuxt route files that would conflict with /apps
find packages projects -path "*pages/apps*" -print
```

Expected results under this canon:
- core `runtime/pages/apps` does not exist
- controller `runtime/pages/apps` exists with `index.vue` + `[id].vue`
- `projects` should return no `pages/apps/*` route files (directory may exist, but no page files)
- no matches for `/apps/learn-more` or `/app/`
- `find packages projects -path "*pages/apps*" -print` should only show the controller route directory/files (and optional empty project directory with no page files)

## 1) Current Apps Routes (Runtime)

### Canonical runtime pages (owner: ecosystem-controller)

- `/apps`
  - `packages/core/fireux-ecosystem-controller/src/runtime/pages/apps/index.vue:1`
  - Collection-first page with `AppCTA` + `AppCollectionManager` (`:5`, `:6`)

- `/apps/:id`
  - `packages/core/fireux-ecosystem-controller/src/runtime/pages/apps/[id].vue:1`
  - App detail page by Firestore app doc id (`route.params.id` parsed in the controller page)

- `/dev/apps`
  - `packages/core/fireux-core/src/runtime/pages/dev/apps.vue:1`
  - Dev inspection page for app model/drift/collection, plus binding + dummy surfaces (`:18`, `:20`, `:22`, `:50`)

### Core `/apps` pages (removed to avoid duplicate ownership)

- `packages/core/fireux-core/src/runtime/pages/apps/index.vue` (deleted in worktree)
- `packages/core/fireux-core/src/runtime/pages/apps/[id].vue` (deleted in worktree)

Result:
- `fireux-core` no longer ships `/apps` route pages.
- `fireux-ecosystem-controller` is the sole owner of `/apps` and `/apps/:id`.

### Docs route (separate concept from `/apps`)

- `/docs/apps` (docs content source)
  - `packages/ecosystem/fireux-fireux/docs/apps.md:1`
  - Docs content explicitly states `/apps` is collection-first and docs belong under `/docs/*` (`:10`, `:18`)

- `/apps` CTA links to docs via `/docs/apps`
  - `packages/core/fireux-core/src/runtime/components/organisms/App/CTA.vue:46`

### Removed / no longer present (current worktree)

- `/apps/learn-more`
  - Route file deleted earlier:
  - `packages/core/fireux-core/src/runtime/pages/apps/learn-more.vue` (deleted in worktree)

- FireUX project-specific `/apps` docs override page
  - `projects/fireux/fireux-app/app/pages/apps/index.vue` (deleted in worktree)
- Result: FireUX `/apps` now resolves to shared runtime page instead of project-level docs page.

- Core `/apps` route pages
  - Removed to prevent duplicate route implementation with ecosystem-controller.

### Project-level app pages (FireUX app)

- `projects/fireux/fireux-app/app/pages/apps/` directory still exists, but no page file currently exists under it.
  - No active project override route file for `/apps` at the moment.

## 2) Apps Route Canon (Current State Assessment)

The current `/apps` route shape is aligned with the canon you described:

- `/apps` is collection-first (not docs-first)
- `/apps` includes a small CTA/context surface (current runtime app) without becoming a docs page
- `/apps/:id` remains the detail route
- `/docs/apps` is the docs route
- No `/apps/learn-more` stub/alias remains
- Route ownership is singular: ecosystem-controller owns `/apps` and `/apps/:id`

This is a clean top-level system shape.

## 3) App ID "Generation" (What Actually Happens Today)

Short version: app IDs are not generated dynamically in runtime UI. They are assigned in app config (`nuxt.config.ts`) and then used as the Firestore document id.

### Where app IDs come from

- App config type requires an explicit `id: string`
  - `packages/core/fireux-core/src/config/app/fireux.config.ts:9`
  - `packages/core/fireux-core/src/config/app/fireux.config.ts:11`

- `defineFireuxConfig(...)` writes `app.id` into runtime config (`setRuntime(... app: { id: app.id, ... })`)
  - `packages/core/fireux-core/src/config/app/fireux.config.ts:96`
  - `packages/core/fireux-core/src/config/app/fireux.config.ts:165`
  - `packages/core/fireux-core/src/config/app/fireux.config.ts:167`

- Example (FireUX app): explicit app id is configured in project `nuxt.config.ts`
  - `projects/fireux/fireux-app/nuxt.config.ts:4`
  - `projects/fireux/fireux-app/nuxt.config.ts:6` (`id: 'fireux-app'`)

- Runtime reads the configured id from `runtimeConfig.public.fireux.id`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/FireUXConfig.ts:45`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/FireUXConfig.ts:75`

## 4) App ID Usage in Routes and Firestore

### Route identity

- App links use the app document `id` as the route segment:
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts:68`
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts:72`
  - Path is URL-encoded with `encodeURIComponent(id)`

- App detail route reads `route.params.id` and fetches `apps/{id}`
  - `packages/core/fireux-ecosystem-controller/src/runtime/pages/apps/[id].vue:90`
  - `packages/core/fireux-ecosystem-controller/src/runtime/pages/apps/[id].vue:97`
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch.ts:16`
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch.ts:20`

### Firestore identity

- `useAppEnsure()` uses `fireux.appId` as the Firestore doc id in `/apps/{appId}`
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts:60`
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts:63`
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts:75`
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts:104`

- App onboarding triggers `ensureApp()` from the runtime onboarding flow
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/utils/useAppOnboarding.ts:139`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/utils/useAppOnboarding.ts:142`

## 5) App ID Uniqueness (Current Guarantees / Gaps)

Short version:
- The current mechanism is fine for today because app ids are config-assigned and onboarding only ensures "this runtime app exists".
- It is not a strong concurrency-safe claim system.
- We should not describe it as stronger than it is.

Safe one-line wording for docs:

> App IDs are treated as stable URL identifiers and Firestore doc ids; uniqueness is enforced socially/config-by-code today, not via a transactional claim registry.

### What is guaranteed today

- `useAppEnsure()` does a read-before-write existence check:
  - reads `apps/{appId}`
  - if exists: returns `{ created: false }`
  - if missing: writes the new app doc
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts:63`
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts:67`
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts:104`

- In normal operation, app id collisions are mostly prevented by the fact that app ids are manually chosen in source config (`defineFireuxConfig({ id })`) per project/app.

### What is *not* guaranteed today

- There is no transactional/global app-id claim system (no `/app_ids/*` registry or claim transaction).
- `setDocument()` is an unconditional `setDoc(...)` helper:
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCreate.ts:71`
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCreate.ts:74`
- Therefore `useAppEnsure()` is:
  - safe enough for single-runtime onboarding
  - not a strong uniqueness guarantee under concurrent writers (TOCTOU race window between `getDoc` and `setDocument`)

### Practical risk profile (today)

- Low to medium operational risk in current model because:
  - app ids are defined in code, not user-submitted through a public create form
  - onboarding creates only the current runtime’s app id
- Higher risk if you later introduce:
  - multi-user app creation UI
  - arbitrary app-id entry
  - concurrent creators targeting the same Firebase project

### Exact failure mode (why this is not a strong claim)

Current flow is conceptually:
1. read `apps/{appId}`
2. if missing, write `apps/{appId}`

Under concurrent writers, both can observe "missing" and both can write.
That means:
- no duplicate docs (same Firestore doc id)
- but possible last-write-wins overwrite / incorrect "created" assumptions

This is acceptable for the current config-assigned onboarding model, but not for a future user-facing "create app" claim flow.

## 6) Canon Direction for `/apps` (Recommended Constraints)

If `/apps` is the top-level canon and should stay clean:

- One canonical route per concept:
  - `/apps` = collection
  - `/apps/:id` = app detail
  - `/docs/apps` = docs
  - `/dev/apps` = dev tooling only

- No aliases/stubs:
  - do not reintroduce `/apps/learn-more`
  - do not add redirect-only route shims during canon design

- Components should emit only canonical app routes:
  - app cards/CTAs should link to `/apps/:id` and `/docs/apps`
  - no alternate app detail path generation

## 7) Next Cleanup Checks (Apps-Focused)

These are not code changes yet, just checks to keep `/apps` clean:

1. Confirm no remaining runtime references to `/apps/learn-more` anywhere in `packages/` or `projects/`.
2. Decide whether app IDs should remain config-assigned (current model) or move to a future claim/registry if app creation becomes dynamic.
