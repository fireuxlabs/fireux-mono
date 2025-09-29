# FireUX Package Map

This doc defines who owns what, where modules are installed, how to import things, and the guardrails that keep us from double-installing modules or drifting on aliases.

## 1) Purpose + TL;DR rules

- Always load `fireux-core` exactly once, from the app configuration. Tenants must not install it.
- Canonical import paths:
  - Code and types use the same path: `<pkg>/runtime/...` (e.g. `fireux-core/runtime/...`).
  - Never import from `src` or `dist` across packages. Never use legacy/custom aliases like `#fireux-core-runtime`.
- Routing lives with the owning package: an extension that ships pages owns those routes. Don’t duplicate the same paths in a tenant/app.
- Use `#imports` only for Nuxt/Vue auto-imported APIs. For FireUX packages, use explicit package import paths.
- Composables remain pure (no toasts). Page components may show toasts.
- Dedup logic exists, but policy wins: don’t count on dedup to fix a wrong install graph.

## 2) Module ownership graph (who installs whom)

```
App (projects/*/*-app)
  └─ installs Tenant module(s) (packages/tenants/*)
       ├─ may install fireux-core
       └─ may install Extensions (packages/extensions/*)
```

Notes:

- Tenants may install extensions they own/need (e.g., `fireux-jobs`), but never `fireux-core`.
- The app always brings `fireux-core` via `createFireuxConfig`.

## 3) Installation matrix (where to add each package)

- fireux-core

  - Installed by the app via `createFireuxConfig` (always).
  - Tenants must never call `installModule('fireux-core')`.

- fireux-jobs, fireux-places (extensions)

  - Preferred: Installed by the tenant module(s) that use them, to keep apps simple.
  - Alternatively (thin tenants): install in the app’s `modules` list.
  - Never install the same extension in both tenant and app.

- Tenants (e.g. `fireux-misebox`, `fireux-cleanbox`)
  - Always installed by the app’s `modules` list.

### Examples

App nuxt.config (core from app only):

```ts
// projects/misebox/misebox-app/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig({
  ...createFireuxConfig({
    ecosystem: 'misebox',
    appName: 'Misebox',
    appShortName: 'Misebox',
    // Core is always included by createFireuxConfig
    modules: ['fireux-misebox'], // tenants/extensions added here as needed
    role: 'global',
  }),
})
```

Tenant module (no core install):

```ts
// packages/tenants/fireux-misebox/src/module.ts
import { defineNuxtModule, installModule, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  async setup(_, nuxt) {
    const resolver = createResolver(import.meta.url)

    // ❌ Do not: installModule('fireux-core')
    // ✅ Tenants may install extensions they own/need:
    await installModule('fireux-jobs')

    // configure runtime layers...
  },
})
```

## 4) Import map (canonical paths)

Use package-root runtime paths for everything (code and types) and avoid custom aliases.

- Composables

  - `import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'`
  - `import { useJobCreate } from 'fireux-jobs/runtime/composables/firestore/jobs/useJobCreate'`

- Components

  - `import OrganismsProfileRoot from 'fireux-core/runtime/components/organisms/OrganismsProfileRoot.vue'`

- Models/Types
  - `import type { Profile } from 'fireux-core/runtime/models/profile'`
  - `import type { Job } from 'fireux-jobs/runtime/models/job'`

Config-only APIs

- `import { createFireuxConfig } from 'fireux-core'`

Rules:

- Do not import from `src/` or `dist/` of another package.
- Do not use legacy aliases like `#fireux-core-runtime`.
- Type-only imports use the same path with `import type`.

## 5) Runtime aliases and toasts

**Use `#imports` only for Nuxt/Vue built-ins; never for FireUX packages.**
Use explicit package paths for FireUX (e.g., `fireux-core/runtime/...`).

- Nuxt UI toasts: page components may use them; composables should not. Keep domain logic side-effect-free.
  - Example usage in a page:

```ts
<script setup lang="ts">
const toast = useToast() // from @nuxt/ui auto-import
// ... on success
toast.add({ title: 'Created', color: 'green' })
</script>
```

## 6) Routing ownership

- fireux-core: provides layouts, utilities, base components. It doesn’t declare app pages by default.
- Tenants: own tenant-specific pages (e.g., Chefs, Suppliers for Misebox).
- Extensions: own feature pages they ship.
  - fireux-jobs: `/professionals`, `/employers` (and related nested routes).
  - fireux-places: place-related pages (e.g., `/places/*`) when present.

