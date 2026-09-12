// Concurrent edit — 2026-07-20 18:06 CEST — Repo Efficiency Pass 2 of 6: call the self-only Professional provisioner without a target.
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserBootstrap } from 'fireux-core/runtime/user/composables/useUserBootstrap'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { professionalConfig } from '../config/professionalConfig'

export function useProfessionalCreate() {
  const { bootstrapUser } = useUserBootstrap()
  const { createProfile } = useProfileCreate(professionalConfig)

  async function createProfessionalProfile(): Promise<{
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

  return { createProfessionalProfile }
}
