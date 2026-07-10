import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import {
  readKitchenAppScope,
  readKitchenFulfilmentConfig,
  readKitchenIdentity,
  readKitchenOperationHours,
  readKitchenMenuStyle,
  readKitchenCurrencyCode,
} from '../../../utils/kitchen-spine'
import type { MenuOrderFulfilmentPolicy } from '../../../models/kitchen/menu/menu.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model.ts'
import { menuSourceFromData } from '../payload/source.ts'
import { resolveMenuPageStyle } from '../payload/page-style.ts'

export type MenuKitchenScope = {
  kitchenId?: string
  kitchenPlaceId?: string
  kitchenImageUrl?: string
  kitchenLogoImageUrl?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenWordmarkImageUrl?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  currencyCode?: string
  page_style?: Record<string, unknown>
  fulfilment?: MenuOrderFulfilmentPolicy
  kitchen_operation_hours?: WeekdayTimeWindowsConfig
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

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

export function menuKitchenIdentity(
  rootData: Record<string, unknown>,
  appData: Record<string, unknown> = {}
) {
  const isTenantOwned = readKitchenAppScope(rootData).hasTenantApp
  const rootIdentity = readKitchenIdentity(rootData)
  const appIdentity = readKitchenIdentity(appData)
  const currencyCode = readKitchenCurrencyCode(appData) ||
    readKitchenCurrencyCode(rootData)

  // Menu identity spine: tenant apps emit style through their API; root menu_style is only a non-tenant directory fallback.
  return {
    name: appIdentity.displayName || rootIdentity.displayName,
    imageUrl: appIdentity.imageUrl || rootIdentity.imageUrl,
    logoImageUrl: appIdentity.logoImageUrl || rootIdentity.logoImageUrl,
    wordmarkImageUrl:
      appIdentity.wordmarkNoLogoImageUrl ||
      rootIdentity.wordmarkNoLogoImageUrl ||
      appIdentity.wordmarkImageUrl ||
      rootIdentity.wordmarkImageUrl,
    currencyCode,
    page_style: resolveMenuPageStyle(
      { source: 'app-kitchen', style: readKitchenMenuStyle(appData) },
      {
        source: 'root-kitchen',
        style: isTenantOwned ? {} : readKitchenMenuStyle(rootData),
      }
    ),
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

const hasKitchenOperationHours = (data: Record<string, unknown>) =>
  Object.keys(record(record(data).orders).operation_hours || {}).length > 0

export function menuKitchenOperationHours(
  rootData: Record<string, unknown>,
  appData: Record<string, unknown> = {}
) {
  if (readKitchenAppScope(rootData).hasTenantApp) {
    return readKitchenOperationHours(appData)
  }

  return hasKitchenOperationHours(appData)
    ? readKitchenOperationHours(appData)
    : readKitchenOperationHours(rootData)
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
  const appKitchenData = await readAppMenuKitchenData(
    kitchenAppId,
    resolvedKitchenId
  )
  const identity = menuKitchenIdentity(kitchenData, appKitchenData)

  return {
    kitchenId: resolvedKitchenId,
    kitchenPlaceId:
      readRecordString(kitchenData, 'place_id') || resolvedKitchenId,
    kitchenImageUrl: identity.imageUrl,
    kitchenLogoImageUrl: identity.logoImageUrl,
    kitchenSlug: resolvedKitchenSlug,
    kitchenName: identity.name,
    kitchenWordmarkImageUrl: identity.wordmarkImageUrl,
    kitchenAppId,
    kitchenMenuId: source.menu_id || '',
    currencyCode: identity.currencyCode,
    page_style: identity.page_style,
    fulfilment: menuKitchenFulfilment(kitchenData, appKitchenData),
    kitchen_operation_hours: menuKitchenOperationHours(kitchenData, appKitchenData),
  }
}
