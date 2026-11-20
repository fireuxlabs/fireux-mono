# Ordering and fulfilment boundary

Updated: 2026-11-20
Ref: 330c4384f
Role: map, not canon

## Purpose

Map the small Ordering foundation and its separation from industry fulfilment.
Inherit AGENTS.md, docs/ai/gpt-context.md and the Misebox scoped context. Current
source and executable checks establish implementation.

## Current owners

Kitchen's Orders capability owns staff drafts, submitted Orders, its operator
board and the trusted commands. Published Menus expose read-only catalogues.
Kitchen Services owns the configuration linking Menus and serving times.
Customer checkout and receipt reads have been removed from these surfaces.

- Kitchen owns the first local Ordering implementation; cross-industry reuse is
  an intended concept, not a proved shared package contract.
- `kitchen/records/order.ts`: Order identity, number, channel vocabulary,
  App declaration shape and lines. `number` may be empty until assigned; the
  ticket renders Order as presentation copy. Optional `placed_by` identifies a person or
  system by name and optional reference; optional `location` supplies a name and
  optional reference. Both are channel-independent descriptive context, not
  authentication or customer identity. Optional `fulfilment` records
  `on_site`, `takeaway`, `collection` or `delivery` separately from channel; Takeaway and
  collection remain distinct; timing is not inferred into the Order. The local kiosk specimen supplies
  an initially empty fulfilment string until a choice is made. The public Kiosk
  entrance requires Eat in or Takeaway before selecting items. This does not implement fulfilment execution. Trusted actor
  authority and audit metadata remain separate. Draft storage uses null for
  absent context so updates can explicitly clear previously saved values;
  readers omit absent context from the domain Order.
- `kitchen/utils/ordering.ts`: validates declared channels and constructs empty,
  in-memory drafts and adds valid distinct lines without mutation. Line IDs come
  from the caller and must be unique within the Order; quantities may be fractional
  but must be finite and positive. These pure functions do not authorize actors, submit or persist records.
- `kitchen/components/Orders/Ticket.vue` presents one Order read-only.
  `kitchen/components/Workspace/Orders/Ticket.vue` supplies line-edit controls
  through the ticket slot and sends edit intents to the draft editor.
- Misebox `components/Docs/OrderingTicket/Index.vue`, exposed at `/packages/fireux-kitchens/ordering/ticket`,
  provides an initially empty local ticket specimen using the actual Ticket
  component. The library exposes POS, Kiosk and Website. All begin empty; the shared
  Items stage adds the same fixed food lines for comparison across channels.
  Each stage displays its own ticket and JSON projection; later lines or
  post-info do not appear in Init or Pre-info previews.
  Init contains channel and known identity; Pre-info contains fulfilment and
  supplied table context. Kiosk fulfilment, Website entrance and customer
  identity begin unselected. Post-info collects relevant missing location,
  customer name/phone, free-text delivery address and optional requested time
  after Items. Supplied profile/table data is reused. These are descriptive draft
  fields, not address verification, delivery eligibility or slot booking. Review
  reuses `orderSubmissionIssues` for completeness gaps and captures a detached local Order on
  Submit order. It never sends requests, assigns a number or transitions a
  persisted order. Success is a separate presentation specimen with counter,
  table, collection, delivery, scheduled and deposit outcomes. Estimates and
  confirmation messages are fixtures; its actions have no handlers or external
  effects. No delivery tracking, acceptance, payment or booking is implemented.
  The library remains unconnected; the separately owned connected order exchange is described below. Customer is separate from the initiating person. Requested time is
  stored as an ISO UTC instant; the ticket labels its UTC display explicitly.
  Table context appears only when supplied; fixture staff/customer
  identities are explicitly labelled as examples. Optional `OrderLine.item.id` preserves the
  selected catalogue reference alongside its name snapshot. These example IDs
  are not verified live Sellables, and no pricing or Menu-read flow is claimed.
  Its local preview state has no persistence adapter or production workflow controller.
