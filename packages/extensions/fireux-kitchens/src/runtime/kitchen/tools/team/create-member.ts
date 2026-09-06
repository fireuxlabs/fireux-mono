import { defineKitchenTeamTool } from './types'
import { workspaceTeamMemberCreatePrimitive } from 'fireux-core/runtime/tools/workspace/team/create-member'

export const kitchenTeamMemberCreateTool = defineKitchenTeamTool({
  id: 'kitchen.team.create-member',
  primitive: workspaceTeamMemberCreatePrimitive.id,
  mode: 'write',
  risk: 'write',
  confirmation: 'required',
  context: {
    target: 'WorkspaceTeamMemberDocument',
    instruction:
      'Create a named Kitchen Team member who is not yet linked to a User.',
    outcome: 'Creates one active member in the selected Kitchen Team.',
    constraints: [
      'Does not create or link a User.',
      'Does not grant Workspace access.',
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
  ai: {
    baked: {
      purpose: 'Add one named person to the selected Kitchen Team.',
      knows: ['The selected Kitchen and user-supplied member details.'],
      constraints: [
        'Do not create or link a User.',
        'Do not grant Workspace access.',
        'Use only the supplied name.',
      ],
      evidence: ['Return the created member identity and stored fields.'],
    },
    runtime: {
      accepted: true,
      required: ['workspaceSelection', 'name'],
      optional: ['userRequest'],
    },
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
