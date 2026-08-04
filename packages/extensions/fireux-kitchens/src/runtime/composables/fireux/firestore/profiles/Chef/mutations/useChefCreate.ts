// Concurrent edit — 2026-07-20 18:06 CEST — Repo Efficiency Pass 2 of 6: call the self-only Chef provisioner without a target.
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserCreate'
import { chefConfig } from '../config/chefConfig'

export function useChefCreate() {
  const { createUser } = useUserCreate()
  const { createProfile } = useProfileCreate(chefConfig)

  async function createChefProfile(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    const user = await createUser()
    const profile = await createProfile()

    return {
      createdCore: profile.createdCore,
      createdApp: profile.createdApp,
      id: user.id,
    }
  }

  return { createChefProfile }
}
