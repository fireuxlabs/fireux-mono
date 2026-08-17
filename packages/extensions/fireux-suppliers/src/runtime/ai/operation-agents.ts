import {
  advisoryAgentCapabilities,
  defineFireuxOperationAgent,
  identityAgentCapabilities,
  type FireuxAgentContextProvider,
  type FireuxOperationAgentCapability,
} from 'fireux-ai/runtime/agents/operation-agent'
import { supplierOperations } from '../content/operations'

type SupplierOperationSlug = (typeof supplierOperations)[number]['slug']

const context = (
  id: string,
  owner: string,
  required = false
): FireuxAgentContextProvider => ({ id, owner, required })

const definitions = {
  identity: {
    name: 'SupplierIdentityAI',
    family: 'identity',
    contextProviders: [
      context('supplier.identity', 'Supplier', true),
      context('company.identity', 'Company', true),
      context('place.identity', 'Place', true),
    ],
    capabilities: identityAgentCapabilities,
  },
  catalogue: {
    name: 'CatalogueAI',
    contextProviders: [context('supplier.catalogue', 'Supplier')],
  },
  ingredients: {
    name: 'SupplierIngredientsAI',
    contextProviders: [context('supplier.ingredients', 'Supplier')],
  },
  items: {
    name: 'SupplierItemsAI',
    contextProviders: [context('supplier.items', 'Supplier')],
  },
  team: {
    name: 'SupplierTeamAI',
    contextProviders: [context('supplier.team', 'AppSupplier')],
  },
} as const satisfies Record<
  SupplierOperationSlug,
  {
    name: string
    family?: string
    contextProviders: readonly FireuxAgentContextProvider[]
    capabilities?: readonly FireuxOperationAgentCapability[]
  }
>

export const supplierOperationAgents = supplierOperations.map((operation) => {
  const definition = definitions[operation.slug]
  return defineFireuxOperationAgent({
    id: `${operation.id}.ai`,
    name: definition.name,
    parentId: 'SupplierAI',
    consoleId: operation.console.id,
    operationId: operation.id,
    operationSlug: operation.slug,
    ...('family' in definition ? { family: definition.family } : {}),
    contextProviders: definition.contextProviders,
    capabilities:
      'capabilities' in definition
        ? definition.capabilities
        : advisoryAgentCapabilities,
    toolIds: [],
    execution: 'shared-inference',
  })
})
