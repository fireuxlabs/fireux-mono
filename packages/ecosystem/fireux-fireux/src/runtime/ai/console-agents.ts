import {
  advisoryAgentCapabilities,
  defineFireuxAgentNode,
  defineFireuxConsoleAgent,
  defineFireuxOperationAgent,
  identityAgentCapabilities,
} from 'fireux-ai/runtime/agents/operation-agent'

export const fireuxAgent = defineFireuxAgentNode({
  id: 'fireux.ai',
  name: 'FireUXAI',
  parentId: 'CoreAI',
  kind: 'ecosystem',
  contextProviders: [
    { id: 'user.context', owner: 'User', required: false },
    { id: 'fireux.context', owner: 'Ecosystem', required: false },
  ],
  capabilities: advisoryAgentCapabilities,
  toolIds: [],
  execution: 'shared-inference',
})

const projectOperations = [
  ['identity', 'ProjectIdentityAI'],
  ['apps', 'ProjectAppsAI'],
  ['ecosystem', 'ProjectEcosystemAI'],
] as const

const projectOperationAgents = projectOperations.map(([slug, name]) =>
  defineFireuxOperationAgent({
    id: `project.${slug}.ai`,
    name,
    parentId: 'ProjectAI',
    consoleId: 'project',
    operationId: `project.${slug}`,
    operationSlug: slug,
    ...(slug === 'identity' ? { family: 'identity' } : {}),
    contextProviders: [
      {
        id: `project.${slug}.context`,
        owner: 'Project',
        required: slug === 'identity',
      },
    ],
    capabilities:
      slug === 'identity'
        ? identityAgentCapabilities
        : advisoryAgentCapabilities,
    toolIds: [],
    execution: 'shared-inference',
  })
)

const blankIdentityAgent = defineFireuxOperationAgent({
  id: 'blank.identity.ai',
  name: 'BlankIdentityAI',
  parentId: 'BlankAI',
  consoleId: 'blank',
  operationId: 'blank.identity',
  operationSlug: 'identity',
  family: 'identity',
  contextProviders: [
    { id: 'blank.identity.context', owner: 'Blank', required: true },
  ],
  capabilities: identityAgentCapabilities,
  toolIds: [],
  execution: 'shared-inference',
})

export const fireuxConsoleAgents = [
  defineFireuxConsoleAgent({
    id: 'fireux.project.ai',
    name: 'ProjectAI',
    parentId: 'FireUXAI',
    consoleId: 'project',
    entityTarget: {
      kind: 'Project',
      idParam: 'projectId',
      selection: 'required',
      authority: 'project-member',
    },
    contextProviders: [
      { id: 'user.context', owner: 'User', required: false },
      { id: 'project.identity', owner: 'Project', required: true },
      { id: 'project.context', owner: 'Project', required: false },
    ],
    operationAgents: projectOperationAgents,
  }),
  defineFireuxConsoleAgent({
    id: 'fireux.blank.ai',
    name: 'BlankAI',
    parentId: 'FireUXAI',
    consoleId: 'blank',
    entityTarget: {
      kind: 'Blank',
      idParam: 'blankId',
      selection: 'required',
      authority: 'blank-reader',
    },
    contextProviders: [
      { id: 'user.context', owner: 'User', required: false },
      { id: 'blank.identity', owner: 'Blank', required: true },
    ],
    operationAgents: [blankIdentityAgent],
  }),
] as const
