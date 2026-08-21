import { defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { readKitchenIdentityEdit } from '../../../../kitchen/server/identity/identity-edit.ts'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return readKitchenIdentityEdit(
    event,
    String(getRouterParam(event, 'kitchen') ?? '')
  )
})
