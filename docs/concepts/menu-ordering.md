# Menu ordering

Updated: 2026-10-02
Ref: 2807ceca9
Role: map, not canon

## Purpose

Map the boundary between a readable Menu, an ordering doorway, and the
KitchenOrder created from that doorway. This document records the shared spine,
explains legitimate surface differences, and exposes migration debt. Current
source and executable tests remain authority.

## Related maps

- Parent: `docs/concepts/family-menu.md`
- Operations handoff: `docs/concepts/order-processing-kitchen-fulfilment.md`
- Workspace family: `docs/concepts/family-workspace-entity.md`
- Server boundaries: `docs/concepts/server-api.md`
- Entity vocabulary: `docs/concepts/entities.md`
- Storage vocabulary: `docs/concepts/firestore-entity.md`

## Website-ordering delivery contract

Website ordering is a delivered outcome spanning existing capabilities, not a
new Service entity or configuration store. The unit of delivery is a usable
customer entrance connected to the Kitchen's operating flow.

1. **Configure:** use existing Kitchen, Menu, Service and Fulfilment editors
   over the same records and authority as the Workspace. `/services/ordering/setup`
   and Workspace Integrations share Kitchen-owned `components/Ordering/Setup.vue`.
   It edits service configuration through the existing form and command. App-local
   Kitchen choice stays local until an explicit authorized Workspace handoff for
   Menu management, payment, installation or Incoming.
2. **Preview:** existing Service customer links and website preview resolve the
   published Menu and current service context. Configuration checks do not prove
   item eligibility, checkout acceptance or successful order reception.
3. **Prove one order:** a deliberately submitted labelled order must reach
   Incoming exactly once with matching items, total, pickup time and unpaid
   status; Kitchen confirmation precedes customer payment choice and preparation.
   Follow preparation, ready and completion through the same Order. Verify its
   Sale and ticket separately. Pay-at-pickup selection is not payment receipt;
   simulated output is not physical-printer proof.
4. **Install:** use the existing website snippet and verify its external-site
   entrance on desktop/mobile. The static Blank site is a customer-facing emulator
   and owns no Kitchen configuration.

The ordering checklist is guidance, not persisted verification or a readiness gate.
Opening Install or seeing a published Menu must not become a green delivery claim.
Detailed Menu editing retains its Workspace destination; this is not yet fully
inline onboarding. Tests and delivery evidence belong with the actual order and
review, not invented booleans on Kitchen or Service.

Current source entrypoints:

