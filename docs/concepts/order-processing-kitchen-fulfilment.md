# Order processing and kitchen fulfilment spine

Updated: 2026-08-24
Ref: d0caff27b
Role: map, not canon

## Purpose

Map the boundary between Menu ordering, Kitchen-owned Order records, and fulfilment rules so the next Order patches do not spread business truth across unrelated surfaces.

## Vertical links

- Parent: menu-ordering.md
- Parent: workspace.md
- Parent: firestore-entity.md

## Horizontal links

- entities.md
- family-menu.md
- family-workspace-entity.md
- server-api.md
- components.md

## Family

- Menu ordering creates the customer promise.
- Kitchen fulfilment owns venue service rules.
- Kitchen order processing owns operational tickets.

## Entity checkpoint

- KitchenOrder is a kitchen-scoped operational record.
- It lives below its root Kitchen at `kitchens/{kitchenId}/orders/{orderId}`.
- It is not a root directory Entity.
- FulfilmentPolicy and FulfilmentMatch are order snapshot shapes, not entities.
- DeliveryZone is fulfilment configuration owned by Kitchen, not a standalone entity.
- KitchenOrder is the active Order canon for menu ordering and kitchen processing.

## Core split

- Menu content is readable by default; no stored view marker is needed.
- `Menu.ordering.order_types[]`: what kind of Order the Menu can create.
- `kitchens/{kitchenId}/fulfilment/policy`: the singular Kitchen-owned
  fulfilment record containing delivery zones and payment methods. Root
  `fulfilment` is a retained migration preimage only; live readers use the child
  exclusively and return an empty policy when it is absent. The
  trusted Kitchen command transactionally writes the complete child aggregate;
  Delivery and Payment editors each replace their owned half while preserving
  the other half from the child-first policy. Runtime writers never update the
  root preimage. The protected create-only copy lives at
  the retired operational artifact in Git history; root retirement remains a
  separate deletion gate.
- `KitchenOrder`: what the customer actually sent and what the kitchen must now process.
- `Workspace/Kitchen/Operations/Orders`: operator board and ticket actions.

## Creation flow

1. Every order source submits through the server-owned menu order route; Staff POS is an authenticated channel, not a direct Firestore writer.
2. The route resolves the source app, kitchen, and scoped menu.
3. Menu ordering config is read and merged with Kitchen fulfilment where appropriate.
4. Source input chooses an `order_type` and supplies its required customer/destination fields.
5. Server validates menu items, variants, add-ons, schedule, payment, and delivery constraints.
6. Server writes a KitchenOrder under the selected Kitchen operations path.
7. Created KitchenOrder copies the selected order-type policy into `fulfilment_policy`.
8. Created KitchenOrder copies concrete fulfilment lookup results into `fulfilment_match`.
9. Customer status reads expose only small customer-safe state.
10. Kitchen workspace sends authenticated transition commands; it does not patch order lifecycle fields directly.

## Intake contract

New orders carry `payment.flow: confirmation_first`. Submission enters
`pending_acceptance`; Kitchen confirmation enters `awaiting_payment_choice`.
The customer chooses an offered method from the saved policy. Required online
payment waits in `pending_payment` for verified settlement. Deferred payment
remains unpaid. A satisfied choice releases scheduled collection to `scheduled`
and other requests to `awaiting_preparation`; explicit `start_preparation`
enters `accepted`. Acceptance and settlement do not print or start preparation.

`KitchenOrderIntakePolicies` retains the allowed/default channel matrix and the
historical payment-first intake behavior for orders without that flow marker.
Do not apply that historical automatic-acceptance rule to new requests.
Payment resume states are bounded by the lifecycle model and verified against
the stored flow; they cannot jump to Ready or Completed. The transition command
and print eligibility share `isKitchenOrderPaymentSatisfied` from
`kitchen/models/order-lifecycle.model.ts`.

## Working vocabulary

- `order_type`: customer-facing service promise such as delivery, collection, dine-in, pre-order, or room service.
- `fulfilment_policy`: rules the customer ordered under, copied for audit history.
- `fulfilment_match`: concrete resolved result, such as the matched delivery zone and fee.
- `status`: the single lifecycle state for order processing and customer status.
- `board_stage`: workspace rail derived from stored order state, not a separate truth source.

## Current V1 order states

- `awaiting_payment_choice`: Kitchen confirmed; customer must choose payment.
- `pending_payment`: required payment must finish before preparation is eligible.
- `scheduled` / `awaiting_preparation`: payment choice is satisfied; explicit preparation is still required.
- `pending_acceptance`: the kitchen must accept or reject the request.
- `changes_requested`: the Kitchen sent the same Order back for the customer's
  amend-or-cancel decision; the board derives Recent while the customer funnel
  remains blocked by that unresolved response.
