# Menu ordering

Updated: 2026-09-03
Ref: 5d18d52e3
Role: map, not canon

## Purpose

Map the boundary between a readable Menu, an ordering doorway, and the
KitchenOrder created from that doorway. This document records the shared spine,
explains legitimate surface differences, and exposes migration debt. Current
source and executable guards remain authority.

## Related maps

- Parent: `docs/concepts/family-menu.md`
- Operations handoff: `docs/concepts/order-processing-kitchen-fulfilment.md`
- Workspace family: `docs/concepts/family-workspace-entity.md`
- Server boundaries: `docs/concepts/server-api.md`
- Entity vocabulary: `docs/concepts/entities.md`
- Storage vocabulary: `docs/concepts/firestore-entity.md`

## Family boundary

The ordering family has four distinct jobs:

| Layer              | Owns                                                           | Does not own                    |
| ------------------ | -------------------------------------------------------------- | ------------------------------- |
| Menu               | Published catalogue and enabled ordering choices               | A customer's transaction        |
| Ordering surface   | Customer intent and surface-specific input                     | Mutable kitchen lifecycle state |
| Kitchen fulfilment | Reusable venue capability such as zones and payment methods    | Menu presentation               |
| KitchenOrder       | Submitted lines, policy snapshots, payment and lifecycle state | Future Menu truth               |

The default Menu route is always readable Browse. Ordering is an optional
projection of the same Menu, not a second Menu entity.

Each Kitchen owns two draft system Menus at `menus/food` and `menus/drinks`, and
uses `food` as its initial `menus.primary_menu_id`. They provide an immediately
usable catalogue floor and do not enter the public `/menus` directory until
published. Additional custom Menus remain separate records governed by product
subscription policy. Every Kitchen-backed public projection uses
`{kitchen-slug}--{menu-id}` so repeated parent-scoped ids cannot collide and
Food, Drinks, and custom Menus retain one predictable route grammar.

## Shared spine

Every ordering surface must follow the same pipeline:

1. Parse one Menu identity and optional route context.
2. Resolve the published Menu through the package-owned Menu seam.
3. Filter the manifest to the requested context and fail closed when disabled.
4. Build a transient basket from server-resolved variants and add-ons.
5. Present the allergy or intolerance notice and require a transient customer
   acknowledgement inside the ordering funnel.
6. Collect only the customer, timing, destination, and payment input required
   by that context.
7. Submit to the canonical Menu order endpoint.
8. Let the server re-resolve price, policy, authority, and availability.
9. Create one KitchenOrder under the owning Kitchen.
10. Track customer-safe status without creating a second lifecycle record.
11. Hand the same KitchenOrder to Kitchen operations.

Surface components may differ. Identity resolution, price authority, order
creation, idempotency, and lifecycle must not.

## Route grammar

The route contract is executable in `scripts/guards/menu-route-contract.mjs`.

| Scope             | Browse                                   | Context                                            | QR           |
| ----------------- | ---------------------------------------- | -------------------------------------------------- | ------------ |
| Root              | `/menus/{menuId}`                        | `/menus/{menuId}.{context}`                        | append `/qr` |
| Kitchen directory | `/kitchens/{kitchenSlug}/menus/{menuId}` | `/kitchens/{kitchenSlug}/menus/{menuId}.{context}` | append `/qr` |
| Tenant            | `/{menuId}`                              | `/{menuId}.{context}`                              | append `/qr` |

Rules:

- The context suffix belongs to the Menu identity, never the collection path.
- A QR encodes the exact Browse or contextual route.
- Unknown suffixes remain part of the Menu id; they do not become new contexts.
- `eat_in` and `takeaway` are KitchenOrder types selected inside Kiosk, not URL
  contexts.
- Scheduled Delivery remains Delivery. Scheduled pickup remains Collection.
  `pre_order` means advance dine-in.
- A Kitchen route without a Menu identity must not guess or auto-select a Menu.

## Surface matrix

| Context        | Projection | Order type(s)        | Discovery                    | Delta status                                     |
| -------------- | ---------- | -------------------- | ---------------------------- | ------------------------------------------------ |
| `generic`      | Browse     | none                 | Public                       | shared default                                   |
| `delivery`     | Order      | `delivery`           | Guest discoverable           | accepted                                         |
| `collection`   | Order      | `collection`         | Guest discoverable           | accepted                                         |
| `pre_order`    | Order      | `pre_order`          | Guest discoverable           | accepted                                         |
| `kiosk`        | Order      | `eat_in`, `takeaway` | Operator-distributed         | accepted presentation delta                      |
| `table`        | Diagnostic | `dine_in` intent     | Operator-distributed         | accepted route alias; product surface to confirm |
| `dine_in`      | Diagnostic | `dine_in`            | Operator-distributed         | product surface to confirm                       |
| `room_service` | Diagnostic | `room_service`       | Operator-distributed         | product surface to confirm                       |
| `staff_pos`    | Diagnostic | multiple             | Authenticated operator entry | product surface to confirm                       |

