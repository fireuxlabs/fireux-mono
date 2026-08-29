import { defineEventHandler, setResponseHeaders } from 'h3'
import { readKitchenWorkspaceIndex } from '../../../../kitchen/server/core/workspace'

export default defineEventHandler(async (event) => {
  const response = await readKitchenWorkspaceIndex(event)
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
