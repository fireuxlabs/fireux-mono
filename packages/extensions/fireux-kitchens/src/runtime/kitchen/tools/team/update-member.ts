import { defineKitchenTeamTool } from './types'

export const kitchenTeamMemberUpdateTool = defineKitchenTeamTool({
  id: 'kitchen.team.update-member',
  mode: 'write',
  risk: 'write',
  confirmation: 'required',
  context: {
    target: 'KitchenTeamMember',
    instruction:
      'Update the name, job title or access role of an existing Kitchen Team member.',
    outcome:
      'Preserves member identity while updating the supported name, job title or access role.',
    constraints: [
      'Access roles are member and operator. Job titles are free text and never grant access.',
      'Only the Kitchen owner may grant operator access.',
      'The owner role cannot be changed here.',
    ],
  },
  inputSchema: {
    type: 'object',
    properties: {
      updates: {
        type: 'array',
        minItems: 1,
        maxItems: 200,
        items: {
          type: 'object',
          properties: {
            memberId: { type: 'string', minLength: 1 },
            changes: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 1, maxLength: 120 },
                role: { type: 'string', enum: ['member', 'operator'] },
                jobTitle: {
                  type: 'string',
                  maxLength: 120,
                  description:
                    'Optional descriptive title. Empty clears; omitted preserves. Never changes access.',
                },
              },
              required: ['name'],
              additionalProperties: false,
            },
          },
          required: ['memberId', 'changes'],
          additionalProperties: false,
        },
      },
    },
    required: ['updates'],
    additionalProperties: false,
  },
  ai: {
    baked: {
      purpose:
        'Update the supported name, job title and access-role fields for selected Kitchen Team members.',
      knows: [
        'The selected Kitchen, current member identities and proposed names.',
      ],
      constraints: [
        'Only member and operator access roles are supported; job titles are free text.',
        'Only the Kitchen owner may grant operator access.',
        'Do not replace member identity or infer additional profile changes.',
      ],
      evidence: [
        'Return which member identities were updated and their resulting names.',
      ],
    },
    runtime: {
      accepted: true,
      required: ['workspaceSelection', 'memberUpdates'],
      optional: ['userRequest'],
    },
  },
  surfaces: {
    human: {
      placement: 'toolbar',
      group: 'update',
      label: 'Update a member',
      description: 'Update a selected Team member.',
      icon: 'i-lucide-user-pen',
    },
    agent: { callable: true },
  },
  result: { kind: 'mutation' },
})
