import {
  isItemPrice,
  normalizeItemChoiceGroups,
  readItemChoiceGroups,
} from './item-choices'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import type { Item } from '../models/item.model'

/** Historical storage/read shapes, not the canonical Item model. */
export type ItemPriceOption = {
  label: string
  quantity: number
  unit: string
  price: number
}
export type ItemAddOnOption = { id: string; label: string; price: number }
type ItemSellingTerms = Pick<Item, 'price' | 'choice_groups' | 'currency_code'>

export type ItemPricing = ItemSellingTerms & {
  price_options: ItemPriceOption[]
  add_ons: ItemAddOnOption[]
}
const text = (value: unknown) => String(value ?? '').trim()
const number = (value: unknown) =>
  Number.isFinite(Number(value)) ? Number(value) : 0
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
export function normalizeItemPriceOptions(value: unknown): ItemPriceOption[] {
  if (!Array.isArray(value)) return []
  return value
    .map((raw) => {
      const data = record(raw)
      const label = text(data.label)
      const match = label.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-ZäöüÄÖÜ]+)?/)
      const quantity =
        number(data.quantity) ||
        (match ? number(match[1]?.replace(',', '.')) : 0)
      const unit = text(data.unit) || text(match?.[2])
      return {
        label: label || [quantity || '', unit].filter(Boolean).join(' '),
        quantity,
        unit,
        price: number(data.price),
      }
    })
    .filter((option) => option.label && option.price > 0)
}
export function normalizeItemAddOns(value: unknown): ItemAddOnOption[] {
  if (!Array.isArray(value)) return []
  return value
    .map((raw, index) => {
      const data = record(raw)
      const label = text(data.label)
      const rawPrice =
        data.price === null ||
        data.price === undefined ||
        text(data.price) === ''
          ? -1
          : number(data.price)
      return {
        id:
          text(data.id) ||
          label.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
          `add-on-${index + 1}`,
        label,
        price: rawPrice,
      }
    })
    .filter((option) => option.id && option.label && option.price >= 0)
}

const validOption = (
  value: unknown,
  keys: string[]
): value is Record<string, unknown> =>
  Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).every((key) => keys.includes(key)) &&
      typeof (value as Record<string, unknown>).label === 'string' &&
      ((value as Record<string, unknown>).label as string).trim()
  )
const unique = (values: string[]) => new Set(values).size === values.length
const optionKey = (value: unknown) => normalizeSlug(value)

export function normalizeItemPricingPatch(
  input: unknown
): Partial<ItemPricing> {
  const patch = input as Partial<ItemPricing>
  const allowed = new Set([
    'price',
    'price_options',
    'add_ons',
    'choice_groups',
  ])
  if (
    !patch ||
    typeof patch !== 'object' ||
    Array.isArray(patch) ||
    !Object.keys(patch).length ||
    Object.keys(patch).some((key) => !allowed.has(key))
  ) {
    throw new Error('Unsupported Item pricing change.')
  }
  if (
    'price' in patch &&
    (typeof patch.price !== 'number' ||
      !Number.isFinite(patch.price) ||
      patch.price < 0)
  )
    throw new Error('Price must be a non-negative number.')
  const normalized = { ...patch }
  if (Object.hasOwn(patch, 'choice_groups')) {
    normalized.choice_groups = normalizeItemChoiceGroups(patch.choice_groups)
    const full = normalized.choice_groups.find(
      (group) => group.pricing === 'full'
    )
    if (full)
      normalized.price = Math.min(...full.options.map((option) => option.price))
  }

  if (Object.hasOwn(patch, 'price_options')) {
    if (!Array.isArray(patch.price_options))
      throw new Error('Variants must be a list.')
    const input = patch.price_options
    if (
      input.some(
        (option) =>
          !validOption(option, ['label', 'quantity', 'unit', 'price']) ||
          typeof option.price !== 'number' ||
          !Number.isFinite(option.price) ||
          option.price <= 0 ||
          ('quantity' in option &&
            (typeof option.quantity !== 'number' ||
              !Number.isFinite(option.quantity) ||
              option.quantity < 0)) ||
          ('unit' in option && typeof option.unit !== 'string')
      )
    )
      throw new Error(
        'Variants require valid numeric quantities and full prices greater than zero.'
      )
    const options = normalizeItemPriceOptions(input)
    if (
      options.length !== input.length ||
      !unique(options.map((option) => optionKey(option.label)))
    ) {
      throw new Error(
        'Variants require unique labels and full prices greater than zero.'
      )
    }
    normalized.price_options = options
  }

  if (Object.hasOwn(patch, 'add_ons')) {
    if (!Array.isArray(patch.add_ons))
      throw new Error('Add-ons must be a list.')
    const input = patch.add_ons
    if (
      input.some(
        (option) =>
          !validOption(option, ['id', 'label', 'price']) ||
          typeof option.price !== 'number' ||
          !Number.isFinite(option.price) ||
          option.price < 0 ||
          ('id' in option && typeof option.id !== 'string')
      )
    )
      throw new Error(
        'Add-ons require a label and a valid non-negative numeric price.'
      )
    const addOns = normalizeItemAddOns(input)
    if (
      addOns.length !== input.length ||
      !unique(addOns.map((addOn) => optionKey(addOn.id))) ||
      !unique(addOns.map((addOn) => optionKey(addOn.label)))
    ) {
      throw new Error(
        'Add-ons require unique labels and identifiers and a non-negative price.'
      )
    }
    normalized.add_ons = addOns
  }

  return normalized
}

