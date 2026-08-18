import type { H3Event } from 'h3'
import { kitchenTeamMemberUpdateTool as definition } from '../../../../tools/kitchen/team'
import {
  updateKitchenTeamMembers,
  type KitchenTeamMemberUpdate,
} from '../update'

export const kitchenTeamMemberUpdateExecutor = {
  definition,
  execute(
    event: H3Event,
    input: { kitchenId: string; updates: KitchenTeamMemberUpdate[] }
  ) {
    return updateKitchenTeamMembers(event, input)
  },
} as const