- Misebox Main App and Bären Ringgenberg declare POS, Kiosk and Website in
  their Nuxt runtime configuration. This declaration permits channel vocabulary;
  it does not implement customer submission or establish live opening availability.
- Workspace Orders begins without an active draft. New order requires settled
  Kitchen access and a signed-in staff profile name, then creates an empty POS
  draft with a snapshot of that staff ID/name. Scope changes clear the active
  draft. Save verifies the initiating identity against the runtime User profile
  on creation and preserves it on updates. Existing Save/reopen tools remain.
- `kitchen/server/orders/save-draft.ts` owns the protected create/update command;
  its HTTP adapter is thin. Current Kitchen authority is checked in the transaction.
- `kitchen/composables/orders/` contains the explicit-Kitchen clients.
  `useKitchenOrderDraftSave` captures client intent before credentials,
  `useKitchenOrderDraftCollection` reads authorized drafts, and
  `useOrderExchange` serves the Orders board.
- Draft storage is `kitchens/{kitchenId}/order-drafts/{id}` with schema version,
  revision and audit metadata outside the basic Order. Empty drafts are valid;
  saving is not submission. Saved channels cannot change. Revision conflicts do
  not silently overwrite edits. The old Orders collection is not read or migrated.

## Connected order exchange

- `kitchen/records/order-submission.ts` keeps execution state, revision and
  Kitchen response outside the basic Order. `utils/order-submission.ts` owns
  completeness and permitted transitions.
- `server/orders/submission.ts` owns staff submission, numbering, idempotency
  and revision-gated status changes. Its transaction checks Kitchen access.
  Records remain in `kitchens/{id}/submitted-orders`.
- `Workspace/Orders/Board.vue` combines saved drafts and submitted orders.
  It masks obsolete results across membership and Kitchen changes, reads all
  submitted orders in internal batches, and keeps open-order editing behind the
  existing editor. Existing orders from customer channels remain readable by
  authorized staff and retain their saved pricing and lifecycle state.

## Domain boundary

Order expresses what is requested and in what quantity/unit. Originating channel
is distinct from acceptance, requested timing, fulfilment arrangement, preparation,
handoff and payment. The connected order exchange owns submission and operator state transitions.
Payment, verified Menu pricing, dispatch and physical handoff remain separate.

Use UBL Order/OrderLine/Item/Quantity vocabulary as a reference. This small internal
model is not a conformant UBL document. Add fields only when a real behaviour and
consumer require them. Prove another industry before extracting a shared owner.

The previous execution, legacy model, reader/adapter, board states, checkout,
customer tracking, kiosk session and handoff stack are deleted. Stored records
are outside this source change. Historical Sales are independently owned immutable
snapshots and do not depend on a live Order model.

## Verification and maintenance

Verify App type checks, empty/populated ticket rendering, declared-channel/draft validation and the
`test:ordering` save/reopen, revision, authority, reader and intent checks. Add behaviour checks when the corresponding commands return. Maintain
this map and the Misebox scoped context when durable ownership or functionality
changes; do not retain retired execution paths as current source pointers.

## Workspace configuration surfaces

Orders has its index and board. Service configuration lives separately at
`/workspace/kitchen/menu/services`, implemented by `Workspace/Services/Index.vue`.
The existing setup and individual Offering pages reuse Kitchen records and
commands; the old Orders/Channels entrance is removed without aliases. Delivery
settings remain composed here and payment methods remain at
`/workspace/kitchen/identity/payments`. This navigation change does not alter
Order processing, prices or the stored channel vocabulary.

Payments presentation is composed directly by `Workspace/Settings/Payments/Index.vue`;
Delivery settings by `Workspace/Orders/Delivery/Index.vue`. Both reuse the existing
Kitchen Fulfilment reader and protected commands, without a section-switching wrapper.
Services configures the existing service choices and their menus and serving times.
The Misebox reference owns the stage previews and success specimens in
`components/Docs/OrderingTicket/`, with local example state and shared ticket rendering.
