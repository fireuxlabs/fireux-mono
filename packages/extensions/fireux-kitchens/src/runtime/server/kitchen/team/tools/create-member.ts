import type { H3Event } from 'h3'
import { kitchenTeamMemberCreateTool as definition } from '../../../../tools/kitchen/team'
import {
  createKitchenTeamMember,
  type CreateKitchenTeamMemberResult,
} from '../create'

export const kitchenTeamMemberCreateExecutor = {
  definition,
  execute(
    event: H3Event,
    input: { kitchenId: string; name: string }
  ): Promise<CreateKitchenTeamMemberResult> {
    return createKitchenTeamMember(event, input)
  },
} as const
