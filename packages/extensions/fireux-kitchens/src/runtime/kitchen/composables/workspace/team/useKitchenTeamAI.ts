import { computed, onMounted, ref, watch } from 'vue'
import { useState } from '#imports'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { kitchenCapabilityAgents } from '../../../models/capability-agents'
import { kitchenTeamAgentTools } from '../../../tools/team'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useKitchenTeamAITools } from './useKitchenTeamAITools'
import type { useKitchenWorkspaceTeam } from './useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

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
  'Create a Team member',
  'Read the Kitchen Team',
  'Find and link an existing User',
  'Add an unlinked named person',
]

export function useKitchenTeamAI(
  workspace: () => {
    state: Workspace['state']['value']
    derived: Workspace['derived']['value']
  }
) {
  const agent = kitchenCapabilityAgents.find(
    (candidate) => candidate.operationSlug === 'team'
  )
  if (!agent) throw new Error('Kitchen TeamAI is not registered.')

  const aiTools = useKitchenTeamAITools()
  const kitchenWorkspace = useKitchenWorkspace()
  const fireux = useFireUXConfig()
  const page = computed(workspace)
  const kitchenId = computed(() => page.value.state.kitchen.id)
  const teamMembers = computed(() => page.value.state.team.members)
  const pending = computed(() => page.value.derived.status === 'loading')
  const availableActions = computed(() =>
    page.value.derived.capability.availableActions.map(
      (primitive) =>
        `kitchen.team.${primitive}-member${primitive === 'read' ? 's' : ''}`
    )
  )
  const promptSuggestions = ref<string[]>(startingPrompts)
  const suggestionCache = useState<Record<string, string[]>>(
    'kitchen-team-ai-suggestions',
    () => ({})
  )
  const suggestionKey = computed(() => {
    if (!kitchenId.value || pending.value) return ''
    const memberState = teamMembers.value
      .map((member) => `${member.id}:${member.name}:${member.userId}`)
      .sort()
      .join('|')
    return [
      fireux.appId,
      kitchenId.value,
      capabilityFingerprint,
      memberState,
    ].join('::')
  })
  let requestVersion = 0

  const loadPromptSuggestions = async () => {
    if (import.meta.server || import.meta.dev) return
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
            appId: fireux.appId,
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
    operation: 'team',
    agentLabel: 'Team AI',
    contextIcon: 'i-lucide-users',
    title: 'Work with your Team',
    description: 'Ask about the people working with this Kitchen.',
    placeholder: 'Ask about your Team…',
    aiTools,
    get kitchenId() {
      return kitchenId.value
    },
    get availableActions() {
      return availableActions.value
    },
    get promptSuggestions() {
      return promptSuggestions.value
    },
  }
}
