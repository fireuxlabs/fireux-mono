import { computed, onMounted, ref, watch } from 'vue'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { kitchenOperationAgents } from '../../../../../ai/operation-agents'
import { kitchenTeamAgentTools } from '../../../../../tools/kitchen/team'
import { useKitchenConsole } from '../core/useKitchenConsole'
import { useKitchenTeamAITools } from './useKitchenTeamAITools'
import { useKitchenConsoleTeam } from './useKitchenConsoleTeam'

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

export function useKitchenTeamAI() {
  const agent = kitchenOperationAgents.find(
    (candidate) => candidate.operationSlug === 'team'
  )
  if (!agent) throw new Error('Kitchen TeamAI is not registered.')

  const aiTools = useKitchenTeamAITools()
  const kitchenConsole = useKitchenConsole()
  const { kitchenId, teamMembers, pending, readOnly } = useKitchenConsoleTeam()
  const promptSuggestions = ref<string[]>([])
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
      kitchenConsole.runtime.appId.value,
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
      promptSuggestions.value = []
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
        '/api/console/kitchen/agent/suggestions',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            appId: kitchenConsole.runtime.appId.value,
            kitchenId: kitchenId.value,
            operation: 'team',
          },
        }
      )
      if (version !== requestVersion || key !== suggestionKey.value) return
      suggestionCache.value[key] = response.suggestions
      promptSuggestions.value = response.suggestions
    } catch {
      if (version === requestVersion) promptSuggestions.value = []
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
