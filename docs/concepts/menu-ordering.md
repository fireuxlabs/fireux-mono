Menu ordering map
Updated: 2026-07-18
Ref: f4ddbda21
Role: map, not canon

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
- `.pre_order`, `.room_service`, `.dine_in`, and `.kiosk` remain purpose-specific surfaces.
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
- A Delivery, Collection, or Pre-order projection exists only when the
  context-filtered manifest keeps `ordering.enabled`, `orderingEnabled`, and
  the matching order-type row true.
- Each live public order projection proves routing, resolution, authorization,
  Menu style, surface navigation, and failure behavior, then renders the same
  selectable manifest catalogue into a page-local basket.
- That basket exists in memory only. It does not restore across navigation or
  refresh. Customers can review configured lines, adjust quantities, and
  remove lines. Collection can then record a page-local queue or scheduled
  pickup choice from the resolved Collection order-type policy; missing hours
  fail closed, and scheduled choices share the server's hours and notice
  validation utilities. Slot cadence starts at each configured service-window
  opening rather than at an unrelated midnight grid. Collection alone has the
  first active submission path:
  optional name/mobile fields, configured Pay now or surface-aware Pay later choice, canonical Order
  creation, and live acceptance/ready/completed status. The active pipeline
  does not restore after refresh. Pay now uses the existing online-card checkout
  only when that method is configured.
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

Collection timing boundary:
- Effective time follows one parent at each layer: Place business hours seed
  Kitchen operation hours; Menu service hours inherit Kitchen by default; an
  enabled ordering surface inherits its Menu by default. A surface override
  never jumps past the Menu directly to the Kitchen.
- Collection availability belongs to the `collection` order-type row, not to
  generic Menu hours and not to the public route.
- The row owns its optional customer message, immediate-collection flag,
  minimum notice, slot interval, scheduling horizon, and inherited or custom
  service hours. Its fulfilment policy owns payment methods and customer-facing
  handoff instructions; its customer policy chooses which of name, mobile, and
  email are required. Public checkout groups configured payment methods into
  surface-aware Pay now and Pay later choices and enforces required contact
  fields on both client and server.
- Temporary operational availability is distinct from configured hours and
  surface enablement. A paused Collection surface remains a readable, themed
  Menu doorway, replaces ordering controls with the configured pause message,
  and fails closed at the canonical order endpoint for stale clients.
- The Menu console keeps surface enablement at
  `/console/kitchen/menus/<menuId>/ordering` and keeps Menu service-hours
  defaults on `/console/kitchen/menus/<menuId>`. It edits Collection policy on the focused
  child route `/console/kitchen/menus/<menuId>/ordering/collection`. The
  `/ordering/<surface>` namespace stays separate from Menu section ids and can
  grow one explicit surface editor at a time. Public suffixes such as
  `.collection` are projections and are never console ids.
- Menu and Collection configuration follows the shared profile-editable
  structure: reusable Firestore form molecules own read/edit/save/cancel,
  optimistic display, validation, and field errors; domain components provide
  current values and focused patch functions. Structured hours validate before
  persistence. Because order types are stored as an array, rapid field patches
  serialize inside the ordering mutation composable rather than through a
  page-wide draft or save action.
- The public Collection surface labels current availability as `Open now`,
  `Not open`, `Collection paused`, or `Collection hours unavailable`. Pickup
  choices read only the resolved Collection row after Menu inheritance.
  Missing effective hours fail closed rather than silently jumping to a
  grandparent layer.

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

Likely future `type` values:
- `dine_in`: order for normal in-venue service.
- `collection`: customer collects from the venue.
- `delivery`: food is delivered to an address.
- `pre_order`: customer orders ahead of service.
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
- `payment_methods`: cash, card on pickup, card to driver, room charge, online card, deposit.
- `deposit`: amount or percentage required before accepting an order.
- `party_size`: minimum or maximum guest count for a mode.

Delivery availability notes:
- Delivery hours are not the same as venue opening hours and should not be
  inferred from Google opening hours.
- A Kitchen may be open while delivery is closed, paused, or overloaded.
- V1 can store/show delivery zones first; delivery time windows should become
  fulfilment policy when we add the editor.
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
- Store fulfilment hints under each `ordering.order_types[]` row as
  `fulfilment`.
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
  configuration first, and quantity remains adjustable in basket review.
- A resolvable Kitchen-scoped `.collection` mistake reuses the same human
  unavailable treatment but resolves only the current Kitchen name and Menu
  page style. Its circular exit and recovery action both return to the Kitchen
  profile. This is a themed 404 doorway, not a second Collection funnel or a
  shortcut to one of the Kitchen's Menus.
- Private and operational suffixes without a dedicated surface still render
  `Menu/Json`. No public route mounts the preserved legacy funnel chain.
- The preserved `Menu/Detail/Food`, `Menu/Detail/Funnel/Index`, and
  `composables/fireux/kitchen/order/funnel/shared/useFunnel` chain is therefore
  disconnected implementation material, not the active public owner.
- `MenuOrder` owns a transient basket seam that merges identical configurations,
  counts quantities, calculates variant absolute prices plus incremental
  add-ons, and validates review-time quantity changes and removals. Its
  Collection-only timing boundary also remains transient, clears with the
  basket/source scope, offers queue collection only during current service,
  and derives future half-hour choices from published service windows and
  `notice_hours`. Collection then uses the separate active
  `useMenuCollectionOrder` seam to submit the validated basket, minimal contact
  details according to the resolved customer policy, pickup choice, and shared
  payment-timing selection to the canonical endpoint. The resolved handoff
  instructions remain visible through checkout and Collection status.
  It polls the existing order-status endpoint until the Kitchen accepts,
  rejects, marks ready, or completes the order. The active path does not reuse
  the preserved funnel draft/storage/session chain or persist tracking across
  a refresh; configured Pay now hands off to the existing secure checkout.
  Delivery and Pre-order submission remain later passes.
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
  kitchen controls issue named lifecycle commands such as Accept, Reject,
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
- Prefer `pre_order` when lead time matters more than handoff.
- Avoid storing `service_modes` as a separate top-level list unless a future proven need appears.
- Avoid `ordering.modes`; delivery, collection, dine-in, pre-order, and room service are order types.

Guardrails:
- Do not add a new mode just because one restaurant words the service differently.
- Do not put delivery fees, deposits, or opening hours on Menu until the ordering/fulfilment layer needs them.
- Do not make public menu rendering infer business rules from kitchen type or tenant app id.
- Keep the Menu component boring: it receives the resolved menu behaviour and renders available views.

Open questions:
- Where exactly should daily fulfilment availability live when delivery pauses, deposits, and table reservations become real?
