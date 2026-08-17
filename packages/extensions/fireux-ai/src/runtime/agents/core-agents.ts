import {
  advisoryAgentCapabilities,
  defineFireuxAgentNode,
} from './operation-agent'

export const userAgent = defineFireuxAgentNode({
  id: 'core.user.ai',
  name: 'UserAI',
  parentId: 'CoreAI',
  kind: 'user',
  contextProviders: [
    { id: 'user.context', owner: 'User', required: false },
  ],
  capabilities: advisoryAgentCapabilities,
  toolIds: [],
  execution: 'shared-inference',
})

export const coreAgent = defineFireuxAgentNode({
  id: 'core.ai',
  name: 'CoreAI',
  kind: 'core',
  contextProviders: [
    { id: 'user.context', owner: 'User', required: false },
  ],
  capabilities: advisoryAgentCapabilities,
  toolIds: [],
  execution: 'shared-inference',
})
