# Firebase Config Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/config/firebase` only.
Does not apply to general Firebase runtime code.

Learn how `config/firebase/` is used in FireUX ecosystem packages.

## Firebase Config Directory

`firebase/` is for ecosystem-specific Firebase support inside `config/`.

It is a support seam, not a runtime delivery surface.

## What Belongs Here

- ecosystem-specific Firebase config helpers
- setup support used by module wiring
- package support files that exist because the package genuinely owns Firebase integration

## Aligned In Repo

- `config/firebase/` is already used in `fireux-bringli`, `fireux-cleanbox`, `fireux-fireux`, `fireux-granite`, and `fireux-misebox`
- ecosystem packages already treat it as a support seam beside `config/module/`

## Not Aligned Yet

- `config/firebase/` is not a general package-family pattern
- it should not spread outside ecosystem packages unless the package scope clearly requires it

## Roadmap To Reconciliation

1. Keep `config/firebase/` ecosystem-specific.
2. Keep it supportive of module wiring rather than runtime delivery.
3. Do not let it become a second package system.

## Short Version

`config/firebase/` is a valid ecosystem support seam when a package genuinely owns Firebase integration.
