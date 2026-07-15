Order processing and kitchen fulfilment spine
Updated: 2026-07-15
Ref: 97fe95697
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
1. Every order source submits through the server-owned menu order route; Staff POS is an authenticated channel, not a direct Firestore writer.
2. The route resolves the source app, kitchen, and scoped menu.
3. Menu ordering config is read and merged with Kitchen fulfilment where appropriate.
4. Source input chooses an `order_type` and supplies its required customer/destination fields.
5. Server validates menu items, variants, add-ons, schedule, payment, and delivery constraints.
6. Server writes a KitchenOrder under the selected Kitchen operations path.
7. Created KitchenOrder copies the selected order-type policy into `fulfilment_policy`.
8. Created KitchenOrder copies concrete fulfilment lookup results into `fulfilment_match`.
9. Public status reads expose only small customer-safe state.
10. Kitchen console sends authenticated transition commands; it does not patch order lifecycle fields directly.

Intake contract:
- `KitchenOrderIntakePolicies` is the exhaustive order-type matrix for allowed channels, default channel, and automatic versus operator acceptance.
- Payment is the first gate. An unpaid required payment produces `pending_payment`.
- After payment, dine-in, eat-in, and takeaway produce `accepted` and derive Queue.
- After payment, collection, delivery, pre-order, and room service produce `pending_acceptance` and require Accept or Reject.
- Payment resume state is limited to `accepted` or `pending_acceptance`; it cannot skip forward to Ready/Completed or restore a terminal order.
- Public ordering maps and kitchen ticket examples consume the same shared intake policy instead of restating status strings.

Working vocabulary:
- `order_type`: customer-facing service promise such as delivery, collection, dine-in, pre-order, or room service.
- `fulfilment_policy`: rules the customer ordered under, copied for audit history.
- `fulfilment_match`: concrete resolved result, such as the matched delivery zone and fee.
- `status`: the single lifecycle state for order processing and customer status.
- `board_stage`: console rail derived from stored order state, not a separate truth source.

Current V1 order states:
- `pending_payment`: payment must finish before the order can continue.
- `pending_acceptance`: the kitchen must accept or reject the request.
- `accepted`: the kitchen owns the order; the board derives Queue.
- `ready`: preparation is complete; the board derives Pass.
- `completed`: handoff is complete; the board derives Recent.
- `cancelled`: the order will not be fulfilled; the board derives Recent.
- `trashed`: explicit cleanup; the board excludes the order.

Current V1 operator transitions:
- `accept`: `pending_acceptance` to `accepted`.
- `reject`: `pending_acceptance` to `cancelled` with a reason.
- `mark_ready`: `accepted` to `ready`.
- `return_to_queue`: `ready` to `accepted`.
- `complete`: `ready` to `completed`.
- `trash`: any stored order to `trashed`.

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
- Add a distinct preparation transition only when the operator board gains a real start/hold cooking action.
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
- When payment capture becomes real, whether payment state lives on KitchenOrder or in a separate payment record owned by the order.
