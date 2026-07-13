Order processing and kitchen fulfilment spine
Updated: 2026-07-13
Ref: 59610f7ad
Role: map, not canon

Purpose:
Map the boundary between public menu ordering, kitchen-owned order records, and fulfilment rules so the next order patches do not spread business truth across unrelated surfaces.

Vertical links:
- Parent: menu-ordering.md
- Parent: console.md
- Parent: firestore-entity.md

Horizontal links:
- entities.md
- family-menu.md
- family-console-entity.md
- server-api.md
- components.md

Family:
- Menu ordering creates the customer promise.
- Kitchen fulfilment owns venue service rules.
- Kitchen order processing owns operational tickets.

Entity checkpoint:
- KitchenOrder is a kitchen-scoped operational record.
- It lives below the app-scoped Kitchen operations root, currently `apps/{appId}/kitchens/{kitchenId}/orders/{orderId}`.
- It is not a root public index entity.
- FulfilmentPolicy and FulfilmentMatch are order snapshot shapes, not entities.
- DeliveryZone is fulfilment configuration owned by Kitchen, not a standalone entity.
- KitchenOrder is the active Order canon for menu ordering and kitchen processing.

Core split:
- Menu content is readable by default; no stored view marker is needed.
- `Menu.ordering.order_types[]`: what kind of order the public menu can create.
- `Kitchen.fulfilment`: reusable venue rules such as delivery zones, payment methods, and deposits.
- `KitchenOrder`: what the customer actually sent and what the kitchen must now process.
- `Console/Kitchen/Operations/Orders`: operator board and ticket actions.

Creation flow:
1. Public menu route resolves the source app, kitchen, and scoped menu.
2. Menu ordering config is read and merged with Kitchen fulfilment where appropriate.
3. Guest basket/funnel input chooses an `order_type` and supplies required customer/contact fields.
4. Server validates menu items, variants, add-ons, and delivery constraints.
5. Server writes a KitchenOrder under the selected Kitchen operations path.
6. Created KitchenOrder copies the selected order-type policy into `fulfilment_policy`.
7. Created KitchenOrder copies concrete fulfilment lookup results into `fulfilment_match`.
8. Public status reads expose only small customer-safe state.
9. Kitchen console moves the ticket through operator stages.

Working vocabulary:
- `order_type`: customer-facing service promise such as delivery, collection, dine-in, pre-order, or room service.
- `fulfilment_policy`: rules the customer ordered under, copied for audit history.
- `fulfilment_match`: concrete resolved result, such as the matched delivery zone and fee.
- `status`: lifecycle state for order processing and customer status.
- `fire_state`: kitchen timing state for whether the order is held, fired, or ready to fire.
- `board_stage`: console rail derived from stored order state, not a separate truth source.

Current V1 order states:
- Incoming: `status` is `pending_acceptance`, `incoming`, or `new`.
- Queue: accepted/open orders that are not incoming, pass, archived, or trashed.
- Pass: `status` is `on_pass` or `pass`, or `fire_state` is `ready_to_fire`.
- Closed/archive: `status` is `closed` or `archived`.
- Trash: `status` is `trashed`.

Current V1 fire states:
- `held`: accepted but not fired, or waiting for requested time/service timing.
- `fired`: active in production or sent from the pass.
- `ready_to_fire`: ready for a kitchen action, currently also used by the pass rail.

Fulfilment ownership:
- Kitchen owns reusable fulfilment defaults.
- Menu opts into order types and can add type-specific policy.
- Order stores the exact policy and match used at creation.
- Public UI renders the resolved policy; it does not infer rules from tenant app id or kitchen type.
- Console operations may update processing state after creation, but should not rewrite historical policy snapshots unless the operator is explicitly correcting the order.

Accepted deltas:
- Each order type may have its own public funnel fields.
- A kitchen may choose different owner copy for delivery, collection, or pre-order.
- The order board can present rails in the order that works for operators.
- Fulfilment setup may sit under Kitchen Identity while it is venue setup; move daily pause/load controls into Operations only when those controls become real work.

Next seam if this grows:
- Add typed `KitchenOrderStatus` and `KitchenOrderBoardStage` helpers before more UI files hardcode state strings.
- Add a focused order-state transition helper if acceptance, preparation, pass, cancellation, and customer status start diverging.
- Add operational fulfilment availability only when there is a real pause/window/load control; do not promote static delivery zones into daily operations by default.

Guardrails:
- Do not put delivery zones or payment defaults on Menu as canonical truth.
- Do not create a new mode just because one restaurant uses different wording.
- Do not infer delivery, collection, or opening rules from Place hours.
- Do not force KitchenOrder into root entity ceremony without a fresh entity decision.
- Do not mix console operation folders into Firestore entity buckets.
- Do not introduce a parallel root Order engine while KitchenOrder remains the operational canon.

Open questions:
- Whether customer-visible cancellation/refund states need a separate public status vocabulary.
- Whether `ready_to_fire` should continue to mean pass-ready, or whether pass should become a clearer order status.
- When payment capture becomes real, whether payment state lives on KitchenOrder or in a separate payment record owned by the order.
