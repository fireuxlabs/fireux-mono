# Workspace

Updated: 2026-11-22
Ref: 0d8d59ce8
Role: map, not canon

## Ownership

Core provides Dashboard for account, Profiles, App membership, and App
settings. [Workspace](../../packages/extensions/fireux-workspace/README.md)
is an optional package for managing an Entity. An App can use Core and domain
Profiles without Workspace.

Workspace owns shared selection, navigation, and the operational frame. Domains
own the accessible Entity collection, canonical records, capabilities, and trusted
commands. Apps select the Workspace families they need and own their entry policy.
Workspace manages an existing Entity through its capabilities. Grouping a route or
tool in Workspace creates no additional record, storage owner, or authority.

## Public and Workspace entry points

Public and Workspace surfaces may use the same Entity under separate access
policies. An App can keep its public Home and provide a Workspace entrance.
Workspace Home resolves selection and the first useful action. Overview summarizes
the selected Entity, groups introduce related capabilities, and child routes own
the work. Match the structure to the actual journey.

## Access and selection

Saved selection is a preference. Domain readers admit only the exact Entity
authorized for the current App and account. Pending and failed access retain
distinct outcomes. Once access settles, reconciliation drops a revoked
selection. Old private payloads stay hidden while scope changes. Navigation visibility,
route metadata, and button state grant no write authority. Trusted commands check
the actor and exact target independently.

See [Workspace package integration](../../packages/extensions/fireux-workspace/README.md),
[Capability and Tool ownership](family-workspace-capability-tool.md), and
[Firestore ownership](firestore-entity.md).
