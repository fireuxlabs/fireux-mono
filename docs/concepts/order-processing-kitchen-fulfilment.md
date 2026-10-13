# Ordering and fulfilment boundary

Updated: 2026-10-13
Role: map, not canon

## Purpose

Map the small Ordering foundation and its separation from industry fulfilment.
Inherit AGENTS.md, docs/ai/gpt-context.md and the Misebox scoped context. Current
source and executable checks establish implementation.

## Current owners

- Kitchen owns the first local Ordering implementation; cross-industry reuse is
  an intended concept, not a proved shared package contract.
- `kitchen/models/order.model.ts`: Order identity, number, channel vocabulary,
  App declaration shape and lines. `number` may be empty until assigned; the
  ticket renders Draft as presentation copy. Optional `placed_by` identifies a person or
  system by name and optional reference; optional `location` supplies a name and
  optional reference. Both are channel-independent descriptive context, not
  authentication or customer identity. Optional `fulfilment` records
  `on_site`, `takeaway`, `collection` or `delivery` separately from channel; Takeaway and
  collection remain distinct; timing is not inferred into the Order. The local kiosk specimen supplies
  an initially empty fulfilment string until a choice is made. The real kiosk
  entrance still needs to settle this required choice before submission. This does not implement fulfilment execution. Trusted actor
  authority and audit metadata remain separate. Draft storage uses null for
  absent context so updates can explicitly clear previously saved values;
  readers omit absent context from the domain Order.
- `kitchen/utils/ordering.ts`: validates declared channels and constructs empty,
  in-memory drafts and adds valid distinct lines without mutation. Line IDs come
  from the caller and must be unique within the Order; quantities may be fractional
  but must be finite and positive. These pure functions do not authorize actors, submit or persist records.
- `kitchen/components/Orders/Ticket.vue`: presents one Order without commands.
- `kitchen/components/dev/Orders.vue`, exposed at `/packages/fireux-kitchens/ordering/ticket`,
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
  lists basic example completeness gaps and captures a detached local Order on
  Submit order. It never sends requests, assigns a number or transitions a
  persisted order. Success is a separate presentation specimen with counter,
  table, collection, delivery, scheduled and deposit outcomes. Estimates and
  confirmation messages are fixtures; its actions have no handlers or external
  effects. No delivery tracking, acceptance, payment or booking is implemented.
  Operational submission policy remains unimplemented. Customer is separate from the initiating person. Requested time is
  stored as an ISO UTC instant; the ticket labels its UTC display explicitly.
  Table context appears only when supplied; fixture staff/customer
  identities are explicitly labelled as examples. Optional `OrderLine.item.id` preserves the
  selected catalogue reference alongside its name snapshot. These example IDs
  are not verified live Sellables, and no pricing or Menu-read flow is claimed.
  Its local preview state has no persistence adapter or production workflow controller.
- Misebox App declares configured draft channels in its Nuxt runtime configuration.
- Workspace Orders begins without an active draft. New order requires settled
  Kitchen access and a signed-in staff profile name, then creates an empty POS
  draft with a snapshot of that staff ID/name. Scope changes clear the active
  draft. Save verifies the initiating identity against the runtime User profile
  on creation and preserves it on updates. Existing Save/reopen tools remain.
- `kitchen/server/orders/save-draft.ts` owns the protected create/update command;
  its HTTP adapter is thin. Current Kitchen authority is checked in the transaction.
- `useKitchenOrderDraftSave` captures client intent before credentials;
  `useKitchenOrderDraftCollection` supplies a membership-bound paged live read.
- Draft storage is `kitchens/{kitchenId}/order-drafts/{id}` with schema version,
  revision and audit metadata outside the basic Order. Empty drafts are valid;
  saving is not submission. Saved channels cannot change. Revision conflicts do
  not silently overwrite edits. The old Orders collection is not read or migrated.

## Domain boundary

Order expresses what is requested and in what quantity/unit. Originating channel
is distinct from acceptance, requested timing, fulfilment arrangement, preparation,
handoff and payment. Submission, acceptance, preparation, handoff and payment have no new implementation yet.

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
