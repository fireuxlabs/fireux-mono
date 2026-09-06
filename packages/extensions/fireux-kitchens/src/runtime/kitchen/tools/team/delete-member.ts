import { defineKitchenTeamTool } from './types'

export const kitchenTeamMemberDeleteTool = defineKitchenTeamTool({
  id: 'kitchen.team.delete-member',
  mode: 'write',
  risk: 'write',
  confirmation: 'required',
  context: {
    target: 'WorkspaceTeamMemberDocument',
    instruction:
      'Remove an existing Kitchen Team member, revoke pending invitations.',
    outcome:
      'Removes the roster entry and revokes pending invitations.',
    constraints: [],
  },
  inputSchema: {
    type: 'object',
    properties: {
      memberId: { type: 'string', minLength: 1 },
    },
    required: ['memberId'],
    additionalProperties: false,
  },
  ai: {
    baked: {
      purpose:
        'Remove a member from the Kitchen roster.',
      knows: ['The selected Kitchen, selected member and current link state.'],
      constraints: [
        'Keep the linked User account and workspace association unchanged.',
        'Do not proceed without explicit confirmation.',
      ],
      evidence: [
        'Return the removed member identity and removal outcome.',
      ],
    },
    runtime: {
      accepted: true,
      required: ['workspaceSelection', 'memberSelection', 'humanConfirmation'],
      optional: ['userRequest'],
    },
  },
  surfaces: {
    human: {
      placement: 'toolbar',
      group: 'update',
      label: 'Remove a member',
      description: 'Remove this person from the team.',
      icon: 'i-lucide-user-minus',
    },
    agent: { callable: true },
  },
  result: { kind: 'mutation' },
})
