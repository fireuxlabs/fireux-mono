# Components Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/runtime/components` only.

Learn how `runtime/components/` is used across FireUX module packages.

## Components Directory

`components/` contains Vue components delivered by the package at runtime.

## What Belongs Here

- package-owned UI components
- component groups used by runtime pages, composables, and features
- delivered UI surfaces that belong to the module

## Aligned In Repo

- `runtime/components/` is already used in `fireux-core`, most extension packages, and several ecosystem packages
- delivered UI is already colocated under runtime rather than pushed into config or package root

## Not Aligned Yet

- not every package needs `components/`
- component grouping still varies by package and should stay delivery-led rather than theoretical

## Roadmap To Reconciliation

1. Keep delivered UI in `runtime/components/`.
2. Let grouping follow runtime delivery needs.
3. Do not force component trees into packages that do not ship UI.

## Short Version

Delivered runtime UI components belong here.
