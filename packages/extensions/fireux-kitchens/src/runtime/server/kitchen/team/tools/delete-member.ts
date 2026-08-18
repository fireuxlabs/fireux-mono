import type { H3Event } from 'h3'
import { kitchenTeamMemberDeleteTool as definition } from '../../../../tools/kitchen/team'
import { deleteKitchenTeamMember } from '../delete'

export const kitchenTeamMemberDeleteExecutor = {
  definition,
  execute(event: H3Event, input: { kitchenId: string; memberId: string }) {
    return deleteKitchenTeamMember(event, input)
  },
} as const
