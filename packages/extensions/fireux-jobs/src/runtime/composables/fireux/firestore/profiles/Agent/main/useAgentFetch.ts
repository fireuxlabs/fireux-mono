import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import { agentConfig } from '../config/agentConfig'
import type { Agent } from '../../../../../../models/profiles/Agent/Agent.model'

// Hydrated (user-attached) agent profiles for UI use.
export function useAgentFetch() {
  const { globalProfilesWithUser, localProfilesWithUser } =
    useProfileCollection<Agent>(agentConfig)

  const coreAgentsHydrated = globalProfilesWithUser
  const appAgentsHydrated = localProfilesWithUser

  const coreAgents = computed(() => coreAgentsHydrated.value ?? [])
  const appAgents = computed(() => appAgentsHydrated?.value ?? [])
  const { byId: coreAgent } = useCollectionById(coreAgents)
  const { byId: appAgent } = useCollectionById(appAgents)

  const pending = computed(() =>
    coreAgentsHydrated.value === undefined ||
    Boolean(appAgentsHydrated && appAgentsHydrated.value === undefined)
  )

  return {
    coreAgents,
    appAgents,
    coreAgent,
    appAgent,
    pending,
  }
}
