import { defineEventHandler, setResponseHeaders } from 'h3'
import { readPublicSupplierIndex } from '../../../supplier/server/identity/public-projection.ts'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })
  return readPublicSupplierIndex()
})
