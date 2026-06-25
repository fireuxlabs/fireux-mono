// Profile family canon: docs/concepts/entities.md
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserCreate'
import { customerConfig } from '../config/customerConfig'

export function useCustomerCreate() {
  const { createUser } = useUserCreate()
  const { createProfile } = useProfileCreate(customerConfig)

  async function createCustomerProfile(): Promise<{
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

  return { createCustomerProfile }
}
