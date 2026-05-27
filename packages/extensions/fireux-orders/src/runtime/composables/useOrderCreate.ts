import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  Order,
  type OrderChannel,
  type OrderLine,
  type OrderScopeType,
  type OrderServiceMode,
  type OrderStatus,
} from '../models/order.model'

const ORDERS_COLLECTION = 'orders'

const normalizeString = (value: unknown) => String(value ?? '').trim()

const makeOrderId = () => {
  const now = Date.now()
  const random = Math.random().toString(16).slice(2, 10)
  return `order-${now}-${random}`
}

type CreateOrderInput = {
  scope: {
    type: OrderScopeType
    id: string
  }
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
    dish_id: normalizeString(line.dish_id),
    label: normalizeString(line.label),
    price_minor: priceMinor,
    currency_code: normalizeString(line.currency_code || 'CHF').toUpperCase() || 'CHF',
    qty,
  }
}

export function useOrderCreate() {
  const { setDocument } = useFirestoreCreate()

  const createOrder = async (input: CreateOrderInput) => {
    const scopeType = normalizeString(input.scope.type)
    const scopeId = normalizeString(input.scope.id)

    if (!scopeType || !scopeId) {
      throw new Error('Missing order scope')
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

    const currencyCode = normalizeString(lines[0]?.currency_code || 'CHF').toUpperCase() || 'CHF'

    const orderId = makeOrderId()
    const payload = {
      ...Order,
      id: orderId,
      scope_type: scopeType,
      scope_id: scopeId,
      status: input.status || 'submitted',
      channel: input.channel || 'menu',
      service: {
        mode: input.service?.mode || 'dine_in',
        table_label: normalizeString(input.service?.table_label),
        notes: normalizeString(input.service?.notes),
      },
      customer: {
        name: normalizeString(input.customer?.name),
        phone: normalizeString(input.customer?.phone),
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
