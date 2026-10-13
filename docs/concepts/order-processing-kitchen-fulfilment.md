# Order processing and kitchen fulfilment spine

Updated: 2026-10-12
Ref: b2a986b6b
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
- `kitchen/collection-order-journey.test.mjs` proves the controlled request-to-Sale
  and report path; fixed catalogue/auth/schedule adapters and an in-memory store
  do not establish a live customer or operator journey.

## Entity checkpoint

- KitchenOrder is a kitchen-scoped operational record.
- It lives below its root Kitchen at `kitchens/{kitchenId}/orders/{orderId}`.
- It is not a root directory Entity.
- FulfilmentPolicy and FulfilmentMatch are order snapshot shapes, not entities.
- DeliveryZone is fulfilment configuration owned by Kitchen, not a standalone entity.
- KitchenOrder is the active Order canon for menu ordering and kitchen processing.

## Core split

- Menu content is readable by default; no stored view marker is needed.
- Kitchen-owned Offering records select eligible Menus, interactions and serving
  hours. Menu ordering consumes their resolved `order_types[]` projection;
  reusable policy is not stored on the Menu.
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
- `kitchen/components/Workspace/Orders`: operator board and ticket actions.

## Creation flow

1. Every order source submits through the server-owned menu order route; Staff POS is an authenticated channel, not a direct Firestore writer.
2. The route resolves the source App, Kitchen, scoped Menu and named Offering.
3. Eligible Offering policy is projected for the Menu and combined with Kitchen fulfilment.
4. Source input chooses an `order_type` and supplies its required customer/destination fields.
5. Server validates Menu items, variants, add-ons, schedule, usable payment choices and delivery constraints.
6. Server writes a KitchenOrder and its allocated number atomically under the selected Kitchen.
7. Created KitchenOrder copies the selected order-type policy into `fulfilment_policy`.
8. Created KitchenOrder copies concrete fulfilment lookup results into `fulfilment_match`.
9. Customer status reads expose only small customer-safe state.
10. Kitchen workspace sends authenticated transition commands; it does not patch order lifecycle fields directly.

## Intake contract

New orders carry `payment.flow: confirmation_first`. Manual collection/delivery
and pre-orders enter `pending_acceptance`; on-site orders and enabled automatic
collection/delivery intake enter `awaiting_payment_choice` directly. Kitchen
confirmation moves manually reviewed orders to that same payment-choice state.
The customer chooses an offered method from the saved policy. Required online
payment waits in `pending_payment` for verified settlement. Deferred payment
remains unpaid. A satisfied choice releases scheduled collection, pre-orders and
future timed deliveries to `scheduled`, and immediate requests to
`awaiting_preparation`; explicit `start_preparation`
enters `accepted`. Acceptance and settlement do not print or start preparation.

`KitchenOrderIntakePolicies` retains the allowed/default channel matrix and the
historical payment-first intake behavior for orders without that flow marker.
New requests consume the Kitchen-owned `orders.intake` policy through
`kitchen/utils/order-intake.ts`: open/off-site/all pause, manual/automatic
collection and delivery acceptance, and preparation estimate. Pre-orders remain
manual. Individual Offering pauses and payment gates still apply. The protected
intake command checks membership-bound authority and the expected prior policy
inside its transaction. New-order commit guards reread the complete Kitchen
snapshot, so a concurrent pause/policy edit cannot permit a stale creation.
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
  amend-or-cancel decision; the source retains its recent bucket while the
  working board places it in Waiting until that response resolves.
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
3. Ready selection uses the Handed off action and the existing `complete` transition.
4. Completed orders enter Recent.
5. `return_to_queue` is the single correction from Pass to Queue and clears the previous ready estimate.
6. The server validates every transition against the exhaustive shared rule map inside the authenticated transaction.
7. Customer Order status keeps observing automatic and operator-accepted Orders through Ready to a terminal state.

There is no separate stored Preparing state. The existing start_preparation
command enters accepted. The board presents New, Waiting, Scheduled, Preparing,
Ready and History; Preparing includes awaiting_preparation records with Start
preparation plus the accepted queue. Waiting includes changes_requested as an unresolved customer amend/cancel state;
History contains completed and cancelled records.

## Fulfilment ownership

- Kitchen owns reusable fulfilment defaults.
- Kitchen Offerings select Menus and own interaction-specific policy.
- Order stores the exact policy and match used at creation.
- Ordering UI renders the resolved policy; it does not infer rules from tenant App id or Kitchen type.
- Workspace operations may update processing state after creation, but should not rewrite historical policy snapshots unless the operator is explicitly correcting the order.
- Operator authority is checked in the acting App; the saved Order source App
  retains Sale, financial-fact and customer-notification ownership across Apps.
  Kitchen gross-sales reports consume all source Apps in the authorized Kitchen,
  using snapshot document identity rather than a redundant stored id.

## Delta register

| Delta                                                      | Classification | Why                                                                      | Alignment recommendation                                                 |
| ---------------------------------------------------------- | -------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Order types collect different customer fields              | `accepted`     | Destination, timing, party, and handoff requirements genuinely differ    | Keep input local to each funnel and submit through one creation contract |
| Operator copy differs by fulfilment type                   | `accepted`     | Served, Collected, Dispatched, and Delivered describe different handoffs | Map copy to shared transitions; do not fork lifecycle states             |
| The board presents Incoming, Queue, Pass, and Recent rails | `accepted`     | Rails are projections of operator work                                   | Keep `board_stage` derived from the single stored status                 |
| Fulfilment setup is Kitchen-owned                         | `accepted`     | Zones and payment methods are reusable venue capability                  | Keep its child policy/editor separate from Offering interactions         |
| No stored Preparing state exists                           | `accepted`     | Queue already means the Kitchen owns the work in V1                      | Add a state only with a real start/hold command and transition tests     |
| Daily intake policy is Kitchen-owned                       | `accepted`     | Current pause and acceptance apply across its Offerings                  | Keep protected orders.intake policy separate from scheduling and load planning |
| Customer cancellation/refund vocabulary is incomplete      | `to-confirm`   | Payment lifecycle is not yet fully specified                             | Extend the shared state machine before adding surface-local status       |
| Payment ownership may outgrow KitchenOrder                 | `to-confirm`   | Capture/refund audit may earn a separate record                          | Make a fresh entity/record decision when payment history requires it     |

## Source evidence

- Order types, intake policies, statuses, and transitions:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/order-lifecycle.model.ts`
- Canonical creation:
  `packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId]/orders.post.ts`
- HTTP action adapter (existing transition URL):
  `packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/orders/transition.post.ts`
- Domain-owned action execution, atomic completion and post-commit notification:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/orders/actions.ts`
- Transition enforcement:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/orders/transition.ts`
- Saved intake policy, protected command and focused proof:
  `kitchen/utils/order-intake.ts`, `kitchen/server/ordering/intake.ts`,
  `src/test/kitchen/order-intake.test.mjs` in `fireux-kitchens`.
- Operator family:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Orders/`

## Alignment roadmap

### Now

1. Keep every order source on the canonical Menu order endpoint.
2. Keep every operator mutation on named, server-validated transitions.
3. Add tests that prove every order type resolves through the exhaustive intake
   policy and derives the expected board rail.

### Next

1. Verify the saved intake controls through a signed-in service journey and busy-shift acceptance.
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
