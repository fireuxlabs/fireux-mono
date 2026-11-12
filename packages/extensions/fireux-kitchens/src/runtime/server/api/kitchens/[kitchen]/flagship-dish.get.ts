import {
  defineEventHandler,
  setResponseHeader,
  getRouterParam,
  getQuery,
} from 'h3'

import { readKitchenFlagshipItem } from '../../../../kitchen/server/items/flagship-projection'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  return readKitchenFlagshipItem(
    getQuery(event).appId,
    getRouterParam(event, 'kitchen')
  )
})
