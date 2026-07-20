// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: initialize Customer details in app scope only.
// Profile family canon: docs/concepts/entities.md
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserCreate'
import { CustomerPrivateModel } from '../../../../../../models/customer.model'
import { customerConfig } from '../config/customerConfig'
import { useCustomerUpdate } from './useCustomerUpdate'

export function useCustomerCreate() {
  const { createUser } = useUserCreate()
  const { createProfile } = useProfileCreate(customerConfig)
  const { updateAppProfile } = useCustomerUpdate()

  async function createCustomerProfile(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    const user = await createUser()
    const profile = await createProfile(user.id)
    if (profile.createdApp) {
      await updateAppProfile(
        { private: { ...CustomerPrivateModel } },
        { id: user.id }
      )
    }

    return {
      createdCore: profile.createdCore,
      createdApp: profile.createdApp,
      id: user.id,
    }
  }

  return { createCustomerProfile }
}
