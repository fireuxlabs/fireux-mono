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
      context('kitchen.workspace', 'Kitchen', true),
    ],
    capabilities: identityAgentCapabilities,
  },
  dishes: {
    name: 'DishesAI',
    contextProviders: [context('kitchen.dishes', 'Kitchen')],
  },
  drinks: {
    name: 'DrinksAI',
    maturity: 'connected',
    contextProviders: [context('kitchen.drinks', 'Kitchen')],
  },
  ingredients: {
    name: 'IngredientsAI',
    contextProviders: [context('kitchen.ingredients', 'Kitchen')],
  },
  'food-safety': {
    name: 'FoodSafetyAI',
    contextProviders: [context('kitchen.food-safety', 'Kitchen')],
  },
  menus: {
    name: 'MenuAI',
    maturity: 'connected',
    contextProviders: [
      context('kitchen.menus', 'Kitchen'),
      context('menus.context', 'Kitchen'),
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
  inventory: {
    name: 'InventoryAI',
    contextProviders: [context('kitchen.inventory', 'Kitchen')],
  },
  purchasing: {
    name: 'PurchasingAI',
    contextProviders: [context('kitchen.purchasing', 'Kitchen')],
  },
  receiving: {
    name: 'ReceivingAI',
    contextProviders: [context('kitchen.receiving', 'Kitchen')],
  },
  waste: {
    name: 'WasteAI',
    contextProviders: [context('kitchen.waste', 'Kitchen')],
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
    maturity: 'connected',
    instruction:
      'Help the operator understand and manage the selected Kitchen team using only the registered Team tools and authorized Team records.',
    contextProviders: [context('kitchen.team', 'Kitchen')],
    capabilities: [...advisoryAgentCapabilities, 'use_tools'],
    toolIds: kitchenTeamAgentToolIds,
  },
  suppliers: {
    name: 'KitchenSuppliersAI',
    contextProviders: [context('kitchen.suppliers', 'Kitchen')],
  },
  finance: {
    name: 'FinanceAI',
    contextProviders: [context('kitchen.finance', 'Kitchen')],
    capabilities: [...advisoryAgentCapabilities, 'use_tools'],
    toolIds: ['kitchen.finance.calculate-labour-cost'],
  },
  costs: {
    name: 'CostsAI',
    contextProviders: [context('kitchen.costs', 'Kitchen')],
  },
  'waste-report': {
    name: 'WasteReportAI',
    contextProviders: [context('kitchen.waste-report', 'Kitchen')],
  },
  performance: {
    name: 'PerformanceAI',
    contextProviders: [context('kitchen.performance', 'Kitchen')],
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
    maturity?: 'handshake' | 'connected' | 'complete'
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
      maturity:
        'maturity' in definition ? definition.maturity : 'handshake',
      execution: 'shared-inference',
    })
  }
)
