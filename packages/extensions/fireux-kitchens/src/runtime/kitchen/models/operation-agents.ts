import {
  advisoryAgentCapabilities,
  defineFireuxOperationAgent,
  identityAgentCapabilities,
  type FireuxAgentContextProvider,
  type FireuxOperationAgentCapability,
} from 'fireux-ai/runtime/models/agents/operation-agent'
import { kitchenOperations } from './operations'
import { kitchenOperationToolCapabilities } from './operation-capabilities'
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
    maturity: 'connected',
    contextProviders: [context('kitchen.dishes', 'Kitchen')],
  },
  drinks: {
    name: 'DrinksAI',
    maturity: 'connected',
    contextProviders: [
      context('kitchen.drinks', 'Kitchen'),
      context('kitchen.recipes', 'Recipes'),
      context('kitchen.ingredients', 'Ingredients'),
      context('kitchen.inventory', 'Inventory'),
      context('kitchen.menus', 'Menus'),
      context('kitchen.finance', 'Finance'),
    ],
  },
  ingredients: {
    name: 'IngredientsAI',
    maturity: 'connected',
    contextProviders: [context('kitchen.ingredients', 'Kitchen')],
  },
  'food-safety': {
    name: 'FoodSafetyAI',
    maturity: 'connected',
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
  orders: {
    name: 'OrdersAI',
    maturity: 'connected',
    contextProviders: [context('kitchen.orders', 'Kitchen')],
  },
  inventory: {
    name: 'InventoryAI',
    maturity: 'connected',
    contextProviders: [context('kitchen.inventory', 'Kitchen')],
  },
  purchasing: {
    name: 'PurchasingAI',
    maturity: 'connected',
    contextProviders: [context('kitchen.purchasing', 'Kitchen')],
  },
  receiving: {
    name: 'ReceivingAI',
    maturity: 'connected',
    contextProviders: [context('kitchen.receiving', 'Kitchen')],
  },
  waste: {
    name: 'WasteAI',
    maturity: 'connected',
    contextProviders: [context('kitchen.waste', 'Kitchen')],
  },
  recipes: {
    name: 'RecipesAI',
    maturity: 'connected',
    contextProviders: [context('kitchen.recipes', 'Kitchen')],
  },
  stations: {
    name: 'StationsAI',
    maturity: 'connected',
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
    capabilities: advisoryAgentCapabilities,
    toolIds: [],
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
      toolCatalogue: kitchenOperationToolCapabilities[slug],
      maturity: 'maturity' in definition ? definition.maturity : 'handshake',
      execution: 'shared-inference',
    })
  }
)
