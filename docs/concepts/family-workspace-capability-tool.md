# Workspace, Capability, and Tool family

Updated: 2026-10-14
Ref: d3c361587
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

The trusted service layer coordinates use cases through domain-supported behaviour. It may use one or several capabilities and keeps workflow-specific execution state, such as an Order's acceptance/payment lifecycle, with the owning workflow. Ordering through a Menu does not make Orders a nested Menu field or make ordering execution a Menu editor responsibility. The previous Menu-order execution boundary is deleted. The rebuilt Ordering capability keeps Order facts separate from submission state, revision and responses. Kitchen owns protected saving, submission and operator transitions; Menu owns canonical item and price resolution for public submissions. See [Ordering boundary](order-processing-kitchen-fulfilment.md). Payment execution and driver dispatch remain outside this implementation. The save command retains its H3 authentication adapter; it is not a transport-independent service API.

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
constraints. Public Menu/Kitchen readers use supported child projections, and the rebuilt Menu submission command validates those projections transactionally.
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

## Capability Surface Spine

The **Capability Surface Spine** names the reusable composition discipline:

```text
Thin route → named composition → focused controls
                              → domain readers and protected commands
```

It inherits `AGENTS.md` and `../ai/gpt-context.md`. It is a pattern for a
capability destination, not a new product layer, mandatory folder scaffold,
storage schema, executor or universal renderer. A capability may have several
named surfaces. Domain-specific models, authority and services remain local.

### Default application

Apply this spine when the first useful surface is built and whenever it grows.
Identify meaningful responsibilities and their owners before writing the parent;
compose as those responsibilities emerge instead of postponing the separation
until a refactor. Completion includes inspecting the resulting composition and
its real consumers. Readable formatting is required, but formatting alone does
not establish composition. Keep a small cohesive surface small: no field-by-field
component rule, mandatory controller layer or forwarding scaffold is introduced.

### Rules

1. **Thin routes.** Declare navigation, access requirements and the entry
   component. Keep domain validation, persistence and workflow execution out
   of route adapters.
2. **Named compositions.** Compose a concrete responsibility such as Payments
   or Delivery. Avoid a generic section switch when the sections have distinct
   jobs. A composition must add real framing, read states or interaction
   coordination; do not add forwarding layers just to match this diagram.
3. **Focused controls.** Give each extracted control a meaningful interaction
   responsibility. Field-by-field components are not required. Local presentation
   helpers may stay beside their consumers; domain readers and commands retain
   their technical-role owners.
4. **Domain meaning and authority.** The domain owns models, validation, storage
   and protected commands. Upper surfaces consume supported readers and tools;
   UI location never changes data ownership.
5. **Honest read states.** Keep pending, failure, missing and settled empty
   distinct. Clear obsolete data on account, membership, Entity or destination
   changes, and dispose live work with its owning surface.
6. **Preserved command intent.** Capture input before asynchronous credentials,
   invalidate obsolete dispatch/completion, enforce current server authority and
   use revisions where concurrent editing requires them. Refreshing data must
   not occupy the same interaction lock as a user command.
7. **Real-system libraries.** Package-owned Library examples consume real models,
   components and shared validation with explicitly supplied example data.
   Preview effects remain separate from live commands. Library is not a
   developer diagnostic or Workspace Demo Data owner.
8. **Proved sharing.** Reuse established lower mechanics immediately. Extract a
   new universal component only after materially different real domain members
   prove the same contract. Names and matching folders alone are insufficient.

### Current comparison and verification

Paths below are relative to `packages/extensions/fireux-kitchens/src/runtime`.

| Surface | Named composition and controls | Shared fundamentals and accepted differences |
| --- | --- | --- |
| Kitchen Payments | `kitchen/components/Workspace/Identity/Payments/Index.vue`, `Methods.vue` | Reuses `useKitchenFulfilment`; payment applicability controls own their focused command intent. Identity placement does not move Kitchen storage. |
| Kitchen Delivery | `kitchen/components/Workspace/Orders/Delivery/Index.vue`, `Areas.vue`, `Zones.vue` | Reuses the same settings reader and protected commands; geographic area editing differs materially from payment-method selection. |
| Services setup | `kitchen/components/Workspace/Offerings/Index.vue` | Reuses Offering readers/setup and the named Delivery composition outside the Orders capability. No new configuration store. |
| Ordering library | `kitchen/components/Library/Orders.vue`, `Orders/Preview.vue`, `Orders/Success.vue` | Local examples reuse the real Ticket, Order reader and submission validator; previews have no live submission authority. |
| Customer ordering | `menu/components/Order/Index.vue`, `Order/{MenuItems,Cart,Details,Response}.vue`, `menu/composables/useMenuOrderFlow.ts` | Explicit presentation inputs/actions; the controller retains scoped transport, receipt lifetime and shared validation/serving-hour checks. |
| Order board | `kitchen/components/Workspace/Orders/Board.vue` | Access-bound reads, independent refresh/action transports and revision-guarded transitions; a working queue has different controls from settings. |

These files are **locally aligned** with the pattern. Payments and Delivery prove
separate named compositions within Kitchen, not a cross-industry universal
component family. Their repeated read-state framing remains an accepted local
composition; extraction awaits a materially different domain consumer.

