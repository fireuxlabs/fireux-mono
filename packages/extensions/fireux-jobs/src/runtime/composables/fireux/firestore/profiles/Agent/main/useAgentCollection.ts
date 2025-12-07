import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/collection/useProfileCollection.ts'
import {
  agentConfig,
  type AgentProfile,
} from '../../../../../../models/profiles/Agent.model.ts'

export function useAgentCollection() {
  const {
    globalProfiles,
    localProfiles,
    globalProfilesWithUser,
    localProfilesWithUser,
  } = useProfileCollection<AgentProfile>(agentConfig)

  return {
    globalAgents: globalProfilesWithUser,
    localAgents: localProfilesWithUser,
    rawGlobalAgents: globalProfiles,
    rawLocalAgents: localProfiles,
  }
}
