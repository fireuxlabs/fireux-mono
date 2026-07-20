// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: hydrate Kitchen fulfilment capability with Menu ownership.
// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: hydrate sparse Menu baselines through concrete Place runtime imports.
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model.ts'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/utils/place-spine.ts'
import {
  hasKitchenOperationHours,
  readKitchenAppScope,
  readKitchenFulfilmentConfig,
  readKitchenIdentity,
  readKitchenMenusConfig,
  readKitchenMenuStyle,
  resolveKitchenOperationHours,
} from '../../../utils/kitchen-spine'
import type {
  KitchenFulfilmentConfig,
  KitchenImageShade,
} from '../../../models/kitchen.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model.ts'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model.ts'
import { menuSourceFromData } from '../payload/source.ts'
import { resolveMenuPageStyle } from '../payload/page-style.ts'

export type MenuKitchenScope = {
  kitchenId?: string
  kitchenPlaceId?: string
  kitchenImageShade?: KitchenImageShade
  kitchenImageUrl?: string
  kitchenLogoImageUrl?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenWordmarkImageUrl?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
  page_style?: Record<string, unknown>
  fulfilment?: KitchenFulfilmentConfig
  kitchen_operation_hours?: WeekdayTimeWindowsConfig
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const hasKitchenMenuDisplayConfig = (value: Record<string, unknown>) => {
  const menus = record(value.menus)

  return Object.hasOwn(menus, 'currency_format') ||
    Object.hasOwn(menus, 'show_currency') ||
    Object.hasOwn(value, 'menu_currency_format') ||
    Object.hasOwn(value, 'menu_show_currency')
}

const explicitKitchenDisplayName = (value: Record<string, unknown>) =>
  readRecordString(record(value.identity), 'display_name') ||
  readRecordString(value, 'display_name')

export const resolveSourceAppId = (
  kitchenData: Record<string, unknown>,
  fallbackAppId: string
) => readKitchenAppScope(kitchenData, fallbackAppId).appId

export async function readAppMenuKitchenData(
  appId: string,
  kitchenId: string
) {
  if (!appId || !kitchenId) return {}

  const snap = await getRuntimeFirestore()
    .collection(`apps/${appId}/kitchens`)
    .doc(kitchenId)
    .get()

  return snap.exists ? snap.data() || {} : {}
}

export async function readMenuKitchenPlaceData(
  rootData: Record<string, unknown>
) {
  const placeId = readRecordString(rootData, 'place_id')
  if (!placeId) return {}

  const snap = await getRuntimeFirestore()
    .collection(PlaceStorage.collection)
    .doc(placeId)
    .get()

  return snap.exists ? snap.data() || {} : {}
}

export function menuKitchenIdentity(
  rootData: Record<string, unknown>,
  appData: Record<string, unknown> = {},
  placeData: Record<string, unknown> = {}
) {
  const isTenantOwned = readKitchenAppScope(rootData).hasTenantApp
  const rootIdentity = readKitchenIdentity(rootData)
  const appIdentity = readKitchenIdentity(appData)
  const placeIdentity = readKitchenIdentity(placeData)
  const currencyCode = readPlaceCurrencyCode(placeData)
  const appMenuConfig = readKitchenMenusConfig(appData)
  const rootMenuConfig = readKitchenMenusConfig(rootData)
  const menuDisplay = isTenantOwned || hasKitchenMenuDisplayConfig(appData)
    ? appMenuConfig
    : rootMenuConfig
  const pageStyle = resolveMenuPageStyle(
    { source: 'app-kitchen', style: readKitchenMenuStyle(appData) },
    {
      source: 'root-kitchen',
      style: isTenantOwned ? {} : readKitchenMenuStyle(rootData),
    }
  )
  const imageUrl =
    placeIdentity.imageUrl || appIdentity.imageUrl || rootIdentity.imageUrl
  const imageShade = placeIdentity.imageUrl
    ? placeIdentity.imageShade
    : appIdentity.imageUrl
      ? appIdentity.imageShade
      : rootIdentity.imageShade

  // Menu identity spine: tenant apps emit style through their API; root menu_style is only a non-tenant directory fallback.
  return {
    name:
      explicitKitchenDisplayName(appData) ||
      explicitKitchenDisplayName(rootData) ||
      placeIdentity.displayName,
    imageUrl,
    imageShade,
    logoImageUrl: appIdentity.logoImageUrl || rootIdentity.logoImageUrl,
    wordmarkImageUrl:
      appIdentity.wordmarkNoLogoImageUrl ||
      rootIdentity.wordmarkNoLogoImageUrl ||
      appIdentity.wordmarkImageUrl ||
      rootIdentity.wordmarkImageUrl,
    currencyCode,
    currencyFormat: menuDisplay.currencyFormat,
    showCurrency: menuDisplay.showCurrency,
    ...(Object.keys(pageStyle).length ? { page_style: pageStyle } : {}),
  }
}

export function menuKitchenFulfilment(
  rootData: Record<string, unknown>,
  appData: Record<string, unknown> = {}
) {
  const isTenantOwned = readKitchenAppScope(rootData).hasTenantApp
  const appFulfilment = readKitchenFulfilmentConfig(appData)
  if (isTenantOwned) return appFulfilment

  if (
    appFulfilment.delivery_zones.length ||
    appFulfilment.payment_methods.length
  ) {
    return appFulfilment
  }

  return readKitchenFulfilmentConfig(rootData)
}

export function menuKitchenOperationHours(
  rootData: Record<string, unknown>,
  appData: Record<string, unknown> = {},
  placeData: Record<string, unknown> = {}
) {
  let kitchenData = rootData
  if (readKitchenAppScope(rootData).hasTenantApp) {
    kitchenData = appData
  } else if (hasKitchenOperationHours(appData)) {
    kitchenData = appData
  }

  return resolveKitchenOperationHours(kitchenData, placeData)
}

export async function readMenuKitchenBySlug(kitchenSlug: string) {
  const snap = await getRuntimeFirestore()
    .collection('kitchens')
    .where('slug', '==', kitchenSlug.toLowerCase())
    .limit(1)
    .get()
  const doc = snap.docs[0]

  if (!doc) return null

  return {
    id: doc.id,
    data: doc.data() || {},
  }
}

export async function readRootMenuKitchenScope(
  data: Record<string, unknown>,
  currentAppId: string
): Promise<MenuKitchenScope> {
  const source = menuSourceFromData(data)
  const kitchenId = source.kitchen_id || ''
  const kitchenSlug = source.kitchen_slug || ''
  if (!kitchenId && !kitchenSlug) return {}

  const db = getRuntimeFirestore()
  const snap = kitchenId
    ? await db.collection('kitchens').doc(kitchenId).get()
    : (await db
        .collection('kitchens')
        .where('slug', '==', kitchenSlug.toLowerCase())
        .limit(1)
        .get()).docs[0]

  const kitchenData = snap?.exists ? snap.data() || {} : {}
  const resolvedKitchenId = snap?.exists ? snap.id : kitchenId
  const resolvedKitchenSlug = readRecordString(kitchenData, 'slug') || kitchenSlug
  const kitchenAppId =
    source.app_id ||
    resolveSourceAppId(kitchenData, currentAppId)
  const [appKitchenData, placeData] = await Promise.all([
    readAppMenuKitchenData(kitchenAppId, resolvedKitchenId),
    readMenuKitchenPlaceData(kitchenData),
  ])
  const identity = menuKitchenIdentity(kitchenData, appKitchenData, placeData)
  const placeId = readRecordString(kitchenData, 'place_id')
  const fulfilment = menuKitchenFulfilment(kitchenData, appKitchenData)
  const kitchenOperationHours = menuKitchenOperationHours(
    kitchenData,
    appKitchenData,
    placeData
  )

  return {
    ...(resolvedKitchenId ? { kitchenId: resolvedKitchenId } : {}),
    ...(placeId ? { kitchenPlaceId: placeId } : {}),
    ...(identity.imageUrl && identity.imageShade !== 'none'
      ? { kitchenImageShade: identity.imageShade }
      : {}),
    ...(identity.imageUrl ? { kitchenImageUrl: identity.imageUrl } : {}),
    ...(identity.logoImageUrl ? { kitchenLogoImageUrl: identity.logoImageUrl } : {}),
    ...(resolvedKitchenSlug ? { kitchenSlug: resolvedKitchenSlug } : {}),
    ...(identity.name ? { kitchenName: identity.name } : {}),
    ...(identity.wordmarkImageUrl
      ? { kitchenWordmarkImageUrl: identity.wordmarkImageUrl }
      : {}),
    ...(kitchenAppId ? { kitchenAppId } : {}),
    ...(source.menu_id ? { kitchenMenuId: source.menu_id } : {}),
    ...(identity.currencyCode ? { currencyCode: identity.currencyCode } : {}),
    currencyFormat: identity.currencyFormat,
    showCurrency: identity.showCurrency,
    ...(identity.page_style ? { page_style: identity.page_style } : {}),
    ...(fulfilment.delivery_zones.length || fulfilment.payment_methods.length
      ? { fulfilment }
      : {}),
    ...(kitchenOperationHours.windows.length
      ? { kitchen_operation_hours: kitchenOperationHours }
      : {}),
  }
}
