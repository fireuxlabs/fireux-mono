import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { blankRoles } from '../../../../utils/blank/team/roles'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const body = await readBody(event)
  return blankRoles(event, { ...body, blankId: body?.workspaceId })
})
