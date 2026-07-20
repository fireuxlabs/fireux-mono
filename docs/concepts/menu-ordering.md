Menu ordering map
Updated: 2026-07-20
Ref: 8d83d3fa7
Role: map, not canon
<!-- Concurrent edit — 2026-07-19 17:33 CEST — Kiosk pass: record the private Kiosk doorway on the shared lifecycle. -->
<!-- Concurrent edit — 2026-07-19 22:12 CEST — Pre-order WhatsApp test pass: record the private Kitchen-alert, provider, and authenticated test boundary. -->
<!-- Concurrent edit — 2026-07-20 16:10 CEST — Pre-order planning pass: place dining time and party size before catalogue selection. -->

Purpose:
Map how food-menu ordering should stay small enough to reason about while still covering future restaurant service patterns.

Vertical links:
- Parent: family-menu.md
- Parent: console.md
- Parent: server-api.md
- Child: order-processing-kitchen-fulfilment.md

Horizontal links:
- entities.md
- firestore-entity.md
- components.md

Core split:
- Public menu content is readable by default.
- `ordering` describes what kind of order the public menu can create.
- `Order` records describe what a customer actually sent to the kitchen.
- `Fulfilment` is not the same as Menu; it is the later operational promise and handoff layer.

Public route hierarchy:
- Global `/menus/<menuId>`, tenant `/<menuId>`, and directory
  `/kitchens/<kitchenSlug>/menus/<menuId>` are Browse. They render the
  published menu and create no Order.
- Ordering contexts suffix the menu identity, not its collection base:
  `/menus/<menuId>.<context>` or
  `/kitchens/<kitchenSlug>/menus/<menuId>.<context>`, while a tenant uses
  `/<menuId>.<context>`.
- Never generate `/menu.delivery` or `/menus.<context>`. Tenant detail grammar
  remains root-based at every menu count; only `/menus` index presentation
  changes between redirect, empty, and list outcomes.
- `/kitchens/<kitchenSlug>.collection` is not an ordering route because it has
  no Menu identity. If the Kitchen resolves, it renders only a Kitchen-themed,
  noindex 404 recovery surface whose actions return to that public Kitchen;
  it never selects, redirects to, or creates an Order from a Menu implicitly.
- Home options is a UI grouping, not a surface, route context, or `KitchenOrder.order_type`.
- A menu's `.delivery` and `.collection` suffixes are separate direct surfaces.
- A menu may enable `delivery`, `collection`, or both inside the Home options grouping.
- `.pre_order` is the guest-facing advance dine-in surface for a larger table.
  Scheduled Delivery remains `.delivery`, and scheduled pickup remains
  `.collection`; neither is represented as `pre_order`.
- `.room_service`, `.dine_in`, and `.kiosk` remain purpose-specific private
  surfaces.
- Dine-in/Table service, Kiosk, and Room Service each have an addressable route
  per doorway, using the same identity suffix rule, but they are
  operator-distributed entries rather than guest-discoverable navigation.
  Public Kitchen cards and customer choice rails do not advertise them;
  console QR tooling remains their management doorway. A later Room Service
  pass may add room identity to each generated QR without changing this
  discoverability boundary.
- Any recognized contextual doorway may add `/qr` after the contextual menu
  identity. That QR encodes the exact context URL and is available only when
  the context-filtered Menu manifest resolves; it never silently falls back to
  generic Browse.
- `eat_in` and `takeaway` are choices inside Kiosk, not separate public surfaces or route suffixes.
- The selected kiosk choice remains on the Order as the preparation, handoff, and future tax-treatment flag.
- A surface groups or preselects customer intent; the resulting canonical order type is what reaches kitchen intake.
- Order creation receives only the route menu identity and, for a directory
  projection, its Kitchen slug. Checkout return URLs are derived server-side
  from the resolved Menu target plus the stored Order type; clients do not send
  a route-mode hint.

Current display rule:
- Do not store a public view marker on menus.
- A Delivery, Collection, Pre-order, or Kiosk projection exists only when the
  context-filtered manifest keeps `ordering.enabled`, `orderingEnabled`, and
  the matching order-type row true.
- Each live public order projection proves routing, resolution, authorization,
  Menu style, surface navigation, and failure behavior, then renders the same
  selectable manifest catalogue into a page-local basket.
