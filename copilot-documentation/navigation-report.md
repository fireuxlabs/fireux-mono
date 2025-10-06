# Misebox Navigation Report

## Scope

Snapshot of the routing assets that drive the Misebox landing page (`/`) navigation and the menu items that should appear in the default header. Includes suggested diagnostics for tracing missing links.

## Key Files

- `projects/misebox/misebox-app/app/pages/index.vue`
  - Declares the landing page and sets `definePageMeta` with `nav` key `home` and `layouts: ['default']`.
- `projects/misebox/misebox-app/app/layouts/default.vue`
  - Nuxt layout shim that renders `<MiseboxDefault />`.
- `packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDefault.vue`
  - Tenant layout component that delegates rendering to `<CoreDefault />`.
- `packages/core/fireux-core/src/runtime/layouts/default.vue`
  - Core layout (`CoreDefault`) that mounts the shared header/footer components.
- `packages/core/fireux-core/src/runtime/components/layouts/default/Header.vue`
  - Header component calling `useNav(['default'])` to fetch desktop/mobile items for the default layout.
- `packages/core/fireux-core/src/runtime/composables/app/nav.ts`
  - Nav composable that filters router records by `meta.nav.layouts` and exposes `desktop`/`mobile` arrays.
- `packages/core/fireux-core/src/runtime/pages/products/index.vue`
  - Provides the `products` nav item (`/products`) with `layouts: ['default']`.
- `packages/core/fireux-core/src/runtime/pages/blog/index.vue`
  - Provides the `blog` nav item (`/blog`) with `layouts: ['default']`.

## Expected Default-Layout Nav Items

| Key        | Path        | Source file                                                      | Notes                             |
| ---------- | ----------- | ---------------------------------------------------------------- | --------------------------------- |
| `home`     | `/`         | `projects/misebox/misebox-app/app/pages/index.vue`               | Landing page for Misebox.         |
| `products` | `/products` | `packages/core/fireux-core/src/runtime/pages/products/index.vue` | Core catalog view, desktop/mobile |
| `blog`     | `/blog`     | `packages/core/fireux-core/src/runtime/pages/blog/index.vue`     | Core blog landing page.           |

> All three routes set `desktop: true`, `mobile: true`, and `layouts: ['default']`, so they should surface in both header menus when bundled into the Misebox app via `createFireuxConfig`.

## Suggested Debug Logging

- Inside `packages/core/fireux-core/src/runtime/components/layouts/default/Header.vue`:
  - Add a temporary `watchEffect` to `console.debug('[nav] desktop items', desktop.value)` and `console.debug('[nav] mobile items', mobile.value)` to confirm the computed arrays.
- Inside `packages/core/fireux-core/src/runtime/composables/app/nav.ts`:
  - Log the raw router records with `meta.nav` (`router.getRoutes().filter((r) => r.meta?.nav)`) to ensure Misebox routes are registered and deduped as expected.
  - Emit a warning when `nav.layouts` is missing or empty to catch misconfigured pages.
- In `projects/misebox/misebox-app/app/pages/index.vue` (development only):
  - Use `onMounted(() => console.debug('[misebox:index] page meta', useRoute().meta))` to verify the `nav` block matches the schema after hydration.
- While running the app, enable Nuxt route tracing (`NUXT_DEBUG=true pnpm dev:misebox`) to watch route registration order and confirm the default layout resolves `CoreDefault` before nav is computed.
