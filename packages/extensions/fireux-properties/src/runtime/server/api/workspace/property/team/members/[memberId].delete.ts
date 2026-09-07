import { defineEventHandler, getQuery, getRouterParam } from 'h3'
import { deletePropertyTeamMember } from '../../../../../../property/server/team/delete.ts'

export default defineEventHandler((event) =>
  deletePropertyTeamMember(event, {
    propertyId: String(getQuery(event).propertyId || ''),
    memberId: getRouterParam(event, 'memberId') || '',
  })
)
