# Types Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/types` only.
Does not apply to runtime-local or config-local type files that live beside the features that use them.

Learn how `types/` should be used across FireUX module packages.

## Types Directory

`types/` is optional support for true shared public contracts.

It is not the place where all TypeScript types go.

## Types Structure

```text
types/
```

When `types/` exists, it should stay narrow.
Small subdirectories are only justified if they make a public contract surface clearer.

## Public Contracts

Use `types/` for contracts that other packages or apps import directly.

This is the public type surface of a package, not a local convenience bucket.

## Local Types

Runtime-local types should stay with the runtime feature that owns them.

Config-local types should stay with the config helper that owns them.

## Aligned In Repo

- `fireux-core` already exposes real shared contracts from `src/types/`
- extensions and ecosystems already consume some of those contracts directly
- most packages do not have top-level `src/types/`, which correctly keeps this surface optional

## Not Aligned Yet

- `packages/core/fireux-core/src/types/` still carries the main remaining type-surface cleanup
- `src/types/` is not yet a collective pattern across package families
- generic top-level type buckets should not regrow where feature-local placement is clearer

## Roadmap To Reconciliation

1. Keep `src/types/` optional.
2. Narrow `fireux-core/src/types/` toward clear public contracts.
3. Keep local types close to the features that own them.
4. Avoid growing top-level `types/` across every package by default.

## Short Version

`types/` is for shared public contracts when a package genuinely needs them.

It is not where all types belong.
