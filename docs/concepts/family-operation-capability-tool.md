# Operation, Capability, and Tool family

Updated: 2026-08-31
Ref: 388a5f755
Role: map, not canon

## Purpose

Define one product grammar for moving from demand evidence to Workspace work
without treating Operations, Capabilities, Tools, commands, and record writes as
synonyms.

This map explains the product classification asserted by Core. It does not
introduce a generic execution engine, stored Entity field, universal component,
or authority bypass.

## Links

- Parent: [spine.md](spine.md)
- Workspace application: [family-workspace-entity.md](family-workspace-entity.md)
- Product language: [product-language.md](product-language.md)
- Creation families: [create.md](create.md)
- Operation page reference: [family-like-menu.md](family-like-menu.md)
- Tool execution transport: [tool-provider.md](tool-provider.md)
- Workspace source map: [workspace.md](workspace.md)
- Core family contract:
  `packages/core/fireux-core/src/config/app/capability-families.ts`
- Current guard: `scripts/guards/operation-tools.mjs`

## Product hierarchy

Use these terms consistently across every Workspace:

- A **Workspace** is the product surface for operating one active root Entity.
- An **Operation** is a stable user-facing working area inside that Workspace,
  normally represented by a navigation destination. Menus, Orders, and
  Purchasing are Kitchen Operations.
- A **Capability** is something an Operation or baked-in Workspace peer can do.
  Menu composition is a capability of Menus. Team and Identity are baked-in
  Workspace peers with capabilities; they are not Operations.
- A **Tool** is one bounded action a person or agent can deliberately invoke
  beneath a capability. Create Menu, Add Menu Section, and Publish Menu are
  Tools.
- A **command** is the authorized execution boundary behind a Tool. A Tool does
  not gain authority merely because it is visible or callable by AI.
- **CRUD** describes record-level create, read, update, and delete mechanics.
  It is the implementation floor, not the complete product vocabulary.

Use the complete evidence chain:

```text
sourced demand evidence
→ operator job
→ bounded Tool hypothesis
→ capability decision
→ Operation or baked-in Workspace peer
→ implemented Tool
→ authorized command
→ record reads and writes
→ visible result and evidence
```

A search phrase does not create a Tool. A Tool hypothesis is not an implemented
Tool, a capability decision is not a release claim, and a visible control is
not mutation authority.

Public Operation discovery uses the Core-owned `/operations/[slug]` page.
Each App supplies its own Operation title, description, Workspace destination,
and evidence-led guiding literature through `FireuxMetaOperation`; an App does
not fork the page merely to restate that content. The signed-in Workspace page
may expose only the capabilities and Tools its domain authority actually
proves.

## Three independent family axes

Classify each capability separately by its surface, its entry or creation
journey, and the meaning of its Tools. These axes may be combined; none replaces
the others.

### Surface families

| Family | Working shape | Current or intended examples |
| --- | --- | --- |
| Entity Gate | Establish, create, or attach the active Workspace Entity | Workspace Index/Create |
| Overview | Summarise authoritative child outcomes and open their owners | Workspace Overview |
| Identity Sheet | Read or edit the active Entity's canonical identity | Workspace Identity |
| Team Governance | Read and manage the active Entity's access authority | Workspace Team |
| Focus List | Small working set, one temporary selection, first loaded item by default | Active Menus, Stations, Team, connected Suppliers |
| Catalogue | Searchable or filterable collection with record detail | All Menus, Dishes, Recipes, Supplier items |
| Relationship Directory | Find, connect, disconnect, invite, or resolve another Entity | Suppliers, Team membership |
| Structured Composer | Build and reorder a structured record | Menu, Recipe, Project Brief |
| Work Queue | Prioritized records moving through operational states | Orders, preparation work |
| Event Ledger | Chronological facts whose history matters | Stock movements, payments, audit events |
| Calendar | Time-positioned records and navigation | Reservations, shifts, scheduled work |
| Control or Checklist | Define requirements and record accountable checks | Food Safety, Station readiness |
| Count or Stocktake | Record observed quantities and reconcile differences | Inventory |
| Configuration Sheet | Maintain persistent operating policy or routing | Station routing, delivery settings |
| Report | Read and compare measures derived from authoritative records | Sales, Costs, Waste, Performance |
| Asset Vault | Upload, select, and reuse bounded media or documents | Menu media, operational documents |

