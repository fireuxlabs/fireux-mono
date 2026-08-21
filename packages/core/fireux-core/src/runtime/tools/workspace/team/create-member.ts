import { defineFireuxPrimitive } from '../../types'

export const workspaceTeamMemberCreatePrimitive = defineFireuxPrimitive({
  kind: 'primitive',
  id: 'workspace.team.create-member',
  family: 'workspace.team',
  name: 'Add a member',
  description: 'Add a named person to this Workspace Team.',
  problem: 'A Workspace Team needs to include another named person.',
  searchIntents: [
    { phrase: 'add a team member', kind: 'problem', status: 'hypothesis' },
    { phrase: 'create team member', kind: 'solution', status: 'hypothesis' },
    { phrase: 'team member management', kind: 'product', status: 'hypothesis' },
  ],
  input: {
    required: ['name'],
    extensible: true,
  },
  result: {
    kind: 'TeamMember',
  },
  execution: {
    environment: 'server',
    authorization: 'required',
    confirmation: 'required',
  },
  surfaces: { human: true, ai: true },
  ai: {
    baked: {
      purpose: 'Add one named person to an authorized Workspace Team.',
      knows: [
        'The proposed member name and the owning package specialization.',
      ],
      constraints: [
        'Do not infer Workspace access, create a User or bypass the owning package executor.',
      ],
      evidence: ['Return the created Team member identity.'],
    },
    runtime: {
      accepted: true,
      required: ['workspaceSelection', 'name'],
      optional: ['domainMemberFields', 'userRequest'],
    },
  },
  implementation: {
    importPath: 'fireux-core/runtime/tools/workspace/team/create-member',
    exports: ['workspaceTeamMemberCreatePrimitive'],
  },
  documentation: {
    slug: 'team-create-member',
    guide:
      'Workspace Entity packages specialize this primitive with their own member fields, permissions, confirmation policy and trusted executor.',
    seoDescription:
      'Create Team members consistently across FireUX Workspace Entities using the shared Workspace Team capability primitive.',
    example: `const projectCreateMember = {
  primitive: workspaceTeamMemberCreatePrimitive.id,
  id: 'project.team.create-member',
  fields: ['name', 'responsibility'],
}`,
  },
})
