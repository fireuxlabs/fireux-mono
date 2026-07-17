Menu ordering map
Updated: 2026-07-17
Ref: 94132eb72
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
- `/menus/<menuId>` is Browse. It renders the published menu and creates no Order.
- Ordering contexts suffix the menu identity, not its collection base:
  `/menus/<menuId>.<context>` or
  `/kitchens/<kitchenSlug>/menus/<menuId>.<context>`.
- Never generate `/menu.delivery`, root `/<menuId>`, or count-dependent route
  grammar.
- Home options is a UI grouping, not a surface, route context, or `KitchenOrder.order_type`.
- `/menus/<menuId>.delivery` and `.collection` are separate direct surfaces.
- A menu may enable `delivery`, `collection`, or both inside the Home options grouping.
- `.pre_order`, `.room_service`, `.dine_in`, and `.kiosk` remain purpose-specific surfaces.
- Kiosk has one public route: `/menus/<menuId>.kiosk`.
- `eat_in` and `takeaway` are choices inside Kiosk, not separate public surfaces or route suffixes.
- The selected kiosk choice remains on the Order as the preparation, handoff, and future tax-treatment flag.
- A surface groups or preselects customer intent; the resulting canonical order type is what reaches kitchen intake.
- Order creation receives only the route menu identity and, for a directory
  projection, its Kitchen slug. Checkout return URLs are derived server-side
  from the resolved Menu target plus the stored Order type; clients do not send
  a route-mode hint.

Current display rule:
- Do not store a public view marker on menus.
- A Collection projection exists only when the context-filtered manifest keeps
  `ordering.enabled`, `orderingEnabled`, and a Collection order-type row true.
- The Collection projection proves routing, resolution, authorization, theme,
  and failure behavior, then renders selectable manifest items into a
  page-local basket.
- That basket exists in memory only. It does not restore across navigation or
  refresh. Customers can review configured lines, adjust quantities, and
  remove lines, but cannot submit an Order, enter customer details, or start
  payment.
- If ordering is absent or disabled, the same menu still renders as readable content.

Current ordering shape:
```ts
ordering: {
  enabled: true,
  order_types: [
    {
      type: 'pre_order',
      notice_hours: 24,
      message: 'Pre-orders need at least 24 hours notice.'
    }
  ]
}
```

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
- `payment_methods`: cash, card on pickup, card to driver, online card, deposit.
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
- `.collection` renders the package-owned, noindex `Menu/Order` projection.
  It resolves the context-filtered manifest through the same `useMenu` seam,
  fails closed with 404 when Collection is disabled or the Menu is document-only,
  and renders its sections as selectable items. Required variants, optional
  add-ons, and quantity are configured explicitly before adding a line to the
  local basket.
- Every other recognized ordering suffix still renders `Menu/Json` as a
  diagnostic projection. No public route mounts an ordering funnel yet.
- The preserved `Menu/Detail/Food`, `Menu/Detail/Funnel/Index`, and
  `composables/fireux/kitchen/order/funnel/shared/useFunnel` chain is therefore
  disconnected implementation material, not the active public owner.
- `MenuOrder` owns a transient basket seam that merges identical configurations,
  counts quantities, calculates variant absolute prices plus incremental
  add-ons, and validates review-time quantity changes and removals. It does not
  use the preserved funnel draft, storage, session, fetch, or order-creation
  seams. Submission, payment, and the canonical order endpoint remain later
  passes.
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
- Initial status is resolved once from payment plus the shared intake policy:
  `pending_payment`, otherwise `pending_acceptance` or `accepted`.
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
