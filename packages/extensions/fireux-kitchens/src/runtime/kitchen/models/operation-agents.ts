import {
  advisoryAgentCapabilities,
  defineFireuxOperationAgent,
  identityAgentCapabilities,
  type FireuxAgentContextProvider,
  type FireuxOperationAgentCapability,
} from 'fireux-ai/runtime/agents/operation-agent'
import { kitchenOperations } from './operations'
import { kitchenTeamAgentToolIds } from '../tools/team'

type KitchenOperationSlug = (typeof kitchenOperations)[number]['slug']
type KitchenAgentCapabilitySlug = KitchenOperationSlug | 'identity' | 'team'

const kitchenAgentCapabilitySlugs = [
  'identity',
  ...kitchenOperations.map((operation) => operation.slug),
  'team',
] as const satisfies readonly KitchenAgentCapabilitySlug[]

const context = (
  id: string,
  owner: string,
  required = false
): FireuxAgentContextProvider => ({ id, owner, required })

const definitions = {
  identity: {
    name: 'KitchenIdentityAI',
    family: 'identity',
    contextProviders: [
      context('kitchen.identity', 'Kitchen', true),
      context('place.identity', 'Place', true),
      context('app-kitchen.workspace', 'AppKitchen', true),
    ],
    capabilities: identityAgentCapabilities,
  },
  dishes: {
    name: 'DishesAI',
    contextProviders: [context('kitchen.dishes', 'Kitchen')],
  },
  drinks: {
    name: 'DrinksAI',
    contextProviders: [context('kitchen.drinks', 'Kitchen')],
  },
  ingredients: {
    name: 'IngredientsAI',
    contextProviders: [context('kitchen.ingredients', 'Kitchen')],
  },
  menus: {
    name: 'MenuAI',
    contextProviders: [
      context('kitchen.menus', 'Kitchen'),
      context('menus.context', 'AppKitchen'),
    ],
  },
  mise: {
    name: 'MiseAI',
    contextProviders: [context('kitchen.mise', 'Kitchen')],
  },
  orders: {
    name: 'OrdersAI',
    contextProviders: [context('kitchen.orders', 'Kitchen')],
  },
  recipes: {
    name: 'RecipesAI',
    contextProviders: [context('kitchen.recipes', 'Kitchen')],
  },
  stations: {
    name: 'StationsAI',
    contextProviders: [context('kitchen.stations', 'Kitchen')],
  },
  team: {
    name: 'TeamAI',
    instruction:
      'Help the operator understand and manage the selected Kitchen team using only the registered Team tools and authorized Team records.',
    contextProviders: [context('kitchen.team', 'AppKitchen')],
    capabilities: [...advisoryAgentCapabilities, 'use_tools'],
    toolIds: kitchenTeamAgentToolIds,
  },
  suppliers: {
    name: 'KitchenSuppliersAI',
    contextProviders: [context('kitchen.suppliers', 'Kitchen')],
  },
  tables: {
    name: 'TablesAI',
    contextProviders: [context('kitchen.tables', 'AppKitchen')],
  },
  finance: {
    name: 'FinanceAI',
    contextProviders: [context('kitchen.finance', 'Kitchen')],
    capabilities: [...advisoryAgentCapabilities, 'use_tools'],
    toolIds: ['kitchen.finance.calculate-labour-cost'],
  },
} as const satisfies Record<
  KitchenAgentCapabilitySlug,
  {
    name: string
    family?: string
    instruction?: string
    contextProviders: readonly FireuxAgentContextProvider[]
    capabilities?: readonly FireuxOperationAgentCapability[]
    toolIds?: readonly string[]
  }
>

export const kitchenOperationAgents = kitchenAgentCapabilitySlugs.map(
  (slug) => {
    const definition = definitions[slug]
    return defineFireuxOperationAgent({
      id: `kitchen.${slug}.ai`,
      name: definition.name,
      parentId: 'KitchenAI',
      workspaceId: 'kitchen',
      operationId: `kitchen.${slug}`,
      operationSlug: slug,
      ...('family' in definition ? { family: definition.family } : {}),
      ...('instruction' in definition
        ? { instruction: definition.instruction }
        : {}),
      contextProviders: definition.contextProviders,
      capabilities:
        'capabilities' in definition
          ? definition.capabilities
          : advisoryAgentCapabilities,
      toolIds: 'toolIds' in definition ? definition.toolIds : [],
      execution: 'shared-inference',
    })
  }
)
