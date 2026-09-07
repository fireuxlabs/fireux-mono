import { defineEventHandler, getQuery, getRouterParam } from 'h3'
import { deleteSupplierTeamMember } from '../../../../../../supplier/server/team/delete.ts'

export default defineEventHandler((event) =>
  deleteSupplierTeamMember(event, {
    supplierId: String(getQuery(event).supplierId || ''),
    memberId: getRouterParam(event, 'memberId') || '',
  })
)
