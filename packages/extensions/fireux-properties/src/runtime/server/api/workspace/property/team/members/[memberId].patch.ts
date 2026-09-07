import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updatePropertyTeamMember } from '../../../../../../property/server/team/update.ts'

export default defineEventHandler(async (event) =>
  updatePropertyTeamMember(event, {
    ...(await readBody(event)),
    memberId: getRouterParam(event, 'memberId') || '',
  })
)
