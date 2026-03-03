import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { computed } from 'vue'
import { agentConfig } from '../config/agentConfig'
import type { AgentCore } from '../../../../../../models/profiles/Agent/Agent.model'

// Hydrated (user-attached) agent profiles for UI use.
export function useAgentFetch() {
  const { globalProfilesWithUser, localProfilesWithUser } =
    useProfileCollection<AgentCore>(agentConfig)

  const coreAgentsHydrated = globalProfilesWithUser
  const appAgentsHydrated = localProfilesWithUser

  const coreAgents = computed(() => coreAgentsHydrated.value ?? [])
  const appAgents = computed(() => appAgentsHydrated?.value ?? [])

  const pending = computed(() =>
    coreAgentsHydrated.value === undefined ||
    appAgentsHydrated?.value === undefined
  )

  return {
    coreAgents,
    appAgents,
    pending,
  }
}
