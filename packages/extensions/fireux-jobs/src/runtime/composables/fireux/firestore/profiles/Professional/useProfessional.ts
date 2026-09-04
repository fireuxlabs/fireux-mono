// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/useProfessional.ts

import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { useUserSessionRead } from 'fireux-core/runtime/user/composables/useUserSessionRead'
import { computed } from 'vue'

import { professionalConfig } from './config/professionalConfig'
import type { Professional } from '../../../../../utils/profiles/Professional/professional'

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
 *   - raw refs: profileRefs, profile, pending
 *   - computed helpers
 *   - UI helpers (pill, cell, profile)
 *   - update helpers
 */
export function useProfessional() {
  const { profile: refs, pending } =
    useProfile<Professional>(professionalConfig)

  const { profile: professionalProfile } = refs

  const computedState = useProfessionalComputed(refs, pending)
  const profileUser = useUserSessionRead(
    computed(() => professionalProfile.value?.id ?? null)
  )
  const professional = useProfessionalInterface(
    refs,
    computed(() => profileUser.user.value ?? null)
  )
  const update = useProfessionalUpdate(refs)
  const create = useProfessionalCreate()

  return {
    profileRefs: refs,
    professionalProfile,
    pending,

    ...computedState,
    ...professional,
    ...update,
    ...create,
    useProfessionalSeo,
  }
}
