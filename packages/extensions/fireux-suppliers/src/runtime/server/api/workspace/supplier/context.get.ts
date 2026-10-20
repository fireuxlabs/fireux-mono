import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { supplierContext } from '../../../../supplier/server/context'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return supplierContext(event, getQuery(event))
})
