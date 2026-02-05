# FireUX — Extensions Scan (Codex Thread)

Status: **Active**
Version: **v1**
Updated: 2026-02-05

Purpose:
- Compare `packages/extensions/fireux-products` against other extensions.
- Capture inconsistencies/opportunities in the extensions system.
- Keep this practical: conventions we should follow + paper cuts to fix later.

Scope scanned:
- `packages/extensions/fireux-products`
- `packages/extensions/fireux-{blogs,companies,drop,jobs,kitchens,places}`

---

## 1. Baseline Extension Shape (Observed)

Common structure across extensions:
- `package.json` + `registry.json`
- `src/module.ts`
- `src/config/module/*-config.ts` (configure runtime, pages, models, etc.)
- `src/runtime/{components,composables,models,pages,server}`

Every extension is a Nuxt module that:
- Configures runtime defaults (via `configureRuntime` or similar).
- Wires components/composables/models/pages.
- May expose a runtime alias (`#fireux-<ext>`) (currently inconsistent).

---

## 2. fireux-products vs The Pack (What Matches / What Doesn’t)

What matches well:
- Same “configureX” pattern as `fireux-blogs` (runtime buckets + runtime alias).
- Runtime is already split cleanly: models, composables, pages, server.
- Permissions composable mirrors `useBlogPermissions` shape (good consistency).

What diverges (worth noting):
- `src/module.ts` uses `nuxt/kit` imports and declares `NuxtConfig.products`, like `fireux-blogs`/`fireux-drop`.
- Other “core entity” extensions (`places`, `kitchens`, `jobs`, `companies`) use `@nuxt/kit` and `configKey: 'fireuxX'`.
- `configKey` naming is not consistent across the repo:
  - `blogs` → `blogs`
  - `drop` → `drop`
  - `products` → `products`
  - `places/jobs/kitchens/companies` → `fireuxPlaces` / `fireuxJobs` / …
- `fireux-products` ships a Stripe server handler at `packages/extensions/fireux-products/src/runtime/server/api/stripe/create-product.post.ts`,
  but `packages/extensions/fireux-products/src/config/module/server-config.ts` is currently a no-op (Places registers endpoints explicitly).
- Route naming drift: `fireux-blogs` injects route names as `fireux-blog-*` (singular) while others use plural package naming.
- Ecosystem modules now set runtime defaults for `fireux.products` + `fireux.blogs`, and app config can override via module options.

Interpretation:
- There are currently **two module “styles”** in the repo, and `products` aligns with `blogs/drop`.

---

## 3. Job 1 — How We Should Build fireux-products In Line With Others

Recommended “do this next” for `fireux-products` (in order):

1. Make the module “truthy” in docs:
   - Update `packages/extensions/fireux-products/package.json` description (it’s currently TODO).
   - Update `packages/extensions/fireux-products/README.md` from template → real guardrails (what it owns, what it does not).
   - Keep `registry.json` accurate (id/name/team are already fine).

2. Decide which module style we standardize on (don’t bike-shed, just pick):
   - Option A: “domain config keys” (`products`, `blogs`, `drop`) for content-ish modules.
   - Option B: “fireuxX config keys” (`fireuxProducts`, `fireuxBlogs`, …) for everything.
   - Either is fine; the problem today is inconsistency, not the choice.

3. Confirm runtime contract:
   - The Product model is already Firestore-shape oriented (`FirebaseProduct`).
   - It includes Stripe concepts (`prices`, `default_price`, `STRIPE_API_VERSION`), so the module should clearly state:
     - “This package can be used without Stripe enabled, but supports Stripe integration.”
     - Where Stripe lives (`src/runtime/server/stripe/*`).

4. Server surface:
   - Decide whether extension server routes are:
     - explicitly registered (Places model via `addServerHandler`), or
     - layer-discovered (and then verify it once).
   - If we standardize on explicit registration, add Stripe endpoints to `fireux-products` server-config.

5. Page surfaces:
   - Products has runtime pages for `/products`, `/products/create`, `/products/:slug`, `/dev/fireux-products`.
   - The module currently injects only `/products` and `/products/:slug`.
   - This is consistent with `fireux-blogs` (injects only index + slug) and relies on runtime layer inclusion for the rest.
   - If we want “explicit is better”, we should either:
     - Inject all module routes (companies-style), or
     - Stop injecting and rely on runtime layer for all routes.

---

## 4. Job 2 — Inconsistencies / Paper Cuts Across Extensions

### 4.1 Mixed Nuxt Kit Import Style

