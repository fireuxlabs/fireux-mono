import type { H3Event } from 'h3'
import { kitchenTeamMembersReadTool as definition } from '../../../../tools/kitchen/team'
import { readKitchenTeamMembers } from '../read'

export const kitchenTeamMembersReadExecutor = {
  definition,
  execute(event: H3Event, input: { kitchenId: string }) {
    return readKitchenTeamMembers(event, input)
  },
} as const
