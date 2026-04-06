import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { resolvePublicAppInfo } from '../../../utils/public-app-content'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  return await resolvePublicAppInfo()
})
