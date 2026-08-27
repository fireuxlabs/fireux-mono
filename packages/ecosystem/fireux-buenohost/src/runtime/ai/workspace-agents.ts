import {
  advisoryAgentCapabilities,
  defineFireuxAgentNode,
  defineFireuxWorkspaceAgent,
} from 'fireux-ai/runtime/models/agents/operation-agent'
import { propertyOperationAgents } from 'fireux-properties/runtime/property/models/operation-agents'

export const buenoHostAgent = defineFireuxAgentNode({
  id: 'buenohost.ai',
  name: 'BuenoHostAI',
  parentId: 'CoreAI',
  kind: 'ecosystem',
  contextProviders: [
    { id: 'user.context', owner: 'User', required: false },
    { id: 'buenohost.context', owner: 'Ecosystem', required: false },
  ],
  capabilities: advisoryAgentCapabilities,
  toolIds: [],
  execution: 'shared-inference',
})

export const buenoHostWorkspaceAgents = [
  defineFireuxWorkspaceAgent({
    id: 'buenohost.property.ai',
    name: 'PropertyAI',
    parentId: 'BuenoHostAI',
    workspaceId: 'property',
    entityTarget: {
      kind: 'Property',
      idParam: 'propertyId',
      selection: 'required',
      authority: 'property-writer',
    },
    contextProviders: [
      { id: 'user.context', owner: 'User', required: false },
      { id: 'property.identity', owner: 'Property', required: true },
      { id: 'property.context', owner: 'AppProperty', required: false },
    ],
    operationAgents: propertyOperationAgents,
  }),
] as const
