import {
  advisoryAgentCapabilities,
  defineFireuxAgentNode,
  defineFireuxWorkspaceAgent,
} from 'fireux-ai/runtime/models/agents/operation-agent'
import { supplierCapabilityAgents } from 'fireux-suppliers/runtime/supplier/models/capability-agents'

export const bringliAgent = defineFireuxAgentNode({
  id: 'bringli.ai',
  name: 'BringliAI',
  parentId: 'CoreAI',
  kind: 'ecosystem',
  contextProviders: [
    { id: 'user.context', owner: 'User', required: false },
    { id: 'bringli.context', owner: 'Ecosystem', required: false },
  ],
  capabilities: advisoryAgentCapabilities,
  toolIds: [],
  execution: 'shared-inference',
})

export const bringliWorkspaceAgents = [
  defineFireuxWorkspaceAgent({
    id: 'bringli.supplier.ai',
    name: 'SupplierAI',
    parentId: 'BringliAI',
    workspaceId: 'supplier',
    entityTarget: {
      kind: 'Supplier',
      idParam: 'supplierId',
      selection: 'required',
      authority: 'supplier-writer',
    },
    contextProviders: [
      { id: 'user.context', owner: 'User', required: false },
      { id: 'supplier.identity', owner: 'Supplier', required: true },
      { id: 'company.identity', owner: 'Company', required: true },
      { id: 'place.identity', owner: 'Place', required: true },
    ],
    operationAgents: supplierCapabilityAgents,
  }),
] as const
