import { defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { readPublicSupplierDetail } from '../../../supplier/public-projection.ts'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })
  return readPublicSupplierDetail(getRouterParam(event, 'id'))
})
