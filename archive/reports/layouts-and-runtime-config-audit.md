# FireUX Layouts & Runtime Config Audit (Phase D)

Date: 2025-08-30
Repo root: /Users/danielwatson/Dev/fireux
Scope scanned: packages/_/_

## Executive summary

- Risk level: Medium.
- Layout keys collide across layers for `default`, `dashboard`, and `dev` (core vs. tenant-specific patterns). Tenants use prefixed filenames (e.g., MiseboxDefault.vue) which avoids direct key clashes, but core ships `default.vue`, `dashboard.vue`, and `dev.vue`; pages using `layout: 'design'` exist without a corresponding `design.vue` layout in core, indicating a probable broken or missing layout.
- Runtime config usage is mostly standardized via a helper `configureRuntime(nuxt, key, defaults?)`. Apps use `createFireuxConfig(...)` in their nuxt.config.ts, but the factory file is not present in the repository (referenced path 404). This is a drift risk.

---

## PART A — Layouts audit (collision & usage)

### Layout files discovered

- /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/runtime/layouts/default.vue (key: default)
- /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/runtime/layouts/dashboard.vue (key: dashboard)
- /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/runtime/layouts/dev.vue (key: dev)
- /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/runtime/layouts/docs.vue (key: docs)
- /Users/danielwatson/Dev/fireux/packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDefault.vue (key: MiseboxDefault)
- /Users/danielwatson/Dev/fireux/packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDashboard.vue (key: MiseboxDashboard)
- /Users/danielwatson/Dev/fireux/packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDev.vue (key: MiseboxDev)
- /Users/danielwatson/Dev/fireux/packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDefault.vue (key: CleanboxDefault)
- /Users/danielwatson/Dev/fireux/packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDashboard.vue (key: CleanboxDashboard)
- /Users/danielwatson/Dev/fireux/packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDev.vue (key: CleanboxDev)

Notes:

- Tenant layout filenames are prefixed; Nuxt layout key is filename without extension (e.g., `MiseboxDefault`). These do not collide with core’s simple keys (`default`, `dashboard`, `dev`).

### Pages with explicit layout

Found definePageMeta({ layout: 'design' }) in core pages:

- /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/runtime/pages/dev/design/atoms/colors.vue → layout: design
- /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/runtime/pages/dev/design/atoms/tokens.vue → layout: design
- /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/runtime/pages/dev/design/atoms/typography.vue → layout: design

Potential issue: No layout file named `design.vue` was found under core runtime layouts. These pages likely reference a non-existent layout, falling back to default or erroring, depending on Nuxt behavior. Flagged as drift.

No other explicit layout declarations found in scanned pages under packages/_/_/src/runtime/pages.

### Default layout behavior per package

- core/fireux-core: ships `default.vue`. Pages without explicit layout will use this by default.
- tenants/fireux-misebox: ships `MiseboxDefault.vue`. Unless mapped, this is not the default key `default`, so tenant pages without meta will likely use the app/layer default (core `default.vue`) unless they explicitly set `layout: 'MiseboxDefault'`.
- tenants/fireux-cleanbox: ships `CleanboxDefault.vue`. Same as above; not the `default` key.

### Layer registration and order

From module pages configuration:

- /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/config/pages-config.ts adds a layer via:
  - nuxt.options.\_layers.push({ cwd: resolver.resolve('../runtime') })
- /Users/danielwatson/Dev/fireux/packages/tenants/fireux-misebox/src/config/pages-config.ts manually extends pages with `extendPages` (file-by-file). It does not register a layer that includes layouts; only pages are injected. Therefore, Misebox layouts may not be auto-discovered as layouts unless elsewhere registered.
- No `pages-config.ts` detected for places module; jobs has its own but not read here; tenants/cleanbox has a config file present (not inspected for layer registration; assumed similar to Misebox based on filename), ambiguity noted.

Effective order heuristic (based on pushes and typical module order):

1. fireux-core runtime layer is registered (includes pages/layouts).
2. Tenants inject pages via `extendPages` (does not contribute layouts by default).
3. Extensions (jobs/places) appear not to add layout layers either (not scanned in depth here; ambiguity noted).

Shadowing risk: Low for tenant-prefixed layout keys. Medium for core `default`, `dashboard`, `dev` if any other package ships a same-key file via a true layer add. Currently, only core adds a layout-capable layer.

### Duplicate keys and risks

- Core vs tenants:
  - Duplicate intent for `default`/`dashboard`/`dev` exists conceptually, but filenames differ; no direct key collision.
- Missing layout key `design` referenced by core pages; no corresponding layout file found.

Recommendations (report-only):

- Keep `default.vue` only in core and document that tenants must use explicit, prefixed layout keys (e.g., `layout: 'MiseboxDashboard'`).
- If tenants want their layout to be default, consider adding a mapping layer or shipping `default.vue` in tenant runtime and ensuring layer registration order supersedes core (trade-offs documented).
- Add or remove `design.vue` accordingly or adjust pages to use an existing layout.

---

## PART B — Nuxt config vs runtime helper drift

### Core runtime helper shape

- File: /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/config/runtime-config.ts
- API: `configureRuntime(nuxt, key, defaults = { enabled: true })`
- Behavior: Ensures `nuxt.options.runtimeConfig.public.fireux[key]` exists and assigns defaults if empty.

