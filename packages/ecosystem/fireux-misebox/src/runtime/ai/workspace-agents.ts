import {
  advisoryAgentCapabilities,
  defineFireuxAgentNode,
  defineFireuxWorkspaceAgent,
  findFireuxOperationAgent,
} from 'fireux-ai/runtime/models/agents/operation-agent'
import { kitchenCapabilityAgents } from 'fireux-kitchens/runtime/kitchen/models/capability-agents'

export const miseboxAgent = defineFireuxAgentNode({
  id: 'misebox.ai',
  name: 'MiseboxAI',
  parentId: 'CoreAI',
  kind: 'ecosystem',
  contextProviders: [
    { id: 'user.context', owner: 'User', required: false },
    { id: 'misebox.context', owner: 'Ecosystem', required: false },
  ],
  capabilities: advisoryAgentCapabilities,
  toolIds: [],
  execution: 'shared-inference',
})

export const miseboxWorkspaceAgents = [
  defineFireuxWorkspaceAgent({
    id: 'misebox.kitchen.ai',
    name: 'KitchenAI',
    parentId: 'MiseboxAI',
    workspaceId: 'kitchen',
    entityTarget: {
      kind: 'Kitchen',
      idParam: 'kitchenId',
      selection: 'required',
      authority: 'kitchen-writer',
    },
    contextProviders: [
      { id: 'user.context', owner: 'User', required: false },
      { id: 'kitchen.identity', owner: 'Kitchen', required: true },
      { id: 'kitchen.context', owner: 'Kitchen', required: false },
    ],
    operationAgents: kitchenCapabilityAgents,
  }),
] as const

export function findMiseboxWorkspaceAgent(workspaceId: string) {
  return miseboxWorkspaceAgents.find(
    (agent) => agent.workspaceId === workspaceId
  )
}

export function findMiseboxOperationAgent(
  workspaceId: string,
  operationSlug: string
) {
  const coordinator = findMiseboxWorkspaceAgent(workspaceId)
  return coordinator
    ? findFireuxOperationAgent(coordinator, operationSlug)
    : undefined
}
