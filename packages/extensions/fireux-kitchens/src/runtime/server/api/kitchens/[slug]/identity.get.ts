import { defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { readKitchenPublicIdentity } from '../../../../kitchen/server/identity/public-identity.ts'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return readKitchenPublicIdentity(
    event,
    String(getRouterParam(event, 'slug') ?? '')
  )
})
