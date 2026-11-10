import {
  defineEventHandler,
  setResponseHeader,
  getRouterParam,
  getQuery,
} from 'h3'

import { readKitchenFlagshipDish } from '../../../../kitchen/server/dishes/flagship-projection'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  return readKitchenFlagshipDish(
    getQuery(event).appId,
    getRouterParam(event, 'kitchen')
  )
})