Verify the bounded contracts with `src/test/kitchen/order-draft.test.mjs`,
`kitchen/order-submission.test.mjs`, `payment-completion-scope.test.mjs` and Core
`editable-completion-scope.test.mjs`, plus the consuming App typecheck and browser
surfaces. Tests prove their encoded behaviours, not repository-wide adoption.
Refresh this section when ownership, consumers or protected behaviour changes;
use current source and checks above the map, and keep temporary task state out.

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

## Entity–Capability–Service Spine

This is a repository-wide ownership and composition discipline, extending the
Capability Surface Spine. It applies to Apps, ecosystems, extensions and Core;
it does not assert that every existing owner is aligned.

- **Entity or domain owner:** owns identity, contracts, storage meaning and
  invariants. Parent-owned records retain their real parent. Technical owners
  and product compositions do not become Entities through folder naming.
- **Capability:** names a supported business responsibility, with its rules,
  commands and surfaces. It is not a compulsory storage or folder container.
- **Service:** coordinates a concrete use case through supported domain
  capabilities. It owns sequencing and the transaction boundary where required,
  while each participating domain retains its validation and authority.
- **Surface:** composes the controls for that responsibility; client controllers
  own interaction state and lifetime, not trusted execution authority.

### Placement and admission rules

1. Use `owner → technical role → meaningful capability` when the capability
   needs several related files. A cohesive single file may remain directly under
   its role. Never create empty peer folders for symmetry.
2. Keep Nuxt-discovered routes, layouts and transport entrypoints at the runtime
   root. Register nested components/composables explicitly. Routes delegate to
   named owner compositions; domain commands remain server-owned.
3. A service may be an existing named function in `server/<capability>/...`.
   `server/services` is optional, not the target shape. Do not introduce a
   forwarding service around one command or move files merely to gain the name.
4. Place coordination with the lowest owner of the complete use case, following
   `App → Ecosystem → Extension → Core`. Cross-domain coordination within a
   cohesive extension does not automatically require ecosystem placement.
5. Share lower mechanisms and supported contracts. Do not bypass another
   domain's validation, reproduce its storage logic, or put domain branches in
   Core to make coordination generic.
6. Keep models/input contracts independent of UI controllers; pure transforms
   belong in utils, trusted orchestration in server, interaction lifecycle in
   composables, and presentation in components.
7. Separate command and client lifetimes: snapshot intent, check current
   authority, reject obsolete UI continuations, preserve truthful completed
   writes, and make retries/idempotency explicit when needed.
8. Promote shared implementations only after materially different consumers
   prove the same contract. This discipline does not prescribe one universal
   renderer, service class, controller interface or folder inventory.

### Proving comparison: publication and ordering

Source paths below are relative to `fireux-kitchens/src/runtime`.

| Boundary | Menu publication | Customer ordering |
| --- | --- | --- |
| Surface | `kitchen/components/Workspace/Menus/Publication/Actions.vue` | `menu/components/Order/Index.vue` and named checkout/response children |
| Domain rules | `menu/server/publication/validation.ts` | `menu/server/ordering.ts` resolves canonical items, prices, fulfilment and serving hours; Kitchen submission validation owns order completeness/transitions |
| Use-case coordination | `publishKitchenMenu` in `menu/server/publication/publish.ts` | `submitKitchenOrder` in `kitchen/server/orders/submission.ts` |
| Transaction invariant | Validate publication and update scoped Menu/public root projection together | Validate authority and canonical Menu selections; number and persist one submission together |
| Material difference | Operator-authorized publication, including idempotent published projection | Customer/operator entrances, caller-bound idempotency, expected totals and execution state |
| Transport | `server/api/workspace/kitchen/menus/{publish,unpublish}.post.ts` | `server/api/ordering/{menu-submit,submit,response}.post.ts` and Workspace response adapters |

The surviving invariant is **named owner surface → domain-owned lifecycle →
trusted use-case coordination → participating domain rules**, with authority
and transaction consistency retained. It does not require identical filenames
or a shared coordinator implementation. Publication is already a compound
command with service responsibility; it needs no additional wrapper. Ordering
remains Kitchen-owned while consuming the supported Menu resolver.

Submission's `kitchen/server/orders/submit-request.ts` owns HTTP credential/App
preparation. `submitKitchenOrder` receives explicit server context and owns the
transaction without reading an HTTP event. Its actor input is trusted internal
server context, never client-authored authority. Operator submissions require an
operator context; public Menu submissions retain canonical target validation.
Response/read/list request preparation lives in `exchange-request.ts`; those
services also receive explicit server actor context. The HTTP adapters retain
body/query parsing and private no-store headers. Domain services keep authority,
revision/transition checks, caller/App receipt ownership and complete scoped reads.
The current service errors use H3-compatible error objects; this is not a claim
of framework-independent error vocabulary.

Verification: `menu-publication.test.mjs`, `menu-workspace-commands.test.mjs`,
`menu-order-flow.test.mjs`, `kitchen/order-submission.test.mjs`, consuming App
typechecks and the current Menu ordering/serving-hour tests. Source-owned tests
prove their encoded contracts; live customer/kitchen response behaviour remains
a separate browser check. Refresh this comparison when authority or consumers
change.
