import { kitchenTeamMemberCreateExecutor } from './create-member'
import { kitchenTeamMemberInvitationCreateExecutor } from './create-member-invitation'
import { kitchenTeamMemberDeleteExecutor } from './delete-member'
import { kitchenTeamMembersReadExecutor } from './read-members'
import { kitchenTeamMemberUpdateExecutor } from './update-member'

export const kitchenTeamServerToolRegistry = {
  [kitchenTeamMemberCreateExecutor.definition.id]:
    kitchenTeamMemberCreateExecutor,
  [kitchenTeamMembersReadExecutor.definition.id]: kitchenTeamMembersReadExecutor,
  [kitchenTeamMemberUpdateExecutor.definition.id]:
    kitchenTeamMemberUpdateExecutor,
  [kitchenTeamMemberDeleteExecutor.definition.id]:
    kitchenTeamMemberDeleteExecutor,
  [kitchenTeamMemberInvitationCreateExecutor.definition.id]:
    kitchenTeamMemberInvitationCreateExecutor,
} as const
