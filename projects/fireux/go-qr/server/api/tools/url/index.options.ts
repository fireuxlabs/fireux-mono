import { defineEventHandler, setResponseStatus } from 'h3'
import { setToolProviderResponseHeaders } from 'fireux-core/runtime/server/utils/tool-provider'

export default defineEventHandler((event) => {
  setToolProviderResponseHeaders(event)
  setResponseStatus(event, 204)
  return null
})