`MenuRouteContexts`, `menuRouteProjection()`, and the route guard are the
current source of truth for this matrix. A diagnostic projection is not a
finished ordering funnel.

## Accepted surface deltas

### Delivery

- Requires a destination and authoritative Kitchen-zone match.
- May add a delivery minimum, fee, and delivery-specific handoff copy.
- Delivery hours may differ from Place, Kitchen, and Menu hours.

### Collection

- Requires a pickup timing choice and collection handoff copy.
- It does not require delivery-zone validation.

### Pre-order

- Means a future dine-in request, not scheduled Delivery or Collection.
- Requires a future dining time and may require party size.
- Request intake can remain open while selectable dining times still fail
  closed when effective hours are unavailable.

### Kiosk

- Starts by fixing Eat here or Take away.
- May use a full-viewport, touch-first presentation and persistent basket
  access.
- Must still consume the shared Menu manifest, basket rules, canonical order
  endpoint, and lifecycle.
- Menu ordering configuration enables and presents the Kiosk projection.
  Orders & Service owns the live-device doorway: an authorized Kitchen operator
  activates a named tablet against one published Menu, opens that exact Kiosk,
  and can revoke it.
- A live Kiosk request requires a short-lived server-issued device capability
  scoped to one App, Kitchen, Menu, and Kiosk record. Only its digest is stored;
  the raw capability remains in an HttpOnly browser cookie. Firestore clients
  cannot read or mutate Kiosk device authority.

### Private entries

Table, Dine-in, Room Service, and Staff POS may require identity or operator
context that public discovery cannot supply. Their restricted entry is an
accepted access delta. Their current diagnostic projection is not evidence that
the full product flow is complete.

## Ownership and inheritance

| Concern                                        | Owner                        |
| ---------------------------------------------- | ---------------------------- |
| Business hours, shared timezone and currency   | Place                        |
| Kitchen operation-hours override               | Kitchen                      |
| Menu service-hours override                    | Menu                         |
| Surface availability, notice and timing delta  | `ordering.order_types[]` row |
| Delivery zones and accepted payment capability | Kitchen fulfilment           |
| Submitted policy and concrete match            | KitchenOrder snapshot        |
| Temporary basket and form input                | Browser memory               |
| Order lifecycle                                | KitchenOrder                 |

Inheritance follows one parent at a time:

```text
Place hours
  -> Kitchen operation hours
    -> Menu service hours
      -> ordering-surface hours
```

Missing effective hours fail closed. A child override must not skip its direct
parent and infer from a grandparent.

## Order creation and tracking

- Clients submit identities and choices, never trusted prices.
- The server resolves MenuItem variants, add-ons, Kitchen capability, timing,
  payment, and fulfilment again before writing.
- The KitchenOrder snapshots the policy and concrete fulfilment result used at
  submission so later configuration changes do not rewrite history.
- Browser tracking stores only a safe post-submit reference/capability. It is
  not lifecycle authority and does not persist basket or customer form data.
- The ordering allergy acknowledgement is a transient submission gate. It is
  not a second directory notice and does not become KitchenOrder truth.
- A signed-in customer may receive a lightweight User-owned link at
  `users/{userId}/orders/{orderId}`. It points to the canonical KitchenOrder
  and records its App/Kitchen identity without duplicating mutable Order
  status; it does not require the optional CustomerProfile preferences record.
- Anonymous orders are not silently attached to an account later.

The detailed state machine and operator transitions live in
`docs/concepts/order-processing-kitchen-fulfilment.md`.

## Configuration boundary

- Menu configuration owns catalogue identity and Menu service hours.
- Focused ordering routes own one order-type row at a time.
- Kitchen configuration owns reusable fulfilment and payment capability.
- Ordering suffix routes are projections, never configuration owners.
- Kiosk activation and revocation are Kitchen operations, not Menu edits or
  public route discovery.
- Empty or inherited optional configuration should be absent rather than
  persisted as blank objects.
- Pausing a surface is temporary operational availability, not Menu deletion or
  a change to configured hours.