The same surface family should retain familiar interaction grammar: selection,
create placement, pending and empty states, and route progression. Domain nouns,
fields, limits, lifecycle, and authority remain with the owning capability.

### Entry and creation families

| Family | Entry contract | Examples |
| --- | --- | --- |
| Quick Create | A few fields create an immediately useful record | Station, blank Menu |
| Search and Connect | Find a canonical record and create a relationship | Existing Supplier |
| Resolvable Shell | Create the smallest local identity and resolve the external relationship later | New Supplier, Kitchen, invited person |
| Guided Create | A staged journey captures consequential decisions | Project, App |
| Import Create | A file, URL, image, or external source produces a reviewed draft | Menu import |
| Derived Create | Another capability produces the proposed record | Purchase requirement from Inventory evidence |

The family names the journey, not storage authority. Search and Connect never
permits one domain to overwrite another domain's canonical Entity. A Resolvable
Shell must remain visibly incomplete until its owning resolution lifecycle is
proved.

### Tool-meaning families

| Family | Product verbs |
| --- | --- |
| Record | create, view, update, archive, restore, delete |
| Relationship | connect, disconnect, invite, claim |
| Lifecycle | activate, deactivate, publish, retire |
| Workflow | submit, approve, reject, hand off, reconcile |
| Transform | import, generate, calculate, scale, translate |
| Operational | start, pause, receive, serve, complete |
| Analysis | compare, summarise, forecast, audit |

Prefer the verb that names the operator's intent. `Publish Menu` may update
records, but calling it `Update Menu` hides its lifecycle, audience, and
authority. Destructive Tools must name their recovery rule; use Archive when
hard deletion is not explicitly authorized and recoverable.

## Local and compound Tools

A **Local Tool** has one owning capability, one authority boundary, one bounded
input, and one observable outcome. Its trusted command may atomically write
several records when the domain requires that invariant.

A **Compound Tool** coordinates two or more Local Tools or capability owners.
It must preserve each Local Tool's validation and authority, expose handoffs and
partial failure, and never become a shortcut around those boundaries.

AI discovers and invokes the same registered Tools as the human surface. It
does not receive a parallel mutation path or infer a Tool from a button label.

## Reference classifications

### Menus

- Operation: Menus.
- Capabilities: maintain a working Menu set, compose a selected Menu, import a
  source, and publish through supported surfaces.
- Surfaces: Focus List, Catalogue, Structured Composer, and Asset Vault.
- Entry: Quick Create or Import Create.
- Tools: Record, Transform, and Lifecycle Tools.

The active Menu selector is a deliberately small Focus List. All draft,
archived, historical, daily, and special Menus belong in the wider Catalogue.
The exact active-Menu capacity and any daily-Menu exception remain
`to-confirm`; do not encode five as a shared Workspace rule without product and
authority evidence.

### Suppliers

- Operation: Suppliers in the Kitchen Workspace; Supplier identity remains
  Supplier-owned.
- Capabilities: select connected Suppliers, connect a canonical Supplier, or
  begin a resolvable Supplier shell when none exists.
- Surfaces: Focus List and Relationship Directory.
- Entry: Search and Connect or Resolvable Shell.
- Tools: Relationship and bounded Record Tools.

Kitchen does not gain canonical Supplier mutation authority merely because the
Supplier appears inside a Kitchen Operation.

### Team and Stations

Team is a baked-in Workspace peer, not an Operation. Its Focus List and
Relationship Tools operate on the root Entity's Team authority and must respect
privacy; they do not expose a global searchable User directory.

