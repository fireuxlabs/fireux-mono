import {
  advisoryAgentCapabilities,
  defineFireuxAgentNode,
} from 'fireux-ai/runtime/models/agents/operation-agent'
import { kitchenWorkspaceAgent } from 'fireux-kitchens/runtime/kitchen/models/workspace-agent'

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
  { ...kitchenWorkspaceAgent, parentId: 'MiseboxAI' },
] as const
