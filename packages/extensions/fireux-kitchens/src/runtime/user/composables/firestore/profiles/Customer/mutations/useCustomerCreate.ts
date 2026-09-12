// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: initialize Customer details in app scope only.
// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-20 18:06 CEST — Repo Efficiency Pass 2 of 6: create the complete Customer record through the self-only provisioner.
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserBootstrap } from 'fireux-core/runtime/user/composables/useUserBootstrap'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { customerConfig } from '../config/customerConfig'

export function useCustomerCreate() {
  const { bootstrapUser } = useUserBootstrap()
  const { createProfile } = useProfileCreate(customerConfig)

  async function createCustomerProfile(): Promise<{
    createdProfile: boolean
    createdAppState: boolean
    id: string
  }> {
    const actor = await useRequireUser()
    const user = await bootstrapUser(actor)
    const profile = await createProfile(actor)

    return {
      createdProfile: profile.createdProfile,
      createdAppState: profile.createdAppState,
      id: user.id,
    }
  }

  return { createCustomerProfile }
}
