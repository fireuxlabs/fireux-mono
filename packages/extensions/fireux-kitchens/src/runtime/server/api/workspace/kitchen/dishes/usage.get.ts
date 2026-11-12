import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readKitchenItemUsage } from '../../../../../kitchen/server/items/read-usage'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const query = getQuery(event)
  return readKitchenItemUsage(event, {
    kitchenId: query.kitchenId,
    dishId: query.dishId,
  })
})
