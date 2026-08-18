import { defineKitchenTeamTool } from './types'

export const kitchenTeamMemberInvitationCreateTool = defineKitchenTeamTool({
  id: 'kitchen.team.create-invitation',
  mode: 'write',
  risk: 'write',
  confirmation: 'required',
  context: {
    target: 'KitchenTeamMember',
    instruction:
      'Create a one-use, seven-day invitation for an existing unlinked Team member.',
    outcome: 'Returns a copyable invitation link for the selected member.',
    constraints: ['The member must not already be linked to a User.'],
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
      group: 'create',
      label: 'Create an invitation',
      description: 'Create a one-use link for an unlinked member.',
      icon: 'i-lucide-link',
    },
    agent: { callable: true },
  },
  result: {
    kind: 'share-link',
    primaryAction: 'copy',
    label: 'Copy invitation link',
  },
})
