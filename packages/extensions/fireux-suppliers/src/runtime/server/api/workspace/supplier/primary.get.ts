import { defineEventHandler, setResponseHeaders } from 'h3'
import { readSupplierWorkspacePrimary } from '../../../../supplier/server/index/workspace'

export default defineEventHandler(async (event) => {
  const response = await readSupplierWorkspacePrimary(event)
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
