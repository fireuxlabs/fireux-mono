import { defineEventHandler, readBody } from 'h3'
import { createKitchenMemberInvitation } from '../../../../../kitchen/server/team/member-invitation.ts'

export default defineEventHandler(async (event) =>
  createKitchenMemberInvitation(event, await readBody(event))
)
