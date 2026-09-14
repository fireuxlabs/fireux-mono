import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: include only explicitly linked Place defaults in Kitchen Menu presentation.
import { createError, getRouterParam } from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import {
  menuKitchenIdentity,
  readMenuKitchenPlaceData,
} from '../../../../menu/server/ownership/kitchen-scope.ts'
import { resolveDirectoryMenuScope } from '../../../../menu/server/ownership/target.ts'

const text = (value: unknown) => String(value ?? '').trim()

export default defineLiveReadHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['GET'],
  })

  const kitchenSlug = text(getRouterParam(event, 'kitchen'))
  if (!kitchenSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen slug is required.',
    })
  }

  const scope = await resolveDirectoryMenuScope(kitchenSlug)
  const placeData = await readMenuKitchenPlaceData(scope.kitchenId)
  const identity = menuKitchenIdentity(scope.rootKitchenData, placeData)

  return {
    kitchenSlug: scope.kitchenSlug,
    ...(identity.name ? { kitchenName: identity.name } : {}),
    ...(identity.kitchen_theme ? { theme: identity.kitchen_theme } : {}),
  }
})
