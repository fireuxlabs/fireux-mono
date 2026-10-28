import { defineEventHandler, setResponseHeader, getRouterParam } from 'h3'

import { inspectKitchenMemberInvitation } from '../../../../kitchen/server/team/member-invitation.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return inspectKitchenMemberInvitation(event, getRouterParam(event, 'token'))
})