- `projects/misebox/misebox-app/app/components/OrderingSetup/Index.vue`
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Ordering/Setup.vue`
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Services/CustomerLinks.vue`
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Integrations/WebsiteOrdering.vue`
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/service-setup-summary.ts`
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/orders/actions.ts`
- `projects/fireux/no-fireux-embed-test/public/misebox.html`

See `order-processing-kitchen-fulfilment.md` for lifecycle and printing ownership.

## Family boundary

The ordering family has four distinct jobs:

| Layer              | Owns                                                           | Does not own                    |
| ------------------ | -------------------------------------------------------------- | ------------------------------- |
| Menu               | Published catalogue and item prices                            | A customer's transaction        |
| Kitchen service    | Enabled state, eligible Menu IDs, hours and order policy       | Catalogue content               |
| Ordering surface   | Customer intent and surface-specific input                     | Mutable kitchen lifecycle state |
| Kitchen fulfilment | Reusable venue capability such as zones and payment methods    | Menu presentation               |
| KitchenOrder       | Submitted lines, policy snapshots, payment and lifecycle state | Future Menu truth               |

The default Menu route is always readable Browse. Ordering is an optional
projection of the same Menu, not a second Menu entity.

Each new Kitchen receives ordinary draft Menus with generated document IDs and
`food` / `drinks` slugs.
There is no primary/specials Menu configuration. They provide an immediately
usable catalogue floor and do not enter the public `/menus` directory until
published. Additional custom Menus remain separate records governed by product
subscription policy. Every Kitchen-backed public projection uses
`{kitchen-slug}--{menu-id}` so repeated parent-scoped ids cannot collide and
Food, Drinks, and custom Menus retain one predictable route grammar.

## Workspace creation and essential edits

Menus owns the account-based allowance in
`packages/extensions/fireux-kitchens/src/runtime/menu/utils/menu-capacity.ts`.
Free permits two retained records per Kitchen, including system and archived
Menus; Premium and Business have no count limit. The manual creator and imported
draft commit check the same policy inside their trusted transaction. The current
AppUser subscription supplies the tier; its explicit Kitchen association supplies
access. Previewing another tier does not change either authority.

`packages/extensions/fireux-kitchens/src/runtime/menu/server/workspace-commands.ts`
owns creation, item patching and rename commands. Menu lifecycle commands live in
`menu/server/publication/publish.ts` and `withdraw.ts`; each commits status and
directory projection in one transaction. Downgrading limits creation and renaming: it does not remove retained menus or disable price correction, reversible
On menu / Off menu changes, or unpublish. Workspace item lists retain off-menu
items for restoration; public consumers still exclude them. These controls reuse
the existing `active` / `archived` item status and do not add another availability
model. Unpublish sets the scoped Menu to draft and synchronizes its public
directory projection.

The bounded command test is
`packages/extensions/fireux-kitchens/src/test/menu-workspace-commands.test.mjs`.
Rename is a trusted command that updates name and slug on the stable document.
Active section/item creation and editing use trusted commands under
`menu/server/sections/commands.ts` and `workspace-commands.ts`. Metadata and its
root projection commit together. Menu removal archives matching projections and
deletes the scoped document transactionally, without a child-record cascade.
See `src/test/kitchen/menu-content-commands.test.mjs` and
`menu-metadata.test.mjs`; this bounded coverage is not a claim about every writer. Root uploaded-document Menus are a separate
creation path and do not create Kitchen-scoped Menu records.

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

The route grammar is implemented in `kitchen/utils/kitchen-menu-route.ts`;
source-owned Menu route tests verify slugs and stable operational IDs.

| Scope             | Browse                                     | Context                                              | QR           |
| ----------------- | ------------------------------------------ | ---------------------------------------------------- | ------------ |
| Root              | `/menus/{menuId}`                          | `/menus/{menuId}.{context}`                          | append `/qr` |
| Kitchen directory | `/kitchens/{kitchenSlug}/menus/{menuSlug}` | `/kitchens/{kitchenSlug}/menus/{menuSlug}.{context}` | append `/qr` |
| Tenant            | `/{menuSlug}`                              | `/{menuSlug}.{context}`                              | append `/qr` |

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

`MenuRouteContexts`, `menuRouteProjection()`, and route tests are the
current source of truth for this matrix. A diagnostic projection is not a
finished ordering funnel.

## Accepted surface deltas

### Delivery

- Requires a destination and authoritative Kitchen-zone match.
- May add a delivery minimum, fee, and delivery-specific handoff copy.
- Delivery service hours may differ from Kitchen operation hours.

### Collection

- Requires a pickup timing choice and collection handoff copy.
- It does not require delivery-zone validation.

### Pre-order

- Means a future dine-in request, not scheduled Delivery or Collection.
- Requires a future dining time and party size.
- Request intake can remain open while selectable dining times still fail
  closed when effective hours are unavailable.

### Kiosk

- Starts by fixing Eat here or Take away.
- May use a full-viewport, touch-first presentation and persistent basket
  access.
- Must still consume the shared Menu manifest, basket rules, canonical order
  endpoint, and lifecycle.
- Kitchen eat-in/takeaway services determine the eligible Menu Kiosk projection.
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

## Ownership and schedules

| Concern                                        | Owner                 |
| ---------------------------------------------- | --------------------- |
| Business hours and shared timezone             | Place                 |
| Menu/order currency                            | Kitchen               |
| Kitchen operation-hours override               | Kitchen               |
| Service enabled state and eligible Menu IDs    | `Kitchen.services[]`  |
| Serving hours                                  | Named Kitchen service |
| Notice, contact, pause and deposit             | Service interaction   |
| Delivery zones and accepted payment capability | Kitchen fulfilment    |
| Submitted policy and concrete match            | KitchenOrder snapshot |
| Temporary basket and form input                | Browser memory        |
| Order lifecycle                                | KitchenOrder          |

Named services have their own explicit serving hours. Place opening information,
Kitchen working hours and service availability answer different questions; service
hours neither inherit nor intersect the other schedules at runtime. Operators edit
venue and Kitchen schedules on `/workspace/kitchen/identity/operating-hours`, which
also summarizes named services. Service configuration lives under
`/workspace/kitchen/orders/services/<serviceId>`.

A service selects Menus and can allow several interactions. Multiple services can
allow the same interaction. Ordering must identify the exact service; the server
checks its enabled state, interaction, explicit schedule and each basket Menu.
Published catalogue browsing remains independent of service availability.
`kitchen_service_id` identifies the named offering on an order; operational
numbering retains its existing separate `service_id`.

Kitchen operating schedule writes still use `kitchen/server/ordering/hours.ts`
and `orders.operation_hours`. Removing that schedule restores venue inheritance
for Kitchen operations, without changing service schedules or Menu publication.

`menu/server/ordering/order-type.ts` owns the static mode definitions: destination,
schedule, handoff, delivery resolution and requested-time recording. Request,
fulfilment, payment and record consumers use this owner directly. These definitions
describe mode behaviour; stored Kitchen services determine which modes are enabled
and their configurable policy.

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


### Menu-order command boundary

The public POST adapter parses the request and delegates to
`menu/server/ordering/create.ts`. This Menu-owned orchestration retains the
existing H3 authentication adapters; it is not a transport-independent service
API. It composes existing context, pricing, fulfilment, record and commit owners.
Before new-order writes, the transaction validates original context inputs,
source publication, routed scope uniqueness, complete pricing collections and
referenced Sellables. Staff POS and Kiosk authority are rechecked in that same
transaction, and scheduling is validated again against current time. External
delivery lookups remain outside the transaction; their result is snapshotted.

Idempotent replay retains the saved quote and skips new-order validation after
matching the existing request. Existing Menu/channel/identity preflight still
runs, so an unpublished or disabled offering can prevent a later replay; this
slice does not change that policy. Order creation and service numbering remain
atomic. A failed postcommit pre-order WhatsApp dispatch is logged without
customer/provider details and cannot turn a saved Order into a failed response.
Kitchen lifecycle commands also recheck current operator membership and bound
Kitchen access inside their transaction before Order/Sale/financial-fact writes.

Verify with `menu-order-create.test.mjs`, `menu-order-commit-guard.test.mjs`,
`kitchen/menu-order-idempotency.test.mjs`, `kitchen/kiosk-session-authority.test.mjs`
and `kitchen/order-completion-identity.test.mjs`. These controlled checks do not
establish deployed behavior or live provider delivery.

## Configuration boundary

- Menu configuration owns catalogue identity, publication and content.
- Kitchen Services routes configure one named service and its interactions at a time.
- Kitchen configuration owns reusable fulfilment and payment capability.
- Ordering suffix routes are projections, never configuration owners.
- Kiosk activation and revocation are Kitchen operations, not Menu edits or
  public route discovery. Device activation selects an eligible named service and
  published Menu; its session remains bound to both. Devices without a stored
  service identity require reactivation rather than selecting a service implicitly.
- Empty optional configuration should be absent rather than
  persisted as blank objects.
- Pausing an interaction is temporary operational availability, not Menu deletion or
  a change to configured hours.
- Item stock is temporary Menu-item availability, not a mutation of Dish truth.

## Current implementation evidence

- Context model: `packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-context.model.ts`
- Context profiles: `packages/extensions/fireux-kitchens/src/runtime/menu/utils/menu-context.ts`
- Route grammar: `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-menu-route.ts`
- Service and authority tests: `packages/extensions/fireux-kitchens/src/test/kitchen-services.test.mjs`
- Mode policy and consumer tests: `packages/extensions/fireux-kitchens/src/test/menu-order-policy.test.mjs`
- Migration tests: `tools/misebox-migrations/test_named_services.py`
- Protected Interlaken Food/Drinks split: the retired operational artifact in Git history
- Protected public Menu id cutover: the retired operational artifact in Git history
- Protected legacy-to-system Menu cutover: the retired operational artifact in Git history
- Public resolver: `packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenu.ts`
- Order UI: `packages/extensions/fireux-kitchens/src/runtime/menu/components/Order/`
- Order state: `packages/extensions/fireux-kitchens/src/runtime/menu/composables/order/`
- Product-preview UI: `packages/extensions/fireux-kitchens/src/runtime/menu/components/Preview/`
- Lifecycle tests: `packages/extensions/fireux-kitchens/src/test/menu-order-lifecycle.test.mjs`
- Canonical create endpoint: `packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId]/orders.post.ts`
- Kiosk device authority: `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/kiosks/`
- Kiosk operations doorway: `packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/settings/kiosks.vue`
- Kitchen order model: `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/order.model.ts`
- Stored service policy: `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/service.model.ts` and `ordering.model.ts`
- Resolved Menu policy: `packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-ordering.model.ts`
- Workspace settings: `packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/services/`

## Delta register

| Delta                                                                             | Classification | Why                                                                           | Alignment recommendation                                                                              |
| --------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Kiosk has a distinct touch-first presentation                                     | `accepted`     | Different operating environment; shared transaction spine remains intact      | Keep presentation local and transaction behavior shared                                               |
| Guest surfaces require different fields                                           | `accepted`     | Destination, timing, and party context genuinely differ                       | Keep thin surface seams over one lifecycle                                                            |
| Private contexts are not advertised publicly                                      | `accepted`     | Entry requires operator-distributed identity/context                          | Keep discovery policy explicit in the context profile                                                 |
| Product previews have a separate presentation family                              | `accepted`     | Collection, Pre-order, Kiosk and Staff POS demonstrations have real consumers | Keep them in `menu/components/Preview` with `menu/composables/preview`; real transactions use `Order` |
| `table`, `dine_in`, `room_service`, and `staff_pos` remain diagnostic projections | `to-confirm`   | Route identity is guarded, but finished product behavior is not               | Specify each required identity and funnel before promoting it to Order                                |
| Pause belongs to a service interaction                                            | `accepted`     | One operator control pauses that interaction across its eligible Menus        | Load/capacity planning remains separate work                                                          |
| Customer cancellation/refund vocabulary is incomplete                             | `to-confirm`   | Payment and customer lifecycle work is not finished                           | Define it beside the KitchenOrder state machine, not in a surface component                           |

No unexplained delta is implicitly accepted. New contexts must update the
context model, route projection, executable tests, this matrix, and the relevant
product flow together.

## Incoming acceptance and ticket printing

New confirmation-first orders do not print on acceptance or payment. Explicit
preparation releases the ticket. `kitchen/models/order-lifecycle.model.ts` owns
`isKitchenOrderPaymentSatisfied` and `canPrintKitchenOrderTicket`; the server
transition, ticket presentation and print dispatcher consume those rules. A
selected deferred method requires `not_required`; a required payment requires
`paid`. Printing also requires accepted, ready or completed lifecycle state.
Historical orders retain their original acceptance/printing behavior.

`Workspace/Orders/Incoming.vue` reserves browser print windows for historical
orders that print on acceptance. A blocked or failed print does not undo
acceptance; the operator uses the ticket's Print control to retry. A browser
print request is not proof of physical output. Verify with
`confirmation-first-payment.test.mjs`, `kitchen/receipt-print-simulation.test.mjs`
and `kitchen/kitchen-order-accept-print.test.ts`.

## Alignment roadmap

### Now

1. Keep live ordering in `MenuOrder` and its shared lifecycle. The old `Detail`
   root, Kitchen funnel controller and basket-session system are removed.
2. Keep product-preview screens under `menu/components/Preview`; their mock
   state is separate from submission and customer tracking.
3. Run the source-owned service, request-idempotency, public-slug and lifecycle
   tests for changes to these boundaries. The former `scripts/` guard suite is
   removed and is not a verification command.
4. Verify representative Browse, Order and product-preview routes in Misebox
   after component or route moves.

### Next

1. Decide the finished contracts for Table/Dine-in, Room Service, and Staff POS.
2. Define daily pause/load authority only alongside its first real operator
   command and persistence requirement.
3. Verify independent service schedules and fail-closed timing with server tests.
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
