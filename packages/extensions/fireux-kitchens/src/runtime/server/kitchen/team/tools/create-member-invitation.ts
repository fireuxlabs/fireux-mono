import type { H3Event } from 'h3'
import { kitchenTeamMemberInvitationCreateTool as definition } from '../../../../tools/kitchen/team'
import { createKitchenMemberInvitation } from '../member-invitation'

export const kitchenTeamMemberInvitationCreateExecutor = {
  definition,
  execute(event: H3Event, input: { kitchenId: string; memberId: string }) {
    return createKitchenMemberInvitation(event, input)
  },
} as const
