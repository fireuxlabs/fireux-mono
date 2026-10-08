import type {
  KitchenSellable,
  SellableFulfilment,
  SellableForm,
} from '../models/sellable.model'
import type { KitchenOrderType } from '../models/order-lifecycle.model'

const fail = (): never => {
  throw new Error('Invalid sellable commercial terms.')
}
const object = (v: unknown): Record<string, any> =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, any>)
    : fail()
const id = (v: unknown) =>
  typeof v === 'string' && /^[A-Za-z0-9_-]{1,160}$/.test(v)
const money = (v: unknown) =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0
const modes = ['on_premise', 'collection', 'delivery', 'room']

export function readSellableForm(value: unknown): SellableForm {
  const raw = object(value)
  if (
    Object.keys(raw).some(
      (key) => !['volume', 'container', 'source'].includes(key)
    )
  )
    fail()
  const form: SellableForm = {}
  if (raw.volume !== undefined) {
    const volume = object(raw.volume)
    if (
      Object.keys(volume).some((key) => !['value', 'unit'].includes(key)) ||
      !money(volume.value) ||
      volume.value <= 0 ||
      !['ml', 'l'].includes(volume.unit)
    )
      fail()
    form.volume = { value: volume.value, unit: volume.unit }
  }
  for (const key of ['container', 'source'] as const) {
    if (raw[key] === undefined) continue
    if (
      typeof raw[key] !== 'string' ||
      !raw[key].trim() ||
      raw[key].length > 80
    )
      fail()
    form[key] = raw[key].trim()
  }
  return form
}

export function readKitchenSellable(value: unknown): KitchenSellable {
  const v = object(value),
    terms = object(v.terms)
  if (
    Object.keys(terms).some(
      (key) => !['currency', 'prices', 'add_ons', 'fulfilment'].includes(key)
    )
  )
    fail()
  if (
    typeof v.dish_id !== 'string' ||
    !v.dish_id ||
    v.dish_id.includes('/') ||
    ['.', '..'].includes(v.dish_id) ||
    !Number.isSafeInteger(v.revision) ||
    v.revision < 1 ||
    !['active', 'archived'].includes(v.status) ||
    !Array.isArray(v.variants) ||
    !v.variants.length ||
    v.variants.length > 100 ||
    !/^[A-Z]{3}$/.test(terms.currency)
  )
    fail()
  const variants = v.variants.map((raw: unknown) => {
    const row = object(raw)
    if (
      !id(row.id) ||
      typeof row.label !== 'string' ||
      !row.label.trim() ||
      row.label.length > 240 ||
      !money(row.quantity) ||
      typeof row.unit !== 'string' ||
      row.unit.length > 40
    )
      fail()
    if (row.implicit !== undefined && typeof row.implicit !== 'boolean') fail()
    return {
      id: row.id as string,
      label: row.label as string,
      quantity: row.quantity as number,
      unit: row.unit as string,
      ...(row.implicit === true ? { implicit: true } : {}),
      ...(row.form !== undefined ? { form: readSellableForm(row.form) } : {}),
    }
  })
  const ids = variants.map((row: { id: string }) => row.id)
  if (
    variants.some((row: { implicit?: boolean }) => row.implicit) &&
    variants.length !== 1
  )
    fail()
  const prices = object(terms.prices)
  if (
    new Set(ids).size !== ids.length ||
    Object.keys(prices).length !== ids.length ||
    ids.some(
      (key: string) => !Object.hasOwn(prices, key) || !money(prices[key])
    )
  )
    fail()
  if (!Array.isArray(terms.add_ons) || terms.add_ons.length > 100) fail()
  const addOns = terms.add_ons.map((raw: unknown) => {
    const row = object(raw)
    if (
      !id(row.id) ||
      typeof row.label !== 'string' ||
      !row.label.trim() ||
      row.label.length > 240 ||
      !money(row.price)
    )
      fail()
    return {
      id: row.id as string,
      label: row.label as string,
      price: row.price as number,
    }
  })
  if (
    new Set(addOns.map((row: { id: string }) => row.id)).size !== addOns.length
  )
    fail()
  const fulfilment =
    terms.fulfilment === undefined ? undefined : object(terms.fulfilment)
  if (
    fulfilment &&
    Object.entries(fulfilment).some(
      ([variantId, allowed]) =>
        !ids.includes(variantId) ||
        !Array.isArray(allowed) ||
        allowed.some((mode: unknown) => !modes.includes(String(mode))) ||
        new Set(allowed).size !== allowed.length
    )
  )
    fail()
  return {
    dish_id: v.dish_id,
    revision: v.revision,
    status: v.status,
    variants,
    terms: {
      currency: terms.currency,
      prices: { ...prices },
      add_ons: addOns,
      ...(fulfilment
        ? {
            fulfilment: Object.fromEntries(
              Object.entries(fulfilment).map(([key, value]) => [
                key,
                [...value],
              ])
            ),
          }
        : {}),
    },
  }
}

/** Temporary translation from existing order types, never from a surface/channel. */
export function sellableFulfilment(type: KitchenOrderType): SellableFulfilment {
  switch (type) {
    case 'dine_in':
    case 'eat_in':
    case 'pre_order':
      return 'on_premise'
    case 'takeaway':
    case 'collection':
      return 'collection'
    case 'delivery':
      return 'delivery'
    case 'room_service':
      return 'room'
  }
}

export function projectSellable(id: string, value: unknown, dishId: string) {
  const sellable = readKitchenSellable(value)
  if (sellable.dish_id !== dishId || sellable.status !== 'active')
    throw new Error('Menu sellable is unavailable or belongs to another Dish.')
  const variants = sellable.variants.map((variant) => ({
    id: variant.id,
    label: variant.label,
    // readKitchenSellable requires a valid price for every variant ID.
    price: sellable.terms.prices[variant.id]!,
    implicit: variant.implicit === true,
  }))
  return {
    sellable_id: id,
    sellable_revision: sellable.revision,
    sellable_currency: sellable.terms.currency,
    sellable_fulfilment: sellable.terms.fulfilment,
    price: Math.min(...Object.values(sellable.terms.prices)),
    sellable_variants: variants,
    priceOptions:
      variants.length === 1 && variants[0]!.implicit ? [] : variants,
    addOns: sellable.terms.add_ons,
  }
}