- That basket exists in memory only. It does not restore across navigation or
  refresh. Customers can review configured lines with read-only quantities and
  remove a line; adding the same configuration again increments its quantity.
  Collection and Delivery can record a page-local ASAP or scheduled choice.
  Pre-order request intake stays open at every wall-clock time while its surface
  is enabled and unpaused, but it requires a future dining choice. Each reads
  the resolved order-type policy; missing hours fail closed for selectable
  fulfilment times, and scheduled
  choices share the server's hours and notice validation utilities. Delivery
  first verifies its address against the resolved Kitchen zone policy. Slot
  cadence starts at each configured service-window opening rather than at an
  unrelated midnight grid. Those three guest surfaces use the active submission path:
  optional name/mobile fields, configured Pay now or surface-aware Pay later choice, canonical Order
  creation, and live acceptance/ready/completed status. After submission, a
  minimal browser tracking session restores the safe Order reference, current
  status, and fulfilment/payment labels across refresh and equivalent root or
  Kitchen-scoped routes. It is keyed by canonical app, Kitchen, Menu, and order
  type. When that local tracker is absent, a signed-in guest evaluates the newest
  matching Order through the bounded canonical customer-order projection and
  restores it only while it is unresolved; older anomalous test or service
  records never leapfrog that newest result. The
  browser storage is not the lifecycle authority. The session does
  not persist customer/contact input or basket contents. Pay now uses the
  existing online-card checkout only when that method is configured. Kiosk
  first fixes Eat here or Take away, then uses the same catalogue, basket,
  checkout, idempotent submission, and tracking lifecycle without collecting
  customer details unless its resolved policy explicitly requires them. Kiosk
  submits through channel `kiosk`; its automatic-acceptance order types enter
  Queue rather than Incoming.
- A signed-in guest order atomically creates a lightweight link at
  `customers/{userId}/orders/{orderId}` beside the Kitchen order. The link
  records only immutable source identity; the Kitchen order remains the sole
  lifecycle authority. The customer dashboard reads a bounded link page and
  resolves its Kitchen orders and deduplicated public Kitchen identities with
  bounded batch reads. That customer-owned projection includes the canonical
  Order-line snapshots needed to reconstruct amendment review without making a
  browser basket authoritative. Ready, completed, and cancelled orders therefore remain
  visible with current Kitchen branding, without a second mutable order-status
  copy, per-card Kitchen reads, or a cross-Kitchen collection-group scan.
  While mounted and visible, the dashboard silently reconciles that bounded
  projection in the background; customers do not operate a manual refresh.
  Anonymous orders are not silently
  claimed later; any future claim flow needs its own explicit identity proof.
- If ordering is absent or disabled, the same menu still renders as readable content.

Current ordering shape:
```ts
ordering: {
  enabled: true,
  order_types: [
    {
      type: 'collection',
      notice_hours: 0.5,
      asap_enabled: true,
      slot_interval_minutes: 30,
      schedule_horizon_days: 7,
      service_hours: {
        inherit_menu_service_hours: true
      }
    }
  ]
}
```

Surface timing and capability boundary:
- Effective time follows one parent at each layer: Place business hours seed
  Kitchen operation hours; Menu service hours inherit Kitchen by default; an
  enabled ordering surface inherits its Menu by default. A surface override
  never jumps past the Menu directly to the Kitchen.
- Collection, Delivery, or Pre-order availability belongs to its order-type
  row, not to generic Menu hours and not to the public route.
- Pre-order has two distinct clocks. Enabled plus unpaused controls whether a
  guest may send an advance-table request at any time. Resolved service hours,
  notice, interval, and horizon control which future dining times the guest may
  request; current Kitchen opening state never closes request intake.
- The row owns its optional customer message, immediate-collection flag,
  minimum notice, slot interval, scheduling horizon, and inherited or custom
  service hours. Its fulfilment policy owns customer-facing handoff instructions;
  its customer policy chooses which of name, mobile, and email are required.
  Delivery-zone and payment capability are Kitchen truth, with each payment
  method declaring the order types for which the Kitchen accepts it. A Menu surface receives only that
  eligible Kitchen projection and never stores overriding zones or payments.
  Public checkout groups the resolved payment methods into
  surface-aware Pay now and Pay later choices and enforces required contact
  fields on both client and server.
- Room charge illustrates the boundary: the Place or property may prove room
  and guest context, the Kitchen decides whether it accepts room charging, and
  the Kitchen policy limits that method to `room_service` with a
  `verified_room` requirement. Collection therefore cannot expose room charge.
