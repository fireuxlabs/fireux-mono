import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { interpretProject } from '../../../../project/server/intent'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return interpretProject(event, await readBody(event))
})
