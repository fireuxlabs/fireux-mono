import {
  normalizeFireuxAppScopeState,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model.ts'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model.ts'
import type {
  KitchenFulfilmentConfig,
  KitchenImageShade,
} from '../models/kitchen.model'
import { readMenuOrderFulfilmentPolicy } from './menu-ordering-policy'
import { readWeekdayTimeWindowsConfig } from './weekday-time'

type KitchenSpineRecord = Record<string, unknown> | null | undefined

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const optionalRecord = (value: unknown): Record<string, unknown> | undefined => {
  const item = record(value)
  return Object.keys(item).length ? item : undefined
}
const bool = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback
const stringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map(text).filter(Boolean)
    : []
const hasKeys = (value: Record<string, unknown>) =>
  Boolean(Object.keys(value).length)
const imageShade = (value: unknown): KitchenImageShade => {
  const shade = text(value).toLowerCase()
  return shade === 'light' || shade === 'dark' || shade === 'none'
    ? shade
    : 'none'
}
const publicKitchenStringKeys = [
  'slug',
  'name',
  'display_name',
  'short_name',
  'tagline',
  'brand_tagline',
  'short_address',
  'formatted_address',
  'display_image_url',
  'wordmark_no_logo_image_url',
  'wordmark_image_url',
  'image_url',
  'image_shade',
  'cover_image',
  'phone',
  'website',
  'google_maps_url',
  'place_id',
  'currency_code',
  'menu_currency_format',
  'claimed_by',
] as const
const publicKitchenArrayKeys = [
  'food_gallery',
  'gallery_images',
  'types',
  'tags',
] as const
const publicKitchenIdentityKeys = [
  'display_name',
  'tagline',
  'image_url',
  'wordmark_no_logo_image_url',
  'wordmark_image_url',
  'image_shade',
] as const

export const composeKitchenScopedSurface = (
  publicKitchen: KitchenSpineRecord,
  scopedKitchen: KitchenSpineRecord
) => {
  const publicRecord = record(publicKitchen)
  const scopedRecord = record(scopedKitchen)

  if (!hasKeys(publicRecord)) return hasKeys(scopedRecord) ? scopedRecord : null
  if (!hasKeys(scopedRecord)) return publicRecord

  const composed: Record<string, unknown> = {
    ...publicRecord,
    ...scopedRecord,
  }

  for (const key of publicKitchenStringKeys) {
    if (text(composed[key])) continue

    const publicValue = publicRecord[key]
    if (text(publicValue)) composed[key] = publicValue
  }

  for (const key of publicKitchenArrayKeys) {
    if (stringArray(composed[key]).length) continue

    const publicValues = stringArray(publicRecord[key])
    if (publicValues.length) composed[key] = publicValues
  }

  const publicIdentity = record(publicRecord.identity)
  const scopedIdentity = record(scopedRecord.identity)
  const identity: Record<string, unknown> = {
    ...publicIdentity,
    ...scopedIdentity,
  }

  for (const key of publicKitchenIdentityKeys) {
    if (text(identity[key])) continue

    const publicValue = publicIdentity[key]
    if (text(publicValue)) identity[key] = publicValue
  }

  if (!stringArray(identity.gallery).length) {
    const publicGallery = stringArray(publicIdentity.gallery)
    if (publicGallery.length) identity.gallery = publicGallery
  }

  if (hasKeys(identity)) composed.identity = identity

  return composed
}

export const readKitchenAppScope = (
  value: KitchenSpineRecord,
  fallbackAppId: unknown = ''
) => {
  const source = record(value)
  const appScope = record(source.app_scope)
  const state = normalizeFireuxAppScopeState(
    text(appScope.state) || text(source.app_scope_state)
  )
  const appId = text(appScope.app_id) || text(source.app_scope_app_id) || text(fallbackAppId)

  return {
    state,
    appId,
    hasTenantApp: state === 'tenant_app' && Boolean(appId),
  }
}

export const readKitchenIdentity = (value: KitchenSpineRecord) => {
  const source = record(value)
  const identity = record(source.identity)
  const displayName =
    text(identity.display_name) ||
    text(source.display_name) ||
    text(source.name) ||
    text(source.short_name)
  const imageUrl =
    text(identity.image_url) ||
    text(source.display_image_url) ||
    text(source.image_url)
  const logoImageUrl =
    text(identity.logo_image_url) ||
    text(source.logo_image_url)
  const wordmarkImageUrl =
    text(identity.wordmark_image_url) ||
    text(source.wordmark_image_url)
  const wordmarkNoLogoImageUrl =
    text(identity.wordmark_no_logo_image_url) ||
    text(source.wordmark_no_logo_image_url)
  const gallery = stringArray(identity.gallery).length
    ? stringArray(identity.gallery)
    : stringArray(source.food_gallery)

  return {
    displayName,
    tagline: text(identity.tagline) || text(source.tagline),
    imageUrl,
    logoImageUrl,
    wordmarkNoLogoImageUrl,
    wordmarkImageUrl,
    imageShade: imageShade(identity.image_shade || source.image_shade),
    gallery,
  }
}

export const readKitchenVisibility = (value: KitchenSpineRecord) => {
  const source = record(value)
  const visibility = record(source.visibility)

  return {
    show: bool(visibility.show, bool(source.show, false)),
    active: bool(visibility.active, bool(source.active, true)),
    isTest: bool(visibility.is_test, bool(source.is_test_kitchen, false)),
  }
}

export const readKitchenMenusConfig = (value: KitchenSpineRecord) => {
  const source = record(value)
  const menus = record(source.menus)
  const style = optionalRecord(menus.style) ?? optionalRecord(source.menu_style)

  return {
    currencyFormat: (
      text(menus.currency_format) ||
      text(source.menu_currency_format) ||
      'dash'
    ) as CurrencyDisplayFormat,
    showCurrency: bool(menus.show_currency, source.menu_show_currency !== false),
    style: style as Partial<PageStyle> | undefined,
    available: bool(menus.available, source.menu_available !== false),
  }
}

export const readKitchenMenuStyle = (value: KitchenSpineRecord) =>
  readKitchenMenusConfig(value).style

export const readKitchenCurrencyCode = (value: KitchenSpineRecord) => {
  const source = record(value)

  return text(source.currency_code).toUpperCase()
}

export const readKitchenTableCount = (value: KitchenSpineRecord) => {
  const count = Number(record(value).tables && record(record(value).tables).count)

  return Number.isSafeInteger(count) && count > 0
    ? Math.min(count, 500)
    : 0
}

export const readKitchenFulfilmentConfig = (
  value: KitchenSpineRecord
): KitchenFulfilmentConfig => {
  const source = record(value)
  const policy = readMenuOrderFulfilmentPolicy(source.fulfilment)

  return {
    delivery_zones: policy?.delivery_zones || [],
    payment_methods: policy?.payment_methods || [],
  }
}

export const readKitchenOperationHours = (value: KitchenSpineRecord) => {
  const source = record(value)
  const orders = record(source.orders)

  return readWeekdayTimeWindowsConfig(orders.operation_hours)
}
