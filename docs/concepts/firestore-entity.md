# Firestore Entity stack family

Updated: 2026-08-21
Ref: f3c707663
Role: map, not canon

## Purpose

Map where FireUX stores an Entity and the records it owns. Current source,
Security Rules, guards, and verified live data remain authority while the
owner-first migration described here is completed.

The rule is intentionally simple:

> A root Entity lives at its named root collection. Everything whose lifecycle
> belongs to that Entity lives beneath it. A surface never becomes a storage
> owner.

## Links

- Parent: [entities.md](entities.md)
- Parent: [composables.md](composables.md)
- Child: [family-workspace-entity.md](family-workspace-entity.md)
- Child: [family-menu.md](family-menu.md)
- Horizontal: [workspace.md](workspace.md)
- Horizontal: [server-api.md](server-api.md)
- Horizontal: [runtime-filesystem.md](runtime-filesystem.md)
- Rules: [firestore-rules.md](firestore-rules.md)

## Owner-first storage

```text
(default)/
├── project/{projectId}       local ProjectMeta projection
├── ecosystem/{ecosystemId}   local EcosystemMeta projection
└── apps/{appId}              local AppMeta projection

<named database>/
├── apps/{appId}              canonical App
│   ├── users/{uid}           AppUser membership and governance
│   ├── join-requests/{uid}
│   ├── membership-blocks/{uid}
│   ├── events/{eventId}
│   ├── conversations/{conversationId}
│   │   ├── messages/{messageId}
│   │   └── private/session
│   └── financial-facts/{factId}
│
├── users/{uid}               canonical User
│   ├── private/account
│   ├── private/context
│   ├── notifications/{notificationId}
│   ├── profiles/{profileKind}
│   │   └── app-state/{appId} only when that profile has real App-specific state
│   └── orders/{orderId}      User-owned link to an operational Order
│
├── projects/{projectId}
│   ├── team/{uid}
│   └── team-requests/{uid}
│
├── kitchens/{kitchenId}
│   ├── team/{uid}
│   ├── team-requests/{uid}
│   ├── private/{recordId}
│   └── <Kitchen operations>/...
│
├── suppliers/{supplierId}
│   ├── team/{uid}
│   ├── team-requests/{uid}
│   └── <Supplier operations>/...
│
├── portfolios/{portfolioId}
│   ├── team/{uid}
│   ├── team-requests/{uid}
│   └── <Portfolio operations>/...
│
├── properties/{propertyId}
│   ├── team/{uid}
│   ├── team-requests/{uid}
│   ├── private/manual
│   └── <Property operations>/...
│
└── marketplace-stores/{storeId}
    ├── team/{uid}
    ├── team-requests/{uid}
    └── <Marketplace Store operations>/...
```

The examples name ownership, not required empty symmetry. An Entity receives
only records and operations it genuinely owns.

## Workspace Entity contract

Project, Kitchen, Supplier, Portfolio, Property, and Marketplace Store are root
Workspace Entities.

- The root document owns only the fields declared by its canonical entity
  model. A Place-backed Workspace Entity uses the same document id as its Place;
  Place owns the shared venue identity. Kitchen therefore stores only
  `id`, `slug`, `status`, and `visibility`: it must not copy Place identity,
  store `place_id`, or absorb capability configuration.
- `management` selects the hosting product relationship: `root`, `workspace`,
  or a dedicated `app`. It never relocates the Entity.
- `team/{uid}` is Workspace membership and access authority. A Team record may
  add entity-specific operational fields, but its document id remains the User
  uid when it grants access.
- `team-requests/{uid}` owns pending membership workflow. A request is not
  authority.
- Operations and protected records live beneath the root Entity, even when a
  Workspace or Dashboard presents them.
- AppUser is still required to enter an App. AppUser governs that App; Team
  governs the Workspace Entity. An App admin may remain the explicit override
  for Entities managed by that App.
- User target arrays and App-nested Entity access documents are not canonical
  authority. Target lists are derived on the trusted server from root
  management plus Team/AppUser evidence.

This replaces the former root-plus-App-support pattern. During migration,
existing `apps/{appId}/{workspaceCollection}/{entityId}` documents are source
preimages only; new features must not extend them.

## User, profiles, and AppUser

`User` is the person at `users/{uid}`. `AppUser` is membership in one App at
`apps/{appId}/users/{uid}`.

- AppUser owns App role, entitlement, and onboarding state.
- A registered customer is an AppUser; Customer is not a second person
  identity.
- A profile is a User-owned Record at `users/{uid}/profiles/{profileKind}`.
- Chef, Driver, and Professional are profile kinds, not root peer collections.
- A profile may add `app-state/{appId}` only for genuine App-specific state.
- Customer ordering preferences are optional App-specific Customer profile
  state. Guest contact and delivery data remain on the Order.
- A User's cross-App order doorway is `users/{uid}/orders/{orderId}`. The link
  identifies its App and owning operation without copying mutable Order state.
- A profile or order link never grants App or Workspace access.

## App boundary

