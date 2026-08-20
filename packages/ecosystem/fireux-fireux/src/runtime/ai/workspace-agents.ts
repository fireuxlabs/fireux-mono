import {
  advisoryAgentCapabilities,
  defineFireuxAgentNode,
  defineFireuxWorkspaceAgent,
  defineFireuxOperationAgent,
  identityAgentCapabilities,
} from 'fireux-ai/runtime/agents/operation-agent'
import { projectAgentOperations } from 'fireux-core/runtime/project/models/agent-operations'

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

const projectOperationAgents = projectAgentOperations.map((operation) =>
  defineFireuxOperationAgent({
    id: `project.${operation.slug}.ai`,
    name: operation.name,
    parentId: 'ProjectAI',
    workspaceId: 'project',
    operationId: `project.${operation.slug}`,
    operationSlug: operation.slug,
    ...('family' in operation ? { family: operation.family } : {}),
    contextProviders: [
      {
        id: `project.${operation.slug}.context`,
        owner: 'Project',
        required: operation.slug === 'identity',
      },
    ],
    capabilities:
      operation.slug === 'identity'
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
  workspaceId: 'blank',
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

export const fireuxWorkspaceAgents = [
  defineFireuxWorkspaceAgent({
    id: 'fireux.project.ai',
    name: 'ProjectAI',
    parentId: 'FireUXAI',
    workspaceId: 'project',
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
  defineFireuxWorkspaceAgent({
    id: 'fireux.blank.ai',
    name: 'BlankAI',
    parentId: 'FireUXAI',
    workspaceId: 'blank',
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
