import { defineKitchenTeamTool } from './types'
import { workspaceTeamMemberCreatePrimitive } from 'fireux-core/runtime/tools/workspace/team/create-member'

export const kitchenTeamMemberCreateTool = defineKitchenTeamTool({
  id: 'kitchen.team.create-member',
  primitive: workspaceTeamMemberCreatePrimitive.id,
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
      role: { type: 'string', maxLength: 120 },
      station: { type: 'string', maxLength: 120 },
      certifications: {
        type: 'array',
        maxItems: 20,
        items: { type: 'string', minLength: 1, maxLength: 120 },
      },
      notes: { type: 'string', maxLength: 1000 },
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
        'Do not invent dossier facts that the user did not supply or approve.',
      ],
      evidence: ['Return the created member identity and stored fields.'],
    },
    runtime: {
      accepted: true,
      required: ['workspaceSelection', 'name'],
      optional: ['role', 'station', 'certifications', 'notes', 'userRequest'],
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
