# Workspace, Capability, and Tool family

Updated: 2026-10-07
Ref: 24a41e2fe
Role: map, not canon

## Purpose

Define the smallest product grammar for work inside a Workspace. This map does
not introduce an execution engine, stored Entity field, generic registry, or
authority bypass.

## Product hierarchy

Use only these product layers inside a Workspace:

- A **Workspace** operates one active root Entity.
- A **Capability** is one stable user-facing area of work in that Workspace.
  Identity, Team, Menus, Orders, Apps, and Ecosystem are capabilities.
- A **Tool** is one bounded action a person or agent can deliberately invoke
  inside a Capability, such as Create Menu, Update Team Member, or Publish Menu.
- A **command** is the trusted execution boundary behind a Tool.
- **CRUD** is the shared record-mechanics floor used by Tools.

There is no separate Workspace **Operation** layer. Use “operation” only as
ordinary technical language for an executed action or operational data, never
as a second name for a Capability.

```text
Workspace
└── Capability [UX descriptor]
    ├── Destination(s) / perspectives
    └── Contextual tools
        └── authorized command
            └── record reads and writes
```

A visible control is not mutation authority. AI receives the same registered
Tools as the human surface and never gains a parallel write path.

## Responsibility, persistence and service orchestration

Capability describes a business responsibility, not a mandatory field, subcollection, Entity or folder at the storage boundary. Each capability exposes its owned fields or records, rules and supported Tools through its current domain owner. Small stable configuration can be nested on that owner; independently managed or growing records retain their existing root or parent-scoped identity. A capability page may also compose a lower Entity's supported editor without taking ownership of its data. Kitchen Identity combines Kitchen-owned `identity` controls with Place-owned venue fields; dine-in offering setup exposes the existing Kitchen-owned `tables.count` editor; Menus manages separately identified Menu records scoped to the Kitchen.

The trusted service layer coordinates use cases through domain-supported behaviour. It may use one or several capabilities and keeps workflow-specific execution state, such as an Order's acceptance/payment lifecycle, with the owning workflow. Ordering through a Menu does not make Orders a nested Menu field or make ordering execution a Menu editor responsibility. The previous Menu-order execution boundary is deleted. The current Ordering capability supports pure draft/line behaviour, an explicit Kitchen-owned Save draft command and a membership-bound saved-draft reader. Submission and fulfilment services remain absent. The save command retains its H3 authentication adapter; it is not a transport-independent service API.

When a service reveals missing information, assign that information to the lowest domain owner that gives it meaning, add the owning capability's model, reader, editing Tool and authority as needed, then let the service consume it. Do not move every service's settings onto one generic configuration map or copy shared venue facts into each Workspace Entity. Public/customer surfaces consume supported projections of the same capability data; they do not expose private records solely because the client can hide them.

Kitchen's Sproochli attachment proves the separate-record boundary alongside
its child-only fulfilment policy. Root copies are migration preimages, never
runtime authority. Missing child attachments resolve unconfigured/disabled;
failed reads stay failures. The guarded attachment command uses explicit input
and child defaults, and public Kitchen/Menu readers consume the same child.
The unused root-reading Identity editor and unconsumed root helpers are retired.
Demo fulfilment also stays outside root configuration. See Kitchen's
`src/test/kitchen-child-attachment.test.mjs`; this does not prove provider readiness,
live data conversion or a complete translation editing capability.

Kitchen named Offerings similarly retain independent parent-scoped identities
at `kitchens/{kitchenId}/offerings/{offeringId}`. Their live private reader is
membership-bound; canonical saved validation and commands share interaction
constraints. Public Menu/Kitchen readers use supported child projections, while the previous order execution transaction is deleted.
Root arrays are migration preimages, not an alternate authority. This storage
boundary is distinct from the trusted ordering service and the operational
order-numbering period. See Kitchen's `kitchen-offering-storage.test.mjs` and
current Offering checks; live conversion remains separately unproved.

## Capability UX descriptors

Only two candidate descriptors are accepted for this proving scope:

- **Collection / Focus**: find records, open one, work on it.
- **Surface**: work with or understand the capability as a whole, without a
  primary collection-to-record relationship.

The descriptor is not another hierarchy level. Destinations and perspectives stay
inside their capability context; tools may act on a collection, record or surface.
Navigation groups are composition only, and routes address destinations rather
than defining capability identity. A Surface does not require a record level.
Mixed and unproved capabilities remain unclassified; Surface is not a catch-all.

