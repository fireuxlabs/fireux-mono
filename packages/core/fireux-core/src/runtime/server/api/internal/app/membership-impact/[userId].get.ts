import { defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { readAppUserDeletionImpact } from '../../../../../app/server/membership/deletion-impact'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return readAppUserDeletionImpact(event, getRouterParam(event, 'userId') || '')
})
