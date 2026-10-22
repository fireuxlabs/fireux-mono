# Product language

Updated: 2026-10-21
Ref: 411ea9ffe
Role: map, not canon

## Purpose

Give FireUX one bottom-up product language. Copy starts with the smallest real
product nouns, actions, fields, states, and relationships. Each parent
summarises its children until the landing can summarise the product without
inventing a second marketing vocabulary.

Source remains authority. This map explains how to derive literature from
source; it is not a catalogue of permanent strings.

## FireUX glossary

These terms have repository-specific meanings. Do not substitute a generic
SaaS definition when reading or designing FireUX:

| Term               | FireUX meaning                                                                                                                                                                                                                                                                      | Not this                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **App**            | A deployed FireUX product identity. Its `role` is exactly `global`, `tenant`, or `standalone`.                                                                                                                                                                                      | A Workspace, customer account, or Team.                                                                      |
| **Global App**     | The ecosystem-facing App that can expose several authorized Workspace targets and commonly lets the User choose among them.                                                                                                                                                         | A globally privileged User or universal database.                                                            |
| **Tenant App**     | A dedicated, usually branded App with `App.role = 'tenant'`. It uses the same package-owned entities, CRUD, Workspace contracts, and `AppUser` relationship as a global App, while it may auto-select a bounded target and vary routes, creation defaults, brand, and presentation. | A separate `Tenant` entity, tenant collection, customer-account hierarchy, or `TenantUser` membership model. |
| **Standalone App** | An App with `App.role = 'standalone'`; it remains an explicit role rather than a fallback for an unknown configuration.                                                                                                                                                             | A tenant without an Ecosystem.                                                                               |
| **AppUser**        | The relationship between a Core User and one App, including App access, role, subscription, and App-scoped profile data. Tenant-App users are AppUsers too.                                                                                                                         | A Project developer Team or a Workspace Team member.                                                         |
| **Team**           | An Entity-owned roster of people and assigned role labels. Workspace access is a separate authority contract.                                                                                                                                                                                             | The App's complete User collection.                                                                          |
| **Workspace**      | The working surface for an Entity, available from arrival; saved records, selection and authorized actions remain distinct.                                                                                                                                                                           | A Tenant entity or owner of domain records.                                                                  |

The behavioral contract and accepted differences between global and tenant
Apps live in [Tenant and global App family](family-tenant-global.md).

Current development access for Kitchen, Project, Supplier, Property, Portfolio
and Blank requires sign-in, current App membership and a domain-owned access
record bound to that membership's creation timestamp. AppUser stores no Entity
associations. Team labels do not grant access; subscription limits remain
enforced and every Team member counts toward capacity. Individual Team-role
restrictions are deferred, not an implemented permission policy. Any future role
policy requires a separate accepted and verified change. These application checks
also do not make the current development-open Firestore Rules private or secure.
See the global context's data and mutation rules and the owning trusted commands.

## Industry operating system positioning

