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
  App declaration shape and lines.
- `kitchen/utils/ordering.ts`: validates declared channels and constructs empty,
  in-memory drafts and adds valid distinct lines without mutation. Line IDs come
  from the caller and must be unique within the Order; quantities may be fractional
  but must be finite and positive. These pure functions do not authorize actors, submit or persist records.
- `kitchen/components/Orders/Ticket.vue`: presents one Order without commands.
- Misebox App declares configured draft channels in its Nuxt runtime configuration.
- Workspace Orders owns a local draft editor with explicit Save/reopen tools.
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