### Helper usage per package

- core/fireux-core/src/module.ts → `configureRuntime(nuxt, 'core')`
- extensions/fireux-jobs/src/module.ts → `configureRuntime(nuxt, 'jobs')`
- extensions/fireux-places/src/module.ts → `configureRuntime(nuxt, 'places')`
- tenants/fireux-misebox/src/module.ts → `configureRuntime(nuxt, 'misebox')`
- tenants/fireux-cleanbox/src/module.ts → `configureRuntime(nuxt, 'cleanbox')`

Manual runtimeConfig mutations detected: none in current module.ts files (tenants previously mutated directly; now using helper).

Resulting runtime keys expected:

- public.fireux.core, public.fireux.jobs, public.fireux.places, public.fireux.misebox, public.fireux.cleanbox

### createFireuxConfig factory

- Referenced in app configs:
  - /Users/danielwatson/Dev/fireux/projects/misebox/niederhorn/nuxt.config.ts
  - /Users/danielwatson/Dev/fireux/projects/misebox/misebox-app/nuxt.config.ts
  - /Users/danielwatson/Dev/fireux/projects/cleanbox/cleanbox-app/nuxt.config.ts
  - /Users/danielwatson/Dev/fireux/projects/cleanbox/richies-reinigung/nuxt.config.ts
- Expected location: /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/config/fireux-config.ts
- Status: Not found in repository (404). Ambiguity: The factory may exist under a different path or was removed. This creates drift between apps and core.

Apps reading runtimeConfig.public.fireux: No direct reads detected in nuxt.config.ts files scanned.

Drift observations:

- Apps rely on `createFireuxConfig` but the implementation is missing. Suggest locating or restoring this factory; otherwise update app configs to inline the intended options.
- No mismatched runtime key names detected across modules vs. helper calls.

---

## PART C — Components vs layouts name conflicts

Policy: single Fire prefix for components; tenant layouts use tenant-prefixed filenames.

Check:

- Searched component filenames under packages/_/_/src/runtime/components and layout keys. No identical names between a layout key and a component filename within the same package were observed.
- Verdict: Component prefixing appears OK; only layout keys need namespacing. No conflicts found.

---

## PART D — Layer order & shadowing analysis

- Registered layer add found only in core (pages-config.ts), which likely makes core’s runtime provide pages and layouts globally.
- Tenants (e.g., Misebox) add pages via `extendPages` and do not register their runtime as a layer with layouts. Therefore their `Misebox*.vue` layouts may not be auto-discoverable by Nuxt as layouts unless elsewhere wired. This is a potential configuration gap.
- Effective load order by heuristic: core first (layer), tenants/extensions inject pages only. No active shadowing detected due to layout key namespaces.

---

## Runtime Keys Map

| Package                  | Helper used? | Key      | Defaults          | Manual mutations? | Apps referencing                        |
| ------------------------ | ------------ | -------- | ----------------- | ----------------- | --------------------------------------- |
| core/fireux-core         | Yes          | core     | { enabled: true } | No                | N/A                                     |
| extensions/fireux-jobs   | Yes          | jobs     | { enabled: true } | No                | N/A                                     |
| extensions/fireux-places | Yes          | places   | { enabled: true } | No                | N/A                                     |
| tenants/fireux-misebox   | Yes          | misebox  | { enabled: true } | No                | Apps load module via createFireuxConfig |
| tenants/fireux-cleanbox  | Yes          | cleanbox | { enabled: true } | No                | Apps load module via createFireuxConfig |

Notes:

- `createFireuxConfig` is missing; multiple apps import it. High drift potential until resolved.

---

## Duplicate Keys & Risk

- Missing layout key: `design` (used by core dev/design pages) — no `design.vue` found in core layouts.
- Core ships canonical `default`, `dashboard`, and `dev`. Tenants ship `MiseboxDefault/CleanboxDefault` etc., avoiding key duplication. Risk is mainly discovery/config wiring, not key collisions.

---

## Suggested conventions (report-only)

- Default ownership: keep `default.vue` exclusively in core; tenants/extensions should use prefixed layout keys and reference explicitly via `definePageMeta({ layout: '<TenantPrefix>Default' })`.
- If tenant wants a different default, register a runtime layer for tenant before core or ship a tenant `default.vue` and ensure layer order precedence (documented trade-offs).
- Add missing `design.vue` or update dev/design pages to an existing layout.
- Ensure tenant modules register their runtime as a Nuxt layer when layouts are needed (not only `extendPages`).
- Restore or relocate `createFireuxConfig` to the referenced path or adjust apps to a new API.

---

## Appendix — Commands used

```
# Layouts
find packages -path "*/src/runtime/layouts/*.vue"

# Pages declaring layout
git grep -n "definePageMeta({ layout" -- "packages/*/*/src/runtime/pages"

git grep -n "layout:" -- "packages/*/*/src/runtime/pages"

# Module and pages config scan
git grep -n "configureRuntime(" -- "packages/*/*/src"

# Layer registration hints
git grep -n "_layers.push" -- "packages/*/*/src/config"

# App nuxt configs
find projects -path "*/nuxt.config.ts"

# createFireuxConfig references
git grep -n "createFireuxConfig" -- "projects/*/*/nuxt.config.ts" "packages/*/*/src"
```
