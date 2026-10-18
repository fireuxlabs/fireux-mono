# Menu and service glossary

Updated: 2026-10-17
Ref: c91260201
Role: map, not canon

Parent: [Menu family](family-menu.md). Related: [Product language](product-language.md).

Use these terms in Menu discovery and Kitchen Services setup. This is a vocabulary
map, not a new storage model. Current source and tests establish behaviour.

## Food and venue

| Term | Meaning |
| --- | --- |
| Place | Physical venue: name, address, branding and facilities. |
| Kitchen | Food operation at a Place; owns dishes, menus, promotions and service settings. |
| Dish | Food or drink with normal prices, variants, options and extras. |
| Menu | Organises dishes and meal deals into sections, or presents an uploaded document. |
| Promotion | Dish offer or meal deal supplying promotional prices. |
| Service | A Misebox-provided way to serve customers, enabled and configured by the operator. |
| Serving times | When a service is available, in the venue's local time. |
| Browse | Explore menus without selecting how to receive food. |
| Surface | Screen presenting existing food and service choices; not a second stored Menu. |

## How food is received

| Term | Meaning |
| --- | --- |
| Eat in | Eat at the venue. |
| Takeaway | Take food away from the venue. |
| Collection | Arrange pickup online; customer wording for the online takeaway journey. |
| Delivery | Receive food at an address. |
| Room service | Receive food in a specified room through a dedicated entrance. |

## How an order is taken

| Term | Meaning |
| --- | --- |
| Bar / counter ordering | Staff take the customer's order at a counter. |
| Table service | A server takes the order for a table. |
| QR table ordering | Customer orders through a link carrying the table number. |
| Kiosk ordering | Customer uses a fixed venue device, choosing Eat in or Takeaway. |
| Online ordering | Customer uses their own device for Collection or Delivery. |
| Staff POS | Operator-facing device/channel; may support several ways of serving food. |

These axes combine: a server can take a takeaway order. A kiosk is a channel,
not a fulfilment method. Do not infer a kiosk or counter service from Eat in alone.

## Timing

| Term | Meaning |
| --- | --- |
| As soon as possible | Next available preparation or fulfilment time. |
| Scheduled order | Select a future collection or delivery time. |
| Pre-order | Choose food in advance, such as before a visit or group event; explain the particular purpose. |

Current setup retains a distinct `pre_order` interaction for advance meal requests.
Collection/Delivery also have scheduling settings. The glossary does not merge
these records or change their behaviour. Pre-order is not another delivery method.

## Source and verification

- Kitchen setup choices: `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/offering-options.ts`.
- Service type labels: `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-order-label.ts`.
- Public directory labels: `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/service-summary.ts`.
- Menu entrances: `packages/extensions/fireux-kitchens/src/runtime/menu/utils/menu-context.ts`.
- Checks: `offering-configuration.test.mjs`, `kitchen-service-summary.test.mjs`,
  `menu-context.test.mjs` under the Kitchen package's `src/test`.

`/menus` presents Collection/Delivery. Place and `/kitchens` present the broader
venue offering. Table, room and kiosk customer entrances carry their own context.
The current setup chooser does not expose every conceptual combination, including
a separate counter-ordering option. Do not claim every glossary entry is configured
or available at every venue. Refresh this map when service vocabulary changes.

Workspace entry: `/workspace/kitchen/services`, separate from Orders.
The Services overview and individual setup reuse the existing records and commands.

Services names the Workspace setup surface. `Offering` remains an internal record
name. Operators use Service consistently; “offering” and “channel” are not
alternative names for that setup. Recipes and Ingredients belong to Prep &
Production; Menus and Services belong to customer-facing menu setup.


A named setup such as **Picnic** can use the Collection service with next-day timing and
its own menus and collection hours. It appears through its named entrance;
creating it does not edit the main Collection or Delivery setup. Its separate
identity, Services row and customer link remain when its collection timing changes. “From tomorrow”
uses the venue’s local calendar, rather than meaning 24 hours from now.
