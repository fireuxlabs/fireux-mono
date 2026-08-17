import { getRouterParam } from 'h3'
import { acceptKitchenMemberInvitation } from '../../../kitchen/team/member-invitation.ts'

export default defineEventHandler((event) =>
  acceptKitchenMemberInvitation(event, getRouterParam(event, 'token'))
)
