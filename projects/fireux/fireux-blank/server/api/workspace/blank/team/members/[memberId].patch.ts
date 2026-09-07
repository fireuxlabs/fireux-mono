import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateBlankTeamMember } from '../../../../../utils/blank/team/update.ts'

export default defineEventHandler(async (event) =>
  updateBlankTeamMember(event, {
    ...(await readBody(event)),
    memberId: getRouterParam(event, 'memberId') || '',
  })
)