- `accepted`: the kitchen owns the order; the board derives Queue.
- `ready`: preparation is complete; the board derives Pass.
- `completed`: handoff is complete; the board derives Recent.
- `cancelled`: the order will not be fulfilled; the board derives Recent.
- `trashed`: explicit cleanup; the board excludes the order.

## Current V1 operator transitions

- `accept`: `pending_acceptance` to `awaiting_payment_choice` for confirmation-first orders; historical orders enter `accepted`.
- `start_preparation`: `scheduled` or `awaiting_preparation` to `accepted`, with the confirmation-first payment gate.
- `reject`: `pending_acceptance` to `changes_requested` with a reason.
- `mark_ready`: `accepted` to `ready`.
- `return_to_queue`: `ready` to `accepted`.
- `complete`: `ready` to `completed`.
- `trash`: any stored order to `trashed`.

## Execution loop

1. Accepted orders enter Queue.
2. `mark_ready` moves an order to Ready and therefore Pass.
3. The Pass action uses fulfilment-specific wording such as Served, Collected, Dispatched, or Delivered, but every action applies the same `complete` transition.
4. Completed orders enter Recent.
5. `return_to_queue` is the single correction from Pass to Queue and clears the previous ready estimate.
6. The server validates every transition against the exhaustive shared rule map inside the authenticated transaction.
7. Customer Order status keeps observing automatic and operator-accepted Orders through Ready to a terminal state.

There is no separate stored Preparing state. The existing start_preparation command enters accepted, which the board presents as Queue.

## Fulfilment ownership

- Kitchen owns reusable fulfilment defaults.
- Menu opts into order types and can add type-specific policy.
- Order stores the exact policy and match used at creation.
- Ordering UI renders the resolved policy; it does not infer rules from tenant App id or Kitchen type.
- Workspace operations may update processing state after creation, but should not rewrite historical policy snapshots unless the operator is explicitly correcting the order.

## Delta register

| Delta                                                      | Classification | Why                                                                      | Alignment recommendation                                                 |
| ---------------------------------------------------------- | -------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Order types collect different customer fields              | `accepted`     | Destination, timing, party, and handoff requirements genuinely differ    | Keep input local to each funnel and submit through one creation contract |
| Operator copy differs by fulfilment type                   | `accepted`     | Served, Collected, Dispatched, and Delivered describe different handoffs | Map copy to shared transitions; do not fork lifecycle states             |
| The board presents Incoming, Queue, Pass, and Recent rails | `accepted`     | Rails are projections of operator work                                   | Keep `board_stage` derived from the single stored status                 |
| Static fulfilment setup can sit under Kitchen Identity     | `accepted`     | Zones and payment capability are venue setup, not daily work             | Move only real pause/load commands into Operations                       |
| No stored Preparing state exists                           | `accepted`     | Queue already means the Kitchen owns the work in V1                      | Add a state only with a real start/hold command and transition tests     |
| Daily pause/load authority is unsettled                    | `to-confirm`   | Capability and current operational availability are different truths     | Introduce persistence only with the first real operator control          |
| Customer cancellation/refund vocabulary is incomplete      | `to-confirm`   | Payment lifecycle is not yet fully specified                             | Extend the shared state machine before adding surface-local status       |
| Payment ownership may outgrow KitchenOrder                 | `to-confirm`   | Capture/refund audit may earn a separate record                          | Make a fresh entity/record decision when payment history requires it     |

## Source evidence

- Order types, intake policies, statuses, and transitions:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/order-lifecycle.model.ts`
- Canonical creation:
  `packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId]/orders.post.ts`
- Authenticated transition command:
  `packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/orders/transition.post.ts`
- Transition enforcement:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/orders/transition.ts`
- Operator family:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Orders/`

## Alignment roadmap

### Now

1. Keep every order source on the canonical Menu order endpoint.
2. Keep every operator mutation on named, server-validated transitions.
3. Add tests that prove every order type resolves through the exhaustive intake
   policy and derives the expected board rail.

### Next

1. Define daily pause/load authority with its first real operator command.
2. Specify customer cancellation, amendment, and refund behavior in the shared
   state machine.
3. Add a Preparing state only if the board gains a real start/hold workflow.

### Later

1. Decide whether payment audit remains a KitchenOrder subrecord or earns a
   separate scoped record.
2. Add Delivery dispatch work as a post-production delta without creating a
   second intake lifecycle.

## Guardrails

- Do not put delivery zones or payment defaults on Menu as canonical truth.
- Do not create a new mode just because one restaurant uses different wording.
- Do not infer delivery, collection, or opening rules from Place hours.
- Do not force KitchenOrder into root entity ceremony without a fresh entity decision.
- Do not mix workspace operation folders into Firestore entity buckets.
- Do not introduce a parallel root Order engine while KitchenOrder remains the operational canon.
