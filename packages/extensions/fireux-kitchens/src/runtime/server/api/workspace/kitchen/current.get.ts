import { defineEventHandler, getQuery, setResponseHeaders } from 'h3'
import { readKitchenWorkspaceCurrent } from '../../../../kitchen/server/core/workspace'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const response = await readKitchenWorkspaceCurrent(
    event,
    String(query.kitchen_id || '').trim()
  )
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
