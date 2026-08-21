import { defineEventHandler, getRouterParam } from 'h3'
import { acceptKitchenMemberInvitation } from '../../../../kitchen/server/team/member-invitation.ts'

export default defineEventHandler((event) =>
  acceptKitchenMemberInvitation(event, getRouterParam(event, 'token'))
)
