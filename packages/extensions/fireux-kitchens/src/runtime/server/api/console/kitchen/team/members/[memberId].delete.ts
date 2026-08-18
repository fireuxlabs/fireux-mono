import { defineEventHandler, getQuery, getRouterParam } from 'h3'
import { deleteKitchenTeamMember } from '../../../../../kitchen/team/delete.ts'

export default defineEventHandler(event =>
  deleteKitchenTeamMember(event, {
    kitchenId: String(getQuery(event).kitchenId || ''),
    memberId: getRouterParam(event, 'memberId') || '',
  })
)
