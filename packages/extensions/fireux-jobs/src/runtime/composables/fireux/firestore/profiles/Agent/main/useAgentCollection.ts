import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import {
  agentConfig,
  type AgentCore,
} from '../../../../../../models/profiles/Agent/Agent.model'

export function useAgentCollection() {
  const {
    globalProfiles,
    localProfiles,
  } = useProfileCollection<AgentCore>(agentConfig)

  return {
    coreAgents: globalProfiles,
    appAgents: localProfiles,
  }
}
