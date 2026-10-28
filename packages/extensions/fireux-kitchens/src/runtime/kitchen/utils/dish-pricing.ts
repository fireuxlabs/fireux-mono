import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import type {
  DishPriceOption,
  DishAddOnOption,
  DishPricing,
} from '../models/dish.model'
const text = (value: unknown) => String(value ?? '').trim()
const number = (value: unknown) =>
  Number.isFinite(Number(value)) ? Number(value) : 0
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
export function normalizeDishPriceOptions(value: unknown): DishPriceOption[] {
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
export function normalizeDishAddOns(value: unknown): DishAddOnOption[] {
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

export function normalizeDishPricingPatch(
  input: unknown
): Partial<DishPricing> {
  const patch = input as Partial<DishPricing>
  const allowed = new Set([
    'price',
    'price_options',
    'add_ons',
    'bottle_deposit',
  ])
  if (
    !patch ||
    typeof patch !== 'object' ||
    Array.isArray(patch) ||
    !Object.keys(patch).length ||
    Object.keys(patch).some((key) => !allowed.has(key))
  ) {
    throw new Error('Unsupported Dish pricing change.')
  }
  if (
    'price' in patch &&
    (typeof patch.price !== 'number' ||
      !Number.isFinite(patch.price) ||
      patch.price < 0)
  )
    throw new Error('Price must be a non-negative number.')
  if (
    'bottle_deposit' in patch &&
    (typeof patch.bottle_deposit !== 'number' ||
      !Number.isFinite(patch.bottle_deposit) ||
      patch.bottle_deposit < 0 ||
      !Number.isSafeInteger(Math.round(patch.bottle_deposit * 100)))
  )
    throw new Error('Bottle deposit must be a valid non-negative amount.')
  const normalized = { ...patch }

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
    const options = normalizeDishPriceOptions(input)
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
    const addOns = normalizeDishAddOns(input)
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

export function readDishPricing(data: Record<string, unknown>): DishPricing {
  if (!Object.hasOwn(data, 'price'))
    throw new Error(
      'Set the Dish normal price before using it on a published Menu.'
    )
  const patch = normalizeDishPricingPatch({
    price: data.price,
    price_options: data.price_options ?? [],
    add_ons: data.add_ons ?? [],
    ...(data.bottle_deposit !== undefined
      ? { bottle_deposit: data.bottle_deposit }
      : {}),
  } as DishPricing)
  return patch as DishPricing
}
