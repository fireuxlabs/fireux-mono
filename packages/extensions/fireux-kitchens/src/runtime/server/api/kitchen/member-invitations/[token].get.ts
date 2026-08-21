import { defineEventHandler, getRouterParam } from 'h3'
import { inspectKitchenMemberInvitation } from '../../../../kitchen/server/team/member-invitation.ts'

export default defineEventHandler((event) =>
  inspectKitchenMemberInvitation(event, getRouterParam(event, 'token'))
)
