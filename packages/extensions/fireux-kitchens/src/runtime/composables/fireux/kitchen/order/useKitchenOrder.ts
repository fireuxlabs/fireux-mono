import {
  orderPath,
  useOrderCreate,
  type OrderLine,
  type OrderServiceMode,
} from 'fireux-orders/runtime/composables/fireux/firestore/order/useOrder'
import type { MenuOrderingFunnelState } from '../../../../models/menu/menu-ordering.model'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenOrder() {
  const { createOrder } = useOrderCreate()

  async function createFunnelOrder(order: MenuOrderingFunnelState) {
    const menuId = text(order.menuId)
    if (!menuId) throw new Error('Missing menu id')

    const orderId = await createOrder({
      scope: {
        type: 'menu',
        id: orderScopeId(order),
      },
      status: 'submitted',
      channel: 'menu',
      service: {
        mode: serviceMode(order.orderType),
      },
      lines: orderLines(order.selection.items),
    })

    return {
      id: orderId,
      path: orderPath(orderId),
    }
  }

  return { createFunnelOrder }
}

function orderScopeId(order: MenuOrderingFunnelState) {
  const menuId = text(order.menuId)
  const kitchenSlug = text(order.kitchenSlug)

  return kitchenSlug ? `${kitchenSlug}:${menuId}` : menuId
}

function serviceMode(orderType: string): OrderServiceMode {
  if (orderType === 'delivery' || orderType === 'collection') {
    return orderType
  }

  return 'dine_in'
}

function orderLines(
  items: MenuOrderingFunnelState['selection']['items']
): OrderLine[] {
  return items.map((item) => ({
    dish_id: text(item.id),
    label: text(item.name),
    price_minor: Math.round(Number(item.unitPrice || 0) * 100),
    currency_code: 'CHF',
    qty: Math.max(1, Math.floor(Number(item.quantity || 1))),
  }))
}
