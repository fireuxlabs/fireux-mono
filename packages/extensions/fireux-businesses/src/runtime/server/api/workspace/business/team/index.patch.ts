import { updateBusinessTeamMember } from '../../../../../business/server/team/update'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return updateBusinessTeamMember(event, await readBody(event))
})