function readStoredPricing(data: Record<string, unknown>) {
  return normalizeItemPricingPatch({
    ...(Object.hasOwn(data, 'price') ? { price: data.price } : {}),
    ...(Object.hasOwn(data, 'choice_groups')
      ? { choice_groups: data.choice_groups }
      : {}),
    price_options: data.price_options ?? [],
    add_ons: data.add_ons ?? [],
  })
}

/** Price projection for existing Menu and Order consumers. */
export function readItemPricing(
  data: Record<string, unknown>
): ItemPricing & { price: number } {
  const pricing = readStoredPricing(data)
  // Keep the existing publication prerequisite for historical flat variants.
  const price = pricing.price
  if (price === undefined)
    throw new Error(
      'Set the Item normal price before using it on a published Menu.'
    )
  return {
    price_options: [],
    add_ons: [],
    ...pricing,
    price,
  }
}

function currencyCode(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Z]{3}$/.test(value))
    throw new Error('Enter an ISO currency code such as CHF.')
  return value
}

/** Read one Item's terms, projecting historical choices without writing them. */
export function readItemSellingTerms(
  data: Record<string, unknown>
): ItemSellingTerms {
  const pricing = readStoredPricing(data)
  const choice_groups = normalizeItemChoiceGroups(readItemChoiceGroups(pricing))
  const hasFullPrice = choice_groups.some((group) => group.pricing === 'full')
  return {
    ...(!hasFullPrice && pricing.price !== undefined
      ? { price: pricing.price }
      : {}),
    ...(data.currency_code !== undefined
      ? { currency_code: currencyCode(data.currency_code) }
      : {}),
    ...(choice_groups.length ? { choice_groups } : {}),
  }
}

/** Validate the final authored terms before persisting them on the Item. */
export function normalizeItemSellingTerms(
  changes: Record<string, unknown>,
  existing: Record<string, unknown> = {}
): ItemSellingTerms {
  const storedGroups = () => readItemChoiceGroups(existing)
  const choice_groups = Object.hasOwn(changes, 'choice_groups')
    ? normalizeItemChoiceGroups(changes.choice_groups)
    : normalizeItemChoiceGroups(storedGroups())
  const hasFullPrice = choice_groups.some((group) => group.pricing === 'full')
  if (hasFullPrice && changes.price != null)
    throw new Error('Set full prices on the choices only.')
  const rawPrice = hasFullPrice
    ? undefined
    : Object.hasOwn(changes, 'price')
      ? (changes.price ?? undefined)
      : storedGroups().some((group) => group.pricing === 'full')
        ? undefined
        : existing.price
  const price = isItemPrice(rawPrice) ? rawPrice : undefined
  if (rawPrice !== undefined && price === undefined)
    throw new Error(
      'Price must be a non-negative amount with at most two decimals.'
    )
  if (choice_groups.length && !hasFullPrice && price === undefined)
    throw new Error('Set a base price before adding extras.')
  const priced = price !== undefined || hasFullPrice
  const currency = Object.hasOwn(changes, 'currency_code')
    ? changes.currency_code
    : existing.currency_code
  return {
    ...(price !== undefined ? { price } : {}),
    ...(priced ? { currency_code: currencyCode(currency) } : {}),
    choice_groups,
  }
}
