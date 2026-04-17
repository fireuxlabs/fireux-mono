# Runtime Directory

Authority: Operational
Updated: 2026-04-17
Scope: `packages/*/fireux-*/src/runtime` only.
Does not apply to consuming app `app/`, `server/`, or root `public/` directories.

Learn how `runtime/` is structured across FireUX module packages.

## Runtime Directory

`runtime/` is the main delivery surface inside a FireUX module.

If `module.ts` is the entrypoint, `runtime/` is where the package actually lands in Nuxt app space.

## Two Runtime Spines

There are two related but different ways to think about `runtime/` in this repo.

### Nuxt Runtime Spine

Plain Nuxt runtime structure is:

```text
runtime/
├─ assets/
├─ components/
├─ composables/
├─ layouts/
├─ middleware/
├─ models/
├─ pages/
├─ plugins/
├─ public/
├─ server/
└─ utils/
```

This is the base runtime surface shape.

### FireUX Runtime Spine

FireUX keeps that Nuxt runtime spine and adds one important cross-layer surface:

```text
runtime/
├─ assets/
├─ components/
├─ concepts/
├─ composables/
├─ layouts/
├─ middleware/
├─ models/
├─ pages/
├─ plugins/
├─ public/
├─ server/
└─ utils/
```

The important distinction is:

- Nuxt gives the runtime surfaces
- FireUX adds `concepts/` for cross-layer canon

That means:

- `models/`, `components/`, `composables/`, `pages/`, and `server/` still describe runtime layers
- `concepts/` is the FireUX layer used when one canon spans more than one runtime layer

## Runtime Structure

```text
runtime/
├─ assets/
├─ components/
├─ concepts/
├─ composables/
├─ layouts/
├─ middleware/
├─ models/
├─ pages/
├─ plugins/
├─ public/
├─ server/
└─ utils/
```

This is the FireUX runtime spine, not just the plain Nuxt one.

Not every package needs every runtime subdirectory, but `concepts/` is the main FireUX addition when cross-layer canon needs a real home.

## assets Directory

`assets/` contains build-processed runtime assets shipped by the package.

## components Directory

`components/` contains Vue components delivered by the package at runtime.

## concepts Directory

`concepts/` contains cross-cutting runtime behaviour canon when a concept spans pages, components, composables, models, server seams, and related runtime layers.

This is the key FireUX addition to the plain Nuxt runtime spine.

Current examples:

- `concepts/create/`
- `concepts/connect/`
- `concepts/read/`
- `concepts/update/`

## composables Directory

`composables/` contains runtime composables shipped by the package.

## layouts Directory

`layouts/` contains package-owned Nuxt layouts when the package genuinely delivers them.

## middleware Directory

`middleware/` contains runtime route middleware delivered by the package.

## models Directory

`models/` contains domain models used by delivered runtime behavior.

## pages Directory

`pages/` contains package-delivered Nuxt pages and route surfaces.

## plugins Directory

`plugins/` contains runtime plugins shipped by the package.

## public Directory

`public/` contains static public files delivered by the package runtime.

## server Directory

`server/` contains package-delivered server routes, handlers, and server-only support code.

Recent repo truth:

- runtime drift inspection now uses a dev-only server seam for collection snapshotting
- collection managers remain component-owned, but direct subcollection discovery is now a runtime server concern
- console family visibility is now an app-config concern through `consoleFamilies`
- ecosystem apps now use a clear database split:
  - `(default)` is the registry/public-mirror database for `project` and `ecosystem`
  - the named ecosystem database is the operational database, including canonical `apps`
- the generic console shell now lives in the runtime seam:
  - `useConsoleState()` is the shared console-layout contract
  - `useRuntimeXConsole()` adapts each family into that shared contract
- the generic console data seam now also lives in the runtime seam:
  - `useConsoleXData()` owns mode split, pending composition, ready state, and the final `{ data }` return shape
  - `useRuntimeXData()` adapts each family by composing family fetch seams into that shared contract
- main console page ownership is now explicit:
  - the shared console layout and generic runtime seam live in core
  - `Project` main console pages are app-owned
  - `Kitchen`, `Portfolio`, and `Supplier` main console pages are domain-owned
- console-backed runtime now treats `live` and `demo` as runtime modes rather than separate console architectures
- `/console/X` is now the shared family entry seam:
  - `demo` shows demo targets
  - `test` shows test targets
  - `live` shows the current user's real targets for that family
- `/console/X/overview` is the selected-target workspace overview seam
- the runtime model layer is now normalized around simple stored-shape contracts:
  - root, system, domain-root, and scoped families use `XModel`, `X`, `XCreateInput`, `XUpdateInput`
  - identity overlays use `AppXModel` and `AppX`
  - console overlays use `ConsoleXModel` and `ConsoleX`
- hydrated or combined read shapes now belong in fetch, runtime, and interface seams rather than in model files

## utils Directory

`utils/` contains shared runtime utilities when they genuinely belong to a shared runtime surface.

## Aligned In Repo

- every current FireUX module package has `src/runtime/`
- `pages/`, `composables/`, `components/`, and `models/` are the strongest shared runtime patterns
- `concepts/` is valid when a behaviour has outgrown any single runtime surface
- `public/`, `server/`, `plugins/`, `layouts/`, `assets/`, `middleware/`, and `utils/` are valid but optional runtime surfaces
- `runtime/models/` is already a normal and valid pattern across core, extensions, and ecosystems

## Not Aligned Yet

- some runtime child directories are common and some are selective, so they should not be forced into symmetry
- runtime-only details still need to stay close to the feature that owns them instead of recreating generic internal buckets

## Roadmap To Reconciliation

1. Keep `runtime/` as the main delivery surface.
2. Keep common runtime directories explicit.
3. Keep optional runtime directories optional.
4. Keep runtime-only details close to their owning features.

## Short Version

`runtime/` is where a FireUX module actually delivers behavior.

Nuxt gives the base runtime spine.

FireUX keeps that spine and adds `concepts/` as the place where cross-layer canon can live.

If structure becomes unclear, `runtime/` should usually be treated as the primary reference point.
