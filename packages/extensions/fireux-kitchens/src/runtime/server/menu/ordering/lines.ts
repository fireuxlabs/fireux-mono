import { createError } from 'h3'
import type {
  KitchenOrderCustomer,
  KitchenOrderPaymentMethod,
} from '../../../models/kitchen/order.model.ts'

export type MenuOrderVariantInput = {
  id?: string
  label?: string
  price?: number
  priceLabel?: string
}

export type CreateMenuOrderBody = {
  itemId?: string
  quantity?: number
  addOns?: MenuOrderVariantInput[]
  add_ons?: MenuOrderVariantInput[]
  variant?: MenuOrderVariantInput
  items?: Array<{
    itemId?: string
    quantity?: number
    addOns?: MenuOrderVariantInput[]
    add_ons?: MenuOrderVariantInput[]
    variant?: MenuOrderVariantInput
  }>
  order_type?: string
  payment_method?: KitchenOrderPaymentMethod | string
  collection?: {
    mode?: string
    requested_for?: string
  }
  requested_for?: string
  customer?: KitchenOrderCustomer
}

type MenuOption = {
  id?: string
  label: string
  price: number
  priceLabel?: string
}

const text = (value: unknown) => String(value ?? '').trim()
const quantity = (value: unknown) =>
  Math.max(1, Number(value || 1) || 1)
const variantKey = (value: unknown) =>
  text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-')

const readVariant = (value: unknown): MenuOrderVariantInput | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const source = value as Record<string, unknown>
  const id = text(source.id)
  const label = text(source.label)
  const price = Number(source.price)
  const priceLabel = text(source.priceLabel || source.price_label)
  if (!id && !label) return null

  return {
    id,
    label,
    ...(Number.isFinite(price) && price > 0 ? { price } : {}),
    ...(priceLabel ? { priceLabel } : {}),
  }
}

const readAddOns = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map(readVariant)
    .filter((addOn): addOn is MenuOrderVariantInput => Boolean(addOn))

export const readRequestedMenuOrderItems = (
  body: CreateMenuOrderBody | null
) => {
  const items = Array.isArray(body?.items)
    ? body.items
    : [{
        itemId: body?.itemId,
        quantity: body?.quantity,
        addOns: body?.addOns || body?.add_ons,
        variant: body?.variant,
      }]

  return items
    .map((item) => ({
      itemId: text(item.itemId),
      quantity: quantity(item.quantity),
      addOns: readAddOns(item.addOns || item.add_ons),
      variant: readVariant(item.variant),
    }))
    .filter((item) => item.itemId)
}

export const resolveMenuOrderVariant = (
  options: MenuOption[],
  requested: MenuOrderVariantInput | null
) => {
  if (!options.length) {
    return requested?.label
      ? {
          id: requested.id,
          label: requested.label,
          price: Number(requested.price || 0) || 0,
          priceLabel: requested.priceLabel,
        }
      : null
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
  options: MenuOption[],
  requested: MenuOrderVariantInput[]
) => {
  if (!requested.length) return []
  if (!options.length) {
    return requested
      .filter((addOn) => text(addOn.label))
      .map((addOn) => ({
        id: text(addOn.id) || variantKey(addOn.label),
        label: text(addOn.label),
        price: Number(addOn.price || 0) || 0,
      }))
  }

  return requested.map((requestedAddOn) => {
    const requestedKeys = [
      variantKey(requestedAddOn.id),
      variantKey(requestedAddOn.label),
    ].filter(Boolean)
    const match = options.find((option) =>
      [
        variantKey(option.id),
        variantKey(option.label),
      ].filter(Boolean).some((key) => requestedKeys.includes(key))
    )
    if (!match) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Selected item add-on is not available.',
      })
    }

    return match
  })
}
