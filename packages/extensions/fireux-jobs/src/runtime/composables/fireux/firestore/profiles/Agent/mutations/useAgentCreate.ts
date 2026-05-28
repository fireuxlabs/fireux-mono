import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserCreate'
import { agentConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Agent/config/agentConfig'

export function useAgentCreate() {
  const { createUser } = useUserCreate()
  const { createProfile } = useProfileCreate(agentConfig)

  async function createAgentProfile(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    const user = await createUser()
    const profile = await createProfile(user.id)

    return {
      createdCore: profile.createdCore,
      createdApp: profile.createdApp,
      id: user.id,
    }
  }

  return { createAgentProfile }
}