“[Brand] is a [domain] operating system” describes the product's intended
operating scope: connected Apps and Workspaces with domain capabilities, Tools
and service workflows. It does not describe a computer operating system or prove
that every capability is shipped. FireUX is an industry SaaS framework for
industry founders and the teams building their software. Shared SaaS foundations
and industry libraries compose connected Apps and Workspaces; Nuxt and Nuxt UI
provide the technical and interface foundation. Core's platform context publishes
that shared meaning. FireUX App owns the three public offer paths in
`app/content/meta/source.ts`: Build with FireUX, Create your industry SaaS and
Create your branded App. Their resource, scoping and intake journeys remain
distinct from end-customer use of an industry product.
The named Ignition product family has one owner in the
[FireUX App intake context](../../projects/fireux/fireux-app/docs/ai/ignition-intake-context.md#product-intent-and-family).
Current feature and release claims still derive from implemented behaviour below.

## The language tree

Read and write from the bottom upward:

1. **Atom** — a field, state, command, measurement, or relationship.
   Examples: selling price, station, portion, completed, gross sales.
2. **Part** — a bounded group of atoms that performs one job.
   Examples: Dish Spec, Prep items, Recipe lines, period selector.
3. **Record or entity** — the product object composed from those parts.
   Examples: Dish, Menu, Order, KitchenSale, Supplier.
4. **Capability** — one area of responsibility whose Tools work with records.
   Examples: Dishes, Menus, Orders, or Kitchen sales reporting.
5. **Workspace or product area** — the capabilities available to one working
   context.
6. **Ecosystem or App** — the products and workspaces it composes.
7. **Landing** — the shortest truthful summary of the proven tree below it.

A parent may summarise or group its descendants. It may not introduce a noun,
action, outcome, or promise that has no named child or source-defined release
contract below it.

## Evidence to product

Product discovery follows one traceable sequence:

```text
sourced evidence
→ operator jobs
→ bounded Tool hypotheses
→ capability decisions
→ implemented capability pages
→ Workspace and landing literature
```

App-owned `app/search-demand.ts` records the market-level evidence, analysis,
Tool hypotheses, and capability decisions for that App domain. A domain package
keeps deeper capability research beside the capability owner. Core renders the
shared stages but does not decide an App's Tools or capabilities. The shared
contract in `packages/core/fireux-core/src/config/app/search-demand.ts` also
supports official statistics, surveys, interviews, discussions, regulatory and
operational guidance, product documentation and operator cases. Direct observations carry findings and
limitations, with stable IDs for cluster and assessment references. Capability
assessments distinguish operator-need confidence and market-validation gaps from
dated implementation scope and source paths. A decision to establish a capability
is neither evidence of paid demand nor a claim that its Tools are implemented.
Unaccepted industry briefs use `proposed`; their validation priorities express
product judgement rather than measured demand or runtime navigation order.

A Tool hypothesis names a job and expected outcome to test. It is not an
implemented Tool and does not grant authority. A capability groups related Tool
hypotheses only when their records, authority, and operator meaning support one
owner. Capability pages may then present a truthful Hero, demonstration, current
Tools, and AI assistance derived from the implemented children. Higher
literature must preserve the difference between observed evidence, a hypothesis,
a product decision, and released behavior.

## Workspace, Capability, and Tool

Use the accepted product hierarchy:

```text
Workspace → Capability → Tool → authorized command
```

- A **Workspace** is the working surface for a selected subject, available from
  arrival even before information is saved. Selection and authority remain
  separate from the existence of the surface.
- A **Capability** is one area of responsibility within that Workspace, such as
  Identity, Team, Menus, Orders, Purchasing, or sales reporting.
- A **Tool** is one supported action within a Capability, such as Create Menu,
  Add Menu Section, Invite Member, or Publish Menu.
- A trusted **command** executes the action under its real authority. A visible
  control, prepared AI action or capability description does not authorize a write.
- **CRUD** is the record-mechanics floor. Prefer the product verb—connect,
  publish, approve, import, calculate, receive—when that is the user's actual
  intent.

There is no separate Workspace **Operation** layer. Use “operation” for an
executed action or operational data, not as another name for a Capability.
Identity and Team are capabilities; reports classify capability presentation
rather than creating another product layer. Compound Tools may coordinate
capabilities while preserving each owned Tool's validation, authority and
failure boundary.
Human and AI surfaces use the same supported Tools and authority boundaries.

Core's `runtime/utils/platform-context.ts` publishes this grammar. Kitchen's
`kitchen/models/capabilities.ts`, the Menus Workspace route and Project Team
composition demonstrate its current use. Their existence does not prove every
catalogued Tool or capability is fully implemented.

Classify capabilities independently by surface family, entry journey and Tool
meaning, following the
[Workspace, Capability, and Tool family](family-workspace-capability-tool.md).
These classifications are not extra hierarchy levels.

### Legacy terminology boundary

Current public `/operations` discovery routes and older domain catalogues still
use Operation names; Kitchen capability data also uses the retained
`FireuxMetaOperation` transport type. Those names do not establish a separate
Workspace layer. Keep references to actual routes and source identifiers exact.
Renaming or retiring them is a separate consumer-aware migration, not part of
changing product copy. Older maps that define Operation as a Workspace layer
must not override the accepted hierarchy above.

## Construction rule

Use:

**real action + product object + observable result**

Prefer:

- `Manage your dishes.`
- `Set the selling price and specification. Connect prep items and recipes.`
- `Record ingredients, quantities, methods and yields. Connect recipes to dishes.`
- `Review gross sales, completed sales, and average sale for a selected period.`

Reject:

- slogans that cannot be verified from a child;
- metaphors standing in for product behavior;
- statements about what the user already knows;
- vague benefit words such as seamless, powerful, effortless, calm, clear, or
  connected without naming the records or relationship;
- explanations of internal automation when the surface should explain what
  the user can inspect or do;
- `publish once`, which describes an internal action without naming what
  becomes available, where it appears, or who can use it;
- `everything in one place`, `transform your workflow`, `order your way`, and
  similar copy that could describe an unrelated product.

## Tense and release state

Product literature uses the present tense for the intended release product.
That does not permit invention.

A present-tense claim needs at least one current source anchor:

- a model field or state;
- a named command, route, component, or child page;
- an executable guard or test;
- an approved, source-linked release contract in the relevant concept map.

Implementation readiness is tracked in source, tests, guards, or delivery
notes—not weakened into public copy with `will`, `coming soon`, or speculative
claims. If no source anchor exists, the claim is not product literature yet.

## Parent test

Before writing or changing parent copy:

1. Name the parent.
2. List its immediate children from current source.
3. For each child, list its nouns, actions, states, and outputs.
4. Remove navigation-only children such as Overview unless navigation itself
   is the subject.
5. Write the shortest sentence that explains those children.
6. Remove every adjective and benefit claim that the children do not prove.
7. Check that the same nouns retain the same meaning at every higher layer.

When child source changes, review the nearest parent literature and continue
upward only where the summary is now inaccurate.

## Misebox example

Current Dish children include:

- Spec: station, portion, components, assembly.
- Prep items.
- Recipes.
- Finance: selling price, estimated cost, margin, and sales projection where
  the bounded presentation supplies them.

Therefore the Dishes capability may say:

`Manage your dishes. Set each dish's specification and selling price, connect
its prep items and recipes, and review sales and costs.`

Kitchen Finance is a report over KitchenSales. Its current children are period
selection, gross sales, completed sales, and average sale. Therefore its
surface says what can be reviewed; it does not lead with “what the Kitchen
earned,” automatic conversion, profit, cash, or a generic Finance promise.

The Kitchen Workspace may summarise its current capability tree. Identity and
Team are capabilities alongside the domain capabilities. Sales, Costs, Waste
Report, and Performance are report presentations within that capability tree.
The Agent root combines Kitchen selection with the overarching Kitchen AI; Overview summarises the
selected Kitchen. QR is Menu tooling; Overview may expose quick access to
important Menu QR results without owning the Tool. Food Safety is a current capability doorway;
HACCP is one deeper concern within that capability, not a separate top-level
domain. Training belongs under Team. Purchasing and Receiving are distinct
capabilities, while Suppliers is grouped under Kitchen Setup. Navigation groups
such as `Operations`, `Reports`, or `Kitchen Setup` do not add product layers.
The Kitchen capability catalogue contains those selected-Kitchen meanings.
Misebox may summarise the Kitchen Workspace, ordering, Jobs, Suppliers, and other composed
products. Its landing may summarise those sections only after their lower
language is stable.

## Ownership

- Atom and record language belongs with the model and owning package.
- Part, Capability and Tool language belongs with the component/content catalogue
  that owns that behavior.
- Workspace language belongs with the Workspace owner.
- Ecosystem language belongs with the ecosystem package.
- Landing composition belongs with the App or shared landing adapter, but its
  vocabulary is inherited from the lower owners.
- Translation changes language, not product meaning. Reviewed translation
  follows `translation.md` after the source literature is approved.

Do not centralise every string in this document. Centralise the derivation
method and keep source literature beside its owner.

## Product surfaces

A product surface is a distinct place where a user or operator uses the App,
such as a Workspace, mobile Menu, Kiosk, public profile, guest guide, or
storefront. A Capability inside a Workspace is not another product surface.

For authenticated navigation, `Dashboard` names the User and App overview and
`Workspace` names the selected operational product area. Do not use `workspace`
as a substitute for either surface. Keep that word only where it literally
describes repository tooling or a physical workplace.

Main App landings present Hero, pricing, product surfaces, then deeper
App-owned features. Present a single surface directly without a selector or a
visible `Surfaces` label. Use a selector only when the App has multiple genuine
usage surfaces backed by current routes.

## Pricing literature

Pricing separates product access, operating capacity, human service, product
identity, and new development:

- **Free** is one functional Workspace Entity with App-owned capability limits.
- **Professional** is one fully enabled self-managed Workspace Entity at CHF
  20/month.
- **Business** is multi-Entity operating access at CHF 100/month plus CHF
  20/month for each Entity.
- **Managed** is an optional service added to Professional or Business at CHF
  100/month plus CHF 20/month for each selected managed Entity. The SaaS owner
  supplies the manager through real Team authority; it is not another product
  entitlement or unlimited work. FireUX App does not currently offer Managed.
- **Your App** is a separate product identity at CHF 600 setup including one
  Entity, CHF 100 setup for each additional Entity, and CHF 50/month for each
  Entity. Creation, onboarding, and migration are bounded to existing
  capabilities. The App owner manages its customers.
- **Your Ecosystem** belongs only to FireUX. It is CHF 1,200 setup plus CHF
  50/month maintenance and gives the ecosystem owner half of each customer
  App's setup and monthly price.
- New capabilities, Tools, integrations, third-party charges, and exceptional
  usage are not silently included; new development is quoted separately.

Core App access retains the stored `free | premium | business` entitlement
vocabulary while public pricing presents `Free | Professional | Business`.
Core pricing owns the pre-designed amounts and formulas; each Main App owns a
thin `useXPricing` wrapper containing its Entity noun, capabilities, Managed
availability, and ecosystem-offer policy. Shared pricing components receive
that result as presentation data. Pricing literature does not belong in
`nuxt.config.ts` or public runtime config. Tenant Apps do not own or advertise
the FireUX ecosystem-creation offer.

The pre-designed prices are intentionally derived from the CHF 20 Professional
Entity value: Business and Managed bases are five Entity units, additional
Business and Managed Entities are one unit, App additional-Entity setup is five
units, App monthly Entity service is two-and-a-half units, and App creation is
thirty units. When editable pricing is introduced, changing the unit must
produce a reviewed proposal for every dependent amount rather than silently
changing published offers. Product owners may then accept or round each price.

## Current source

- `packages/core/fireux-core/src/runtime/models/workspace-team-member.model.ts`
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/core/operator-access.ts`
- `packages/core/fireux-core/src/runtime/utils/platform-context.ts`
- `packages/core/fireux-core/src/runtime/components/Workspace/Capability.vue`
- `packages/ecosystem/fireux-fireux/src/runtime/project/components/Workspace/Team/Index.vue`
- `packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/food-and-drink/menus/index.vue`
- `packages/core/fireux-core/src/config/app/meta-content.ts`
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/capabilities.ts`
- `packages/extensions/fireux-suppliers/src/runtime/supplier/models/operations.ts`
- `packages/ecosystem/fireux-misebox/src/runtime/content/solutions.ts`
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FoodAndDrink/Items/Detail/Index.vue`
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Overview/Finance.vue`
- `projects/misebox/misebox-app/app/components/Landing/Index.vue`
- `packages/core/fireux-core/src/runtime/app/composables/pricing/usePricing.ts`
- `projects/*/*-app/app/composables/use*Pricing.ts`

## Verification

For literature work:

- inspect the current source and immediate children before drafting;
- search for duplicated or contradictory parent copy after changing a shared
  noun;
- verify that every present-tense capability has a source anchor;
- verify changed references and claims; for runtime copy changes, run focused
  checks and relevant source-owned tests for the affected consumers;
- run `git diff --check`; the former product-landing and repository guards are
  removed;
- visually check interactive copy when the selected child changes it;
- update this map only when the derivation method or ownership boundary
  changes.

## Customer food discovery copy

Customer Menu copy must help people choose food, understand availability or take
the next step. Omit filler subtitles and internal platform terminology such as
“independent publishers”. Venue identity supports the food choice.
