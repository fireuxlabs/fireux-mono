import { deleteBusinessTeamMember } from '../../../../../business/server/team/delete'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return deleteBusinessTeamMember(event, await readBody(event))
})
