# Workspace, Capability, and Tool family

Updated: 2026-10-03
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
and `Workspace/Identity/Index.vue`. This is a bounded presentation proof, not a
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
selection and navigation. Property manual creation remains a separate effect,
not an atomic extension of Property onboarding.

Project/Kitchen Test and Kitchen Orders/Services consume that same local intent
mechanism without introducing a generic capability executor. Portfolio Document
and Task contributions retain Portfolio ownership and exact command results;
Property Reservations retain their protected night-lock transaction. Business
Kitchen Services are offering records, distinct from the trusted Service Layer.

Source-owned scope tests live in Core `src/test/workspace-team-command-scope`,
`team-ui-completion-scope`, and `onboarding-command-scope.test.mjs`, with Kitchen
onboarding completion tests protecting live-collection handoff. These controlled
checks do not establish browser or production use.
