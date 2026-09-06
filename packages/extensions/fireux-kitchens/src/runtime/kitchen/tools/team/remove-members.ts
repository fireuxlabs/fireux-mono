import { defineKitchenTeamTool } from './types'

export const kitchenTeamMembersRemoveTool = defineKitchenTeamTool({
  id: 'kitchen.team.remove-members',
  mode: 'write',
  risk: 'destructive',
  confirmation: 'required',
  context: {
    target: 'KitchenTeamMemberCollection',
    instruction:
      'Remove several existing Kitchen Team members while preserving explicitly named people.',
    outcome:
      'Removes each selected roster entry and revokes pending invitations.',
    constraints: [
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
        'Remove multiple Team members from one explicit, confirmed request.',
      knows: ['The selected Kitchen and its current Team members.'],
      constraints: [
        'Resolve every preserved name before preparing the action.',
        'Do not proceed without explicit confirmation.',
      ],
      evidence: ['Return the affected member names and removal outcome.'],
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
