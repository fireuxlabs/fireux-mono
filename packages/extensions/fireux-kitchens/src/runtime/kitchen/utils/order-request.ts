import type { KitchenOrder } from '../models/order.model'
import type { OrderRequest } from '../models/order-request.model'

/** Existing Kitchen quantities count individual items (UN/ECE unit C62). */
export function toOrderRequest(order: KitchenOrder): OrderRequest {
  return {
    id: order.id,
    number: String(order.service_number || order.order_number || order.id),
    lines: order.items.map(({ id, label, quantity }) => ({
      id,
      item: { name: label },
      quantity,
      unit_code: 'C62',
    })),
  }
}
