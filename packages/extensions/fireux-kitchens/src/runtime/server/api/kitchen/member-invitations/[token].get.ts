import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam } from 'h3'
import { inspectKitchenMemberInvitation } from '../../../../kitchen/server/team/member-invitation.ts'

export default defineLiveReadHandler((event) =>
  inspectKitchenMemberInvitation(event, getRouterParam(event, 'token'))
)
