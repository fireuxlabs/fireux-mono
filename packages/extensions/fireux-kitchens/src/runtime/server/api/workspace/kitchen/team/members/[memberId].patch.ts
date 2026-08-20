import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateKitchenTeamMember } from '../../../../../../kitchen/server/team/update.ts'

export default defineEventHandler(async (event) =>
  updateKitchenTeamMember(event, {
    ...(await readBody(event)),
    memberId: getRouterParam(event, 'memberId') || '',
  })
)
