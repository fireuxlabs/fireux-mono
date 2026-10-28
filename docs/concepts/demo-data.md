# Demo data

Updated: 2026-10-28
Ref: cf2413355
Role: map, not canon

## Purpose and ownership

Map the fictional, read-only examples used by Misebox's public Menu demo and
landing previews. Inherit [AGENTS.md](../../AGENTS.md) and
[global context](../ai/gpt-context.md). Real Entity models and supported
presentation adapters define the contract; fixtures follow those owners.

- Parent: [Workspace and Entities](family-workspace-entity.md).
- Related: [pages](pages.md), [components](components.md),
  [Firestore ownership](firestore-entity.md), and
  [Misebox context](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md).

## Retained examples

| Owner | Source | Use |
| --- | --- | --- |
| Kitchen | [scenarios](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/scenarios.ts) | Misebox Restaurant, Deanos and Pizza the Action; Menus, Dishes and their related operational examples |
| Supplier | [scenarios](../../packages/extensions/fireux-suppliers/src/runtime/supplier/demo/scenarios.ts) | Three Suppliers with Ingredient references, Items and Catalogues |
| Company and Place | [linked fixtures](../../packages/extensions/fireux-companies/src/runtime/place/demo/company/scenarios.ts) | Required Supplier Company/Place relationships |
| Demo media | [URL contract](../../packages/extensions/fireux-demo/src/runtime/utils/media/misebox.ts) | Immutable owner-relative Misebox image URLs |

Deanos carries the richer production and historical-order example. Its fixed
sample period is declared by the [Order history owner](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/operations/Orders/history.ts),
not the current clock. Historical examples must not be described as current
customer activity. Production Specs, Prep and derived Finance are example
projections, not permission to seed a parallel persisted model.

Property, Portfolio, Reservation, Project and Blank have no retained Demo
fixtures. Add an example only for a real consumer and its current model.

## Runtime composition

The App owns its named
[Product Demo adapter](../../projects/misebox/misebox-app/app/composables/product-demo/useMiseboxProductDemo.ts)
and [composition](../../projects/misebox/misebox-app/app/composables/product-demo/loadMiseboxProductDemo.ts).
They dynamically compose domain fixtures and project them into existing Menu
and landing components. [PowerCards](../../projects/misebox/misebox-app/app/composables/product-demo/useMiseboxPowerCardsProductDemo.ts)
uses its own bounded read-only projection over the same domain examples.

FireUX's [assisted Ignition source recipe](../../projects/fireux/fireux-app/shared/ignition-preview.ts)
also consumes the existing Kitchen Menu manifest and catalogue in its generated
starting App. It copies no fictional Kitchen records into Firestore. Canonical
App initialization remains a separate, authenticated Core command; this is not
a demo Workspace mode or a new fixture persistence system.

Public demo routes are `/demo` and `/demo/menu`. Their
[experience list](../../projects/misebox/misebox-app/app/composables/product-demo/misebox-product-demo-experiences.ts)
and App sitemap advertise only available routes. Kiosk and order-board demo
routes are absent; do not add links or inactive preview buttons for them.

The showroom resolves stable Ingredient IDs through the supported public
canonical Ingredient reader. It is read-only, but not an offline catalogue.
PowerCards keeps its data projection network-free; immutable image delivery is
separate from operational data reads.

## Boundaries

- Demo fixtures create no live records, memberships, Orders or payments.
- Workspace always reads its selected live Entity and owned collections. Demo
  is not a Workspace mode, source override or fallback for empty live data.
- Fixture modules own fictional records and pure validation. They import no
  Firebase, Storage or server mutation SDK.
- Ingredient identity remains canonical. Fixtures retain stable references,
  not copied Ingredient names, taxonomy or image authority.
- Supplier owns offers and Catalogues; Kitchen owns its usage links. Company
  and Place remain separate linked records, not duplicated Supplier identity.
- Firebase Storage owns demo images. `fireux-demo` supplies URL construction
  only; it does not install a runtime surface or publish media.
- Test and simulation storage are retired. Read-only examples do not establish
  a writable test system or authorize database seeding.

## Refresh and verification

Refresh an affected fixture and consumer together when its real model changes.
Keep scenario identity and historical dates deterministic. Preserve relationship
and arithmetic validation at the domain owner rather than adding App-local joins.

Run the source-owned checks:

```sh
node --test packages/extensions/fireux-kitchens/src/test/menu-demo-terms.test.mjs
node --test projects/misebox/misebox-app/test/product-demo-foundations.test.mjs
```

Typecheck the affected App and inspect `/demo` and `/demo/menu`, including every
advertised demo destination. Confirm current Workspace reads and trusted
commands are unchanged. There is no `pnpm guard` or retained seed/publishing
script for this dataset. A separate remote-media audit requires current Storage
evidence; local fixture validation does not prove object availability.
