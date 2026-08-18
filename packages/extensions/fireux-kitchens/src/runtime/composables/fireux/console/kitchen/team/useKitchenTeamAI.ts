import { kitchenOperationAgents } from '../../../../../ai/operation-agents'
import { useKitchenTeamAITools } from './useKitchenTeamAITools'
import { useKitchenTeamTools } from './useKitchenTeamTools'

export function useKitchenTeamAI() {
  const agent = kitchenOperationAgents.find(
    (candidate) => candidate.operationSlug === 'team'
  )

  if (!agent) {
    throw new Error('Kitchen TeamAI is not registered.')
  }

  const tools = useKitchenTeamTools()
  const aiTools = useKitchenTeamAITools()
  const promptSuggestions = [
    'Who is currently on my Team?',
    ...tools.map((tool) => tool.context.requestTemplate),
    'What can I do with my Team?',
  ] as const

  return {
    agent,
    agentLabel: 'Team AI',
    contextIcon: 'i-lucide-users',
    title: 'Work with your Team',
    description: 'Ask about the people working with this Kitchen.',
    aiTools,
    promptSuggestions,
  }
}
