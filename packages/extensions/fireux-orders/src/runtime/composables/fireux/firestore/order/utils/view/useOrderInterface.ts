import type { Order } from '../../../../../../models/order.model'

export namespace OrderCard {
  export type Card = {
    id: string
    title: string
    subtitle: string
    status: string
    scope: string
    total: string
  }
}

const clean = (value: unknown) => String(value ?? '').trim()

export function useOrderInterface() {
  function card(order: Partial<Order>): OrderCard.Card {
    const id = clean(order.id)
    const scope = [order.scope_type, order.scope_id].map(clean).filter(Boolean).join(':')
    const currency = clean(order.totals?.currency_code || 'CHF')
    const subtotal = Number(order.totals?.subtotal_minor || 0) / 100

    return {
      id,
      title: id || 'Order',
      subtitle: clean(order.service?.mode) || clean(order.channel) || 'order',
      status: clean(order.status),
      scope,
      total: `${currency} ${subtotal.toFixed(2)}`,
    }
  }

  return { card }
}
