// Profile family canon: docs/concepts/entities.md
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserCreate'
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
    const profile = await createProfile(user.id)

    return {
      createdCore: profile.createdCore,
      createdApp: profile.createdApp,
      id: user.id,
    }
  }

  return { createDriverProfile }
}
