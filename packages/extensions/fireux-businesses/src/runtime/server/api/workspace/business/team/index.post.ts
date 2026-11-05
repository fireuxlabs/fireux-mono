import { createBusinessTeamMember } from '../../../../../business/server/team/create'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return createBusinessTeamMember(event, await readBody(event))
})
