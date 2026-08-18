import type { H3Event } from 'h3'
import { deleteKitchenTeamMember } from './delete.ts'

export const deleteKitchenTeamMemberTool = {
  id: 'kitchen.team.delete-member',
  mode: 'write',
  confirmation: 'required',
  description:
    'Delete an unlinked Kitchen Team member and revoke pending invitations.',
} as const

export const executeDeleteKitchenTeamMemberTool = (
  event: H3Event,
  input: { kitchenId: string; memberId: string }
) => deleteKitchenTeamMember(event, input)
