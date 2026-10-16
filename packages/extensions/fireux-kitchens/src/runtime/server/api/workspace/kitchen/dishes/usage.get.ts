import { getQuery } from 'h3'
import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { readKitchenDishUsage } from '../../../../../kitchen/server/dishes/read-usage'

export default defineLiveReadHandler((event) => {
  const query = getQuery(event)
  return readKitchenDishUsage(event, {
    kitchenId: query.kitchenId,
    dishId: query.dishId,
  })
})
