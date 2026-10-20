import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { propertyContext } from '../../../../property/server/context'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return propertyContext(event, await readBody(event), true)
})
