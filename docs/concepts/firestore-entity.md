# Firestore Entity map

Updated: 2026-10-25
Ref: ce2861c77
Role: map, not canon

## Purpose and authority

Map FireUX's data ownership and authority boundaries on Cloud Firestore. Use
Firebase's [data model guide](https://firebase.google.com/docs/firestore/data-model)
and [security overview](https://firebase.google.com/docs/firestore/security/overview)
for upstream behavior. This map records only FireUX's product contract.

Current models, readers, commands and Rules establish implementation. They do
not prove that stored records or deployed Rules have completed a migration.
Inspect the owning sources and target environment before making a live claim.

## FireUX ownership contract

A canonical Entity belongs to its domain owner. Records whose lifecycle belongs
to that Entity live beneath it; an independently identified Entity keeps its own
identity. A route, Workspace, Dashboard, App or Ecosystem is not a storage
owner merely because it presents the record.

User is a person. AppUser is membership in one App. Profiles, memberships,
cross-App links and domain records retain their distinct owners and authority.
See [core models](core-models.md) and [Entities](entities.md) for canonical
relationships and current models.

Domain packages own their canonical paths, projections, access policy,
validation and protected commands. Core owns shared Firestore transport and
typed lower-level mechanics. Apps adapt their product routes; Ecosystems bind
Firebase projects and compose extensions.

Public and private records remain separate when their access differs.
Firestore cannot redact selected nested fields from a document read. A public
projection must omit protected children; hiding a field in Vue does not protect
it. Team membership, App membership and a displayed role label grant only the
authority defined by the owning domain.

## Reads, writes and security

Mutable on-screen collections and records use the owning live reader. A
reactive parameter around a one-shot read or periodic polling is not a live
binding. Shared transport and read-state behavior belong in Core; authorization
and projections remain with the domain. See [server API](server-api.md) for
read and transport contracts.

Protected writes use named domain commands with an exact target and validated
actor authority. Client SDK access is separately governed by Firestore Security
Rules. Admin/server SDKs use server IAM and bypass Firestore Rules; trusted
commands still need their own domain checks. Rules are not query filters.

See the [Firestore mutation context](../ai/firestore-mutations-context.md) for
current command lanes, development policy and connected-operation boundaries,
and [Rules source map](firestore-rules.md) for template ownership. The accepted
open-development Rules policy is intentionally scoped there. It does not imply
privacy or authorize shipping.

## Migration and evidence

Owner-first storage is the intended contract. Existing source or stored records
may still reflect an older path; classify that as migration work rather than
extending it as a new pattern. Do not claim a family cutover from a model or
build alone. Source, deployed Rules and live data are separate evidence.

Before a data migration, the owning context defines exact target validation,
read-only planning, retained preimages, authorization, verification and a
separate retirement decision. This documentation map does not authorize a live
Firestore operation.

## Related owners

- [Entity families](entities.md) and [core models](core-models.md)
- [Workspace and Entity composition](family-workspace-entity.md)
- [Firestore Rules](firestore-rules.md)
- [Server APIs](server-api.md)
- [Mutation authority](../ai/firestore-mutations-context.md)
- [FireUX platform map](fireux.md)
