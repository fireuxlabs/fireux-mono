import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseHeaders,
} from 'h3'
import { updateKitchenIdentity } from '../../../../kitchen/server/identity/identity-edit.ts'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return updateKitchenIdentity(
    event,
    String(getRouterParam(event, 'kitchen') ?? ''),
    await readBody(event)
  )
})
