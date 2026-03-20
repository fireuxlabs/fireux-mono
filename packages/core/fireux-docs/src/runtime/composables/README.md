# Composables Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/runtime/composables` only.

Learn how `runtime/composables/` is used across FireUX module packages.

## Composables Directory

`composables/` contains runtime composables shipped by the package.

## What Belongs Here

- runtime feature composables
- package-owned logic used by pages, components, and runtime flows
- composables that belong to delivery rather than setup support

## Aligned In Repo

- `runtime/composables/` is one of the strongest shared runtime patterns in the repo
- extensions and ecosystems already use it for delivered logic, hooks, and runtime behavior

## Not Aligned Yet

- grouping still varies by package
- runtime-local types and helpers still need to stay close to the features that own them

## Roadmap To Reconciliation

1. Keep composables delivery-first.
2. Keep setup support in `config/`, not here.
3. Keep feature-local details close to their composables when that is clearer.

## Short Version

Delivered runtime composables belong here.
