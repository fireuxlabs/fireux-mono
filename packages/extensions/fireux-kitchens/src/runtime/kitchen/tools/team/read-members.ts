import { defineKitchenTeamTool } from './types'

export const kitchenTeamMembersReadTool = defineKitchenTeamTool({
  id: 'kitchen.team.read-members',
  mode: 'read',
  risk: 'read',
  confirmation: 'none',
  context: {
    target: 'KitchenTeamMemberCollection',
    instruction: 'Read the current authorized Kitchen Team member collection.',
    outcome: 'Returns the current bounded Team member list.',
  },
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  ai: {
    baked: {
      purpose:
        'Read the authorized member collection for the selected Kitchen Team.',
      knows: ['Only the selected Kitchen and its authorized Team member rows.'],
      constraints: [
        'Do not infer unrecorded skills, availability, access or employment facts.',
      ],
      evidence: [
        'Return the bounded Team member collection used by later deductions.',
      ],
    },
    runtime: {
      accepted: true,
      required: ['workspaceSelection'],
      optional: ['memberSelection', 'userRequest'],
    },
  },
  surfaces: {
    human: false,
    agent: { callable: true },
  },
  result: { kind: 'collection' },
})
