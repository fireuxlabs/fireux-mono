import { defineEventHandler, setResponseHeaders } from 'h3'
import { readKitchenWorkspaceKitchens } from '../../../../kitchen/server/core/workspace'

export default defineEventHandler(async (event) => {
  const response = await readKitchenWorkspaceKitchens(event)
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
