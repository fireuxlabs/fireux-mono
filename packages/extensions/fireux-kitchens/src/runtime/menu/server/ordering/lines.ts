import { createError } from 'h3'
import type {
  KitchenOrderChannel,
  KitchenOrderCustomer,
  KitchenOrderPaymentMethod,
} from '../../../kitchen/utils/order.ts'

export type MenuOrderVariantInput = {
  id?: string
  label?: string
  price?: number
  price_label?: string
}

export type CreateMenuOrderBody = {
  idempotency_key?: string
  channel?: KitchenOrderChannel | string
  items?: Array<{
    item_id?: string
    menu_id?: string
    quantity?: number
    add_ons?: MenuOrderVariantInput[]
    variant?: MenuOrderVariantInput
  }>
  kitchen_service_id?: unknown
  order_type?: string
  payment_method?: KitchenOrderPaymentMethod | string
  collection?: {
    mode?: string
    requested_for?: string
  }
  requested_for?: string
  customer?: KitchenOrderCustomer
  table?: {
    number?: unknown
  }
  room_service?: {
    room?: unknown
  }
}

export type RequestedMenuOrderItem = {
  itemId: string
  menuId: string
  quantity: number
  addOns: MenuOrderVariantInput[]
  variant: MenuOrderVariantInput | null
}

export type MenuOrderOption = {
  id?: string
  label: string
  price: number
  priceLabel?: string
}

const text = (value: unknown) => String(value ?? '').trim()
const quantity = (value: unknown) => {
  if (value === undefined || value === null || value === '') return 1

  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 99) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Item quantity must be a whole number between 1 and 99.',
    })
  }

  return parsed
}
const variantKey = (value: unknown) =>
  text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')

const readVariant = (value: unknown): MenuOrderVariantInput | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const source = value as Record<string, unknown>
  const id = text(source.id)
  const label = text(source.label)
  const price = Number(source.price)
  const priceLabel = text(source.price_label)
  if (!id && !label) return null

  return {
    id,
    label,
    ...(Number.isFinite(price) && price > 0 ? { price } : {}),
    ...(priceLabel ? { price_label: priceLabel } : {}),
  }
}

const readAddOns = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map(readVariant)
    .filter((addOn): addOn is MenuOrderVariantInput => Boolean(addOn))

export const readRequestedMenuOrderItems = (
  body: CreateMenuOrderBody | null
): RequestedMenuOrderItem[] => {
  const items = Array.isArray(body?.items) ? body.items : []

  return items
    .map((item) => ({
      itemId: text(item.item_id),
      menuId: text(item.menu_id),
      quantity: quantity(item.quantity),
      addOns: readAddOns(item.add_ons),
      variant: readVariant(item.variant),
    }))
    .filter((item) => item.itemId)
}

export const resolveMenuOrderVariant = (
  options: MenuOrderOption[],
  requested: MenuOrderVariantInput | null
) => {
  if (!options.length) {
    if (!requested) return null

    throw createError({
      statusCode: 400,
      statusMessage: 'Selected item variant is not available.',
    })
  }
  if (!requested && options.length === 1) return options[0]
  if (!requested) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose an item variant.',
    })
  }

  const requestedKeys = [
    variantKey(requested.id),
    variantKey(requested.label),
  ].filter(Boolean)
  const match = options.find((option, optionIndex) => {
    const optionKeys = [
      variantKey(option.id),
      variantKey(option.label),
      `option-${optionIndex + 1}`,
    ].filter(Boolean)

    return optionKeys.some((key) => requestedKeys.includes(key))
  })
  if (!match) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Selected item variant is not available.',
    })
  }

  return match
}

export const resolveMenuOrderAddOns = (
  options: MenuOrderOption[],
  requested: MenuOrderVariantInput[]
) => {
  if (!requested.length) return []
  if (!options.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Selected item add-on is not available.',
    })
  }

  const resolved = requested.map((requestedAddOn) => {
    const requestedKeys = [
      variantKey(requestedAddOn.id),
      variantKey(requestedAddOn.label),
    ].filter(Boolean)
    const match = options.find((option) =>
      [variantKey(option.id), variantKey(option.label)]
        .filter(Boolean)
        .some((key) => requestedKeys.includes(key))
    )
    if (!match) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Selected item add-on is not available.',
      })
    }

    return match
  })
  const resolvedKeys = resolved.map(
    (addOn) => variantKey(addOn.id) || variantKey(addOn.label)
  )
  if (new Set(resolvedKeys).size !== resolvedKeys.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose each item add-on only once.',
    })
  }

  return resolved
}
