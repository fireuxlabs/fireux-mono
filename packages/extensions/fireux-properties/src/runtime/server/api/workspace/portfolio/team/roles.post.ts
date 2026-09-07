import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { portfolioRoles } from '../../../../../portfolio/server/team/roles'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const body = await readBody(event)
  return portfolioRoles(event, { ...body, portfolioId: body?.workspaceId })
})
