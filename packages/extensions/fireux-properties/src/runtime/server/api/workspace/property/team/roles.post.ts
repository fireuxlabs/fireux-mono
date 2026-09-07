import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { propertyRoles } from '../../../../../property/server/team/roles'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const body = await readBody(event)
  return propertyRoles(event, { ...body, propertyId: body?.workspaceId })
})
