Menu ordering map
Updated: 2026-06-24
Ref: d3492e130
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
  modes: [
    {
      type: 'pre_order',
      service_mode: 'dine_in',
      notice_hours: 24
    }
  ]
}
```

Efficient matrix:
- `type`: the customer order promise.
- `service_mode`: how the kitchen treats or fulfils that promise.
- Optional policy fields: constraints on that mode, only added when needed.

Why this is efficient:
- It avoids a giant enum for every combination.
- It keeps browse/order UI separate from operational order types.
- It lets Bären, La Tap, Luna, and future kitchens share one shape.
- It lets the order system grow by adding small policy fields, not new one-off surfaces.

Current examples:
- Luna: no `ordering`, so the menu is browse-only.
- Bären: `public_views: ['order']`, `ordering.modes: [{ type: 'delivery' }, { type: 'collection' }]`.
- La Tap: `public_views: ['browse', 'order']`, `ordering.modes: [{ type: 'pre_order', service_mode: 'dine_in', notice_hours: 24 }]`.

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

Naming notes:
- Prefer `collection` when the order is collected by the customer.
- Prefer `delivery` when the order travels to the customer.
- Prefer `pre_order` when lead time matters more than handoff.
- Avoid storing `service_modes` as a separate top-level list unless a future proven need appears.

Guardrails:
- Do not add a new mode just because one restaurant words the service differently.
- Do not put delivery fees, deposits, or opening hours on Menu until the ordering/fulfilment layer needs them.
- Do not make public menu rendering infer business rules from kitchen type or tenant app id.
- Keep the Menu component boring: it receives the resolved menu behaviour and renders available views.

Open questions:
- Should order creation enforce `notice_hours` immediately, or only after the requested-time UI exists?
- Should selected ordering mode config be copied onto the created Order for audit history?
- Where exactly should fulfilment settings live when delivery zones, deposits, and table reservations become real?
