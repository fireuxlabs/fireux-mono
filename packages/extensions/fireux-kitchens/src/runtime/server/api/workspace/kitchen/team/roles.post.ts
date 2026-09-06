import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { kitchenRoles } from '../../../../../kitchen/server/team/roles'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const body = await readBody(event)
  return kitchenRoles(event, { ...body, kitchenId: body?.workspaceId })
})
