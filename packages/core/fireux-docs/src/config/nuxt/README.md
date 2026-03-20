# Nuxt Config Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/config/nuxt` only.

Learn how `config/nuxt/` should be interpreted in FireUX module packages.

## Nuxt Config Directory

`nuxt/` would be a thin Nuxt-specific support seam inside `config/`.

It is not part of the current aligned live repo pattern.

## What Would Belong Here

- thin Nuxt-specific support helpers
- compatibility wrappers that are clearly smaller than `config/module/`

## Aligned In Repo

- `config/nuxt/` is documented as a possible support seam
- it is not part of the current aligned live FireUX package pattern

## Not Aligned Yet

- `config/nuxt/` is not currently used by the real FireUX packages
- it should not be treated as a standard config subdirectory

## Roadmap To Reconciliation

1. Do not recreate `config/nuxt/` by default.
2. Add it only if a future package has a clear and narrow case.
3. Define that case before treating it as a live support seam.

## Short Version

`config/nuxt/` is a questioned seam, not part of the current aligned model.
