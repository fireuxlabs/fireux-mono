# Menu and service glossary

Updated: 2026-11-22
Ref: eb57620fa
Role: Kitchen terminology

Parent: [Menu family](../../../../docs/concepts/family-menu.md). Related: [Product language](../../../../docs/concepts/product-language.md).

Use these terms in Menu discovery and Kitchen Services setup. Channel examples
describe business options. Check the current
[Menu and Orders boundary](../../../../docs/concepts/menu-ordering.md)
for available customer and staff surfaces.

## Food and venue

| Term      | Meaning                                                                               |
| --------- | ------------------------------------------------------------------------------------- |
| Place     | Physical venue: name, address, branding and facilities.                               |
| Kitchen   | Food operation at a Place; owns dishes, menus, promotions and service settings.       |
| Item      | The Kitchen-owned record for a dish or drink. The operator catalogue is called Items. |
| Menu      | Organises dishes and meal deals into sections, or presents an uploaded document.      |
| Promotion | A discount or meal deal supplying promotional prices.                                 |
| Browse    | Explore menus without selecting how to receive food.                                  |
| Surface   | A screen that presents existing food and service choices.                             |

Use **dish** or **drink** in customer copy when it describes the food. In source
and architecture docs, use **Item** for the Kitchen-owned record. The collection
is `dishes` and the route parameter is `dishId`. A **Menu placement**
references an Item in a Menu section. **Item selling terms** describe price and
choice groups. The source calls that shape `ItemOffer`.

## Kitchen Services

| Term          | Meaning                                                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Services      | The Kitchen Workspace capability for configuring how and when customers can order across Menus.                                   |
| Service       | A way to serve customers that the operator can enable and configure, such as Collection or Delivery.                              |
| Service setup | An operator's configuration for a service, optionally presented under a name such as Picnic.                                      |
| `Offering`    | The internal name for a saved Kitchen-owned service setup. It carries availability, linked Menus, serving hours and interactions. |
| Interaction   | A saved rule for browsing or ordering within an Offering. A mixed setup can share menus and hours across several interactions.    |
| Serving times | When a service is available in the venue's local time.                                                                            |

Picnic is a named Collection setup with its own menus, collection hours and
next-day timing. Its saved identity and customer link survive changes to that
timing. “From tomorrow” uses the venue's local calendar. The Services chooser
currently creates one setup per type/channel.
See the [Services Workspace boundary](../../../../docs/concepts/family-menu.md#services-workspace-boundary)
for ownership and current navigation.

## How food is received

| Term         | Meaning                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| Eat in       | Eat at the venue.                                                        |
| Takeaway     | Take food away from the venue.                                           |
| Collection   | Arrange pickup online; customer wording for the online takeaway journey. |
| Delivery     | Receive food at an address.                                              |
| Room service | Receive food in a specified room through a dedicated entrance.           |

## How an order is taken

| Term                   | Meaning                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| Bar / counter ordering | Staff take the customer's order at a counter.                             |
| Table service          | A server takes the order for a table.                                     |
| QR table ordering      | Customer orders through a link carrying the table number.                 |
| Kiosk ordering         | Customer uses a fixed venue device, choosing Eat in or Takeaway.          |
| Online ordering        | Customer uses their own device for Collection or Delivery.                |
| Staff POS              | Operator-facing device/channel; may support several ways of serving food. |

A **channel** describes how an order is taken. **Fulfilment** describes how the
customer receives it. A server can take a takeaway order. A kiosk can support
both Eat in and Takeaway.

## Timing

Serving windows nest: **Place → Kitchen → Service → Menu**. Kitchen hours
follow Place opening hours or fit within them. Each service follows Kitchen
hours or uses a narrower window. A regular interactive Menu is available
throughout its linked services unless its own times narrow that availability.
A reused Menu keeps its own schedule; each service limits it separately.
Changes to a parent window constrain effective availability without rewriting
the saved child schedules. Workspace editors flag conflicting saved times.

| Term                | Meaning                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| As soon as possible | Next available preparation or fulfilment time.                                                 |
| Scheduled order     | Select a future collection or delivery time.                                                   |
| Pre-order           | Choose food in advance, such as before a visit or group event; explain the particular purpose. |

Current setup retains a distinct `pre_order` interaction for advance meal requests.
Collection/Delivery also have scheduling settings. The glossary does not merge
these records or change their behaviour. Pre-order is not another delivery method.

## Source and verification

- Kitchen setup choices in [`offering-options.ts`](../src/runtime/kitchen/utils/offering-options.ts) and the saved [`KitchenOffering` contract](../src/runtime/kitchen/utils/offering-policy.ts).
- The [Item model](../src/runtime/kitchen/models/item.model.ts) owns identity and selling terms.
- Service type labels: `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-order-label.ts`.
- Public directory labels: `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/service-summary.ts`.
- Menu entrances: `packages/extensions/fireux-kitchens/src/runtime/menu/utils/navigation/context.ts`.
- Checks: `offering-configuration.test.mjs`, `kitchen-service-summary.test.mjs`,
  `menu-context.test.mjs` under the Kitchen package's `src/test`.

`/menus` presents Collection/Delivery. Place and `/kitchens` present the broader
venue offering. Table, room and kiosk customer entrances carry their own context.
The current setup chooser does not expose every conceptual combination, including
a separate counter-ordering option. Do not claim every glossary entry is configured
or available at every venue. Refresh this map when service vocabulary changes.

Services use one setup pattern: switch Off or On; On reveals inline configuration.
Changes persist automatically through the existing service commands. Off retains
configuration. Enabled and ready for customers are distinct: public availability
still requires eligible published menus and serving hours. Room service has its
own setup and contextual entrance; it is not part of the public service selector.
