import { defineKitchenTeamTool } from './types'

export const kitchenTeamMemberDeleteTool = defineKitchenTeamTool({
  id: 'kitchen.team.delete-member',
  mode: 'write',
  risk: 'write',
  confirmation: 'required',
  context: {
    target: 'KitchenTeamMember',
    instruction:
      'Deactivate an existing Kitchen Team member, revoke pending invitations and remove linked software access.',
    outcome:
      'Preserves the member record and operational history while ending active Team access.',
    constraints: ['The Kitchen owner cannot be deactivated by this tool.'],
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
        'Deactivate a member while preserving their Kitchen Team history.',
      knows: ['The selected Kitchen, selected member and current link state.'],
      constraints: [
        'Revoke linked access without deleting the historical member record.',
        'Do not deactivate the Kitchen owner.',
        'Do not proceed without explicit confirmation.',
      ],
      evidence: [
        'Return the deactivated member identity and access-revocation outcome.',
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
      label: 'Deactivate a member',
      description: 'End access while preserving the Team member’s history.',
      icon: 'i-lucide-user-minus',
    },
    agent: { callable: true },
  },
  result: { kind: 'mutation' },
})