An App owns only App lifecycle and genuinely App-wide records. Normal App
children include membership, join requests, membership blocks, events,
conversations, and FinancialFacts. Other App-owned records must justify an App
lifecycle independently; an App is not a bucket for every feature it renders.

Workspace Entities, their Team, and their operations never live beneath App.
Product is root commercial truth. Ignition is a Conversation with
`kind: 'ignition'`, not a parallel App collection. A Marketplace Store is a
root Workspace Entity even when one App is its current management host.

## Root and parent-owned records

- A root Entity document is the canonical readable Entity. Firestore cannot
  redact nested fields, so protected material lives in a separately authorized
  child record under its honest owner.
- A parent-owned Entity or Record uses a path beneath its parent. KitchenMenu,
  Recipe, KitchenPrepItem, Dish, KitchenOrder, MenuSection, MenuItem,
  KitchenStation, SupplierItem, and similar children follow this rule.
- A root doorway such as Menu may reference a parent-owned operational Entity;
  it does not duplicate that Entity's content tree.
- Directory entries, detail responses, cards, and joined views are transport
  Shapes. They do not replace or rename the canonical Entity.
- A public Entity route is a server-owned read boundary, not permission for the
  page to fetch protected records and hide them visually. It may return a
  canonical readable root, named related canonical Entities, and a bounded
  presentation Shape. Protected children are absent from that response and
  require their own authorization. Kitchen detail proves this contract with
  one canonical Kitchen, its required same-id Place, and a joined presentation;
  Kitchen Team and operational children remain outside the Entity route.

## Firestore composable stack

Entity-owned Firestore adapters live under
`runtime/<entity>/composables/firestore` and use only the capabilities they
actually support:

- `fetch` for one record or a bounded collection;
- `mutations` for typed Create, Update, and Delete commands;
- `seo` for entity search presentation;
- `utils` for storage normalization and exact path helpers.

Entity-facing state such as `useXDetail`, `useXCollection`, permissions, and
interface projection belongs one layer above under
`runtime/<entity>/composables`. Shared reactive reads and typed mutation lanes
remain in the root FireUX spine.

## Read-state contract

- `useFirestoreRead` is the shared reactive read authority.
- An inactive source is `idle`; an unresolved active source is `pending`; a
  failed source is `error`; only a settled successful source is `ready`,
  `empty`, or `missing`.
- Reactive source changes clear stale rows and dispose the previous listener.
- Exact-id batches expose the same outcome vocabulary.
- One-shot existence checks use `firestoreGetDoc`; live reads use the shared
  reactive seam once during setup.
- A server projection may supply SSR, joins, or authorization, while an exact
  permitted document listener keeps the already-open surface current. That is
  a transport choice, not a different Entity.

## Mutation lanes

Firestore has exactly three mutation lanes: Client, Server, and MCP/Skill.
Each exposes only typed Create, Update, and Delete targets. Pages, Workspaces,
Dashboards, scripts, and agents are consumers of those lanes, never extra
storage authorities.

An ordinary update accepts one named input containing identity and `changes`.
Transitions, media, membership, relationships, and compound writes retain
their narrower domain commands.

## Current migration state

The 2026-08-20 live inventory confirms the destination is not yet fully
implemented:

- FireUX still has App-nested Project access and duplicated App-nested Product
  records.
- Misebox still has App-nested Workspace roots/support, Kitchen operations,
  profiles, Marketplace Stores, and Customer records, plus some older root
  Kitchen child duplicates.
- Granite Portfolio and BuenoHost Property still use root-plus-App-support.
- current models, readers, writers, Rules, demos, and guards still encode the
  former support-record contract.

Migration must move one complete family at a time: model, paths, readers,
writers, Rules, indexes, guards, Demo adapters, retained preimage, live data,
and post-write verification. No family is complete while either the source or
stored data still requires the old path.

## Do not

- Nest a Workspace Entity, its Team, or its operations beneath App.
- Use Dashboard, Workspace, Console, Directory, Detail, or Admin as a storage
  owner.
- Keep App support arrays, User target arrays, and Team as competing access
  authorities.
- Create `PublicX`, `publicRead`, `/api/public/*`, or a second filtered Entity
  merely to make the root readable.
- Put protected fields in a readable root and expect Rules to redact them.
- Add compatibility aliases, dual writes, fallback reads, or generic migration
  registries as the permanent design.
- Infer Entity status from a collection or folder.

## Verification

Before a family cutover:

1. verify the concrete Firebase project, database, edition, Rules, indexes,
   source readers/writers, and live path counts;
2. produce a deterministic dry-run plan and retained protected preimage;
3. freeze or reject concurrent writes for the affected family;
4. migrate with version preconditions and typed mutation targets;
5. verify counts, ids, relationships, access outcomes, and representative live
   surfaces;
6. remove old readers/writers and deploy reviewed Rules before old data is
   retired; and
7. run focused checks followed by the complete repository guard.

Current executable entrypoints include
`scripts/_lib/entity-matrix.mjs`,
`scripts/guards/entity-matrix.mjs`,
`scripts/guards/firestore-mutations.mjs`, and the owning ecosystem Rules
artifacts. The temporary migration ledger must shrink to zero rather than
becoming another accepted system.
