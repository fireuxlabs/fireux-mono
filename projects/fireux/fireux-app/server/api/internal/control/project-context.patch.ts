import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { projectContext } from 'fireux-projects/runtime/project/server/context'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return projectContext(event, await readBody(event), true)
})
