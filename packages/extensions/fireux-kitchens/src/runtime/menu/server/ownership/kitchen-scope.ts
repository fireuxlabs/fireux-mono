// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: hydrate Kitchen fulfilment capability with Menu ownership.
// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: hydrate sparse Menu baselines through concrete Place runtime imports.
// Concurrent edit — 2026-07-22 12:13 CEST — Place/Kitchen palette inheritance: resolve Place base, migration fallback, then canonical root override.
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { useRuntimeConfig } from '#imports'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { PlaceStorage } from 'fireux-places/runtime/place/models/place.model'
import {
  readPlaceCurrencyCode,
  readPlacePresentation,
} from 'fireux-places/runtime/place/utils/place-spine'
import {
  readKitchenManagementTarget,
  readKitchenFulfilmentConfig,
  readKitchenMenusConfig,
  readKitchenWorkspacePalette,
  readKitchenSproochliConfig,
  resolveKitchenOperationHours,
} from '../../../kitchen/utils/kitchen-spine'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type {
  KitchenFulfilmentConfig,
} from '../../../kitchen/models/kitchen.model.ts'
import type { PlaceImageShade } from 'fireux-places/runtime/place/models/place.model'
import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model.ts'
import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model.ts'
import { menuSourceFromData } from '../payload/source.ts'
import { resolveMenuPageStyle } from '../payload/page-style.ts'
import { readKitchenByRouteSlug } from '../../../kitchen/server/identity/route-identity.ts'

export type MenuKitchenScope = {
  kitchenId?: string
  kitchenPlaceId?: string
  kitchenImageShade?: PlaceImageShade
  kitchenImageUrl?: string
  kitchenLogoImageUrl?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenTagline?: string
  kitchenWordmarkImageUrl?: string
  placeLogoImageUrl?: string
  placeWordmarkImageUrl?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
  primaryMenuId?: string
  specialsEnabled?: boolean
  specialsMenuId?: string
  page_style?: Record<string, unknown>
  kitchen_theme?: WorkspaceTheme
  fulfilment?: KitchenFulfilmentConfig
  kitchen_operation_hours?: WeekdayTimeWindowsConfig
  sproochli?: SproochliAttachmentConfig
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export const resolveSourceAppId = (kitchenData: Record<string, unknown>) =>
  readKitchenManagementTarget(
    kitchenData,
    String(useRuntimeConfig().public?.fireux?.ecosystem ?? '').trim()
  ).appId

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
    .collection(PlaceStorage.collection)
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
  wordmarkImageUrl: string
  currencyCode: string
  currencyFormat: CurrencyDisplayFormat
  showCurrency: boolean
  page_style?: Record<string, unknown>
  kitchen_theme?: WorkspaceTheme
  placeLogoImageUrl: string
  placeWordmarkImageUrl: string
} {
  const place = readPlacePresentation(placeData)
  const currencyCode = readPlaceCurrencyCode(placeData)
  const menuDisplay = readKitchenMenusConfig(kitchenData)
  const workspacePalette = readKitchenWorkspacePalette(kitchenData)
  const placePalette = record(placeData.brand_palette)
  const placeStyle =
    place.mediaBackdropColor && !readRecordString(placePalette, 'primary_color')
      ? { ...placePalette, primary_color: place.mediaBackdropColor }
      : placePalette
  const workspaceStyle = workspacePalette
    ? {
        background_color_light: workspacePalette.canvas,
        background_color_dark: workspacePalette.canvas,
        font_color_light: workspacePalette.text,
        font_color_dark: workspacePalette.text,
        title_color_light: workspacePalette.text,
        title_color_dark: workspacePalette.text,
        primary_color: workspacePalette.accent,
        // Legacy PageStyle uses secondary for decorative Menu accents.
        // Workspace accent_contrast is reserved for text placed on accent.
        secondary_color: workspacePalette.accent,
      }
    : {}
  const pageStyle = resolveMenuPageStyle(
    { source: 'place', style: placeStyle },
    { source: 'workspace-theme', style: workspaceStyle }
  )

  return {
    name: place.name,
    tagline: place.brandTagline,
    imageUrl: place.coverImage || place.imageUrl,
    imageShade: place.imageShade,
    logoImageUrl: place.logoImage,
    placeLogoImageUrl: place.logoImage,
    placeWordmarkImageUrl: place.wordmarkImage,
    wordmarkImageUrl: place.wordmarkImage,
    currencyCode,
    currencyFormat: menuDisplay.currencyFormat,
    showCurrency: menuDisplay.showCurrency,
    ...(Object.keys(pageStyle).length ? { page_style: pageStyle } : {}),
    ...(workspacePalette
      ? { kitchen_theme: { palette: workspacePalette } }
      : {}),
  }
}

export function menuKitchenFulfilment(kitchenData: Record<string, unknown>) {
  return readKitchenFulfilmentConfig(kitchenData)
}

export function menuKitchenOperationHours(
  kitchenData: Record<string, unknown>,
  placeData: Record<string, unknown> = {}
) {
  return resolveKitchenOperationHours(kitchenData, placeData)
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
  const fulfilment = menuKitchenFulfilment(kitchenData)
  const kitchenOperationHours = menuKitchenOperationHours(
    kitchenData,
    placeData
  )
  const sproochli = readKitchenSproochliConfig(kitchenData)
  const menus = readKitchenMenusConfig(kitchenData)

  return {
    ...(resolvedKitchenId ? { kitchenId: resolvedKitchenId } : {}),
    ...(placeId ? { kitchenPlaceId: placeId } : {}),
    ...(identity.imageUrl && identity.imageShade !== 'none'
      ? { kitchenImageShade: identity.imageShade }
      : {}),
    ...(identity.imageUrl ? { kitchenImageUrl: identity.imageUrl } : {}),
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
    ...(menus.primaryMenuId ? { primaryMenuId: menus.primaryMenuId } : {}),
    ...(menus.specialsEnabled ? { specialsEnabled: true } : {}),
    ...(menus.specialsMenuId ? { specialsMenuId: menus.specialsMenuId } : {}),
    ...(identity.page_style ? { page_style: identity.page_style } : {}),
    ...(identity.kitchen_theme
      ? { kitchen_theme: identity.kitchen_theme }
      : {}),
    ...(fulfilment.delivery_zones.length || fulfilment.payment_methods.length
      ? { fulfilment }
      : {}),
    ...(kitchenOperationHours.windows.length
      ? { kitchen_operation_hours: kitchenOperationHours }
      : {}),
    ...(sproochli.enabled ? { sproochli } : {}),
  }
}