- Collection, Delivery, and Pre-order operators edit minimum preparation time
  in whole minutes on the focused surface console. The existing `notice_hours` value remains the
  stored cross-surface policy unit; the editor converts at its boundary, and
  public time choices omit slots inside that configured lead time.
- Temporary operational availability is distinct from configured hours and
  surface enablement. A paused Collection, Delivery, or Pre-order surface
  remains a readable, themed Menu doorway, replaces ordering controls with the configured pause message,
  and fails closed at the canonical order endpoint for stale clients.
- The Menu console keeps surface enablement at
  `/console/kitchen/menus/<menuId>/ordering` and keeps Menu service-hours
  defaults on `/console/kitchen/menus/<menuId>`. It edits Collection,
  Delivery, and Pre-order policy on focused child routes below
  `/ordering/<surface>`. The
  `/ordering/<surface>` namespace stays separate from Menu section ids and can
  grow one explicit surface editor at a time. Public suffixes such as
  `.collection` are projections and are never console ids.
- Console configuration follows `Menu defaults → Ordering surfaces → focused
  surface settings`. The Ordering index lists real public/private doorways;
  `Home options` remains only a customer-interface grouping and never owns
  configuration. Focused settings live at `/ordering/<surface>`, currently for
  Collection, Delivery, Pre-order, and Kiosk. Kiosk skin therefore belongs at
  `/ordering/kiosk`, not
  loose on the Ordering index. Surfaces without settings beyond enablement do
  not receive empty placeholder editors.
- Menu, Collection, Delivery, and Pre-order configuration follows the shared
  profile-editable structure: reusable Firestore form molecules own read/edit/save/cancel,
  optimistic display, validation, and field errors; domain components provide
  current values and focused patch functions. Structured hours validate before
  persistence. Because order types are stored as an array, rapid field patches
  serialize inside the ordering mutation composable rather than through a
  page-wide draft or save action.
- A Pre-order row may enable one WhatsApp Kitchen alert and store its Kitchen
  recipient as an E.164 number under `notifications.whatsapp`. This operational
  recipient is removed from public Menu manifests. WhatsApp Business sender
  identity, access token, Graph version, approved template, and template
  language remain deployment environment, never Menu data.
- Order creation snapshots an enabled alert as pending in the same transaction
  as the Order. Server delivery claims that Order notification once and records
  attempts, provider message id, or a bounded failure. A provider failure does
  not roll back the accepted Order. Pay-later alerts run after the Order commit;
  Pay-now alerts remain blocked by `pending_payment` and run only after the
  verified Stripe webhook advances the Order.
- The approved WhatsApp template receives six body values in order: Order
  number, requested date/time, customer name, item summary, formatted total,
  and the absolute confirmation URL. Runtime configuration uses
  `FIREUX_WHATSAPP_CLOUD_ACCESS_TOKEN`,
  `FIREUX_WHATSAPP_CLOUD_GRAPH_VERSION`,
  `FIREUX_WHATSAPP_CLOUD_PHONE_NUMBER_ID`,
  `FIREUX_WHATSAPP_PRE_ORDER_TEMPLATE`, and
  `FIREUX_WHATSAPP_PRE_ORDER_TEMPLATE_LANGUAGE`, plus
  `FIREUX_WHATSAPP_PRE_ORDER_CONSOLE_URL`. The latter must be an HTTPS global
  Misebox origin with the exact path
  `/console/kitchen/orders/pre-orders`.
- The focused Pre-order console may test that exact stored recipient through an
  authenticated Kitchen-operator endpoint. The test uses the same provider and
  approved six-value template without creating a fake Order or accepting a
  client-supplied recipient.
- Public order surfaces label current availability as `Open now`, `Not open`,
  `<Surface> paused`, or `<Surface> hours unavailable`. Time choices read only
  the resolved surface row after Menu inheritance.
  Missing effective hours fail closed rather than silently jumping to a
  grandparent layer. Pre-order is the deliberate exception to current-open
  copy: it displays `Pre-order requests open` whenever enabled and unpaused,
  while its future dining selector still fails closed without effective hours.

Efficient matrix:
- `type`: the customer order type.
- Optional policy fields: constraints on that order type, only added when needed.
- `KitchenOrderIntakePolicies`: shared channel and acceptance policy for every canonical order type.

