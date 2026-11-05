import { updateBusiness } from '../../../../business/server/update'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return updateBusiness(event, await readBody(event))
})
