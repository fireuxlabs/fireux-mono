import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { createRequest } from '../../menu-express/intake'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return createRequest(event, await readBody(event))
})
