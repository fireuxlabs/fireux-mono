// Concurrent edit — 2026-07-20 18:06 CEST — Repo Efficiency Pass 2 of 6: call the self-only Agent provisioner without a target.
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserBootstrap } from 'fireux-core/runtime/user/composables/useUserBootstrap'
import { agentConfig } from '../config/agentConfig'

export function useAgentCreate() {
  const { createUser } = useUserBootstrap()
  const { createProfile } = useProfileCreate(agentConfig)

  async function createAgentProfile(): Promise<{
    createdProfile: boolean
    createdAppState: boolean
    id: string
  }> {
    const user = await createUser()
    const profile = await createProfile()

    return {
      createdProfile: profile.createdProfile,
      createdAppState: profile.createdAppState,
      id: user.id,
    }
  }

  return { createAgentProfile }
}
