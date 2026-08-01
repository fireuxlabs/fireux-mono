import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'
import { requireFinancialMoney } from 'fireux-finance/runtime/utils/money.ts'
import {
  MARKETPLACE_FULFILMENT_METHODS,
  type MarketplaceFulfilmentMethod,
} from '../../models/marketplace.model'

export class MarketplaceValidationError extends Error {}

export const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export function fail(message: string): never {
  throw new MarketplaceValidationError(message)
}

export const keysOnly = (
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string
) => {
  const extra = Object.keys(value).find((key) => !allowed.includes(key))
  if (extra) fail(`${label} contains an unsupported field: ${extra}.`)
}

export const marketplaceText = (
  value: unknown,
  label: string,
  min: number,
  max: number
): string => {
  if (typeof value !== 'string') fail(`${label} must be text.`)
  const output = value.trim()
  if (output.length < min || output.length > max) {
    fail(`${label} must be between ${min} and ${max} characters.`)
  }
  return output
}

export const marketplaceDocumentId = (
  value: unknown,
  label: string
): string => {
  const id = marketplaceText(value, label, 1, 120)
  if (id === '.' || id === '..' || id.includes('/') || /^__.*__$/.test(id)) {
    fail(`${label} is invalid.`)
  }
  return id
}

export const marketplaceSlug = (value: unknown): string => {
  const slug = marketplaceText(value, 'Store slug', 3, 80).toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail('Store slug must use lowercase letters, numbers and single hyphens.')
  }
  return slug
}

export const optionalText = (
  value: unknown,
  label: string,
  max: number
): string => {
  if (value === undefined || value === null || value === '') return ''
  return marketplaceText(value, label, 0, max)
}

export const httpsUrl = (value: unknown, label: string): string => {
  const url = optionalText(value, label, 2048)
  if (url && !/^https:\/\//.test(url)) fail(`${label} must use HTTPS.`)
  return url
}

export const stringIds = (
  value: unknown,
  label: string,
  max: number
): string[] => {
  if (!Array.isArray(value)) fail(`${label} must be a list.`)
  const output = Array.from(
    new Set(value.map((item) => marketplaceDocumentId(item, `${label} item`)))
  )
  if (output.length > max) fail(`${label} has too many items.`)
  return output
}

export const fulfilmentMethods = (
  value: unknown,
  label = 'Fulfilment methods',
  requireOne = true
): MarketplaceFulfilmentMethod[] => {
  const items = stringIds(value, label, 2)
  if (requireOne && !items.length) {
    fail(`${label} requires at least one choice.`)
  }
  if (
    items.some(
      (item) =>
        !MARKETPLACE_FULFILMENT_METHODS.includes(
          item as MarketplaceFulfilmentMethod
        )
    )
  ) {
    fail(`${label} contains an unsupported choice.`)
  }
  return items as MarketplaceFulfilmentMethod[]
}

export const locality = (value: unknown) => {
  const data = record(value)
  keysOnly(data, ['label', 'postal_code'], 'Locality')
  const postalCode = marketplaceText(data.postal_code, 'Postcode', 4, 4)
  if (!/^\d{4}$/.test(postalCode)) fail('Postcode must contain four digits.')
  return {
    label: marketplaceText(data.label, 'Locality', 1, 80),
    postal_code: postalCode,
  }
}

export const price = (value: unknown): FinancialMoney | null => {
  if (value === null || value === undefined) return null
  try {
    const money = requireFinancialMoney(value, {
      allowNegative: false,
      allowZero: false,
      label: 'Offer price',
    })
    if (money.currency_code !== 'CHF') fail('Offer price must use CHF.')
    return money
  } catch (error) {
    fail(error instanceof Error ? error.message : 'Offer price is invalid.')
  }
}
