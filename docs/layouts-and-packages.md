# Layouts and Packages: how routes flow into layouts

This note explains where layouts come from, how extension pages (like Professionals/Employers) get discovered, and how to clone the setup for `/dev` pages.

## Sources of layouts

- fireux-core

  - Exposes layout components in `fireux-core/runtime/layouts` (CoreDefault, CoreDashboard, CoreDev, CoreDocs, CoreDesign).
  - config: `packages/core/fireux-core/src/config/layouts-config.ts`
    - Registers the directory as global components (`Core*`).
    - Registers Nuxt layout keys for `dashboard`, `dev`, `design`, `docs` when files exist on disk.
    - Intentionally does not register the `default` key to avoid colliding with the app’s own `app/layouts/default.vue`. Apps own their default.
  - default.vue component: `fireux-core/runtime/layouts/default.vue` can be used by apps or tenants as a component; it pulls `useCoreRoutes()` and merges incoming `routes` props with its own menu link sets.

- Tenants (Misebox, Cleanbox)

  - Each tenant exposes its own layout components under `packages/tenants/<tenant>/src/runtime/layouts`.
  - config: `<tenant>/src/config/layouts-config.ts`
    - Registers the layouts dir as global components, and (optionally) registers Nuxt layout keys (e.g., `MiseboxDefault`, `MiseboxDashboard`, `MiseboxDev`, etc.) if present.

- Extensions (Jobs, Places)
  - Extensions may expose layout components under their `runtime/layouts` folder and are registered as global components via their `layouts-config.ts`.
  - config: `<extension>/src/config/layouts-config.ts` uses `addComponentsDir` (no layout keys by default).

## Where routes come from (pages layers)

All packages that ship pages add their `runtime` as a Nuxt layer. This is how their pages/ layouts/ middleware are discovered by the app:

- Core: `packages/core/fireux-core/src/config/pages-config.ts`
- Tenants: `packages/tenants/*/src/config/pages-config.ts`
- Jobs extension: `packages/extensions/fireux-jobs/src/config/pages-config.ts`
- Places extension: `packages/extensions/fireux-places/src/config/pages-config.ts`

Each `configurePages` pushes a layer like:

```ts
nuxt.options._layers ||= []
nuxt.options._layers.push({
  cwd: resolver.resolve('./runtime'),
  config: { srcDir: resolver.resolve('./runtime') },
})
```

Nuxt merges these layers in order (module registration order), so all page files under each `runtime/pages` folder become part of the app’s router.

## Professionals and Employers routes

- Provided by: `fireux-jobs` extension
- Files:
  - Professionals
    - `packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue`
    - `packages/extensions/fireux-jobs/src/runtime/pages/professionals/[id].vue`
  - Employers
    - `packages/extensions/fireux-jobs/src/runtime/pages/employers/index.vue`
    - `packages/extensions/fireux-jobs/src/runtime/pages/employers/[id].vue`
- Layout usage: these pages use UPage/UPageBody/UPageSection and embed `OrganismsProfileRoot`. They render inside whatever the app’s current layout is (typically the app-level `app/layouts/default.vue`; core exposes `CoreDefault` as a component if apps/tenants want it).
- How they get into the app: Tenants (Misebox/Cleanbox) install `fireux-jobs`, which registers its `runtime` as a layer; thus, `/professionals` and `/employers` are available automatically.

## Dev pages for extensions

- Jobs ships a dev page: `packages/extensions/fireux-jobs/src/runtime/pages/dev/fireux-jobs.vue`
- This renders aggregate information for employers/professionals and is accessible under `/dev/fireux-jobs`.
- To copy this pattern for another extension, add:
  - `src/runtime/pages/dev/<ext-name>.vue` with your diagnostic UI
  - Ensure your module’s `configurePages` registers `./runtime` as a layer (see above)

## How to add a route into the default layout

- The default layout is owned by the app (app/layouts/default.vue). Pages from extensions/tenants will render inside it automatically.
- If you want to use Core’s default wrapper, use the component `CoreDefault` in your app’s layout:

```vue
<!-- app/layouts/default.vue -->
<template>
  <CoreDefault :routes="{ menuBarLinks, mobileLinks }" />
</template>
```

- The CoreDefault component merges `useCoreRoutes()` with any routes you pass as props, so links to `/professionals` and `/employers` will appear if your app/tenant provides those via their `useCoreRoutes` injection or your custom `routes` prop.

## Adding `/dev` options in your app/tenant

- Use core’s built-in `dev` layout key (registered by `fireux-core` when `runtime/layouts/dev.vue` exists) or define your own dev layout in the app.
- Add dev pages under `app/pages/dev/*.vue` for app-only tooling.
- For package-level dev pages (recommended), put them under `packages/<pkg>/src/runtime/pages/dev/*.vue` and ensure the package’s `configurePages` is active—then they appear under `/dev/<name>`.

## Summary (checklist)

- Core layouts/components registered globally; app owns the `default` layout key.
- Tenants add their runtime as a layer and may register layout keys.
- Extensions add their runtime as a layer; professionals/employers come from `fireux-jobs`.
- To expose diagnostics, add `runtime/pages/dev/<file>.vue` in your package and rely on the layer registration.