Why this is efficient:
- It avoids a premature second axis.
- It keeps display default and operational order types separate.
- It lets Bären, La Tap, Luna, and future kitchens share one shape.
- It lets the order system grow by adding small policy fields, not new one-off surfaces.

Public choice rail:
- The structured public manifest emits choices at `behaviour.choices`.
- Those choices are derived from all published sibling menus for the same Kitchen.
- Local choices switch the current menu between readable content and available order behaviour.
- Linked choices route to another published sibling menu.
- Owner copy for a mode belongs on the order type `message`; renderer fallbacks should stay boring.

Configuration note:
- Tenant ordering configuration is runtime data and may change during a
  migration. Inspect the resolved KitchenMenu manifest before claiming that a
  kitchen supports a particular order type; this map is not data authority.
- A menu with no enabled order types still renders through Browse.

Known and planned `type` values:
- `dine_in`: order for normal in-venue service.
- `collection`: customer collects from the venue.
- `delivery`: food is delivered to an address.
- `pre_order`: advance dine-in requested for a larger table and future dining
  time; it is not scheduled Delivery or Collection.
- `room_service`: hotel/private-room service.

Possible future timing policies:
- `notice_hours`: minimum notice before the requested time.
- `cutoff_time`: latest same-day order time.
- `requested_for_required`: customer must choose a time.
- `asap_enabled`: kitchen accepts immediate orders.
- `schedule_windows`: mode-specific ordering windows.

Possible future fulfilment policies:
- `handoff`: table, bar, counter, pickup, curbside, locker, driver, buffet, or room.
- `delivery_zones`: areas, postcodes, fees, minimum spend, and eta rules.
- Kitchen `payment_methods`: method plus applicable order types and optional
  customer-context requirements. Cash, card at pickup, card to driver, room
  charge, and online card remain Kitchen capabilities; surfaces consume the
  compatible projection.
- `deposit`: amount or percentage required before accepting an order.
- `party_size`: minimum or maximum guest count for a mode.

Delivery availability notes:
- Delivery hours are not the same as venue opening hours and should not be
  inferred from Google opening hours.
- A Kitchen may be open while delivery is closed, paused, or overloaded.
- Delivery zones are Kitchen capability; Delivery time windows and notice are
  Menu-surface policy edited on the focused Delivery route.
- Kitchens need an operational pause such as: "Sorry, the kitchen is too busy
  to run delivery right now."
- When delivery is paused or closed, public UI can offer nearby Misebox
  kitchens instead of leaving the customer at a dead end.

Item availability notes:
- Operators need a fast out-of-stock control for menu items.
- Running out of burgers is not a menu deletion; it is temporary availability
  state.
- Prefer item/menu availability before changing Dish truth, because one dish
  can appear differently across menus or services.

V1 fulfilment policy:
- Store surface-specific fulfilment hints under each `ordering.order_types[]`
  row as `fulfilment`; do not duplicate Kitchen payment capability there.
- Store Delivery zones and accepted payment-method policies once on Kitchen
  `fulfilment`, including
  their applicable order types. The server resolves those policies into the
  selected Menu surface before rendering or validating checkout.
- Public menu rendering may show `message` and order choices.
- Order creation copies the selected order-type policy to
  `Order.fulfilment_policy` so historical tickets retain the rules the
  customer ordered under.
- Enforcement follows the relevant input UI. Current order creation validates
  serving windows, future requested times, and `notice_hours` whenever the
  selected strategy supplies a scheduled request.

Public order funnel spine:
- Generic public routes currently render the package-owned `Menu/Browse`
  projection. It is context-free and read-only.
- `.delivery`, `.collection`, and `.pre_order` render the package-owned,
  noindex `Menu/Order` projection. Each resolves its context-filtered manifest
  through the same `useMenu` seam, fails closed with 404 when that order type
  is disabled or the Menu is document-only, and renders the standard Menu
  catalogue as selectable items. A resolved-but-disabled order page keeps that
  404 response while offering the generic Browse
  route and, when the resolved source has a Kitchen slug, its public Kitchen
  route; genuinely missing Menus do not emit guessed recovery links. This
  recovery state uses the host app's normal UI theme rather than presenting a
  disabled ordering context as if it were still the Kitchen's live Menu
  surface. The lowest-priced valid variant is selected initially (declared
  order breaks price ties), the customer may choose another, and the chosen
  variant identity and optional add-ons are configured before adding a line.
  Variant choices render inline on the item row, with the lowest-priced valid
  option selected initially; the plus adds that explicit selection. A true
  base-price item plus also adds one immediately. Only add-on families open
  configuration first, where quantity may be chosen before adding.
