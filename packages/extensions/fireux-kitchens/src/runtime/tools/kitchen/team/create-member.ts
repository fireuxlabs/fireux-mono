import { defineKitchenTeamTool } from './types'

export const kitchenTeamMemberCreateTool = defineKitchenTeamTool({
  id: 'kitchen.team.create-member',
  mode: 'write',
  risk: 'write',
  confirmation: 'required',
  context: {
    target: 'KitchenTeamMember',
    instruction:
      'Create a named Kitchen Team member who is not yet linked to a User.',
    outcome: 'Creates one active member in the selected Kitchen Team.',
    constraints: [
      'Does not create or link a User.',
      'Does not grant Console access.',
    ],
  },
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 120,
        description: 'The name used to identify the new Team member.',
      },
    },
    required: ['name'],
    additionalProperties: false,
  },
  surfaces: {
    human: {
      placement: 'toolbar',
      group: 'create',
      label: 'Add a member',
      description: 'Add a named person to this Kitchen Team.',
      icon: 'i-lucide-user-plus',
    },
    agent: { callable: true },
  },
  result: { kind: 'object' },
})
