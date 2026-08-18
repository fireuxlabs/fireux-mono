import { createError } from 'h3'
import type {
  KitchenOrderCustomer,
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../../kitchen/models/order.model.ts'
import { menuOrderTypeStrategiesList } from './order-types/index.ts'

const orderTypes = new Set<KitchenOrderType>(
  menuOrderTypeStrategiesList().map((strategy) => strategy.type)
)

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

  throw createError({
    statusCode: 400,
    statusMessage: 'Choose a valid order type.',
  })
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

const customerText = (
  value: unknown,
  label: string,
  maxLength: number,
  options: { multiline?: boolean } = {}
) => {
  const result = text(value)
  if (!result) return ''

  const invalidControls = options.multiline
    ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/
    : /[\u0000-\u001f\u007f]/
  if (result.length > maxLength || invalidControls.test(result)) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} is not valid.`,
    })
  }

  return result
}

const customerPartySize = (value: unknown) => {
  if (value === undefined || value === null || value === '') return 0

  const result = Number(value)
  if (!Number.isSafeInteger(result) || result < 1 || result > 500) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Party size must be a whole number between 1 and 500.',
    })
  }

  return result
}

export const readCustomer = (value: unknown): KitchenOrderCustomer => {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  const customer = {
    name: customerText(source.name, 'Customer name', 120),
    email: customerText(source.email, 'Customer email', 254),
    phone: customerText(source.phone, 'Customer phone', 64),
    address: customerText(source.address, 'Delivery address', 500, {
      multiline: true,
    }),
    address_place_id: customerText(
      source.address_place_id,
      'Delivery place identifier',
      256
    ),
    allergy_note: customerText(source.allergy_note, 'Allergy note', 2000, {
      multiline: true,
    }),
    notes: customerText(source.notes, 'Customer notes', 2000, {
      multiline: true,
    }),
    party_size: customerPartySize(source.party_size),
  }

  return Object.fromEntries(
    Object.entries(customer).filter(([, entry]) => entry)
  ) as KitchenOrderCustomer
}
