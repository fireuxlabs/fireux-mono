// Concurrent edit — 2026-07-19 16:58 CEST — Delivery pass: normalize Kitchen-owned zones and per-surface payment capability.
// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: resolve explicit Kitchen overrides through the concrete Place runtime module.
import type { CurrencyDisplayFormat } from '../models/shared/currency-display.model'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import {
  readSproochliAttachmentConfig,
  type SproochliAttachmentConfig,
} from 'fireux-sproochli/runtime/sproochli'
import type {
  KitchenFulfilmentConfig,
  KitchenFulfilmentPaymentMethod,
  KitchenFulfilmentPaymentPolicy,
  KitchenMediaBackdropColor,
  KitchenImageShade,
  KitchenPaymentRequirement,
} from '../models/kitchen.model'
import {
  readMediaBackdropColor,
  readPlaceBusinessHours,
} from 'fireux-places/runtime/utils/place-spine'
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
export const composeKitchenScopedSurface = (
  publicKitchen: KitchenSpineRecord,
  scopedKitchen: KitchenSpineRecord
) => {
  const publicRecord = record(publicKitchen)
  const scopedRecord = record(scopedKitchen)

  if (!hasKeys(publicRecord)) return null
  if (!hasKeys(scopedRecord)) return publicRecord

  const composed: Record<string, unknown> = {
    ...publicRecord,
    ...(Array.isArray(scopedRecord.operator_ids)
      ? { operator_ids: scopedRecord.operator_ids }
      : {}),
    ...(Array.isArray(scopedRecord.team_ids)
      ? { team_ids: scopedRecord.team_ids }
      : {}),
    ...(Array.isArray(scopedRecord.join_requests)
      ? { join_requests: scopedRecord.join_requests }
      : {}),
  }
  if (Object.hasOwn(publicRecord, 'sproochli')) {
    composed.sproochli = readSproochliAttachmentConfig(publicRecord.sproochli)
  } else {
    delete composed.sproochli
  }

  return composed
}

export const readKitchenAppScope = (
  value: KitchenSpineRecord
) => {
  const source = record(value)
  const appScope = record(source.app_scope)
  const storedState = text(appScope.state)
  const state =
    storedState === 'root_only' ||
    storedState === 'parent_app' ||
    storedState === 'tenant_app'
      ? storedState
      : ''
  const appId = text(appScope.app_id)

  return {
    state,
    appId,
    hasTenantApp: state === 'tenant_app' && Boolean(appId),
  }
}

export const readKitchenIdentity = (value: KitchenSpineRecord) => {
  const source = record(value)
  const identity = record(source.identity)

  return {
    displayName: text(identity.display_name),
    tagline: text(identity.tagline),
    imageUrl: text(identity.image_url),
    cardImageUrl: text(identity.card_image_url),
    logoImageUrl: text(identity.logo_image_url),
    wordmarkNoLogoImageUrl: text(identity.wordmark_no_logo_image_url),
    wordmarkImageUrl: text(identity.wordmark_image_url),
    mediaBackdropColor: readMediaBackdropColor(
      identity.media_backdrop_color
    ) as KitchenMediaBackdropColor | '',
    /** @deprecated Compatibility projection only. */
    imageShade: (text(identity.image_shade).toLowerCase() === 'light'
      ? 'light'
      : text(identity.image_shade).toLowerCase() === 'dark'
        ? 'dark'
        : 'none') as KitchenImageShade,
  }
}

export const readKitchenVisibility = (value: KitchenSpineRecord) => {
  const source = record(value)
  const visibility = record(source.visibility)

  return {
    show: bool(visibility.show, false),
    active: bool(visibility.active, true),
    isTest: bool(visibility.is_test, false),
  }
}

export const readKitchenMenusConfig = (value: KitchenSpineRecord) => {
  const source = record(value)
  const menus = record(source.menus)
  const style = optionalRecord(menus.style)

  return {
    currencyFormat: (
      text(menus.currency_format) || 'dash'
    ) as CurrencyDisplayFormat,
    showCurrency: bool(menus.show_currency, true),
    style: style as Partial<PageStyle> | undefined,
    available: bool(menus.available, true),
  }
}

export const readKitchenSproochliConfig = (
  value: KitchenSpineRecord
): SproochliAttachmentConfig =>
  readSproochliAttachmentConfig(record(value).sproochli)

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
