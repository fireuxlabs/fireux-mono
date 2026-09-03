import { kitchenTeamMemberCreateExecutor } from './create-member'
import { kitchenTeamMemberInvitationCreateExecutor } from './create-member-invitation'
import { kitchenTeamMemberDeleteExecutor } from './delete-member'
import { kitchenTeamMembersDeactivateExecutor } from './deactivate-members'
import { kitchenTeamMembersReadExecutor } from './read-members'
import { kitchenTeamMemberUpdateExecutor } from './update-member'
import type { KitchenTeamServerTool } from './types'

export const kitchenTeamServerToolRegistry = {
  [kitchenTeamMemberCreateExecutor.definition.id]:
    kitchenTeamMemberCreateExecutor,
  [kitchenTeamMembersReadExecutor.definition.id]:
    kitchenTeamMembersReadExecutor,
  [kitchenTeamMemberUpdateExecutor.definition.id]:
    kitchenTeamMemberUpdateExecutor,
  [kitchenTeamMemberDeleteExecutor.definition.id]:
    kitchenTeamMemberDeleteExecutor,
  [kitchenTeamMembersDeactivateExecutor.definition.id]:
    kitchenTeamMembersDeactivateExecutor,
  [kitchenTeamMemberInvitationCreateExecutor.definition.id]:
    kitchenTeamMemberInvitationCreateExecutor,
} as const

export function findKitchenTeamServerTool(id: string) {
  return (
    kitchenTeamServerToolRegistry as Record<
      string,
      KitchenTeamServerTool | undefined
    >
  )[id]
}
