import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateKitchenMember } from '../../../../../kitchen/team/update.ts'

export default defineEventHandler(async (event) =>
  updateKitchenMember(event, {
    ...(await readBody(event)),
    memberId: getRouterParam(event, 'memberId') || '',
  })
)
