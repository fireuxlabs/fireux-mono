// Concurrent edit — 2026-07-19 16:58 CEST — Delivery pass: share canonical basket-to-request projection across order surfaces.
import type { MenuOrderBasketLine } from '../composables/order/useMenuOrderBasket'

export function menuOrderRequestItems(
  lines: MenuOrderBasketLine[],
  sourceMenuId: string
) {
  return lines.map(line => ({
    item_id: line.itemId,
    menu_id: sourceMenuId,
    quantity: line.quantity,
    ...(line.variant
      ? { variant: { id: line.variant.id, label: line.variant.label } }
      : {}),
    ...(line.addOns.length
      ? {
          add_ons: line.addOns.map(addOn => ({
            id: addOn.id,
            label: addOn.label,
          })),
        }
      : {}),
  }))
}
