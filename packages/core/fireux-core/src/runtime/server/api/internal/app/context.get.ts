import { defineEventHandler, setResponseHeaders } from 'h3'
import { readCurrentAppContext } from '../../../../app/server/context/read'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return readCurrentAppContext(event)
})
