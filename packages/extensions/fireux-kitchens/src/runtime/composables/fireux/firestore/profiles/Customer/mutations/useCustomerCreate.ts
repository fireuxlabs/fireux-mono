// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: initialize Customer details in app scope only.
// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-20 18:06 CEST — Repo Efficiency Pass 2 of 6: create the complete Customer record through the self-only provisioner.
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
    const profile = await createProfile()

    return {
      createdCore: profile.createdCore,
      createdApp: profile.createdApp,
      id: user.id,
    }
  }

  return { createCustomerProfile }
}
