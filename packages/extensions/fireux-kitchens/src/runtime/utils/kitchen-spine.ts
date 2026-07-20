// Concurrent edit — 2026-07-19 16:58 CEST — Delivery pass: normalize Kitchen-owned zones and per-surface payment capability.
// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: resolve explicit Kitchen overrides through the concrete Place runtime module.
import {
  normalizeFireuxAppScopeState,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model.ts'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model.ts'
import type {
  KitchenFulfilmentConfig,
  KitchenFulfilmentPaymentMethod,
  KitchenFulfilmentPaymentPolicy,
  KitchenImageShade,
  KitchenPaymentRequirement,
} from '../models/kitchen.model'
import { readPlaceBusinessHours } from 'fireux-places/runtime/utils/place-spine.ts'
import type { KitchenOrderType } from '../models/kitchen/order.model'
import {
  kitchenOrderTypes,
  readDeliveryZones,
} from './menu-ordering-policy'
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

const kitchenPaymentMethods = [
  'cash',
  'card_at_pickup',
  'card_to_driver',
  'room_charge',
  'online_card',
] as const satisfies readonly KitchenFulfilmentPaymentMethod[]

const kitchenPaymentRequirements = [
  'verified_room',
] as const satisfies readonly KitchenPaymentRequirement[]

export const KitchenPaymentMethodDefaultOrderTypes = {
  cash: ['collection', 'delivery', 'dine_in', 'eat_in', 'takeaway', 'pre_order'],
  card_at_pickup: ['collection', 'eat_in', 'takeaway', 'pre_order'],
  card_to_driver: ['delivery'],
  room_charge: ['room_service'],
  online_card: [
    'collection',
    'delivery',
    'dine_in',
    'eat_in',
    'takeaway',
    'pre_order',
    'room_service',
  ],
} as const satisfies Record<KitchenFulfilmentPaymentMethod, readonly KitchenOrderType[]>

const readKitchenPaymentMethod = (value: unknown) => {
  const method = text(value) as KitchenFulfilmentPaymentMethod

  return kitchenPaymentMethods.includes(method) ? method : null
}

const readKitchenPaymentPolicy = (
  value: unknown
): KitchenFulfilmentPaymentPolicy | null => {
  // 2026-07-19 16:35 CEST — Normalize current flat Kitchen data while the
  // console rewrites it into the Kitchen-owned applicability policy.
  const flatMethod = readKitchenPaymentMethod(value)
  const row = record(value)
  const method = flatMethod || readKitchenPaymentMethod(row.method)
  if (!method) return null

  const configuredTypes = stringArray(row.order_types)
    .filter((type): type is KitchenOrderType =>
      kitchenOrderTypes.includes(type as KitchenOrderType)
    )
  const orderTypes = configuredTypes.length
    ? configuredTypes
    : [...KitchenPaymentMethodDefaultOrderTypes[method]]
  const requirements = stringArray(row.requirements)
    .filter((requirement): requirement is KitchenPaymentRequirement =>
      kitchenPaymentRequirements.includes(requirement as KitchenPaymentRequirement)
    )

  return {
    method,
    order_types: [...new Set(orderTypes)],
    ...(requirements.length ? { requirements: [...new Set(requirements)] } : {}),
  }
}

export const kitchenPaymentMethodsForOrderType = (
  fulfilment: KitchenFulfilmentConfig | null | undefined,
  orderType: KitchenOrderType
) => (fulfilment?.payment_methods || [])
  .filter(policy => policy.order_types.includes(orderType))
  .map(policy => policy.method)
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

/** Read-only projection helper. Canonical currency is owned by linked Place. */
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
  const fulfilment = record(source.fulfilment)
  const paymentPolicies = Array.isArray(fulfilment.payment_methods)
    ? fulfilment.payment_methods
      .map(readKitchenPaymentPolicy)
      .filter((policy): policy is KitchenFulfilmentPaymentPolicy => Boolean(policy))
      .filter((policy, index, policies) =>
        policies.findIndex(candidate => candidate.method === policy.method) === index
      )
    : []

  return {
    delivery_zones: readDeliveryZones(fulfilment.delivery_zones),
    payment_methods: paymentPolicies,
  }
}

export const readKitchenOperationHours = (value: KitchenSpineRecord) => {
  const source = record(value)
  const orders = record(source.orders)

  return readWeekdayTimeWindowsConfig(orders.operation_hours)
}

export const hasKitchenOperationHours = (value: KitchenSpineRecord) => {
  const source = record(value)
  const orders = record(source.orders)

  return hasKeys(record(orders.operation_hours))
}

export const resolveKitchenOperationHours = (
  kitchen: KitchenSpineRecord,
  place: KitchenSpineRecord
) => {
  const kitchenHours = readKitchenOperationHours(kitchen)
  const placeHours = readPlaceBusinessHours(place)

  if (
    hasKitchenOperationHours(kitchen) &&
    kitchenHours.source === 'custom' &&
    kitchenHours.windows.length
  ) {
    return kitchenHours
  }

  if (placeHours) {
    return {
      source: 'place' as const,
      timezone: placeHours.timezone,
      windows: placeHours.windows,
    }
  }

  return {
    source: 'place' as const,
    timezone: text(record(place).timezone) || kitchenHours.timezone,
    windows: [],
  }
}
