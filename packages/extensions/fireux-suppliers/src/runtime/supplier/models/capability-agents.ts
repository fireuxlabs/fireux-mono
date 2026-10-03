import {
  advisoryAgentCapabilities,
  defineFireuxOperationAgent,
  identityAgentCapabilities,
  type FireuxAgentContextProvider,
  type FireuxOperationAgentCapability,
} from 'fireux-ai/runtime/models/agents/operation-agent'
import { supplierCapabilities } from './capabilities'

type SupplierCapabilitySlug = (typeof supplierCapabilities)[number]['slug']
type SupplierAgentCapabilitySlug = SupplierCapabilitySlug | 'identity' | 'team'

const supplierAgentCapabilitySlugs = [
  'identity',
  ...supplierCapabilities.map((operation) => operation.slug),
  'team',
] as const satisfies readonly SupplierAgentCapabilitySlug[]

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
    contextProviders: [context('supplier.team', 'Supplier')],
  },
} as const satisfies Record<
  SupplierAgentCapabilitySlug,
  {
    name: string
    family?: string
    contextProviders: readonly FireuxAgentContextProvider[]
    capabilities?: readonly FireuxOperationAgentCapability[]
  }
>

export const supplierCapabilityAgents = supplierAgentCapabilitySlugs.map(
  (slug) => {
    const definition = definitions[slug as keyof typeof definitions]
    return defineFireuxOperationAgent({
      id: `supplier.${slug}.ai`,
      name: definition.name,
      parentId: 'SupplierAI',
      workspaceId: 'supplier',
      operationId: `supplier.${slug}`,
      operationSlug: slug,
      ...('family' in definition ? { family: definition.family } : {}),
      contextProviders: definition.contextProviders,
      capabilities:
        'capabilities' in definition
          ? definition.capabilities
          : advisoryAgentCapabilities,
      toolIds: [],
      execution: 'shared-inference',
    })
  }
)
