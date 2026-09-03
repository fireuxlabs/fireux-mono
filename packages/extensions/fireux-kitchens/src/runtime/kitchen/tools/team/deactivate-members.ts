import { defineKitchenTeamTool } from './types'

export const kitchenTeamMembersDeactivateTool = defineKitchenTeamTool({
  id: 'kitchen.team.deactivate-members',
  mode: 'write',
  risk: 'destructive',
  confirmation: 'required',
  context: {
    target: 'KitchenTeamMemberCollection',
    instruction:
      'Deactivate several existing Kitchen Team members while preserving explicitly named people.',
    outcome:
      'Preserves each affected member record and operational history while ending active Team access.',
    constraints: [
      'The Kitchen owner cannot be deactivated.',
      'Every affected member must be shown before confirmation.',
    ],
  },
  inputSchema: {
    type: 'object',
    properties: {
      memberIds: {
        type: 'array',
        minItems: 1,
        maxItems: 50,
        uniqueItems: true,
        items: { type: 'string', minLength: 1 },
      },
    },
    required: ['memberIds'],
    additionalProperties: false,
  },
  ai: {
    baked: {
      purpose:
        'Deactivate multiple Team members from one explicit, confirmed request.',
      knows: ['The selected Kitchen and its current Team members.'],
      constraints: [
        'Never include the Kitchen owner.',
        'Resolve every preserved name before preparing the action.',
        'Do not proceed without explicit confirmation.',
      ],
      evidence: ['Return the affected member names and access outcome.'],
    },
    runtime: {
      accepted: true,
      required: ['workspaceSelection', 'humanConfirmation'],
      optional: ['userRequest'],
    },
  },
  surfaces: {
    human: false,
    agent: { callable: true },
  },
  result: { kind: 'mutation' },
})
