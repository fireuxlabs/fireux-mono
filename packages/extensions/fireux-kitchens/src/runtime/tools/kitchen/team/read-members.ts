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
  surfaces: {
    human: false,
    agent: {
      enabled: true,
      suggestion: {
        strategy: 'collection',
        text: 'Who is currently on my Team?',
      },
    },
  },
  result: { kind: 'collection' },
})
