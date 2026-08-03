# Product language

Updated: 2026-08-02
Ref: 796952bf0
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
5. **Console or product area** — the set of operations available to one
   working context.
6. **Ecosystem or App** — the products and consoles it composes.
7. **Landing** — the shortest truthful summary of the proven tree below it.

A parent may summarise or group its descendants. It may not introduce a noun,
action, outcome, or promise that has no named child or source-defined release
contract below it.

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

The Kitchen Console may summarise its current operation catalogue. That
catalogue follows real selected-Kitchen work rather than folder placement, so
Kitchen Identity and Team are Operations even though Console anatomy keeps
`Identity` and `Team` beside the structural `Operations` bucket. Finance is a
selected-Kitchen reporting Operation. Overview is the Console home. QR is Menu
tooling; Overview may expose quick access to important Menu QR results without
owning the Tool. HACCP is a parked future Kitchen Operation until its workspace
is wired. Training belongs under Team, and Purchasing belongs under Suppliers
if Kitchen-owned purchasing gains authoritative producers. Misebox may
summarise the Kitchen Console, ordering, Jobs, Suppliers, and other composed
products. Its landing may summarise those sections only after their lower
language is stable.

## Ownership

- Atom and record language belongs with the model and owning package.
- Part and operation language belongs with the component/content catalogue
  that owns that behavior.
- Console language belongs with the Console owner.
- Ecosystem language belongs with the ecosystem package.
- Landing composition belongs with the App or shared landing adapter, but its
  vocabulary is inherited from the lower owners.
- Translation changes language, not product meaning. Reviewed translation
  follows `translation.md` after the source literature is approved.

Do not centralise every string in this document. Centralise the derivation
method and keep source literature beside its owner.

## Current source

- `packages/core/fireux-core/src/runtime/models/system/meta-content.model.ts`
- `packages/extensions/fireux-kitchens/src/runtime/content/operations.ts`
- `packages/extensions/fireux-suppliers/src/runtime/content/operations.ts`
- `packages/ecosystem/fireux-misebox/src/runtime/content/solutions.ts`
- `packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Operations/Dishes/Dish.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Overview/Finance.vue`
- `projects/misebox/misebox-app/app/components/Misebox/Landing/Index.vue`

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
