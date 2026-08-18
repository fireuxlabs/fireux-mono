import { defineKitchenTeamTool } from './types'

export const kitchenTeamMemberDeleteTool = defineKitchenTeamTool({
  id: 'kitchen.team.delete-member',
  mode: 'write',
  risk: 'destructive',
  confirmation: 'required',
  context: {
    target: 'KitchenTeamMember',
    instruction:
      'Delete an existing unlinked Kitchen Team member and revoke pending invitations.',
    outcome: 'Permanently removes the unlinked member from the selected Team.',
    constraints: ['A member linked to a User cannot be deleted by this tool.'],
  },
  inputSchema: {
    type: 'object',
    properties: {
      memberId: { type: 'string', minLength: 1 },
    },
    required: ['memberId'],
    additionalProperties: false,
  },
  surfaces: {
    human: {
      placement: 'toolbar',
      group: 'update',
      label: 'Delete a member',
      description: 'Delete an unlinked member and revoke pending invitations.',
      icon: 'i-lucide-user-minus',
    },
    agent: { callable: true },
  },
  result: { kind: 'mutation' },
})
