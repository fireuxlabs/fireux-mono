import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { createError, getRouterParam, getQuery } from 'h3'
import { readKitchenFlagshipDish } from '../../../../kitchen/server/operations/dishes/flagship-projection'

export default defineLiveReadHandler(async (event) => {
  const kitchenId = String(getRouterParam(event, 'kitchen') || '').trim()
  const appId = String(getQuery(event).appId || '').trim()
  if (!kitchenId || !appId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen and App identity are required.',
    })
  }
  return readKitchenFlagshipDish(appId, kitchenId)
})
