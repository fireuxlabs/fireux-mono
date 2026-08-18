import {
  advisoryAgentCapabilities,
  defineFireuxOperationAgent,
  identityAgentCapabilities,
  type FireuxAgentContextProvider,
  type FireuxOperationAgentCapability,
} from 'fireux-ai/runtime/agents/operation-agent'
import { kitchenOperations } from '../content/operations'

type KitchenOperationSlug = (typeof kitchenOperations)[number]['slug']

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
      context('app-kitchen.console', 'AppKitchen', true),
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
    contextProviders: [context('kitchen.team', 'AppKitchen')],
    capabilities: [...advisoryAgentCapabilities, 'use_tools'],
    toolIds: [
      'kitchen.team.add-member',
      'kitchen.member.create-invitation',
      'kitchen.team.update-member',
    ],
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
  KitchenOperationSlug,
  {
    name: string
    family?: string
    contextProviders: readonly FireuxAgentContextProvider[]
    capabilities?: readonly FireuxOperationAgentCapability[]
    toolIds?: readonly string[]
  }
>

export const kitchenOperationAgents = kitchenOperations.map((operation) => {
  const definition = definitions[operation.slug]
  return defineFireuxOperationAgent({
    id: `${operation.id}.ai`,
    name: definition.name,
    parentId: 'KitchenAI',
    consoleId: operation.console.id,
    operationId: operation.id,
    operationSlug: operation.slug,
    ...('family' in definition ? { family: definition.family } : {}),
    contextProviders: definition.contextProviders,
    capabilities:
      'capabilities' in definition
        ? definition.capabilities
        : advisoryAgentCapabilities,
    toolIds: 'toolIds' in definition ? definition.toolIds : [],
    execution: 'shared-inference',
  })
})
