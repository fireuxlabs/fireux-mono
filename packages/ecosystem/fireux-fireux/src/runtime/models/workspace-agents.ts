import {
  advisoryAgentCapabilities,
  defineFireuxAgentNode,
  defineFireuxWorkspaceAgent,
  defineFireuxOperationAgent,
  identityAgentCapabilities,
} from 'fireux-ai/runtime/models/agents/operation-agent'
import { projectAgentCapabilities } from 'fireux-fireux/runtime/project/models/agent-capabilities'

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

const projectCapabilityAgents = projectAgentCapabilities.map((capability) =>
  defineFireuxOperationAgent({
    id: `project.${capability.slug}.ai`,
    name: capability.name,
    parentId: 'ProjectAI',
    workspaceId: 'project',
    operationId: `project.${capability.slug}`,
    operationSlug: capability.slug,
    ...('family' in capability ? { family: capability.family } : {}),
    contextProviders: [
      {
        id: `project.${capability.slug}.context`,
        owner: 'Project',
        required: capability.slug === 'identity',
      },
    ],
    capabilities:
      capability.slug === 'identity'
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
    operationAgents: projectCapabilityAgents,
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
