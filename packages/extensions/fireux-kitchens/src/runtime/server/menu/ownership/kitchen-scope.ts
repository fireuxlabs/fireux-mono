// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: hydrate Kitchen fulfilment capability with Menu ownership.
// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: hydrate sparse Menu baselines through concrete Place runtime imports.
// Concurrent edit — 2026-07-22 12:13 CEST — Place/Kitchen palette inheritance: resolve Place base, migration fallback, then canonical root override.
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model.ts'
import {
  readPlaceCurrencyCode,
  readPlacePresentation,
} from 'fireux-places/runtime/utils/place-spine.ts'
import {
  readKitchenAppScope,
  readKitchenFulfilmentConfig,
  readKitchenIdentity,
  readKitchenMenusConfig,
  readKitchenMenuStyle,
  readKitchenSproochliConfig,
  resolveKitchenOperationHours,
} from '../../../utils/kitchen-spine'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
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
  sproochli?: SproochliAttachmentConfig
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const explicitKitchenDisplayName = (value: Record<string, unknown>) =>
  readRecordString(record(value.identity), 'display_name')

export const resolveSourceAppId = (
  kitchenData: Record<string, unknown>
) => readKitchenAppScope(kitchenData).appId

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
  _appData: Record<string, unknown> = {},
  placeData: Record<string, unknown> = {}
): {
  name: string
  imageUrl: string
  imageShade: KitchenImageShade
  logoImageUrl: string
  wordmarkImageUrl: string
  currencyCode: string
  currencyFormat: CurrencyDisplayFormat
  showCurrency: boolean
  page_style?: Record<string, unknown>
} {
  const rootIdentity = readKitchenIdentity(rootData)
  const place = readPlacePresentation(placeData)
  const currencyCode = readPlaceCurrencyCode(placeData)
  const menuDisplay = readKitchenMenusConfig(rootData)
  const pageStyle = resolveMenuPageStyle(
    { source: 'place', style: placeData.brand_palette },
    { source: 'root-kitchen', style: readKitchenMenuStyle(rootData) }
  )

  return {
    name:
      explicitKitchenDisplayName(rootData) ||
      place.name,
    imageUrl: place.imageUrl,
    imageShade: place.imageShade as KitchenImageShade,
    logoImageUrl: rootIdentity.logoImageUrl,
    wordmarkImageUrl:
      rootIdentity.wordmarkNoLogoImageUrl ||
      rootIdentity.wordmarkImageUrl,
    currencyCode,
    currencyFormat: menuDisplay.currencyFormat,
    showCurrency: menuDisplay.showCurrency,
    ...(Object.keys(pageStyle).length ? { page_style: pageStyle } : {}),
  }
}

export function menuKitchenFulfilment(
  rootData: Record<string, unknown>,
  _appData: Record<string, unknown> = {}
) {
  return readKitchenFulfilmentConfig(rootData)
}

export function menuKitchenOperationHours(
  rootData: Record<string, unknown>,
  _appData: Record<string, unknown> = {},
  placeData: Record<string, unknown> = {}
) {
  return resolveKitchenOperationHours(rootData, placeData)
}

export async function readMenuKitchenBySlug(kitchenSlug: string) {
  const snap = await getRuntimeFirestore()
    .collection('kitchens')
    .doc(kitchenSlug.toLowerCase())
    .get()
  if (!snap.exists) return null

  return {
    id: snap.id,
    data: snap.data() || {},
  }
}

export async function readRootMenuKitchenScope(
  data: Record<string, unknown>,
  _currentAppId: string
): Promise<MenuKitchenScope> {
  const source = menuSourceFromData(data)
  const kitchenId = source.kitchen_id || ''
  const kitchenSlug = source.kitchen_slug || ''
  if (!kitchenId && !kitchenSlug) return {}

  const db = getRuntimeFirestore()
  const snap = kitchenId
    ? await db.collection('kitchens').doc(kitchenId).get()
    : await db.collection('kitchens').doc(kitchenSlug.toLowerCase()).get()

  const kitchenData = snap?.exists ? snap.data() || {} : {}
  const resolvedKitchenId = snap?.exists ? snap.id : kitchenId
  const resolvedKitchenSlug = readRecordString(kitchenData, 'slug') || kitchenSlug
  const kitchenAppId =
    source.app_id ||
    resolveSourceAppId(kitchenData)
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
  const sproochli = readKitchenSproochliConfig(kitchenData)

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
    ...(sproochli.enabled ? { sproochli } : {}),
  }
}
