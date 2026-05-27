// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/useProfessional.ts

import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { computed } from 'vue'

import { professionalConfig } from './config/professionalConfig'
import type { Professional } from '../../../../../models/profiles/Professional/Professional.model'

import { useProfessionalComputed } from './utils/view/useProfessionalComputed'
import { useProfessionalCreate } from './mutations/useProfessionalCreate'
import { useProfessionalUpdate } from './mutations/useProfessionalUpdate'
import { useProfessionalSeo } from './utils/useProfessionalSeo'
import { useProfessionalInterface, type ProfessionalCard } from './utils/view/useProfessionalInterface'

export type { ProfessionalCard, Professional }

/**
 * useProfessional
 * - Runtime facade for Professional profiles
 * - Exposes:
 *   - raw refs: profileRefs, coreProfile, appProfile, pending
 *   - computed helpers
 *   - UI helpers (pill, cell, profile)
 *   - update helpers
 */
export function useProfessional() {
  const { profile: refs, pending } =
    useProfile<Professional>(professionalConfig)

  const { coreProfile, appProfile } = refs

  const computedState = useProfessionalComputed(refs, pending)
  const profileUser = useUserFetch(computed(() => coreProfile.value?.id ?? null))
  const professional = useProfessionalInterface(
    refs,
    computed(() => profileUser.user.value ?? null)
  )
  const update = useProfessionalUpdate(refs)
  const create = useProfessionalCreate()

  return {
    profileRefs: refs,
    coreProfile,
    appProfile,
    pending,

    ...computedState,
    ...professional,
    ...update,
    ...create,
    useProfessionalSeo,
  }
}
