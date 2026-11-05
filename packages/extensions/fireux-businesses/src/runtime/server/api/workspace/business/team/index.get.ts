import { readBusinessTeamMembers } from '../../../../../business/server/team/read'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readBusinessTeamMembers(event, { businessId: getQuery(event).businessId as string })
})
