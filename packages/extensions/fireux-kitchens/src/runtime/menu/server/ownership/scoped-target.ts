import { readKitchenOfferings } from '../../../kitchen/server/offerings/read'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { readKitchenSproochliAttachment } from '../../../kitchen/server/core/sproochli-attachment'
import {
  menuKitchenIdentity,
  readMenuKitchenFulfilment,
  readMenuKitchenPlaceData,
} from './kitchen-scope'
import type { ScopedMenuTarget, ScopedTargetKind } from './target-types'
export const scopedTarget = async (
  kind: ScopedTargetKind,
  menuId: string,
  input: {
    appId: string
    kitchenId: string
    kitchenSlug: string
    rootKitchenData: Record<string, unknown>
  }
): Promise<ScopedMenuTarget> => {
  const [menuSnapshot, placeData] = await Promise.all([
    getRuntimeFirestore()
      .collection(`kitchens/${input.kitchenId}/menus`)
      .where('slug', '==', menuId)
      .limit(2)
      .get(),
    readMenuKitchenPlaceData(input.kitchenId),
  ])
  if (
    menuSnapshot.docs.length !== 1 ||
    readRecordString(menuSnapshot.docs[0]?.data() || {}, 'status') !==
      'published'
  ) {
    throw createError({ statusCode: 404, statusMessage: 'Menu not found.' })
  }
  const menuDocument = menuSnapshot.docs[0]!
  const menuData = menuDocument.data()
  const sourceMenuId = menuDocument.id
  const identity = menuKitchenIdentity(input.rootKitchenData, placeData)
  const kitchenPlaceId = input.kitchenId
  const fulfilment = await readMenuKitchenFulfilment(input.kitchenId)
  const sproochli = await readKitchenSproochliAttachment(
    getRuntimeFirestore(),
    input.kitchenId
  )

  const offerings = await readKitchenOfferings(
    getRuntimeFirestore(),
    input.kitchenId
  )
  return {
    orderingSource: {
      kitchen: input.rootKitchenData,
      place: placeData,
      offerings,
    },
    kind,
    routeMenuId: menuId,
    sourceMenuId,
    appId: input.appId,
    kitchenId: input.kitchenId,
    kitchenSlug:
      input.kitchenSlug || readRecordString(input.rootKitchenData, 'slug'),
    rootKitchenData: input.rootKitchenData,
    kitchenData: input.rootKitchenData,
    menuData,
    scope: {
      kitchen_offerings: offerings,
      kitchenTimezone: String(placeData.timezone || ''),
      kitchenId: input.kitchenId,
      ...(kitchenPlaceId ? { kitchenPlaceId } : {}),
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
      ...(input.kitchenSlug || readRecordString(input.rootKitchenData, 'slug')
        ? {
            kitchenSlug:
              input.kitchenSlug ||
              readRecordString(input.rootKitchenData, 'slug'),
          }
        : {}),
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
      kitchenAppId: input.appId,
      kitchenMenuId: sourceMenuId,
      kitchenMenuSlug: menuId,
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
    },
  }
}
