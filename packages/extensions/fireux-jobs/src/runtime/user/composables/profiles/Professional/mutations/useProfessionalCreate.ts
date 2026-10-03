// Concurrent edit — 2026-07-20 18:06 CEST — Repo Efficiency Pass 2 of 6: call the self-only Professional provisioner without a target.
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { useUserBootstrap } from 'fireux-core/runtime/user/composables/useUserBootstrap'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { professionalConfig } from '../config/professionalConfig'

export function useProfessionalCreate() {
  const { bootstrapUser } = useUserBootstrap()
  const { createProfile, captureIntent: captureProfileIntent, scopeEpoch } = useProfileCreate(professionalConfig)

  const { currentUser } = useAuth(), runtime = useFireUXConfig(), route = useRoute()
  const captureWorkflow = useCommandScope([() => currentUser.value?.uid, () => runtime.appId, () => route.fullPath])
  const captureIntent = () => { const workflow = captureWorkflow(), profile = captureProfileIntent(); return () => workflow() && profile() }

  async function createProfessionalProfile(): Promise<{
    createdProfile: boolean
    createdAppState: boolean
    id: string
  }> {
    const isCurrent = captureWorkflow(), uid = currentUser.value?.uid
    const actor = await useRequireUser()
    const assertCurrent = () => { if (!isCurrent() || actor.uid !== uid) throw new Error('The signed-in account changed. Please try again.') }
    assertCurrent()
    const user = await bootstrapUser(actor)
    assertCurrent()
    const profile = await createProfile(actor)

    return {
      createdProfile: profile.createdProfile,
      createdAppState: profile.createdAppState,
      id: user.id,
    }
  }

  return { createProfessionalProfile, captureIntent, scopeEpoch }
}
