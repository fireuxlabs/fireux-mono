import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readKitchenDishUsage } from '../../../../../kitchen/server/dishes/read-usage'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const query = getQuery(event)
  return readKitchenDishUsage(event, {
    kitchenId: query.kitchenId,
    dishId: query.dishId,
  })
})
