import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { agentConfig } from '../config/agentConfig'
import type { Agent } from '../../../../../../models/profiles/Agent/Agent.model'

export function useAgentCollection() {
  const {
    globalProfiles,
    localProfiles,
  } = useProfileCollection<Agent>(agentConfig)

  return {
    coreAgents: globalProfiles,
    appAgents: localProfiles,
  }
}
