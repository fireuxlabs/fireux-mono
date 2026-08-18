// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: initialize the server-owned Driver kitchen authorization index empty.
// Concurrent edit — 2026-07-20 18:06 CEST — Repo Efficiency Pass 2 of 6: call the self-only Driver provisioner without a target.
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserCreate } from 'fireux-core/runtime/user/composables/firestore/mutations/useUserCreate'
import { driverConfig } from '../config/driverConfig'

export function useDriverCreate() {
  const { createUser } = useUserCreate()
  const { createProfile } = useProfileCreate(driverConfig)

  async function createDriverProfile(): Promise<{
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

  return { createDriverProfile }
}
