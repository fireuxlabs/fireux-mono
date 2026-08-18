import { createError, defineEventHandler, getRouterParam } from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import {
  menuKitchenFulfilment,
  readAppMenuKitchenData,
  readMenuKitchenBySlug,
  resolveSourceAppId,
} from '../../../../menu/server/ownership/kitchen-scope.ts'

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

  const kitchen = await readMenuKitchenBySlug(kitchenSlug)
  if (!kitchen) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kitchen not found.',
    })
  }

  const kitchenAppId = resolveSourceAppId(kitchen.data)
  const appKitchenData = await readAppMenuKitchenData(kitchenAppId, kitchen.id)

  return menuKitchenFulfilment(kitchen.data, appKitchenData)
})
