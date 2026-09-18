// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: hydrate Kitchen fulfilment capability with Menu ownership.
// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: hydrate sparse Menu baselines through concrete Place runtime imports.
// Concurrent edit — 2026-07-22 12:13 CEST — Place/Kitchen palette inheritance: resolve Place base, migration fallback, then canonical root override.
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { useRuntimeConfig } from '#imports'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { readPlacePresentation } from 'fireux-places/runtime/place/utils/place-spine'
import {
  readKitchenCurrency,
  readKitchenThemePalette,
} from '../../../kitchen/utils/kitchen-readers'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type { KitchenFulfilment } from '../../../kitchen/models/fulfilment.model.ts'
import { readKitchenFulfilment } from '../../../kitchen/server/core/fulfilment.ts'
import { readKitchenSproochliAttachment } from '../../../kitchen/server/core/sproochli-attachment.ts'
import type { PlaceImageShade } from 'fireux-places/runtime/place/utils/place-spine'
import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model.ts'
import { menuSourceFromData } from '../payload/source.ts'
import { readKitchenByRouteSlug } from '../../../kitchen/server/identity/route-identity.ts'

export type MenuKitchenScope = {
  kitchenId?: string
  kitchenPlaceId?: string
  kitchenImageShade?: PlaceImageShade
  kitchenImageUrl?: string
  kitchenLogoImageUrl?: string
  kitchenMediaBackdropColor?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenTagline?: string
  kitchenWordmarkImageUrl?: string
  placeLogoImageUrl?: string
  placeWordmarkImageUrl?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  kitchenMenuSlug?: string
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
  kitchen_theme?: WorkspaceTheme
  fulfilment?: KitchenFulfilment
  kitchen_services?: unknown
  sproochli?: SproochliAttachmentConfig
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export const resolveSourceAppId = (kitchenData: Record<string, unknown>) =>
  String(useRuntimeConfig().public?.fireux?.id ?? '').trim()

export async function readMenuKitchenData(kitchenId: string) {
  if (!kitchenId) return {}

  const snap = await getRuntimeFirestore()
    .collection('kitchens')
    .doc(kitchenId)
    .get()

  return snap.exists ? snap.data() || {} : {}
}

export async function readMenuKitchenPlaceData(kitchenId: string) {
  if (!kitchenId) return {}

  const snap = await getRuntimeFirestore()
    .collection('places')
    .doc(kitchenId)
    .get()

  return snap.exists ? snap.data() || {} : {}
}

export function menuKitchenIdentity(
  kitchenData: Record<string, unknown>,
  placeData: Record<string, unknown> = {}
): {
  name: string
  tagline: string
  imageUrl: string
  imageShade: PlaceImageShade
  logoImageUrl: string
  mediaBackdropColor: string
  wordmarkImageUrl: string
  currencyCode: string
  currencyFormat: CurrencyDisplayFormat
  showCurrency: boolean
  kitchen_theme?: WorkspaceTheme
  placeLogoImageUrl: string
  placeWordmarkImageUrl: string
} {
  const place = readPlacePresentation(placeData)
  const currencyCode = readKitchenCurrency(kitchenData)
  const workspacePalette = readKitchenThemePalette(kitchenData)

  return {
    name: place.name,
    tagline: place.tagline,
    imageUrl: place.imageUrl,
    imageShade: place.imageShade,
    logoImageUrl: place.logoImage,
    mediaBackdropColor: place.mediaBackdropColor,
    placeLogoImageUrl: place.logoImage,
    placeWordmarkImageUrl: place.wordmarkImage,
    wordmarkImageUrl: place.wordmarkImage,
    currencyCode,
    currencyFormat: 'dash',
    showCurrency: true,
    ...(workspacePalette
      ? { kitchen_theme: { palette: workspacePalette } }
      : {}),
  }
}

export function readMenuKitchenFulfilment(kitchenId: string) {
  return readKitchenFulfilment(getRuntimeFirestore(), kitchenId)
}

export async function readMenuKitchenBySlug(kitchenSlug: string) {
  const kitchen = await readKitchenByRouteSlug(
    getRuntimeFirestore(),
    kitchenSlug
  )
  if (!kitchen) return null

  return {
    id: kitchen.id,
    data: kitchen.data,
    snapshot: kitchen.snapshot,
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
  const snapshot = kitchenId
    ? await db.collection('kitchens').doc(kitchenId).get()
    : (await readKitchenByRouteSlug(db, kitchenSlug))?.snapshot

  const kitchenData = snapshot?.exists ? snapshot.data() || {} : {}
  const resolvedKitchenId = snapshot?.exists ? snapshot.id : kitchenId
  const resolvedKitchenSlug =
    readRecordString(kitchenData, 'slug') || kitchenSlug
  const kitchenAppId = source.app_id || resolveSourceAppId(kitchenData)
  const placeData = await readMenuKitchenPlaceData(resolvedKitchenId)
  const identity = menuKitchenIdentity(kitchenData, placeData)
  const placeId = resolvedKitchenId
  const fulfilment = await readMenuKitchenFulfilment(resolvedKitchenId)
  const sproochli = await readKitchenSproochliAttachment(
    db,
    resolvedKitchenId,
    kitchenData
  )

  return {
    kitchen_services: kitchenData.services,
    ...(resolvedKitchenId ? { kitchenId: resolvedKitchenId } : {}),
    ...(placeId ? { kitchenPlaceId: placeId } : {}),
    ...(identity.imageUrl && identity.imageShade !== 'none'
      ? { kitchenImageShade: identity.imageShade }
      : {}),
    ...(identity.imageUrl ? { kitchenImageUrl: identity.imageUrl } : {}),
    ...(identity.mediaBackdropColor
      ? { kitchenMediaBackdropColor: identity.mediaBackdropColor }
      : {}),
    ...(identity.logoImageUrl
      ? { kitchenLogoImageUrl: identity.logoImageUrl }
      : {}),
    ...(resolvedKitchenSlug ? { kitchenSlug: resolvedKitchenSlug } : {}),
    ...(identity.name ? { kitchenName: identity.name } : {}),
    ...(identity.tagline ? { kitchenTagline: identity.tagline } : {}),
    ...(identity.wordmarkImageUrl
      ? { kitchenWordmarkImageUrl: identity.wordmarkImageUrl }
      : {}),
    ...(identity.placeLogoImageUrl
      ? { placeLogoImageUrl: identity.placeLogoImageUrl }
      : {}),
    ...(identity.placeWordmarkImageUrl
      ? { placeWordmarkImageUrl: identity.placeWordmarkImageUrl }
      : {}),
    ...(kitchenAppId ? { kitchenAppId } : {}),
    ...(source.menu_id ? { kitchenMenuId: source.menu_id } : {}),
    ...(identity.currencyCode ? { currencyCode: identity.currencyCode } : {}),
    currencyFormat: identity.currencyFormat,
    showCurrency: identity.showCurrency,
    ...(identity.kitchen_theme
      ? { kitchen_theme: identity.kitchen_theme }
      : {}),
    ...(fulfilment.delivery_zones.length || fulfilment.payment_methods.length
      ? { fulfilment }
      : {}),
    ...(sproochli.enabled ? { sproochli } : {}),
  }
}
