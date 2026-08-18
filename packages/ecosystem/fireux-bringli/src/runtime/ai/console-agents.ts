import {
  advisoryAgentCapabilities,
  defineFireuxAgentNode,
  defineFireuxConsoleAgent,
} from 'fireux-ai/runtime/agents/operation-agent'
import { supplierOperationAgents } from 'fireux-suppliers/runtime/supplier/ai/operation-agents'

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

export const bringliConsoleAgents = [
  defineFireuxConsoleAgent({
    id: 'bringli.supplier.ai',
    name: 'SupplierAI',
    parentId: 'BringliAI',
    consoleId: 'supplier',
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
    operationAgents: supplierOperationAgents,
  }),
] as const
