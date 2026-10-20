import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { propertyContext } from '../../../../property/server/context'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return propertyContext(event, getQuery(event))
})
