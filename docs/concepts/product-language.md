# Product language

Updated: 2026-08-28
Ref: f061af90a
Role: map, not canon

## Purpose

Give FireUX one bottom-up product language. Copy starts with the smallest real
product nouns, actions, fields, states, and relationships. Each parent
summarises its children until the landing can summarise the product without
inventing a second marketing vocabulary.

Source remains authority. This map explains how to derive literature from
source; it is not a catalogue of permanent strings.

## The language tree

Read and write from the bottom upward:

1. **Atom** — a field, state, command, measurement, or relationship.
   Examples: selling price, station, portion, completed, gross sales.
2. **Part** — a bounded group of atoms that performs one job.
   Examples: Dish Spec, Prep items, Recipe lines, period selector.
3. **Record or entity** — the product object composed from those parts.
   Examples: Dish, Menu, Order, KitchenSale, Supplier.
4. **Operation or report** — what the user does with records.
   Examples: manage Dishes, organise Menus, run Orders, review Kitchen sales.
5. **Workspace or product area** — the set of operations available to one
   working context.
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
shared stages but does not decide an App's Tools or capabilities.

A Tool hypothesis names a job and expected outcome to test. It is not an
implemented Tool and does not grant authority. A capability groups related Tool
hypotheses only when their records, authority, and operator meaning support one
owner. Capability pages may then present a truthful Hero, demonstration, current
Tools, and AI assistance derived from the implemented children. Higher
literature must preserve the difference between observed evidence, a hypothesis,
a product decision, and released behavior.

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
- Mise en place requirements.
- Finance: selling price, estimated cost, margin, and sales projection where
  the bounded presentation supplies them.

Therefore the Dish operation may say:

`Manage your dishes. Set each dish's specification and selling price, connect
its prep items and recipes, organise mise en place, and review sales and costs.`

Kitchen Finance is a report over KitchenSales. Its current children are period
selection, gross sales, completed sales, and average sale. Therefore its
surface says what can be reviewed; it does not lead with “what the Kitchen
earned,” automatic conversion, profit, cash, or a generic Finance promise.

The Kitchen Workspace may summarise its current capability tree. Identity and
Team are first-class Workspace peers; they are not Operations. Sales, Costs,
Waste, and Performance are selected-Kitchen Reports. The Agent root combines
Kitchen selection with the overarching Kitchen AI; Overview summarises the
selected Kitchen. QR is Menu tooling; Overview may expose quick access to
important Menu QR results without owning the Tool. Food Safety is a current capability doorway;
HACCP is one deeper concern within that capability, not a separate top-level
domain. Training belongs under Team. Purchasing and Receiving are distinct
Operations, while Suppliers is Kitchen Setup. The Kitchen operation catalogue
contains only those selected-Kitchen product meanings. Misebox may
summarise the Kitchen Workspace, ordering, Jobs, Suppliers, and other composed
products. Its landing may summarise those sections only after their lower
language is stable.

## Ownership

- Atom and record language belongs with the model and owning package.
- Part and operation language belongs with the component/content catalogue
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
storefront. An Operation inside a Workspace is not another product surface.

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
- New Operations, Tools, integrations, third-party charges, and exceptional
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

- `packages/core/fireux-core/src/config/app/meta-content.ts`
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/operations.ts`
- `packages/extensions/fireux-suppliers/src/runtime/supplier/models/operations.ts`
- `packages/ecosystem/fireux-misebox/src/runtime/content/solutions.ts`
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Dishes/Dish.vue`
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
- run `pnpm guard:product-landing` while iterating, then the mandatory
  `pnpm guard` before handoff;
- visually check interactive copy when the selected child changes it;
- update this map only when the derivation method or ownership boundary
  changes.