- Item stock is temporary Menu-item availability, not a mutation of Dish truth.

## Current implementation evidence

- Context model: `packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-context.model.ts`
- Context profiles: `packages/extensions/fireux-kitchens/src/runtime/menu/utils/menu-context.ts`
- Route grammar: `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-menu-route.ts`
- Route guard: `scripts/guards/menu-route-contract.mjs`
- Shared ordering-spine guard: `scripts/guards/menu-order-spine.mjs`
- Protected Interlaken Food/Drinks split: `scripts/migrate-interlaken-pizza-food-drinks.mjs`
- Protected public Menu id cutover: `scripts/migrate-misebox-public-menu-ids.mjs`
- Protected legacy-to-system Menu cutover: `scripts/migrate-misebox-menus-to-system-defaults.mjs`
- Public resolver: `packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenu.ts`
- Order UI: `packages/extensions/fireux-kitchens/src/runtime/menu/components/Order/`
- Order state: `packages/extensions/fireux-kitchens/src/runtime/menu/composables/order/`
- Canonical create endpoint: `packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId]/orders.post.ts`
- Kiosk device authority: `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/kiosks/`
- Kiosk operations doorway: `packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/kiosks.vue`
- Kitchen order model: `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/order.model.ts`
- Workspace settings: `packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/menus/[menuId]/ordering/`

## Delta register

| Delta                                                                             | Classification | Why                                                                          | Alignment recommendation                                                                       |
| --------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Kiosk has a distinct touch-first presentation                                     | `accepted`     | Different operating environment; shared transaction spine remains intact     | Keep presentation local and transaction behavior shared                                        |
| Guest surfaces require different fields                                           | `accepted`     | Destination, timing, and party context genuinely differ                      | Keep thin surface seams over one lifecycle                                                     |
| Private contexts are not advertised publicly                                      | `accepted`     | Entry requires operator-distributed identity/context                         | Keep discovery policy explicit in the context profile                                          |
| `kitchen/order/funnel` remains in diagnostic/demo source                          | `retired`      | Public Root, Kitchen-directory, and tenant Menu routes now share `MenuRoute` | Keep it outside production routes; remove the retired source with its remaining demo consumers |
| `table`, `dine_in`, `room_service`, and `staff_pos` remain diagnostic projections | `to-confirm`   | Route identity is guarded, but finished product behavior is not              | Specify each required identity and funnel before promoting it to Order                         |
| Daily pause/load authority is not settled                                         | `to-confirm`   | Static capability and live operational availability are different concerns   | Add a Kitchen operation record only when a real operator control exists                        |
| Customer cancellation/refund vocabulary is incomplete                             | `to-confirm`   | Payment and customer lifecycle work is not finished                          | Define it beside the KitchenOrder state machine, not in a surface component                    |

No unexplained delta is implicitly accepted. New contexts must update the
context model, route projection, executable guard, this matrix, and the relevant
product flow together.

## Alignment roadmap

### Now

1. Remove the retired `kitchen/order/funnel` source with its remaining demo-only consumers.
2. Keep the ordering-spine guard mandatory so Delivery, Collection, Pre-order,
   and Kiosk cannot bypass shared resolution, pricing, idempotency, creation,
   and tracking seams.
3. Add behavioral tests for server outcomes at the first stable database test
   harness; the source-level guard protects ownership and composition now.
4. Keep the route-contract guard mandatory while consolidation occurs.

### Next

1. Decide the finished contracts for Table/Dine-in, Room Service, and Staff POS.
2. Define daily pause/load authority only alongside its first real operator
   command and persistence requirement.
3. Lock configuration inheritance and fail-closed timing with server tests.
4. Document customer cancellation, amendment, and payment/refund transitions in
   the fulfilment map.

### Later

1. Add dispatch-specific Delivery work without creating a second intake
   lifecycle.
2. Add room/table identity to issued QR entries where the product flow proves it
   is required.
3. Introduce richer scheduling, deposits, and capacity only as focused policy
   deltas, not new Menu families.

## Guardrails

- Do not create a new order type because one venue uses different wording.
- Do not infer ordering capability from Kitchen type, tenant app id, or Place
  opening state.
- Do not store delivery zones or generic payment capability on Menu.
- Do not trust client prices or lifecycle transitions.
- Do not add a second mutable Order record for public tracking.
- Do not describe diagnostic projections as shipped funnels.
- Do not put implementation snapshots, environment variables, or venue data in
  this family map.
