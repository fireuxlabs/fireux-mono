import { defineEventHandler, setResponseHeaders } from 'h3'
import { readKitchenWorkspaceTargets } from '../../../../kitchen/server/core/targets'

export default defineEventHandler(async (event) => {
  const response = await readKitchenWorkspaceTargets(event)
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
