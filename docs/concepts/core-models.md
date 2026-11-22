# Core records and relationships

Updated: 2026-11-22
Ref: 0d8d59ce8
Role: map, not canon

Firebase Auth supplies the signed-in UID. Core User is the person. Core App is
the application and owns its membership records. An Ecosystem is an independent
root and can exist without Apps. Its optional FireUX Project relationship is
separate from the Firebase project that supplies infrastructure.

## Stored records

- [User](../../packages/core/fireux-core/src/runtime/user/README.md) owns
  canonical identity, private account and consent. Profiles remain User-owned
  records. Access to each App or domain resource is checked by that owner.
- [App](../../packages/core/fireux-core/src/runtime/app/README.md) owns
  `apps/{appId}/users/{uid}`. Sign-in identifies a User. Explicit Join creates
  AppUser membership. Role and subscription are read from the owning App.
- [Ecosystem](../../packages/core/fireux-core/src/runtime/ecosystem/README.md)
  owns its canonical identity. `App.ecosystem_id` establishes the relationship.
  FireUX Project administration requires the exact stored Project relationship.

Reverse App locators under User or Ecosystem support discovery and reconciliation.
They confer no membership, ownership or access. Canonical App and identity
records may live in different named databases. Verify exact targets and scope
through the [Core Firebase configuration](../../packages/core/fireux-core/src/config/app/README.md#firebase)
and the owning trusted command.

## Entity model file shape

A model documents a distinct, consumed domain record or transport contract.
Keep stored data separate from authored configuration, transport, and view
projections. Give defaults explicit `Defaults` names. A local supporting type
can stay with its owner. A collection or a route does not by itself require
another model, a sibling Entity, or a public contract.

See [Entity ownership](entities.md), [Firestore storage](firestore-entity.md),
and [mutation authority](../ai/firestore-mutations-context.md).
