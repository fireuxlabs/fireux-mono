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
  ticket renders Order as presentation copy. Optional `placed_by` identifies a person or
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
- `kitchen/components/Library/Orders.vue`, exposed at `/packages/fireux-kitchens/ordering/ticket`,
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
- `useKitchenOrderDraftSave` captures client intent before credentials;
  `useKitchenOrderDraftCollection` supplies a membership-bound live read with paged and full-collection modes.
- Draft storage is `kitchens/{kitchenId}/order-drafts/{id}` with schema version,
  revision and audit metadata outside the basic Order. Empty drafts are valid;
  saving is not submission. Saved channels cannot change. Revision conflicts do
  not silently overwrite edits. The old Orders collection is not read or migrated.

## Connected order exchange

- `order-submission.model.ts` keeps execution state, revision and
  kitchen response outside the basic Order. `utils/order-submission.ts` owns
  completeness and permitted transitions.
- `server/orders/submission.ts` owns guarded submission, numbering, idempotency,
  operator response and customer-scoped reads. Records live in
  `kitchens/{id}/submitted-orders`; the old Orders collection is untouched.
  There is no test flag or separate test-order mode. Public Website targets use the published Menu resolver for the exact tenant
  or directory Kitchen. Tenant ownership is rechecked in the writing transaction.
  Generic submissions, including POS/Kiosk, require current Kitchen authority;
  anonymous customers cannot bypass canonical Menu resolution.
- POS/Kiosk and table Website orders auto-accept. Website collection/delivery
  await acceptance or rejection; rejection requires a reason. Accepted orders
  progress through preparing, ready and completed with exact revisions.
- `Workspace/Orders/Board.vue` combines persisted open orders (including empty
  ones) and the protected submitted-order reader. `/workspace/kitchen/orders/board`
  is the single board,
  with membership/access-bound clearing, independent refresh and action transports,
  multi-select state filters, one next action per ticket and collapsed
  response/contact details. Open orders use the existing guarded editor in a modal; manual order creation
  is not exposed on the board.
  No separate draft page or saved-draft list remains. Submitted reads include
  completed and declined orders. The protected reader drains internal 1000-record
  batches; the board has no order cap or pagination controls. Open orders use
  the same scoped reader in its full-collection mode. Its browser full-screen control isolates the board
  from Workspace chrome. The separate fixed-item order form and tenant `/order`
  shortcut are removed. Published structured menus now expose Collection,
  Delivery and Table ordering when the App declares Website support. These
  consume `menu/components/Order.vue`, the existing canonical Menu payload and
  `api/ordering/menu-submit`. Selection uses stable section/item/option IDs.
  `menu/server/ordering.ts` rechecks publication, item/Dish availability,
  Sellable variant restrictions and canonical prices in the writing transaction.
  Changed totals require review; order facts remain separate from the pricing
  and Menu-selection snapshot. No browser-authored price becomes authoritative.
- No payment, delivery-zone fee calculation, driver dispatch or production deployment is implied.
  Anonymous Website sessions can read only their own submitted response through
  the trusted endpoint; they do not receive operator access. Public self-service
  kiosk device authority is not yet provisioned; Kiosk submission currently
  requires an authorized operator.

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
`/workspace/kitchen/food-and-drink/services`, implemented by `Workspace/Offerings/Index.vue`.
The existing setup and individual Offering pages reuse Kitchen records and
commands; the old Orders/Channels entrance is removed without aliases. Delivery
settings remain composed here and payment methods remain at
`/workspace/kitchen/identity/payments`. This navigation change does not alter
Order processing, prices or the stored channel vocabulary.

Payments presentation is composed directly by `Workspace/Identity/Payments/Index.vue`;
Delivery settings by `Workspace/Orders/Delivery/Index.vue`. Both reuse the existing
Kitchen Fulfilment reader and protected commands, without a section-switching wrapper.
Services configures the existing service choices and their menus and serving times.
Library stage previews share `Library/Orders/Preview.vue`; success presentation is
`Library/Orders/Success.vue`, with local example state and shared validation retained.

Public Collection, Delivery and Table submissions require a currently open,
menu-linked service schedule in its configured timezone. `publicMenuServiceOpen`
reuses the existing weekday-time evaluator on both the customer page and inside
`menu/server/ordering.ts` before any new-order write. The server clock is authoritative;
client time is presentation only. Opening is inclusive, closing exclusive; overnight
windows and multiple alternative schedules retain the existing evaluator semantics.
Closed services remain browsable but cannot submit; existing receipts and successful
idempotent retries remain available. This does not add scheduled-order booking.
