import {
  createError,
  defineEventHandler,
  getRouterParam,
} from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import {
  menuKitchenIdentity,
  readAppMenuKitchenData,
} from '../../../menu/ownership/kitchen-scope.ts'
import { resolveDirectoryPublicMenuScope } from '../../../menu/ownership/public-target.ts'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(async event => {
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
  const appKitchenData = await readAppMenuKitchenData(
    scope.appId,
    scope.kitchenId
  )
  const identity = menuKitchenIdentity(
    scope.rootKitchenData,
    appKitchenData
  )

  return {
    kitchenSlug: scope.kitchenSlug,
    kitchenName: identity.name,
    pageStyle: identity.page_style,
  }
})
