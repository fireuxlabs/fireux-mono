import { completeBusinessOnboarding } from '../../../../business/server/create'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return completeBusinessOnboarding(event, await readBody(event))
})
