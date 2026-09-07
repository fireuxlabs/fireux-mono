import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateSupplierTeamMember } from '../../../../../../supplier/server/team/update.ts'

export default defineEventHandler(async (event) =>
  updateSupplierTeamMember(event, {
    ...(await readBody(event)),
    memberId: getRouterParam(event, 'memberId') || '',
  })
)
