# Runtime Directory

Authority: Operational
Updated: 2026-03-23
Scope: `packages/*/fireux-*/src/runtime` only.
Does not apply to consuming app `app/`, `server/`, or root `public/` directories.

Learn how `runtime/` is structured across FireUX module packages.

## Runtime Directory

`runtime/` is the main delivery surface inside a FireUX module.

If `module.ts` is the entrypoint, `runtime/` is where the package actually lands in Nuxt app space.

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

Not every package needs every runtime subdirectory.

## assets Directory

`assets/` contains build-processed runtime assets shipped by the package.

## components Directory

`components/` contains Vue components delivered by the package at runtime.

## concepts Directory

`concepts/` contains cross-cutting runtime behaviour canon when a concept spans pages, components, composables, and related runtime layers.

Current examples:
- `concepts/create/`
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

If structure becomes unclear, `runtime/` should usually be treated as the primary reference point.
