import {
  advisoryAgentCapabilities,
  defineFireuxOperationAgent,
  identityAgentCapabilities,
  type FireuxAgentContextProvider,
} from 'fireux-ai/runtime/models/agents/operation-agent'
import { portfolioCapabilities } from './capabilities'

const names = {
  identity: 'PortfolioIdentityAI',
  properties: 'PortfolioPropertiesAI',
  compliance: 'PortfolioComplianceAI',
  documents: 'PortfolioDocumentsAI',
  tasks: 'PortfolioTasksAI',
  finance: 'PortfolioFinanceAI',
  team: 'PortfolioTeamAI',
} as const

const portfolioAgentCapabilitySlugs = [
  'identity',
  ...portfolioCapabilities.map((operation) => operation.slug),
  'team',
] as const

const context = (id: string, required = false): FireuxAgentContextProvider => ({
  id,
  owner: 'Portfolio',
  required,
})

export const portfolioCapabilityAgents = portfolioAgentCapabilitySlugs.map(
  (slug) => {
    const identity = slug === 'identity'
    const operationId = `portfolio.${slug}`
    return defineFireuxOperationAgent({
      id: `${operationId}.ai`,
      name: names[slug as keyof typeof names],
      parentId: 'PortfolioAI',
      workspaceId: 'portfolio',
      operationId,
      operationSlug: slug,
      ...(identity ? { family: 'identity' } : {}),
      contextProviders: [context(`${operationId}.context`, identity)],
      capabilities: identity
        ? identityAgentCapabilities
        : advisoryAgentCapabilities,
      toolIds: [],
      execution: 'shared-inference',
    })
  }
)