Observed:
- Some modules use `@nuxt/kit` + `@nuxt/schema`.
- Others use `nuxt/kit` + `nuxt/schema`.
- Some packages even mix styles internally (module uses `nuxt/kit`, config helpers use `@nuxt/kit` types).

Impact:
- Harder to enforce a single template for new extensions.
- Potential for subtle type duplication / “two Resolver types” issues.

### 4.2 Mixed configKey Strategy

Observed:
- `configKey` alternates between plain domain keys and `fireuxX`.

Impact:
- Harder to guess where options live in `nuxt.config.ts`.

### 4.3 Version mismatches

Observed:
- `packages/extensions/fireux-jobs/package.json` is `0.1.0`, but `packages/extensions/fireux-jobs/src/module.ts` advertises `meta.version: 1.0.0`.

Impact:
- Drift smell and upgrade confusion (meta and package should agree).

### 4.4 Module meta compatibility mismatch

Observed:
- `fireux-products` / `fireux-blogs` / `fireux-drop` declare:
  - `compatibility: { nuxt: '^4.0.0' }`
- But their `package.json` peerDependency is `nuxt: ^4.1.0`.

Impact:
- Minor, but it’s drift.

### 4.5 Redundant wiring (copy/paste debt)

Observed:
- `fireux-products`, `fireux-blogs`, `fireux-companies`:
  - `configureComposables(...)` already calls `registerComposablesDir(...)` which calls `addImportsDir(...)`,
  - but module.ts also calls `addImportsDir('./runtime/composables')` again.
- Some modules ensure the runtime layer in both `configurePages(...)` and again inside `register*Pages(...)`.

Impact:
- Not broken, just noisy and makes future module templates harder to keep clean.

### 4.6 Route naming inconsistency

Observed:
- `fireux-blogs` injects route names `fireux-blog-*` (singular),
  while other modules use plural package naming (`fireux-products-*`, `fireux-companies-*`).

Impact:
- Minor, but makes route discovery + grep harder.

### 4.7 Server registration inconsistency

Observed:
- Places explicitly registers API handlers in `packages/extensions/fireux-places/src/config/module/server-config.ts`.
- Products ships `runtime/server/api/stripe/create-product.post.ts`, but `packages/extensions/fireux-products/src/config/module/server-config.ts` is currently a stub.

Impact:
- Hard to predict whether a module’s server surface is “real” without reading multiple files.

### 4.8 Missing TypeScript references

Observed:
- `packages/extensions/tsconfig.json` references most extensions but omits `fireux-companies`.

Impact:
- IDE/build tooling can be inconsistent depending on how references are used.

### 4.9 Template READMEs / TODO descriptions

Observed:
- `fireux-products`, `fireux-blogs`, `fireux-drop` still have template readmes and TODO descriptions.

Impact:
- These modules are easiest to misunderstand and misuse because their docs are not asserting guardrails.

### 4.10 Over-broad peerDependencies (possible)

Observed:
- Several extensions include `stripe` + `h3` + `@vueuse/core` in peerDeps even if the extension doesn’t obviously use them.
  - Example: `fireux-drop` includes `stripe` in peerDeps but currently ships almost no runtime/server logic.

Impact:
- Not a runtime bug, but adds conceptual noise and can complicate upgrades.

---

## 5. Open Questions (Answer When Convenient)

1. Should “content modules” (`blogs/products/drop`) intentionally use domain config keys (`blogs`, `products`, `drop`) while “entities” use `fireuxX`?
2. Do we want a single extension template we follow going forward?
3. Should we tighten peerDeps on thin modules (like `drop`) or keep a “standard peerDeps set” for simplicity?

---

## 6. Updates (2026-02-05)

Changes applied for canonical alignment and future consistency:
- **Canonical wiring helper:** added `configureFireuxModule(...)` in `fireux-core` and migrated all extension `module.ts` to use it (runtime → plugins → composables → components → layouts → models → pages → server).
- **No runtime aliases:** removed `#fireux-*` runtime alias usage and switched internal imports to `fireux-<ext>/runtime/*`.
- **Core module order standardized:** core module now follows the same order and uses typed `configurePages(resolver, nuxt)`.
- **`fireux-drop` config parity:** added `src/config/module/*-config.ts` files for `fireux-drop` to match other extensions.
- **Glob-based page filtering:** added `filterPagesByGlob(...)` to core pages-config and used it in misebox to avoid manual file checks.

Still unique / follow-up:
- Ecosystem packages (`fireux-cleanbox`, `fireux-misebox`, `fireux-fireux`, `fireux-ecosystem-controller`) still have custom config layout + alias usage; decide if they should follow the same canonical module wiring.
