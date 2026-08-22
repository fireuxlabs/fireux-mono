import { defineEventHandler, setResponseHeaders } from 'h3'
import { loadAppSearchDemand } from '../../../../config/app/search-demand'

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  return {
    ok: true,
    demand: loadAppSearchDemand(),
  }
})
