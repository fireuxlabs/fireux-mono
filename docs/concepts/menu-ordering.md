Menu ordering map
Updated: 2026-06-30
Ref: 151c7ad49
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
- `public_views` describes what the public menu can show.
- `ordering` describes what kind of order the public menu can create.
- `Order` records describe what a customer actually sent to the kitchen.
- `Fulfilment` is not the same as Menu; it is the later operational promise and handoff layer.

Current public views:
- `browse`: read the structured menu.
- `order`: add items and send an order.

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

Why this is efficient:
- It avoids a premature second axis.
- It keeps browse/order UI separate from operational order types.
- It lets Bären, La Tap, Luna, and future kitchens share one shape.
- It lets the order system grow by adding small policy fields, not new one-off surfaces.

Public choice rail:
- The public menu endpoint may emit `public_choices`.
- `public_choices` are derived from all published sibling menus for the same Kitchen.
- Local choices switch the current menu between browse/order behaviour.
- Linked choices route to another published sibling menu.
- Owner copy for a mode belongs on the order type `message`; renderer fallbacks should stay boring.

Current examples:
- Luna: no `ordering`, so the menu is browse-only.
- Bären: `public_views: ['order']`, `ordering.order_types: [{ type: 'delivery', fulfilment: { delivery_zones } }, { type: 'collection' }]`.
- La Tap: `public_views: ['browse', 'order']`, `ordering.order_types: [{ type: 'pre_order', notice_hours: 24 }]`.

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
- Enforcement should wait for the relevant input UI. Example: do not enforce
  `notice_hours` until the public order flow asks for `requested_for`.

Public order funnel spine:
- `Menu/Detail/Index`: public menu experience owner. It fetches the manifest,
  applies the theme, and routes document menus away from ordering.
- `Menu/Detail/Food`: structured food menu experience. It renders the readable
  menu body and the order funnel for orderable menus.
- `Menu/Detail/Content`: readable menu renderer. It receives a view model,
  emits choice/add/remove events, and does not own checkout/order creation.
- `Menu/Detail/Funnel/Index`: public order funnel shell. It owns the six visible
  checkout steps, but calls the injected submit seam instead of creating orders
  locally.
- `composables/fireux/kitchen/order/funnel/shared/useFunnel`: state seam
  between `MenuDetailFood` and the funnel. It owns selected public choice,
  basket visibility, local draft persistence, and submit.
- `funnel/shared`: common steps/seams such as basket, allergen notice,
  customer autofill, and late notes.
- `funnel/Delivery`: delivery-only steps such as `useDeliveryZone-3` and
  `useFulfilment`.
- `funnel/Collection`: collection-only timing/rendezvous with the kitchen.
- `server/api/menus/[menuId]/orders.post.ts`: canonical public menu order
  creation route for now. It writes `KitchenOrder` records under
  `apps/<appId>/kitchens/<kitchenId>/orders`.
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

Bären delivery policy reference:
- Their current provider uses coloured delivery areas with different minimum
  orders and fees.
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
- Should order creation enforce `notice_hours` immediately, or only after the requested-time UI exists?
- Should selected ordering mode config be copied onto the created Order for audit history?
- Where exactly should daily fulfilment availability live when delivery pauses, deposits, and table reservations become real?
