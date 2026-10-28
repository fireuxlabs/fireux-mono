import {
  defineEventHandler,
  setResponseHeader,
  getRouterParam,
  setResponseHeaders,
} from 'h3'

import { readKitchenUserMemberships } from '../../../../../kitchen/server/core/user-memberships'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const response = await readKitchenUserMemberships(event, {
    userId: getRouterParam(event, 'userId') || '',
  })
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  return response
})
