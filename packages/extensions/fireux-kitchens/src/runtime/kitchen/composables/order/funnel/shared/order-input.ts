import type { KitchenOrderCustomer } from '../../../../models/order.model.ts'
import type { MenuOrderingDeliveryState } from '../../../../../menu/models/menu-ordering.model.ts'
import type {
  MenuOrderAddOn,
  MenuOrderDraftItem,
  MenuOrderVariant,
  MenuOrderVariantInput,
} from './types'

export const text = (value: unknown) => String(value ?? '').trim()

export const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export const normalizeVariant = (
  value: unknown
): MenuOrderVariant | undefined => {
  const source = record(value)
  const id = text(source.id)
  const label = text(source.label)
  const price = numberValue(source.price)
  const priceLabel = text(source.priceLabel)
  if (!id && !label) return undefined

  return {
    id,
    label,
    ...(price ? { price } : {}),
    ...(priceLabel ? { priceLabel } : {}),
  }
}

export const normalizeAddOns = (value: unknown): MenuOrderAddOn[] => {
  if (!Array.isArray(value)) return []

  return value
    .map(normalizeVariant)
    .filter((addOn): addOn is MenuOrderAddOn => Boolean(addOn))
}

export const isDraftItem = (value: unknown): value is MenuOrderDraftItem => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const item = value as Partial<MenuOrderDraftItem>
  return Boolean(
    text(item.id) &&
      text(item.name) &&
      text(item.lineId || item.id) &&
      Number(item.quantity) > 0
  )
}

export const cleanVariant = (variant: MenuOrderVariantInput | undefined) => {
  const id = text(variant?.id)
  const label = text(variant?.label)
  const price = numberValue(variant?.price)
  const priceLabel = text(variant?.priceLabel)
  if (!id && !label) return undefined

  return {
    id,
    label,
    ...(price ? { price } : {}),
    ...(priceLabel ? { price_label: priceLabel } : {}),
  }
}

export const cleanAddOns = (addOns: MenuOrderVariantInput[] | undefined) =>
  Array.isArray(addOns)
    ? addOns
        .map(cleanVariant)
        .filter(
          (addOn): addOn is NonNullable<ReturnType<typeof cleanVariant>> =>
            Boolean(addOn)
        )
    : []

export const cleanCustomer = (customer: KitchenOrderCustomer | undefined) => {
  const clean = {
    name: text(customer?.name),
    email: text(customer?.email),
    phone: text(customer?.phone),
    address: text(customer?.address),
    address_place_id: text(customer?.address_place_id),
    allergy_note: text(customer?.allergy_note),
    notes: text(customer?.notes),
    party_size: Math.max(0, Math.floor(numberValue(customer?.party_size))),
  }

  return Object.fromEntries(Object.entries(clean).filter(([, value]) => value))
}

export const customerFromDelivery = (
  delivery: MenuOrderingDeliveryState | undefined
): KitchenOrderCustomer => {
  const address = delivery?.address

  return cleanCustomer({
    address: text(address?.formatted || address?.input),
    address_place_id: text(address?.place_id),
  })
}

export const isTerminalOrderStatus = (status: unknown) =>
  ['completed', 'cancelled', 'trashed'].includes(text(status))
