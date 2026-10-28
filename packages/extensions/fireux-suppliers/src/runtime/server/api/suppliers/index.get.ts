import { defineEventHandler, setResponseHeader, setResponseHeaders } from 'h3'

import { readSuppliers } from '../../../supplier/server/identity/read.ts'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  return readSuppliers()
})
