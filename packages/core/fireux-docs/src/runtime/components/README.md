# Components Directory

Authority: Operational
Updated: 2026-03-22
Scope: `packages/*/fireux-*/src/runtime/components` and child directories under `components/*`.

Learn how `runtime/components/` is used across FireUX module packages, and how the current create-system component families are aligned or still drifting.

## Components Directory

`components/` contains Vue components delivered by the package at runtime.

Implementation notes for specific component trees belong beside the real owning package or app.
This README stays at repo and directory level only.

## Current Focus

For the current alignment pass, the important seam is:

- `runtime/components/**/Create/System.vue`

Why this seam matters:

- routes increasingly act as owners and shells
- create behaviour usually lives in the create system component
- public and console routes often reuse the same create system
- the real alignment question is now behavioural, not just route-shaped

Pages tell us who owns creation.
Create-system components tell us how creation actually works.
Use `packages/core/fireux-docs/src/runtime/concepts/create/README.md` as the create authority.

## Create-system Families

### Ensure / Bootstrap Family

These create systems are idempotent, state-driven, and safe to run multiple times.

Examples:
- `packages/core/fireux-core/src/runtime/components/organisms/User/Create/System.vue`
- `packages/core/fireux-core/src/runtime/components/organisms/App/Create/System.vue`

Current behaviour:
- `User` checks auth and user state, then ensures missing root and app membership records
- `App` runs auth, PIN, and environment checks before allowing bootstrap

Status:
- aligned

### Setup-if-missing Profile Family

These create systems create the profile if it is missing, then return the user to the profile workspace.

Examples:
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Create/System.vue`
- `packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Create/System.vue`
- `packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Create/System.vue`

Current behaviour:
- shared card-based setup surface
- explicit benefits list
- single action button
- ensure profile, then redirect back to dashboard profile

Status:
- aligned

### Console Create Family

These are the important console create systems for the current pass.

Examples:
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Create/System.vue`
- `packages/extensions/fireux-properties/src/runtime/components/organisms/Portfolio/Create/System.vue`
- `packages/extensions/fireux-suppliers/src/runtime/components/console/supplier/Create/System.vue`

Target canon:
- public create makes the root console record
- console create ensures the app-scoped overlay
- console create may create the root record first if missing

Current repo truth:
- `Supplier`, `Kitchen`, and `Portfolio` now all use one create system with `public` and `console` modes
- `console` mode ensures the public entity and the app overlay
- `public` mode creates only the public entity
- `Kitchen` still keeps a place-backed acquisition step inside the same create system

Status:
- aligned

Important note:
- `Kitchen` remains a place-backed subtype inside the aligned console family

### Form-first Create Shell Family

These create systems use a write-plus-preview shell and behave like normal create flows.

Examples:
- `packages/extensions/fireux-jobs/src/runtime/components/organisms/Job/Create/System.vue`
- `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/Create/System.vue`
- `packages/extensions/fireux-products/src/runtime/components/organisms/Product/Create/System.vue`

Current behaviour:
- `MoleculesCreateShell`
- write slot plus preview slot
- submit action
- clear or reset behaviour
- optional creator or state context around the shell

Status:
- mostly aligned

### Place-backed Acquisition Family

These create systems acquire or confirm a place-backed root entity rather than behaving like a plain blank form.

Examples:
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Create/System.vue`
- `packages/extensions/fireux-companies/src/runtime/components/organisms/Company/Create/System.vue`
- `packages/extensions/fireux-places/src/runtime/components/organisms/Place/Create/System.vue`

Current behaviour:
- `Place` confirms the canonical place record from search
- `Company` uses `PlaceSearchSection` and either reuses an existing company or creates it
- `Kitchen` still contains a place-acquisition step inside the console create flow

Status:
- aligned

### Scoped Child Create Systems

These create systems exist, but they are not part of the first important create alignment pass.

Examples:
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Create/System.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Ingredients/Create/System.vue`

Current role:
- console-owned or domain-child creation
- useful for product work inside a console
- not the main repo-level create canon right now

Status:
- deferred

## What Belongs Here

- package-owned UI components
- component groups used by runtime pages, composables, and features
- delivered UI surfaces that belong to the module
- create-system components that implement runtime creation behaviour

## Aligned In Repo

- `runtime/components/` is already used in `fireux-core`, most extension packages, and several ecosystem packages
- delivered UI is already colocated under runtime rather than pushed into config or package root
- create behaviour is already concentrated in `Create/System.vue` components
- ensure/bootstrap create systems for `User` and `App` are clear
- setup-if-missing profile create systems for `Chef`, `Agent`, and `Professional` are clear
- form-first create systems for `Job`, `Blog`, and `Product` already share a recognizable shell pattern

## Not Aligned Yet

- naming can still be tightened later, especially `createdRoot` versus `createdPublic`

## Roadmap To Reconciliation

1. Keep delivered UI in `runtime/components/`.
2. Keep route ownership decisions in `runtime/pages/`, and behaviour decisions in create-system components.
3. Treat `Create/System.vue` as the main implementation seam for creation work.
4. Keep `User` and `App` as ensure-first systems, not normal CRUD forms.
5. Keep `Chef`, `Agent`, and `Professional` as setup-if-missing systems.
6. Keep scoped child create systems inside their owning console or domain, not in the first repo-wide canon pass.
7. Tighten naming only after behaviour stays stable in real usage.

## Short Version

Delivered runtime UI components belong here.

For the current pass:
- pages define create ownership
- create-system components define create behaviour
- four create-system families are already clear:
  - ensure/bootstrap
  - setup-if-missing profile
  - console create
  - form-first create shell

The biggest drift left is now naming cleanup and any future create families beyond the current shipping slice.
