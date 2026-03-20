# Source Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src` only.
Does not apply to consuming apps under `projects/*/*`.

This page begins inside `src/`.
Package-root files are defined one level up in `../README.md`.

Learn how `src/` is structured across FireUX module packages and how each top-level source surface should be read.

## Source Directory

`src/` is the authored source root for a FireUX package.

This is where the Nuxt module entrypoint, runtime delivery, and any justified support surfaces live.

## Source Structure

```text
src/
├─ module.ts
├─ runtime/
├─ config/
└─ types/
```

This is the standard source envelope.

- `module.ts` and `runtime/` are the real spine.
- `config/` and `types/` are optional support.
- not every package needs every support surface

## Module Entrypoint

`module.ts` is the Nuxt module entrypoint for the package.

It should be the top of the package spine.

## Runtime Directory

`runtime/` is the main delivery surface inside `src/`.

This is where the package actually lands in Nuxt app space.

## Config Directory

`config/` is support space inside `src/`.

Use it for setup and wiring support when the package genuinely needs it.

It is not a second spine.

## Types Directory

`types/` is optional support inside `src/`.

Use it only where the package exposes true shared public contracts.

It should not become a dumping ground for runtime-local typing.

## Aligned In Repo

- every current FireUX module package uses `src/`
- every current FireUX module package has `src/module.ts`
- every current FireUX module package has `src/runtime/`
- most extension and ecosystem packages also use `src/config/`
- narrower packages such as `fireux-ecosystem-controller` and `fireux-nuxtfire` still fit this reading without every support surface

## Not Aligned Yet

- `packages/core/fireux-core/src/types` still carries the main remaining support-surface question
- `src/types/` is not yet a collective package pattern across the repo
- support-surface rules are still being tightened so `config/` and `types/` stay helpful rather than turning into parallel systems

## Roadmap To Reconciliation

1. Keep `src/` read as one module entrypoint, one runtime spine, and optional support.
2. Keep `module.ts` and `runtime/` treated as the real structural spine.
3. Keep `config/` and `types/` treated as support only.
4. Continue narrowing `fireux-core/src/types` toward a clear public-contract role.
5. Keep extension and ecosystem packages aligned to the same `src/` reading without forcing identical contents.

## Short Version

`src/` is the authored source root for FireUX module packages.

It should read as:
- one entrypoint
- one runtime
- small optional support
