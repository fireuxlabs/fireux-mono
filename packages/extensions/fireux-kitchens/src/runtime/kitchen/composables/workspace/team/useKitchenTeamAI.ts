import { computed, onMounted, ref, watch } from 'vue'
import { useState } from '#imports'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { kitchenOperationAgents } from '../../../models/operation-agents'
import { kitchenTeamAgentTools } from '../../../tools/team'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useKitchenTeamAITools } from './useKitchenTeamAITools'
import { useKitchenWorkspaceTeam } from './useKitchenWorkspaceTeam'

const capabilityFingerprint = kitchenTeamAgentTools
  .map((tool) =>
    JSON.stringify({
      id: tool.id,
      context: tool.context,
      inputSchema: tool.inputSchema,
      confirmation: tool.confirmation,
    })
  )
  .join('|')

const startingPrompts = [
  'Who is on my Kitchen Team?',
  'Add a Team member',
  'How do Team invitations work?',
]

export function useKitchenTeamAI() {
  const agent = kitchenOperationAgents.find(
    (candidate) => candidate.operationSlug === 'team'
  )
  if (!agent) throw new Error('Kitchen TeamAI is not registered.')

  const aiTools = useKitchenTeamAITools()
  const kitchenWorkspace = useKitchenWorkspace()
  const { kitchenId, teamMembers, pending, readOnly } =
    useKitchenWorkspaceTeam()
  const promptSuggestions = ref<string[]>(startingPrompts)
  const suggestionCache = useState<Record<string, string[]>>(
    'kitchen-team-ai-suggestions',
    () => ({})
  )
  const suggestionKey = computed(() => {
    if (!kitchenId.value || pending.value || readOnly.value) return ''
    const memberState = teamMembers.value
      .map((member) => `${member.id}:${member.name}:${member.user_id}`)
      .sort()
      .join('|')
    return [
      kitchenWorkspace.runtime.appId.value,
      kitchenId.value,
      capabilityFingerprint,
      memberState,
    ].join('::')
  })
  let requestVersion = 0

  const loadPromptSuggestions = async () => {
    if (import.meta.server) return
    const key = suggestionKey.value
    if (!key) {
      promptSuggestions.value = startingPrompts
      return
    }
    if (suggestionCache.value[key]) {
      promptSuggestions.value = suggestionCache.value[key]
      return
    }
    const version = ++requestVersion
    try {
      const user = await useRequireUser()
      const token = await user.getIdToken()
      const response = await $fetch<{ ok: true; suggestions: string[] }>(
        '/api/workspace/kitchen/agent/suggestions',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            appId: kitchenWorkspace.runtime.appId.value,
            kitchenId: kitchenId.value,
            operation: 'team',
          },
        }
      )
      if (version !== requestVersion || key !== suggestionKey.value) return
      suggestionCache.value[key] = response.suggestions
      promptSuggestions.value = response.suggestions
    } catch {
      if (version === requestVersion) promptSuggestions.value = startingPrompts
    }
  }

  watch(suggestionKey, () => void loadPromptSuggestions())
  onMounted(() => void loadPromptSuggestions())

  return {
    agent,
    agentLabel: 'Team AI',
    contextIcon: 'i-lucide-users',
    title: 'Work with your Team',
    description: 'Ask about the people working with this Kitchen.',
    placeholder: 'Ask about your Team…',
    aiTools,
    get promptSuggestions() {
      return promptSuggestions.value
    },
  }
}
