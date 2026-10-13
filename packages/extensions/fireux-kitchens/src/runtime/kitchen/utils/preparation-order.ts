import type { KitchenOrder } from '../models/order.model'
import { toOrderRequest } from './order-request'
import type { KitchenPreparationOrder } from '../models/preparation-order.model'

/** The only bridge from the parked commerce contract into preparation tickets. */
export function toKitchenPreparationOrder(
  order: KitchenOrder
): KitchenPreparationOrder | null {
  if (order.status !== 'accepted' && order.status !== 'ready') return null
  return {
    ...toOrderRequest(order),
    state: order.status === 'ready' ? 'ready' : 'preparing',
  }
}
