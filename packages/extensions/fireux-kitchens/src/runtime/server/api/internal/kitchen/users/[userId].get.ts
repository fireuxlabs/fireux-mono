import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam, setResponseHeaders } from 'h3'
import { readKitchenUserMemberships } from '../../../../../kitchen/server/core/user-memberships'

export default defineLiveReadHandler(async (event) => {
  const response = await readKitchenUserMemberships(event, {
    userId: getRouterParam(event, 'userId') || '',
  })
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