Rule: a route path must be owned by exactly one package in an app. Don’t shadow or duplicate it in the tenant/app layer.

## 7) Conflict-prevention rules

- Tenants must not install `fireux-core` (app owns core).
- Never install the same module in both the tenant and the app.
  - If tenant installs `fireux-core`, the app must set `includeCore: false` and must not list `fireux-core` directly.
  - If tenant installs an extension (e.g., `fireux-jobs`), the app must not also list it.
- Never depend on `src/` or `dist/` of another package—use runtime paths.
- Never use custom aliases like `#fireux-core-runtime`.
- Never define a page that conflicts with an extension’s route.
- Prefer policy over dedup: even though dedup keeps the last occurrence, don’t rely on it.

Verification tips:

- Nuxt public runtimeConfig contains `public.modules` (from `createFireuxConfig`); inspect it at runtime to confirm what’s loaded.
- Check the Nuxt route manifest (dev overlay or server logs) to ensure routes are coming from the expected layer.

## 8) Adding a new extension (step-by-step)

1. Scaffold `packages/extensions/fireux-<name>` with a Nuxt module that exposes a `runtime` dir (components, composables, pages, plugins as needed).
2. Ensure `src/config/pages-config.ts` (or equivalent) points to the extension’s `./runtime` folder for pages.
3. Export public APIs from `runtime/` only; avoid `src/`/`dist/` imports by consumers.
4. Add the extension as a dependency in the tenant(s) that use it and install via `installModule('fireux-<name>')` in the tenant module.
5. Do not add the extension to the app’s `modules` if the tenant installs it (self-contained mode).
6. Smoke test routes (e.g., `http://localhost:3000/<feature>`) and fix import paths if Vite can’t resolve them.
7. Add import examples to docs and keep them canonical (`<pkg>/runtime/...`).

## 9) CI/Lint suggestions (catch bad imports/double installs)

Simple bash checks we can wire into CI. Use `grep -R` (POSIX) or `rg` (ripgrep) if available.

- Ban custom runtime aliases and cross-package src/dist imports:

```bash
# Fail on legacy/custom FireUX aliases
if grep -R "#fireux-.*-runtime" packages projects; then
  echo "ERROR: Legacy FireUX alias detected" >&2; exit 1; fi

# Fail on importing src/ or dist/ of another package
if grep -R "from .*\/(src|dist)\/" packages projects; then
  echo "ERROR: Cross-package src/dist import detected" >&2; exit 1; fi
```

- Core ownership (app only):

```bash
# Fail if any tenant tries to install fireux-core
if grep -R "installModule(['\"]fireux-core['\"])" packages/tenants; then
  echo "ERROR: Tenants must not install fireux-core (app owns it)" >&2; exit 1; fi

# Fail if any app lists fireux-core in modules (createFireuxConfig already includes it)
if grep -R "['\"]fireux-core['\"]" projects/*/*/nuxt.config.ts; then
  echo "ERROR: Apps must not list fireux-core in modules; use createFireuxConfig" >&2; exit 1; fi

# Example for fireux-jobs duplication
TENANT_JOBS=$(grep -R "installModule(['\"]fireux-jobs['\"])" packages/tenants || true)
APP_JOBS=$(grep -R "['\"]fireux-jobs['\"]" projects/*/*/nuxt.config.ts || true)
if [ -n "$TENANT_JOBS" ] && [ -n "$APP_JOBS" ]; then
  echo "ERROR: fireux-jobs installed in both tenant and app" >&2; exit 1; fi
```

## 10) Quick PR checklist (reviewers)

- Install graph
  - [ ] Core comes from the app via `createFireuxConfig` (not listed in modules). Tenants do not install it.
  - [ ] Extensions are not listed in both tenant and app (choose one place).
- Imports
  - [ ] Only `<pkg>/runtime/...` imports used. No `src/` or `dist/` cross-package imports.
  - [ ] No legacy aliases like `#fireux-core-runtime`.
- Routing
  - [ ] Routes are owned by a single package; no duplicates or shadows.
- Code style
  - [ ] Composables have no UI side effects (no toasts). Toasts only in pages.
- Sanity
  - [ ] `public.modules` looks correct at runtime. Routes resolve in dev.

---

By following this map, we keep installs predictable, imports stable, and routes unambiguous across the monorepo.
