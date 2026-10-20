import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { appContext } from '../../../../app/server/context'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return appContext(event, await readBody(event), true)
})