- A resolvable Kitchen-scoped `.collection` mistake reuses the same human
  unavailable treatment but resolves only the current Kitchen name and Menu
  page style. Its circular exit and recovery action both return to the Kitchen
  profile. This is a themed 404 doorway, not a second Collection funnel or a
  shortcut to one of the Kitchen's Menus.
- Private and operational suffixes without a dedicated surface still render
  `Menu/Json`.
- `MenuOrder` is the single target public ordering spine. The unshipped
  `Menu/Detail/Food`, `Menu/Detail/Funnel/Index`, app-local `/ordering/*`, and
  `composables/fireux/kitchen/order/funnel/*` implementation still has direct
  development consumers, but it is not a second product family or compatibility
  boundary. Migrate useful surface steps into `MenuOrder`, switch those
  consumers, and delete the alternate chain atomically before release.
- `MenuOrder` owns a transient basket seam that merges identical configurations,
  counts quantities, calculates variant absolute prices plus incremental
  add-ons, and supports review-time line removal without a second quantity
  editor. Its
  shared timing boundary also remains transient, clears with the basket/source
  scope, offers ASAP only during current service,
  and derives future half-hour choices from published service windows and
  `notice_hours`. Collection, Delivery, and Pre-order use thin surface request
  seams over
  one `useMenuOrderLifecycle`; Delivery adds authoritative address/zone/minimum/
  fee validation before the same checkout, while Pre-order gates the catalogue
  behind one transient advance-table plan containing party size and a future
  requested dining time. Checkout does not ask for those plan fields again.
  Kiosk adds only the fixed Eat here/Take
  away choice and uses
  no customer schedule. Each active surface submits the validated basket,
  minimal contact details according to the resolved customer policy, timing
  choice, and shared payment selection to the canonical endpoint. Resolved
  handoff instructions remain visible through checkout and status. The shared
  lifecycle polls the existing order-status endpoint until the Kitchen accepts,
  requests a customer change, marks ready, or completes the order. All surface funnels must reuse
  the canonical Menu/Order session boundary rather than create parallel draft
  or tracking storage. Its
  `useMenuOrderTrackingSession` stores only safe post-submit tracking state and
  keeps the ordering catalogue blocked while that submitted Order is unresolved.
  Anonymous same-device tracking carries an unguessable Order capability used
  only by the customer-safe status, checkout, and response endpoints; signed-in
  account ownership remains the alternative authority. A pending Pre-order is
  visible in Incoming and at `/console/kitchen/orders/pre-orders`. The Kitchen
  confirmation transition creates one deterministic User notification for a
  signed-in customer and My orders projects the same canonical Order.
  A Kitchen send-back moves the same Order to `changes_requested` and remains
  visible after navigation or refresh. It never cancels on the customer's
  behalf: the customer sees a personal greeting and must either cancel, which
  clears the active funnel, or amend. The intentionally simple first amendment
  pipeline closes the returned Order, restores its submitted items into the
  normal basket from the canonical customer projection, and lets the customer
  adjust and submit a fresh Order through the ordinary validated funnel.
  Configured Pay now hands off to the existing secure checkout.
- `funnel/shared`: shared steps/seams such as basket, allergen notice,
  customer autofill, and late notes.
- Funnel composable naming should keep `useFunnel` as the shared root,
  `use<Type>Funnel` as the type brain, and `use<Type>Funnel<Screen>` only when a
  screen earns its own state seam. Shared screens can stay short, such as
  `useBasket`.
- `useFunnelSteps` owns shared step navigation for the funnel card. It is not a
  type brain and should not own order creation rules.
- `funnel/shared/utils`: shared funnel utilities such as customer autofill.
- `funnel/Delivery`: delivery-only screens such as `Area` and `Fulfilment`,
  backed by the single `useDeliveryFunnel` seam until a screen earns its own
  extra composable.
- `funnel/Collection`: collection-only timing/rendezvous with the kitchen.
- `server/api/menus/[menuId]/orders.post.ts`: canonical KitchenOrder creation
  route for public and authenticated Staff POS channels. It writes records under
  `apps/<appId>/kitchens/<kitchenId>/orders`.
