import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { interpretKitchenIdentity } from '../../../../../kitchen/server/identity/intent'
export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return interpretKitchenIdentity(event, await readBody(event))
})