Stations is a Kitchen Operation using a Focus List and Quick Create. Its fields,
capacity, and commands remain Kitchen-owned even when its interaction grammar
matches Menus or Team.

## Maintained Workspace inventory

Classification is mandatory for every visible Workspace peer and Operation.
Every registered Operation must provide `capabilityFamilies` through
`FireuxMetaOperation`; the public Operation reader rejects missing or invalid
values. Baked-in Workspace peers remain classified in this map until a proven
source catalogue owns them. The classification describes the product shape;
the final column records what current source actually proves. `Research` and
`doorway` never mean released.

### Baked-in Workspace peers

| Peer | Surface families | Entry family | Tool families | Current evidence |
| --- | --- | --- | --- | --- |
| Index/Create | Entity Gate | Family-owned: Quick Create, Search and Connect, Resolvable Shell, or Guided Create | Record or Relationship | Kitchen and Project prove trusted Create; other families retain explicit deltas in the Workspace map |
| Overview | Overview | — | Analysis only when backed by authoritative child records | Present across maintained families; depth varies |
| Identity | Identity Sheet, Configuration Sheet | — | Record, Lifecycle | Present across maintained families; edit authority varies |
| Team | Team Governance, Focus List, Relationship Directory | Search and Connect or Resolvable Shell when implemented | Relationship, Record, Workflow | Root Team is authority; Kitchen proves live Tools while other families are mostly factual reads |
| Notifications | Event Ledger | Derived Create | Record | Shared-shell capability; production actions remain authority-bound |
| Calendar control | Calendar | — | — until a family supplies dated evidence | Kitchen, Property, and Project have distinct date sources; it is not automatic Operation parity |

### Project and Blank

| Workspace | Operation | Surface families | Entry family | Tool families | Current evidence |
| --- | --- | --- | --- | --- | --- |
| Project | Apps | Catalogue | — | Record: view | Read-only projection |
| Project | Ecosystem | Catalogue, Relationship Directory | — | Record: view | Read-only projection |
| Blank | — | — | — | — | Structural harness with no Operations |

### Kitchen

| Operation | Surface families | Entry family | Tool families | Current evidence |
| --- | --- | --- | --- | --- |
| Menus | Focus List, Catalogue, Structured Composer, Asset Vault | Quick Create, Import Create | Record, Transform, Lifecycle | Create/read and import workflow exist; broader publishing remains capability-owned |
| Dishes | Catalogue | Quick Create | Record, Analysis | Record Tools exist; deeper analysis follows evidence |
| Drinks | Catalogue | Quick Create | Record; Transform and Analysis hypotheses | Record CRUD available; compound demand remains research |
| Recipes | Catalogue, Structured Composer | Quick Create | Record; Transform and Analysis hypotheses | Record capability exists; scaling and costing remain research |
| Ingredients | Catalogue, Relationship Directory | Search and Connect | Relationship; Operational hypotheses | Canonical Ingredient connection exists; stock and Waste handoffs remain separate |
| Food Safety | Control or Checklist, Event Ledger | Guided Create | Workflow, Operational, Analysis | Research doorway; no compliance claim |
| Orders & Service | Work Queue, Event Ledger | Derived Create | Operational, Workflow | Live ordering and service lifecycle are domain-owned |
| Inventory | Count or Stocktake, Event Ledger | Derived Create | Record, Operational, Analysis | Classification target; Tools require Inventory authority |
| Purchasing | Work Queue, Catalogue | Derived Create | Workflow, Relationship, Analysis | Research doorway; commitment and sending require separate approval |
| Receiving | Work Queue, Control or Checklist, Event Ledger | Derived Create | Operational, Workflow | Research doorway; accepted goods alone may hand off to Inventory |
| Waste | Event Ledger | Quick Create | Record, Operational | Record Waste is available; reporting remains separate |
| Stations | Focus List, Configuration Sheet | Quick Create | Record; Relationship and Workflow hypotheses | Add Station exists; routing, readiness, and competency remain research |
| Suppliers | Focus List, Relationship Directory | Search and Connect, Resolvable Shell | Relationship; Analysis and Workflow hypotheses | Selection exists; connect and downstream handoffs remain research |
| Sales | Report | — | Analysis | Bounded sales projection exists; broader reports remain research |
| Costs | Report | — | Analysis | Research doorway derived only from authoritative costs |
| Waste report | Report | — | Analysis | Recorded events exist; aggregation Tools remain research |
| Performance | Report | — | Analysis | Research doorway dependent on complete operational histories |

