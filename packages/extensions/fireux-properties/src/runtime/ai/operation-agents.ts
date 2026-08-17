import {
  advisoryAgentCapabilities,
  defineFireuxOperationAgent,
  identityAgentCapabilities,
  type FireuxAgentContextProvider,
} from 'fireux-ai/runtime/agents/operation-agent'
import { portfolioOperations, propertyOperations } from '../content/operations'

const context = (
  id: string,
  owner: string,
  required = false
): FireuxAgentContextProvider => ({ id, owner, required })

const portfolioNames = {
  identity: 'PortfolioIdentityAI',
  properties: 'PortfolioPropertiesAI',
  compliance: 'PortfolioComplianceAI',
  documents: 'PortfolioDocumentsAI',
  tasks: 'PortfolioTasksAI',
  finance: 'PortfolioFinanceAI',
  team: 'PortfolioTeamAI',
} as const

const propertyNames = {
  identity: 'PropertyIdentityAI',
  reservations: 'PropertyReservationsAI',
  calendar: 'PropertyCalendarAI',
  team: 'PropertyTeamAI',
} as const

function operationAgent(
  operation: (typeof portfolioOperations)[number] | (typeof propertyOperations)[number],
  parentId: 'PortfolioAI' | 'PropertyAI',
  name: string,
  owner: 'Portfolio' | 'Property'
) {
  const identity = operation.slug === 'identity'
  return defineFireuxOperationAgent({
    id: `${operation.id}.ai`,
    name,
    parentId,
    consoleId: operation.console.id,
    operationId: operation.id,
    operationSlug: operation.slug,
    ...(identity ? { family: 'identity' } : {}),
    contextProviders: [
      context(`${operation.id}.context`, owner, identity),
    ],
    capabilities: identity
      ? identityAgentCapabilities
      : advisoryAgentCapabilities,
    toolIds: [],
    execution: 'shared-inference',
  })
}

export const portfolioOperationAgents = portfolioOperations.map((operation) =>
  operationAgent(
    operation,
    'PortfolioAI',
    portfolioNames[operation.slug as keyof typeof portfolioNames],
    'Portfolio'
  )
)

export const propertyOperationAgents = propertyOperations.map((operation) =>
  operationAgent(
    operation,
    'PropertyAI',
    propertyNames[operation.slug as keyof typeof propertyNames],
    'Property'
  )
)
