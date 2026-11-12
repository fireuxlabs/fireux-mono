import { deanosKitchenDemoCompletedOrders } from '../Orders/history'

export type KitchenDemoItemFinance = {
  dishId: string
  quantitySold: number
}

/**
 * Item-level sales quantities projected from the same completed Orders used
 * by Orders and Finance. Unsold Menu dishes stay absent instead of receiving
 * invented presentation figures.
 */
const quantitySoldByItemId = new Map<string, number>()

for (const order of deanosKitchenDemoCompletedOrders) {
  for (const item of order.items) {
    quantitySoldByItemId.set(
      item.dishId,
      (quantitySoldByItemId.get(item.dishId) ?? 0) + item.quantity
    )
  }
}

export const deanosKitchenDemoItemFinance: KitchenDemoItemFinance[] = [
  ...quantitySoldByItemId,
]
  .map(([dishId, quantitySold]) => ({ dishId, quantitySold }))
  .sort((left, right) => left.dishId.localeCompare(right.dishId))
