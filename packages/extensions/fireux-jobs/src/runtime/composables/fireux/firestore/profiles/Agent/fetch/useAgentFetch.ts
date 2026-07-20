// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: replace raw Agent/User collection reads with the bounded API.
import { usePublicProfileCollection } from 'fireux-core/runtime/composables/fireux/public/profile/usePublicProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import type { Agent } from '../../../../../../models/profiles/Agent/Agent.model'

// Agent profiles for UI use. Public identity joins canonical User by profile uid.
export function useAgentFetch() {
  const {
    profiles,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  } = usePublicProfileCollection<Agent>({ collection: 'agents' })

  const coreAgents = profiles
  const appAgents = computed<Agent[]>(() => [])
  const { byId: coreAgent } = useCollectionById(coreAgents)
  const { byId: appAgent } = useCollectionById(appAgents)

  return {
    coreAgents,
    appAgents,
    coreAgent,
    appAgent,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  }
}
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: expose canonical User hydration for Agent rows.
