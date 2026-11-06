import {
  defineFireuxWorkspaceAgent,
  findFireuxOperationAgent,
} from 'fireux-ai/runtime/models/agents/operation-agent'
import { kitchenCapabilityAgents } from './capability-agents'

export const kitchenWorkspaceAgent = defineFireuxWorkspaceAgent({
  id: 'kitchen.ai',
  name: 'KitchenAI',
  parentId: 'CoreAI',
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
})

export function findKitchenOperationAgent(operationSlug: string) {
  return findFireuxOperationAgent(kitchenWorkspaceAgent, operationSlug)
}
