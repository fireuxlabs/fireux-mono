import { createError } from 'h3'
import type {
  KitchenOrderCustomer,
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../../models/kitchen/order.model.ts'

const orderTypes = new Set<KitchenOrderType>([
  'dine_in',
  'eat_in',
  'takeaway',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
])

export const text = (value: unknown) => String(value ?? '').trim()

export const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

export const money = (value: number, currencyCode: string) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currencyCode,
  }).format(value)

export const orderId = () => {
  const now = Date.now()
  const rand = Math.random().toString(16).slice(2)
  return `order-${now}-${rand}`
}

export const orderNumber = () => {
  const now = new Date()
  const y = String(now.getFullYear()).slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${y}${m}${d}-${hh}${mm}`
}

export const normalizeOrderType = (
  value: unknown,
  allowedModes: KitchenOrderType[]
): KitchenOrderType => {
  const requested = text(value) as KitchenOrderType
  if (orderTypes.has(requested) && allowedModes.includes(requested)) {
    return requested
  }

  return allowedModes[0] || 'dine_in'
}

export const normalizePaymentMethod = (
  value: unknown,
  allowedMethods: KitchenOrderPaymentMethod[]
): KitchenOrderPaymentMethod | undefined => {
  if (!allowedMethods.length) return undefined

  const requested = text(value) as KitchenOrderPaymentMethod
  if (!requested) return undefined
  if (allowedMethods.includes(requested)) return requested

  throw createError({
    statusCode: 400,
    statusMessage: 'Choose a valid payment method.',
  })
}

export const statusForOrderType = (
  orderType: KitchenOrderType,
  paymentRequired = false
) =>
  paymentRequired
    ? 'pending_payment'
    : orderType === 'delivery' || orderType === 'collection' || orderType === 'pre_order'
      ? 'pending_acceptance'
      : 'open'

export const readCustomer = (value: unknown): KitchenOrderCustomer => {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const customer = {
    name: text(source.name),
    email: text(source.email),
    phone: text(source.phone),
    address: text(source.address),
    address_place_id: text(source.address_place_id),
    allergy_note: text(source.allergy_note),
    notes: text(source.notes),
    party_size: numberValue(source.party_size),
  }

  return Object.fromEntries(
    Object.entries(customer).filter(([, entry]) => entry)
  ) as KitchenOrderCustomer
}

export const readCollection = (
  value: unknown,
  orderType: KitchenOrderType
) => {
  if (orderType !== 'collection') return null

  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const mode = text(source.mode)
  const requestedFor = text(source.requested_for)

  if (mode === 'scheduled') {
    if (!requestedFor) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Choose a collection time.',
      })
    }

    return {
      mode: 'scheduled' as const,
      requested_for: requestedFor,
    }
  }

  if (requestedFor) {
    return {
      mode: 'scheduled' as const,
      requested_for: requestedFor,
    }
  }

  return {
    mode: 'queue' as const,
  }
}
