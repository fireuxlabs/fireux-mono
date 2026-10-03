import {
  advisoryAgentCapabilities,
  defineFireuxOperationAgent,
  identityAgentCapabilities,
  type FireuxAgentContextProvider,
} from 'fireux-ai/runtime/models/agents/operation-agent'
import { propertyCapabilities } from './capabilities'

const names = {
  identity: 'PropertyIdentityAI',
  reservations: 'PropertyReservationsAI',
  calendar: 'PropertyCalendarAI',
  team: 'PropertyTeamAI',
} as const

const propertyAgentCapabilitySlugs = [
  'identity',
  ...propertyCapabilities.map((operation) => operation.slug),
  'team',
] as const

const context = (id: string, required = false): FireuxAgentContextProvider => ({
  id,
  owner: 'Property',
  required,
})

export const propertyCapabilityAgents = propertyAgentCapabilitySlugs.map(
  (slug) => {
    const identity = slug === 'identity'
    const operationId = `property.${slug}`
    return defineFireuxOperationAgent({
      id: `${operationId}.ai`,
      name: names[slug as keyof typeof names],
      parentId: 'PropertyAI',
      workspaceId: 'property',
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
