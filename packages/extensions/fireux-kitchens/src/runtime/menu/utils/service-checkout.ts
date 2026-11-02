import type { ServiceBasketLine } from './service-basket'
import type { MenuOrderSelection } from '../models/menu-order-selection.model'
import type { Order } from '../../kitchen/models/order.model'

export type MenuCheckoutService = 'collection' | 'eat_in' | 'takeaway'

export function serviceSelections(
  lines: ServiceBasketLine[]
): MenuOrderSelection[] {
  return lines.map((line) => ({
    menuId: line.source.menuId,
    sectionId: line.source.sectionId,
    itemId: line.itemId,
    ...(line.choices.optionId ? { optionId: line.choices.optionId } : {}),
    extraIds: [...line.choices.extraIds],
    groups: Object.fromEntries(
      Object.entries(line.choices.groups).map(([key, values]) => [
        key,
        [...values],
      ])
    ),
    ...(line.choices.bottle ? { bottle: line.choices.bottle } : {}),
    offeringIds: [...line.offeringIds],
    quantity: line.choices.quantity,
    expectedUnitMinor: line.unitMinor,
  }))
}
export function serviceOrder(
  lines: ServiceBasketLine[],
  id: string,
  name: string,
  phone: string,
  service: MenuCheckoutService = 'collection'
): Order {
  return {
    id,
    number: '',
    channel: service === 'collection' ? 'website' : 'kiosk',
    fulfilment: service === 'eat_in' ? 'on_site' : service,
    ...(service === 'collection'
      ? { customer: { name: name.trim(), phone: phone.trim() } }
      : {}),
    lines: lines.map((line, index) => ({
      id: `line-${index + 1}`,
      item: { id: line.itemId, name: line.name },
      quantity: line.choices.quantity,
      unit_code: 'C62',
    })),
  }
}
