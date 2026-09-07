import { defineEventHandler, getQuery, getRouterParam } from 'h3'
import { deleteBlankTeamMember } from '../../../../../utils/blank/team/delete.ts'

export default defineEventHandler((event) =>
  deleteBlankTeamMember(event, {
    blankId: String(getQuery(event).blankId || ''),
    memberId: getRouterParam(event, 'memberId') || '',
  })
)
