import type { LiveProjectionSources } from 'fireux-core/runtime/server/utils/live-projection-sources'
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
  showItemImages?: boolean
  kitchen_theme?: WorkspaceTheme
  kitchen_offerings?: unknown
  sproochli?: SproochliAttachmentConfig
}

export async function readMenuKitchenPlaceData(
  kitchenId: string,
  sources?: LiveProjectionSources
) {
  if (!kitchenId) return {}

  const place = getRuntimeFirestore().collection('places').doc(kitchenId)
  sources?.watch(place, { authority: true })
  const snap = await place.get()

  return snap.exists ? snap.data() || {} : {}
}

export function readMenuKitchenFulfilment(kitchenId: string) {
  return readKitchenFulfilment(getRuntimeFirestore(), kitchenId)
}

export function readMenuKitchenBySlug(
  kitchenSlug: string,
  sources?: LiveProjectionSources
) {
  return readKitchenByRouteSlug(getRuntimeFirestore(), kitchenSlug, sources)
}
