# Menu and Ordering boundary

Updated: 2026-10-14
Role: map, not canon

## Purpose

Map readable Menu content separately from the Ordering capability. Inherit
AGENTS.md, docs/ai/gpt-context.md and the Misebox scoped context; source and checks
establish behaviour.

## Current boundary

Menu browsing, publication and Offering/Fulfilment configuration retain their
existing owners. `menu/server/offerings/projection.ts` retains the older policy
projection without re-enabling its retired execution stack. Published structured
Menu cards expose Collection, Delivery and Table ordering only when the App
declares Website support and the Kitchen grants that service for the Menu. `menu/components/Order.vue` reuses the canonical Menu
payload for actual items and choices; `menu/server/ordering.ts` owns transactional
resolution of their current publication, availability, names and prices. The thin
Menu-submit adapter passes the resolved owner to Kitchen's submission command.
Table is now an order projection, alongside Collection and Delivery. The retired
kiosk session flow remains unavailable.

The current small entrance requires a configured Offering schedule but does not
yet evaluate current opening-time/slot availability or infer delivery-zone fees. Payment, dispatch and physical handoff are separate responsibilities. The
customer reads only its own submission response; operator actions retain current
Kitchen authority. Workspace draft persistence remains separate from submission.

The new Order model and ticket live with Kitchen's first local Ordering consumer.
See `order-processing-kitchen-fulfilment.md` and the named source files there.
Misebox's public runtime configuration declares the draft channel vocabulary;
`kitchen/utils/ordering.ts` validates it when constructing an empty draft.

## Public venue and menu surfaces

The Kitchen home at `/kitchens/{slug}` presents venue information through
KitchenDetail/PlaceDetail and links to Menus and ordering. It does not load the
Menu directory or delivery-area reader. Venue opening hours stay with PlaceDetail;
serving times and delivery information belong to menus and ordering.
`/kitchens/{slug}/menus` reuses MenuIndex for the published
menu cards, service times and ordering entrances, plus the shared delivery-area
disclosure, with one return link to venue information;
it does not repeat the venue header, contact, gallery or opening-hours panels.
The directory destination remains unchanged. This split does not establish a
permanent acquisition or eating-journey entrance policy.

## Verification and maintenance

Keep Menu browse/publication checks separate from Ordering behaviour
checks. Update this map when a complete ordering slice returns; do not restore
retired interfaces merely to satisfy a previous test or source pointer.

Public Website service buttons and the Menu order command derive supported
collection, delivery and table ordering from enabled Kitchen offerings linked to
the Menu, with a valid configured schedule and an enabled, unpaused interaction.
Table ordering also requires the table QR channel. The App Website channel alone
does not grant these services. `menu/utils/menu-ordering.ts` owns the shared
projection; the command re-reads offerings within the order transaction. This
checks configured services, not current opening-time/slot availability.
Published Menu status controls the public catalogue; menu names such as Food,
Drinks, Breakfast or Kids do not grant ordering services.
