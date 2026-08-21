import { deanosKitchenDemoCompletedOrders } from '../Orders/history'

export type KitchenDemoDishFinance = {
  dishId: string
  quantitySold: number
}

/**
 * Dish-level sales quantities projected from the same completed Orders used
 * by Orders and Finance. Unsold Menu dishes stay absent instead of receiving
 * invented presentation figures.
 */
const quantitySoldByDishId = new Map<string, number>()

for (const order of deanosKitchenDemoCompletedOrders) {
  for (const item of order.items) {
    quantitySoldByDishId.set(
      item.dishId,
      (quantitySoldByDishId.get(item.dishId) ?? 0) + item.quantity
    )
  }
}

export const deanosKitchenDemoDishFinance: KitchenDemoDishFinance[] = [
  ...quantitySoldByDishId,
]
  .map(([dishId, quantitySold]) => ({ dishId, quantitySold }))
  .sort((left, right) => left.dishId.localeCompare(right.dishId))
