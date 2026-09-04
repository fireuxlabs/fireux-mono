# FireUX Kitchens

Updated: 2026-09-04
Ref: 68e811b1b
Role: package landing map, not canon

`fireux-kitchens` owns the reusable Kitchen domain: Kitchen identity, Workspace
surfaces, Team operations, menus, orders, ingredients, dishes, recipes, service
workflows, and the server commands that genuinely belong to those capabilities.
Apps install and compose this package; they do not copy Kitchen implementation.

Current source and executable guards outrank this README. Start with the root
`AGENTS.md`, `docs/ai/gpt-context.md`, `docs/ai/misebox-context.md`, and
`docs/concepts/family-workspace-entity.md` before changing Kitchen architecture.

## Start with the Kitchen

The Kitchen's public domain entrance is currently:

```text
src/runtime/kitchen/composables/firestore/useKitchen.ts
```

It composes the Kitchen CRUD language:

```text
useKitchen
├── useKitchenRead
├── useKitchenCreate
├── useKitchenUpdate
└── useKitchenDelete
```

The current nested `composables/firestore` placement is discoverability debt.
Consumers should still begin with `useKitchen`; do not add another Kitchen
facade while the existing entrance is moved toward `runtime/kitchen/`.

Pages and components express human interaction. They consume Kitchen operations
and render their live results. They do not choose a persistence transport,
construct arbitrary Firestore paths, call refresh after writes, or maintain a
second copy of Firestore documents.

## CRUD ownership

Kitchen operations own their inputs, validation, relationships, and transport
choice. Core client and server primitives implement transport mechanics; they
do not own Kitchen decisions.

Use client CRUD when all of these are true:

- the operation changes one Kitchen-owned document;
- the browser may know its collection path and fields;
- no secret or privileged external provider is involved;
- no protected cross-document relationship must be coordinated; and
- the existing Firestore listener can publish the committed result.

Use a trusted server command when any of these are true:

- several documents must commit atomically;
- ownership, membership, AppUser relationships, or primary-Kitchen selection
  changes;
- the operation crosses Users, Kitchens, Apps, databases, or providers;
- protected fields, administrator authority, secrets, or payments are needed;
  or
- a relationship cascade must be validated and committed as one operation.

The page never makes this decision. The named `useKitchenCreate`,
`useKitchenUpdate`, or `useKitchenDelete` operation does.

## Realtime contract

The normal runtime loop is:

```text
UI → useKitchen operation → Firestore → existing listener → UI
```

This contract is the same whether a write originates in the browser or in a
trusted server command. A successful mutation must become visible through the
listener. Do not add `refresh`, `refreshNuxtData`, reloads, manual collection
patches, or copied capability state to simulate that behaviour. If a committed
write is not observed, repair the reader/listener boundary.

## Current transport evidence

The CRUD names describe domain intent; they do not promise that every operation
uses the same transport.

| Operation          | Current source                                                            | Current transport and reason                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useKitchenRead`   | `src/runtime/kitchen/composables/firestore/fetch/useKitchenRead.ts`       | Client VueFire listeners read Kitchen and same-ID Place data.                                                                                                |
| `useKitchenCreate` | `src/runtime/kitchen/composables/firestore/mutations/useKitchenCreate.ts` | Trusted onboarding coordinates Place, Kitchen, owner Team, and AppUser membership.                                                                           |
| `useKitchenUpdate` | `src/runtime/kitchen/composables/firestore/mutations/useKitchenUpdate.ts` | Currently one server endpoint. Ordinary single-document fields should be reviewed for client CRUD; protected relationship changes remain server-owned.       |
| `useKitchenDelete` | `src/runtime/kitchen/composables/firestore/mutations/useKitchenDelete.ts` | Currently deletes the Kitchen root through the client primitive. Any required relationship cleanup must be proved before treating root deletion as complete. |

This table records current source; it is not evidence that every current choice
is final or correct.

## Capability structure

Capabilities beneath a Kitchen follow the same rule:

```text
runtime/kitchen/<capability>/
├── use<Capability>.ts
├── use<Capability>Read.ts
├── use<Capability>Create.ts
├── use<Capability>Update.ts
└── use<Capability>Delete.ts
```

Create only the files the capability actually needs. A small capability does
not require ceremonial layers. Team, Test, Menu, and Order may differ in domain
rules, but none should invent another generic CRUD system.

## Boundaries

- Kitchen owns Kitchen records and operations.
- Place owns venue identity and presentation used by a Place-backed Kitchen.
- AppUser owns the current App's Kitchen membership index and primary Kitchen.
- Kitchen Team owns Kitchen access, operational roles, invitations, and member
  lifecycle.
- Apps own routes, deployment configuration, brand, and genuinely App-specific
  composition.
- Core owns proven product-neutral client and server Firestore mechanics.

Do not copy Place presentation onto Kitchen, use Team discovery as the AppUser
Workspace index, or move Kitchen behaviour into an App because one App consumes
it first.

## Verification

For a Kitchen CRUD change:

1. Inspect `useKitchen.ts`, the relevant named operation, its real consumers,
   and the nearest working sibling.
2. Prove a client write through its live listener without refresh compensation,
   or prove why a server command is required.
3. Run focused lint/build checks while iterating.
4. Run `pnpm guard` before handoff.

Relevant executable entrypoints include:

- `scripts/guards/kitchen-entity.mjs`
- `scripts/guards/kitchen-food-authority.mjs`
- `scripts/guards/firestore-mutations.mjs`
- `scripts/guards/workspace-pages.mjs`

For Firestore work, also read `docs/ai/firestore-mutations-context.md` and use
the repository's Firestore guidance before editing.
