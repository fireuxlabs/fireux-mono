import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import { readKitchenFulfilment } from '../../../kitchen/server/core/fulfilment.ts'
import type { PlaceImageShade } from 'fireux-places/runtime/place/utils/place-spine'
import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model.ts'
import { readKitchenByRouteSlug } from '../../../kitchen/server/identity/route-identity.ts'

export type MenuKitchenScope = {
  kitchenTimezone?: string
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
  kitchen_offerings?: unknown
  sproochli?: SproochliAttachmentConfig
}

export async function readMenuKitchenPlaceData(kitchenId: string) {
  if (!kitchenId) return {}

  const snap = await getRuntimeFirestore()
    .collection('places')
    .doc(kitchenId)
    .get()

  return snap.exists ? snap.data() || {} : {}
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
