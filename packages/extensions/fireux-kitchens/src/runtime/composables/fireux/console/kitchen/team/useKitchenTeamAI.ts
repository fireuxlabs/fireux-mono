import { kitchenOperationAgents } from '../../../../../ai/operation-agents'
import {
  kitchenTeamAgentTools,
  type KitchenTeamToolSuggestion,
} from '../../../../../tools/kitchen/team'
import { useKitchenTeamAITools } from './useKitchenTeamAITools'
import { useKitchenConsoleTeam } from './useKitchenConsoleTeam'

const memberName = (member: { name?: string; display_name?: string }) =>
  String(member.display_name || member.name || '').trim()

const titleCase = (value: string) =>
  value.replace(/\b\p{L}/gu, (character) => character.toLocaleUpperCase())

const fillRequestTemplate = (
  template: string,
  values: Record<string, string>
) =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template
  )

type NamedMember = {
  member: { user_id?: string }
  name: string
}

const suggestionText = (
  suggestion: KitchenTeamToolSuggestion,
  members: NamedMember[]
) => {
  if (suggestion.strategy === 'never') return null
  if (suggestion.strategy === 'example' || suggestion.strategy === 'collection') {
    return suggestion.text
  }

  if (suggestion.strategy === 'eligible-record') {
    const member = members.find(({ member }) => !member.user_id)
    return member
      ? fillRequestTemplate(suggestion.template, {
          existingTeamMemberName: member.name,
        })
      : null
  }

  const casing = members.find(({ name }) => titleCase(name) !== name)
  const member = casing || members[0]
  if (!member) return null

  return fillRequestTemplate(suggestion.template, {
    existingTeamMemberName: member.name,
    updatedTeamMemberName: casing ? titleCase(casing.name) : 'a new name',
  })
}

export function useKitchenTeamAI() {
  const agent = kitchenOperationAgents.find(
    (candidate) => candidate.operationSlug === 'team'
  )

  if (!agent) {
    throw new Error('Kitchen TeamAI is not registered.')
  }

  const aiTools = useKitchenTeamAITools()
  const { teamMembers } = useKitchenConsoleTeam()

  const promptSuggestions = () => {
    const members = teamMembers.value
      .map((member) => ({ member, name: memberName(member) }))
      .filter(({ name }) => Boolean(name))
    return [
      ...kitchenTeamAgentTools
        .map((tool) => suggestionText(tool.surfaces.agent.suggestion, members))
        .filter((suggestion): suggestion is string => Boolean(suggestion)),
      'What can I do with my Team?',
    ]
  }

  return {
    agent,
    agentLabel: 'Team AI',
    contextIcon: 'i-lucide-users',
    title: 'Work with your Team',
    description: 'Ask about the people working with this Kitchen.',
    aiTools,
    get promptSuggestions() {
      return promptSuggestions()
    },
  }
}