- Kitchen operators use a short service-local `Order N`, not the stored document
  ID or a date-coded reference. Order creation advances
  `order-service/current` in the same Firestore transaction as the Order write
  and idempotency reservation. Ending a service rotates the service ID and
  resets the next Order to 1; it must not overlap active Incoming, Queue, or Pass
  work.
- Operator presentation follows the work state: Incoming owns its receiving
  controls; Queue and Pass share one operational Kitchen Order ticket; Recent
  is a completed-order archive and may expose richer inspection information
  rather than reusing the active ticket.
- The Kitchen Orders console does not expose a generic Create/Edit surface.
  Customer funnels and authenticated Staff POS channels create Orders;
  kitchen controls issue named lifecycle commands such as Accept, Send back,
  Ready, Return, and Send. If a later Order field earns direct editing, use the
  shared profile-editable structure for an atomic, permissioned, auditable
  field update rather than treating the whole Order as a free-form document.
- Collection tickets may suffix the short reference with the customer's first
  name (`Order: 3-Sofia`). Other surfaces retain `Order: N`; table and room
  identity remain fulfilment context rather than part of the sequence.
- Initial status is resolved once from payment plus the shared intake policy:
  `pending_payment`, otherwise `pending_acceptance` or `accepted`.
- The active Kitchen board separates payment holding from kitchen intake.
  Unpaid orders do not appear in Incoming until payment resolves. Collection,
  Delivery, and Pre-order require an operator acceptance decision; Dine-in,
  Eat-in, Takeaway, and Room service enter Queue automatically. Delivery may
  add dispatch work after kitchen production without becoming a second intake
  lifecycle.
- Clients submit option identity, not trusted option prices. Order creation
  resolves every selected variant and add-on again from the published
  Kitchen-owned MenuItem, charges the variant's absolute price plus add-on
  deltas, and rejects missing or unknown required choices.
- Each resolved KitchenOrder line snapshots its published `item_kind` as
  `food` or `drink`. Kitchen receiving views may therefore show quantity totals
  by production kind without rehydrating mutable Dish or MenuItem records.
- Do not create a second client-side generic `Order` record from the public
  funnel unless the generic order engine and kitchen order console are
  deliberately reconciled first.

Customer funnel notes:
- The allergy/safety notice should be a full step panel, not a small warning
  competing with delivery details.
- The waiting/accepted state should be customer-first: destination/status first,
  order number as a small reference.
- Address autocomplete felt smooth in the latest Bären test, but it was flaky
  during setup; keep an asterisk here to revisit diagnostics if customers hit
  "address not available" or selected addresses fail verification.
- Public customer surfaces should not expose print-test actions; printing belongs
  after kitchen acceptance in order processing.

Bären delivery policy example (not data authority):
- A prior provider reference used coloured delivery areas with different
  minimum orders and fees. Verify the current Kitchen fulfilment data before
  treating these values as live policy.
- The visible rules are minimum CHF 15 / fee CHF 0, minimum CHF 20 / fee CHF 0,
  minimum CHF 30 / fee CHF 0, and minimum CHF 50 / fee CHF 10.
- Treat this as fulfilment configuration, not as another menu mode.
- V1 can match delivery zones by `postal_codes` or named areas.
- Later versions can add map polygons if postcodes are not accurate enough.
- Opening hours, delivery hours, pickup hours, reservation hours, payment
  methods, address, and phone are also fulfilment/contact policy, not menu
  rendering state.

Naming notes:
- Prefer `collection` when the order is collected by the customer.
- Prefer `delivery` when the order travels to the customer.
- Prefer `pre_order` only for advance dine-in table service. Scheduled Delivery
  and Collection remain timing choices inside their own order types.
- Avoid storing `service_modes` as a separate top-level list unless a future proven need appears.
- Avoid `ordering.modes`; delivery, collection, dine-in, pre-order, and room service are order types.

Guardrails:
- Do not add a new mode just because one restaurant words the service differently.
- Do not put delivery fees, deposits, or opening hours on Menu until the ordering/fulfilment layer needs them.
- Do not make public menu rendering infer business rules from kitchen type or tenant app id.
- Keep the Menu component boring: it receives the resolved menu behaviour and renders available views.

Open questions:
- Where exactly should daily fulfilment availability live when delivery pauses, deposits, and table reservations become real?