Kitchen Menus proves Collection / Focus through its collection and canonical record
with local perspectives. Kitchen Identity proves Surface orientation through a
Kitchen breadcrumb, title and public destination above existing domain editors.
Source: `fireux-kitchens/src/runtime/kitchen/components/Workspace/Menus/Index.vue`
and `Workspace/Identity/Index.vue` with its `Profile.vue` and `Listing.vue` children. This is a bounded presentation proof, not a
classification rollout. No runtime descriptor, registry, shared renderer or new
Core contract is established by these two compositions.

## Other descriptive vocabulary

A Capability may classify its presentation, entry journey, and Tool meaning.
These classifications describe it; they are not more product layers.

- Presentation: catalogue, focus list, composer, queue, ledger, calendar,
  checklist, stocktake, configuration, report, or asset vault.
- Entry: quick create, search and connect, resolvable shell, guided create,
  import create, or derived create.
- Tool meaning: record, relationship, lifecycle, workflow, transform,
  operational, or analysis.

## Project proving set

Identity, Team, Test, Apps, and Ecosystem are Project capabilities.

## Kitchen proving set

Identity, Team, Test, Menus, Dishes, Drinks, Recipes, Ingredients, Food Safety,
Orders, Inventory, Purchasing, Receiving, Waste, Stations, Suppliers, Finance,
Costs, Waste Report, and Performance are Kitchen capabilities.

Overview is a Workspace summary surface. Calendar and Notifications are shared
Workspace controls and appear only where evidence and authority are proved.
Kitchen owns the numbered-table count through its Identity command (`tables.count`); separate table operations/records are not implied.

## Ownership rules

- A Capability owns its records, Tools, lifecycle, authority, and pages.
- A Tool names user intent; its command may perform several atomic writes when
  the domain invariant requires it.
- A compound Tool coordinates owned Tools without bypassing their validation or
  authority.
- Team and Identity are capabilities, not exceptional peers requiring another
  classification system.
- Domain capability sets may differ. Alignment means matching grammar and
  placement, not inventing identical features.

## Current migration boundary

Project, Kitchen, Supplier, Portfolio and Property Workspace catalogues use
Capability terminology. Older public App discovery at `/operations` and the
shared metadata/agent adapter fields retain their existing external contract.
They are a separate product-route/provider migration and do not establish a
second Workspace Operation layer. Portfolio Compliance/Documents/Tasks destinations are contributed by their
named extensions beneath the same Portfolio owner; inspect all contributing
packages before classifying a capability or retiring an import. Supplier/Portfolio/Property Test surfaces
explicitly report that storage is not connected; only Project and Kitchen
currently consume the string Test command pipeline.

Project, Kitchen, and Supplier root surfaces consume the same Core
`WorkspaceCrud` interaction. Their Entity-owned slots and available actions
remain deliberately different.

## Command intent at the client boundary

Team's five domain adapters retain their named authoritative commands. Core
`composables/fireux/commands/useCommandScope.ts` captures a local
intent epoch from explicitly supplied reactive sources and disposal. It is not
an executor, access policy, transaction boundary or capability registry.

A pending credential request must not dispatch after its Entity, account,
App membership or App changes, including a change away and back. A write
already dispatched may return its truthful result; obsolete completion must
not select records, clear another draft, close another dialog, show a toast,
or navigate. Shared Team forms therefore observe account/App/membership as
well as their local record/draft/dialog intent. Onboarding creation adapters
snapshot inputs before credentials, while their active surface owns completion
selection and navigation. Property onboarding retains its trusted creation planner; the unused manual
creation adapter and its unconnected public control are retired. A rendered
Property creation Tool must be proved before it is advertised.

Project/Kitchen Test and Kitchen Offerings consume that same local intent
mechanism without introducing a generic capability executor. Portfolio Document
and Task contributions retain Portfolio ownership and exact command results;
Property Reservations retain their protected night-lock transaction. Business
Kitchen Offerings are parent-owned records, distinct from the trusted Service Layer.

Source-owned scope tests live in Core `src/test/workspace-team-command-scope`,
`team-ui-completion-scope`, and `onboarding-command-scope.test.mjs`, with Kitchen
onboarding completion tests protecting live-collection handoff. These controlled
checks do not establish browser or production use.
