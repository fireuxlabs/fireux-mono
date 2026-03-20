# Models Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/runtime/models` only.

Learn how `runtime/models/` is used across FireUX module packages.

## Models Directory

`models/` contains domain models used by delivered runtime behavior.

## What Belongs Here

- model definitions used by runtime features
- model-adjacent runtime types that naturally belong with those models
- grouped model surfaces that stay clearly inside runtime delivery

## Aligned In Repo

- `runtime/models/` is already normal in core, many extensions, and some ecosystem packages
- the repo already behaves as if models belong in runtime delivery space
- `runtime/models/` is an explicitly valid FireUX pattern

## Not Aligned Yet

- some model-adjacent types still need to stay closer to models rather than drifting into broader support buckets
- docs and implementation need to keep treating models as runtime, not as a separate framework layer

## Roadmap To Reconciliation

1. Keep `runtime/models/` explicitly valid.
2. Keep model-adjacent structure close to the models that own it.
3. Export types elsewhere only when they are truly public contracts.

## Short Version

Runtime domain models belong here.
