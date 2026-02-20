import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { Order, type OrderChannel, type OrderLine, type OrderServiceMode, type OrderStatus } from '../models/order.model'

const ORDERS_COLLECTION = 'orders'

const makeOrderId = () => {
  const now = Date.now()
  const random = Math.random().toString(16).slice(2, 10)
  return `order-${now}-${random}`
}

type CreateOrderInput = {
  kitchen_id: string
  place_id?: string
  channel?: OrderChannel
  status?: OrderStatus
  service?: {
    mode?: OrderServiceMode
    table_label?: string
    notes?: string
  }
  customer?: {
    name?: string
    phone?: string
  }
  lines: OrderLine[]
}

const normalizeLine = (line: OrderLine): OrderLine => {
  const qty = Math.max(1, Math.floor(Number(line.qty || 1)))
  const priceMinor = Math.max(0, Math.round(Number(line.price_minor || 0)))

  return {
    dish_id: String(line.dish_id || '').trim(),
    label: String(line.label || '').trim(),
    price_minor: priceMinor,
    currency_code: String(line.currency_code || 'CHF').trim().toUpperCase() || 'CHF',
    qty,
  }
}

export function useOrderCreate() {
  const { setDocument } = useFirestoreCreate()

  const createOrder = async (input: CreateOrderInput) => {
    const kitchenId = String(input.kitchen_id || '').trim()
    if (!kitchenId) {
      throw new Error('Missing kitchen_id')
    }

    const lines = (input.lines || [])
      .map(normalizeLine)
      .filter((line) => Boolean(line.dish_id) && Boolean(line.label) && line.qty > 0)

    if (!lines.length) {
      throw new Error('Order requires at least one line')
    }

    const subtotalMinor = lines.reduce(
      (sum, line) => sum + Number(line.price_minor || 0) * Number(line.qty || 0),
      0
    )

    const currencyCode = String(lines[0]?.currency_code || 'CHF').trim().toUpperCase() || 'CHF'

    const orderId = makeOrderId()
    const payload = {
      ...Order,
      id: orderId,
      kitchen_id: kitchenId,
      place_id: String(input.place_id || '').trim(),
      status: input.status || 'submitted',
      channel: input.channel || 'menu',
      service: {
        mode: input.service?.mode || 'dine_in',
        table_label: String(input.service?.table_label || '').trim(),
        notes: String(input.service?.notes || '').trim(),
      },
      customer: {
        name: String(input.customer?.name || '').trim(),
        phone: String(input.customer?.phone || '').trim(),
      },
      lines,
      totals: {
        subtotal_minor: subtotalMinor,
        currency_code: currencyCode,
      },
    }

    await setDocument(ORDERS_COLLECTION, orderId, payload, {
      app: true,
    })

    return orderId
  }

  return { createOrder }
}
