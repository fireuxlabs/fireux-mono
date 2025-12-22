import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import {
  agentConfig,
  type AgentProfile,
} from '../../../../../../models/profiles/Agent/Agent.model'

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
