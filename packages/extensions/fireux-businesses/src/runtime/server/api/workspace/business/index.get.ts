import { readBusinessWorkspace } from '../../../../business/server/workspace'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readBusinessWorkspace(event)
})
