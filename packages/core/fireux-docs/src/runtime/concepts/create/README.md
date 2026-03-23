# Create Concept

Authority: Operational
Updated: 2026-03-23
Scope: runtime create behaviour across `pages/`, `components/`, and `composables/`.

Learn how FireUX create behaviour works at runtime, which create modes exist, and how console creation is supposed to behave.

## Create Concept

Create is now a runtime concept, not just a page pattern and not just a component pattern.

Create spans:
- `runtime/pages/` for entry and ownership
- `runtime/components/` for orchestration
- `runtime/composables/` for behavioural truth

Use this README as the create authority.
Use the pages and components READMEs as supporting views.

## Core Principle

There is no single create pattern across FireUX.

There are only two top-level create modes:
- ensure create
- payload create

Everything else is a subtype or specialization of those two modes.

## Create Modes

### Ensure Create

Ensure create:
- inspects current state first
- creates only when missing
- is safe to run multiple times

Examples:
- `users/create.vue`
- `apps/create.vue`
- profile setup flows that ensure a missing identity record

This mode is for bootstrap, recovery, and setup-if-missing behaviour.

### Payload Create

Payload create:
- takes user or system input
- writes a real entity payload
- creates a new canonical record unless it deliberately reuses an existing one

Examples:
- `jobs/create.vue`
- `admin/blogs/create.vue`
- `admin/products/create.vue`
- public console entity creation like `kitchens/create.vue`

This mode is for ordinary entity creation.

## Terminology

### Public Entity

The canonical record.

Examples:
- `kitchens/<id>`
- `suppliers/<id>`
- `portfolios/<id>`

This is the real public entity:
- name
- public-facing data
- canonical identity

Do not call this a "root console".
Call it the public entity.

### Console Overlay

The app-scoped operational layer on top of a public entity.

Examples:
- `apps/<appId>/kitchens/<id>`
- `apps/<appId>/suppliers/<id>`
- `apps/<appId>/portfolios/<id>`

This is where app-specific operational state lives:
- permissions
- console flags
- app-specific governance
- private or tenant runtime state

Apps do not own these entities.
Apps overlay them.

For console-backed domains, this overlay is the hosted console inside a specific app.

That means a console-backed domain should usually be understood as:
- root public entity
- app-hosted console overlay
- app-owned child records beneath that overlay when operational records exist

## Console Create Canon

Consoles currently include:
- `Kitchen`
- `Portfolio`
- `Supplier`
- `Project` as target canon when its creation surfaces become real

Console create is not a separate top-level mode.

It is:
- payload create for the public entity
- plus overlay ensure behaviour when used from the console

The console rule is:
- one create system per console
- two behaviours: `public` and `console`

### Public Mode

`mode="public"` should:
- create the public entity if missing
- not ensure the console overlay

### Console Mode

`mode="console"` should:
- ensure the public entity exists
- create the public entity first if needed
- ensure the app-scoped console overlay exists
- leave app-owned child records to their own later create flows inside that hosted console

## Console Contract

Every console create system should converge on this input shape:

- `mode?: 'public' | 'console'`
- `existingRootId?: string | null`

Every console create path should converge on this result shape:

```ts
{
  id: string
  createdRoot: boolean
  createdOverlay: boolean
}
```

Important note:
- in current code, `createdRoot` means "created public entity"
- the terminology is public entity plus console overlay, even if some helper names still use `root`

## Ownership Stack

Create should be understood in this stack:

- pages decide entry and ownership
- components orchestrate create behaviour
- composables enforce create truth

That means:
- pages should not carry behavioural truth by themselves
- components should not invent storage rules
- composables are the source of behavioural consistency

## Current Entity Mapping

### Ensure Create

- `User`
- `App`
- `Chef`
- `Agent`
- `Professional`

### Payload Create

- `Place`
- `Company`
- `Job`
- `BlogPost`
- `Product`

### Console Payload Create With Overlay Behaviour

- `Kitchen`
- `Portfolio`
- `Supplier`
- `Project` as target canon

For all of these, the same structural rule applies:
- root public entity at `/.../<id>`
- app-hosted console overlay at `/apps/<appId>/.../<id>`
- app-owned child records beneath that overlay where needed

## Current Status

Already strong:
- ensure/bootstrap systems for `User` and `App`
- setup-if-missing profile systems for `Chef`, `Agent`, and `Professional`
- form-first create shell systems for `Blog`, `Job`, and `Product`
- console create systems for `Kitchen`, `Portfolio`, and `Supplier` now share one-system two-mode behaviour

Later cleanup:
- naming can still be tightened later, especially `createdRoot` versus `createdPublic`

## Roadmap To Reconciliation

1. Keep create canon here, not in `pages/` or `components/`.
2. Keep page docs focused on ownership and route entry.
3. Keep component docs focused on orchestration families.
4. Push shared behavioural rules into composables.
5. Converge console create on one component per console with `public` and `console` modes.
6. Keep "public entity" and "console overlay" as the preferred create terms.

## Short Version

Create is a runtime concept.

The core create split is:
- ensure create
- payload create

Console create is payload create plus overlay ensure behaviour.

Pages own entry.
Components orchestrate.
Composables define the truth.
