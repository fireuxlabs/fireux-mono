import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  Order,
  OrderStorage,
  type OrderChannel,
  type OrderLine,
  type OrderScopeType,
  type OrderServiceMode,
  type OrderStatus,
} from '../../../../../models/order.model'

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

const clean = (value: unknown) => String(value ?? '').trim()

export function useOrderCreate() {
  const { setDocument } = useFirestoreCreate()

  async function createOrder(input: CreateOrderInput) {
    const scopeType = clean(input.scope.type)
    const scopeId = clean(input.scope.id)
    const lines = (input.lines || [])
      .map(normalizeLine)
      .filter((line) => line.dish_id && line.label && line.qty > 0)

    if (!scopeType || !scopeId) throw new Error('Missing order scope')
    if (!lines.length) throw new Error('Order requires at least one line')

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
        table_label: clean(input.service?.table_label),
        notes: clean(input.service?.notes),
      },
      customer: {
        name: clean(input.customer?.name),
        phone: clean(input.customer?.phone),
      },
      lines,
      totals: {
        subtotal_minor: subtotalMinor(lines),
        currency_code: clean(lines[0]?.currency_code || 'CHF').toUpperCase() || 'CHF',
      },
    }

    await setDocument(OrderStorage.collection, orderId, payload, { app: true })
    return orderId
  }

  return { createOrder }
}

function makeOrderId() {
  return `order-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

function normalizeLine(line: OrderLine): OrderLine {
  return {
    dish_id: clean(line.dish_id),
    label: clean(line.label),
    price_minor: Math.max(0, Math.round(Number(line.price_minor || 0))),
    currency_code: clean(line.currency_code || 'CHF').toUpperCase() || 'CHF',
    qty: Math.max(1, Math.floor(Number(line.qty || 1))),
  }
}

function subtotalMinor(lines: OrderLine[]) {
  return lines.reduce(
    (sum, line) =>
      sum + Number(line.price_minor || 0) * Number(line.qty || 0),
    0
  )
}
