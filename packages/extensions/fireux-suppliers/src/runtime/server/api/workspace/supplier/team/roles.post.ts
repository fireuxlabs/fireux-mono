import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { supplierRoles } from '../../../../../supplier/server/team/roles'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const body = await readBody(event)
  return supplierRoles(event, { ...body, supplierId: body?.workspaceId })
})
