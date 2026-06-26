Menu ordering map
Updated: 2026-06-25
Ref: f1e9891ff
Role: map, not canon

Purpose:
Map how food-menu ordering should stay small enough to reason about while still covering future restaurant service patterns.

Vertical links:
- Parent: family-menu.md
- Parent: console.md
- Parent: server-api.md

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
- `Menu/Detail/Ordering/Basket`: selected items and total.
- `Menu/Detail/Ordering/Funnel/Panel`: shared overlay platform shell, close, submit, selected
  order-type policy.
- `Menu/Detail/Ordering/Funnel/Delivery`: delivery zones, payment methods, address/contact.
- `Menu/Detail/Ordering/Funnel/Collection`: payment methods and pickup contact.
- `Menu/Detail/Ordering/Funnel/PreOrder`: notice copy and pre-order contact/request notes.
- Each order type may own its inner funnel, but order submission stays through
  the shared menu order draft/create seam.

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
- Where exactly should fulfilment settings live when delivery zones, deposits, and table reservations become real?