Kitchen Calendar is the shared top-bar Calendar control, not a separate
Operation. Tables remains outside Kitchen ownership. Mise is absent from the
current Operation catalogue after its stub was retired; reintroducing it
requires a new source-backed capability decision rather than documentation
parity.

### Supplier

| Operation | Surface families | Entry family | Tool families | Current evidence |
| --- | --- | --- | --- | --- |
| Catalogue | Catalogue | — | Record: view | Canonical Supplier catalogue read |
| Ingredients | Catalogue, Relationship Directory | — | Record: view | Read of connected canonical Ingredients |
| Items | Catalogue | — | Record: view | Canonical Supplier item read |

### Portfolio and Property

| Workspace | Operation | Surface families | Entry family | Tool families | Current evidence |
| --- | --- | --- | --- | --- | --- |
| Portfolio | Properties | Catalogue, Relationship Directory | Search and Connect | Record: view | Read projection exists; mutation family is not proved here |
| Portfolio | Compliance | Control or Checklist, Event Ledger | — | — | Doorway only |
| Portfolio | Documents | Asset Vault | Import Create | — | Doorway only |
| Portfolio | Tasks | Work Queue | Quick Create or Derived Create | — | Doorway only; entry remains `to-confirm` |
| Portfolio | Finance | Report | — | Analysis | Parked doorway |
| Property | Reservations | Calendar, Work Queue | Quick Create | Record, Workflow | Doorway only in the Property Workspace |
| Property | Calendar | Calendar | — | Analysis | Doorway only; dated Reservation evidence owns future behaviour |

This inventory blankets current top-level Workspace capability ownership. A
nested capability is classified by its owning Operation before implementation;
it does not become another Operation merely because it receives a route or SEO
page.

## Classification card

Before building or aligning an Operation or baked-in Workspace peer, record:

```text
operator job and sourced demand:
Operation or Workspace peer:
capabilities:
surface family:
entry or creation family:
Local Tools:
Compound Tools:
record and authority owners:
visible result:
```

Unknown classification remains `to-confirm`. Do not create a miscellaneous
family, a generic component contract, or a stored discriminator to make an
unclassified page appear complete.

## Evidence and extraction

The vocabulary and classification axes are shared. Component and composable
extraction still follows [spine.md](spine.md): two materially different members
must retain the same contract for the same reason after their authority and
lifecycle differences are visible.

Current source asserts the family vocabulary in Core and classifies the active
Project, Kitchen, Supplier, Portfolio, and Property Operation catalogues. It is
also comparing the Workspace Focus List interaction in Kitchen Team, Menus,
Stations, and Suppliers; the guarded records-then-tools page family is
established separately by Menus and the like-menu family. Classification does
not prove a reusable component or implemented Tool until named siblings,
authority, and guards establish that narrower spine.

## Verification

- Trace every implemented Tool to its capability owner, authority, command, and
  visible result.
- Verify Operation catalogues contain only active-Entity working areas.
- Verify baked-in Workspace peers do not leak into Operation catalogues.
- Verify demand evidence, Tool hypotheses, capability decisions, and released
  Tools remain distinct.
- Run the operation-tools guard through `pnpm guard` when executable Tool
  contracts change.
- Run `git diff --check` for documentation-only changes.
