import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
  type MenuItem,
} from './menu-item'
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

export const normalizeMenuItemPatch = (
  patch: Partial<MenuItem>
): Partial<MenuItem> => {
  const allowed = new Set([
    'price',
    'price_options',
    'add_ons',
    'status',
    'sort_order',
  ])
  if (
    !patch ||
    typeof patch !== 'object' ||
    Array.isArray(patch) ||
    !Object.keys(patch).length ||
    Object.keys(patch).some((key) => !allowed.has(key))
  ) {
    throw new Error('Unsupported menu item change.')
  }
  const immutable = [
    'id',
    'kitchen_id',
    'menu_id',
    'section_id',
    'dish_id',
    'created',
  ]
  if (immutable.some((key) => Object.hasOwn(patch, key))) {
    throw new Error('Menu Item identity and relationships cannot be changed.')
  }
  if (
    'image' in patch ||
    'image_url' in patch ||
    'item_kind' in patch ||
    'is_deal' in patch
  ) {
    throw new Error(
      'Dish owns food identity and media; MenuItem owns menu pricing and options.'
    )
  }
  if (
    'price' in patch &&
    (typeof patch.price !== 'number' ||
      !Number.isFinite(patch.price) ||
      patch.price < 0)
  )
    throw new Error('Price must be a non-negative number.')
  if (
    'sort_order' in patch &&
    (typeof patch.sort_order !== 'number' || !Number.isFinite(patch.sort_order))
  )
    throw new Error('Invalid item order.')
  if (
    'status' in patch &&
    patch.status !== 'active' &&
    patch.status !== 'archived'
  )
    throw new Error('Invalid menu item availability.')
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
    const options = normalizeMenuItemPriceOptions(input)
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
    const addOns = normalizeMenuItemAddOns(input)
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
