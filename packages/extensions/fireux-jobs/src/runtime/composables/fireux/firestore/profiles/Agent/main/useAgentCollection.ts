import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import {
  agentConfig,
  type AgentCore,
} from '../../../../../../models/profiles/Agent/Agent.model'

export function useAgentCollection() {
  const {
    globalProfiles,
    localProfiles,
    globalProfilesWithUser,
    localProfilesWithUser,
  } = useProfileCollection<AgentCore>(agentConfig)

  return {
    globalAgents: globalProfilesWithUser,
    localAgents: localProfilesWithUser,
    rawGlobalAgents: globalProfiles,
    rawLocalAgents: localProfiles,
  }
}
