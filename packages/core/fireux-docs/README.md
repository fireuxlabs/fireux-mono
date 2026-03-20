# FireUX Package Spine

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*` package roots only.
Does not apply to consuming apps under `projects/*/*`.

Learn how FireUX module packages are structured at package-root level.

## Package Root

FireUX packages are Nuxt modules.

Each package exposes its functionality through a single `src/` directory.
Nuxt owns the application layer. FireUX extends from module space.

## Package Structure

```text
fireux-package/
├─ package.json
├─ registry.json
├─ tsconfig.json
└─ src/
```

`node_modules/` may exist locally, but it is not part of the authored package structure.

## package.json

`package.json` defines package identity, exports, scripts, and dependencies.

It should point the package root at the module surface inside `src/`.

## registry.json

`registry.json` defines FireUX package metadata used by FireUX tooling and registration.

It must stay descriptive.
It must not become a second config system.

## tsconfig.json

`tsconfig.json` defines the local TypeScript boundary for the package.

It should extend the repo root config without redefining package structure.

## node_modules Directory

`node_modules/` is a local install artifact.

It is not an authored package surface and should not be treated as part of the FireUX structure.

## src Directory

`src/` is the single authored module surface for the package.

The internal structure of `src/` is defined in `src/README.md`.

## Aligned In Repo

- all current FireUX packages use a minimal package root
- all current FireUX packages expose a single `src/` module surface
- `package.json` is standard across FireUX packages
- `registry.json` and `tsconfig.json` are normal package-root support files where used

## Not Aligned Yet

- there is no active package-root drift at the moment
- remaining reconciliation now happens inside `src/`, not at package root

## Roadmap To Reconciliation

1. Keep package roots minimal.
2. Keep `src/` as the single authored module surface.
3. Do not introduce new top-level package systems.
4. Keep this page aligned with the real repo.

## Short Version

A FireUX package is a Nuxt module with:
- a minimal root
- a single `src/` module surface

All deeper structure lives inside `src/`.
