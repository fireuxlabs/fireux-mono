import type {
  MenuManifestAddOn,
  MenuManifestPriceOption,
} from '../models/kitchen/menu/menu-detail.model'

type MenuOrderOption = {
  id: string
  label: string
  price: number
  priceLabel: string
}

export function resolveMenuOrderPriceOptions(
  value: unknown
): MenuManifestPriceOption[] | null {
  return resolveMenuOrderOptions(value, menuOrderPositivePrice)
}

export function resolveMenuOrderAddOns(
  value: unknown
): MenuManifestAddOn[] | null {
  return resolveMenuOrderOptions(value, menuOrderNonNegativePrice)
}

export function menuOrderPositivePrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function menuOrderNonNegativePrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export function defaultMenuOrderPriceOption(
  value: MenuManifestPriceOption[]
): MenuManifestPriceOption | null {
  let selected = value[0] || null

  for (const option of value.slice(1)) {
    if (selected && option.price < selected.price) selected = option
  }

  return selected
}

function resolveMenuOrderOptions(
  value: unknown,
  validPrice: (value: unknown) => boolean
): MenuOrderOption[] | null {
  if (!Array.isArray(value)) return null

  const ids = new Set<string>()
  const options: MenuOrderOption[] = []

  for (const candidate of value) {
    if (!isRecord(candidate)) return null

    const id = canonicalText(candidate.id)
    const label = canonicalText(candidate.label)
    const price = candidate.price
    if (
      !id ||
      !label ||
      ids.has(id) ||
      typeof price !== 'number' ||
      !validPrice(price)
    ) {
      return null
    }

    ids.add(id)
    options.push({
      id,
      label,
      price,
      priceLabel: canonicalText(candidate.priceLabel),
    })
  }

  return options
}

function canonicalText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
