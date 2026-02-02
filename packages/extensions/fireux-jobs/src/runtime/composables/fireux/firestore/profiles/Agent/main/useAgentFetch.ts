import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { computed } from 'vue'
import {
  agentConfig,
  type AgentCore,
} from '../../../../../../models/profiles/Agent/Agent.model'

// Hydrated (user-attached) agent profiles for UI use.
export function useAgentFetch() {
  const { globalProfilesWithUser, localProfilesWithUser } =
    useProfileCollection<AgentCore>(agentConfig)

  const globalProfilesHydrated = globalProfilesWithUser
  const localProfilesHydrated = localProfilesWithUser

  const globalAgents = computed(() => globalProfilesHydrated.value ?? [])
  const localAgents = computed(() => localProfilesHydrated?.value ?? [])

  const pending = computed(() =>
    globalProfilesHydrated.value === undefined ||
    localProfilesHydrated?.value === undefined
  )

  return {
    globalAgents,
    localAgents,
    pending,
  }
}
