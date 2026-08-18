import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseHeaders,
} from 'h3'
import { updateKitchenPublicIdentity } from '../../../kitchen/identity/public-identity.ts'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return updateKitchenPublicIdentity(
    event,
    String(getRouterParam(event, 'slug') ?? ''),
    await readBody(event)
  )
})
