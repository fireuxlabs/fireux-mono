import { useRouter } from 'vue-router'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { agentConfig } from '../../../../../../models/profiles/Agent/Agent.model'

export function useAgentCreate() {
  const { ensure } = useProfileEnsure(agentConfig)
  const router = useRouter()

  const createAgent = async () => {
    const result = await ensure()
    if (import.meta.client) router.push('/dashboard/agent/profile')
    return result
  }

  return { createAgent }
}
