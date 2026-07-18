import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import { agentConfig } from '../config/agentConfig'
import type { Agent } from '../../../../../../models/profiles/Agent/Agent.model'

// Agent profiles for UI use. Public user summaries live on the profile rows.
export function useAgentFetch() {
  const { globalProfiles, localProfiles, pending, error, outcome } =
    useProfileCollection<Agent>(agentConfig)

  const coreAgents = computed(() => globalProfiles.value ?? [])
  const appAgents = computed(() => localProfiles?.value ?? [])
  const { byId: coreAgent } = useCollectionById(coreAgents)
  const { byId: appAgent } = useCollectionById(appAgents)

  return {
    coreAgents,
    appAgents,
    coreAgent,
    appAgent,
    pending,
    error,
    outcome,
  }
}
