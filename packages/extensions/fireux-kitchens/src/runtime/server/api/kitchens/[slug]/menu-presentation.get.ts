// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: include only explicitly linked Place defaults in Kitchen Menu presentation.
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import {
  menuKitchenIdentity,
  readAppMenuKitchenData,
  readMenuKitchenPlaceData,
} from '../../../../menu/server/ownership/kitchen-scope.ts'
import { resolveDirectoryPublicMenuScope } from '../../../../menu/server/ownership/public-target.ts'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['GET'],
  })

  const kitchenSlug = text(getRouterParam(event, 'slug'))
  if (!kitchenSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen slug is required.',
    })
  }

  const scope = await resolveDirectoryPublicMenuScope(kitchenSlug)
  const [appKitchenData, placeData] = await Promise.all([
    readAppMenuKitchenData(scope.appId, scope.kitchenId),
    readMenuKitchenPlaceData(scope.kitchenId),
  ])
  const identity = menuKitchenIdentity(
    scope.rootKitchenData,
    appKitchenData,
    placeData
  )

  return {
    kitchenSlug: scope.kitchenSlug,
    ...(identity.name ? { kitchenName: identity.name } : {}),
    ...(identity.page_style ? { pageStyle: identity.page_style } : {}),
  }
})
