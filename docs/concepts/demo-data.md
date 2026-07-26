# Demo World and Demo Data spine map
Updated: 2026-07-25
Ref: 796952bf0
Role: map, not canon

## Purpose

Map the deterministic read-only Demo World and its two named consumers:
Console Demo Data and a project's public Product Demo.

## Vertical links

- Parent: console.md
- Child: firestore-entity.md

## Horizontal links

- entities.md
- debug.md
- runtime-package.md

## Current contract

- Demo World is scenario data, not canonical storage, live public-content
  authority, dev preview content, test data, or simulation data.
- A fixture follows the current real entity/record shapes. Real models and
  adapters are authority; the application must never bend around a fixture.
- Demo aggregation follows the owning domain's operation vocabulary. In
  Kitchens that means Menu, Dish, Recipe, Mise, root Ingredient usage, and
  Kitchen-owned Supplier links. Supplier Ingredient coverage, priced Item
  offers, and `Catalogue` remain Supplier-owned and must not become Kitchen
  fixture or scenario concepts.
- The Kitchen Demo World may prove a production graph ahead of persisted model
  promotion: a Kitchen-scoped Dish Spec consumes measured root Ingredients,
  stable Prep items, or Recipes; a Menu selects the Dish; and dated Mise tasks
  produce the required Prep item or Recipe. Mise is work, not a fourth Dish
  component kind. Menu-item variants and add-ons own their component deltas
  instead of changing the Dish base Spec.
- This Demo production graph remains an explicit working seam, not storage
  canon. Promote it only after the model, collection, Rules, adapter, and guard
  contract have been agreed together.
- Reusable fixtures live with their package under `src/runtime/demo`.
- App-only fixtures live with their project under `app/demo`.
- An owning Console composable adapter loads fixtures with a dynamic import and
  `useConsoleDemoData`; inactive Consoles do not import or evaluate them.
- Every Console core that accepts the shared Demo source owns a matching lazy
  Demo adapter. Demo targets use the same selected-target and outcome spine as
  Live targets, and operation records remain scoped to their selected Demo
  parent rather than falling through to an empty or remote collection.
- `useConsoleDemoData` caches a successful local load and exposes
  `idle`, `pending`, `error`, `empty`, or `ready` without remote work.
- A project Product Demo has one named adapter at
  `app/composables/product-demo/use*ProductDemo.ts`. That adapter dynamically
  composes only its project's fixtures and Demo Worlds owned by packages the
  project consumes. It never imports another project's Demo World.
- Public Product Demo pages occupy the reserved `app/pages/demo` route family.
  They remain thin route compositions and consume the named adapter; they do
  not import fixture modules directly or become a second data authority.
- Demo World is read-only. Fixture modules do not depend on Firestore, Storage,
  Firebase Admin, server code, public adapters, or mutation code. Arbitrary
  runtime imports remain forbidden.
- Test and simulation sources remain separate because they are allowed to
  exercise writes. Dev fixtures remain with authenticated dev tooling.

## Authority and refresh

- Entity models, DTOs, and console adapters define current shapes.
- `scripts/guards/demo-data.mjs` enforces location, deferred loading, consumer,
  ownership, and dependency boundaries.
- Refresh fixtures in the same change when a real shape used by Demo changes.

## Verification

- Run the Demo Data guard through `pnpm guard`.
- Typecheck every owning package or app whose fixtures or adapters changed.
- Verify an inactive console reports `idle` and does not invoke its loader.
- Verify a Product Demo remains deterministic and performs no live, test, or
  simulation storage work.
