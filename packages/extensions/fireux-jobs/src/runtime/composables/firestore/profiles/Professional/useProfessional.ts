// FILE: packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessional.ts

import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

import {
  professionalConfig,
  type ProfessionalProfile,
  type ProfessionalCoreProfile,
  type ProfessionalCard,
} from '../../../../models/profiles/Professional.model.ts'

import { useProfessionalInterface } from './main/useProfessionalInterface.ts'
import { useProfessionalComputed } from './main/useProfessionalComputed.ts'
import { useProfessionalUpdate } from './main/useProfessionalUpdate.ts'

export type { ProfessionalProfile, ProfessionalCoreProfile, ProfessionalCard }

/**
 * useProfessional
 * - Runtime facade for Professional profiles
 * - Exposes:
 *   - raw refs: profile, coreProfile, appProfile, pending
 *   - computed helpers
 *   - UI helpers (pill etc.) that use coreUser
 *   - update helpers
 */
export function useProfessional() {
  const { profile: refs, pending } =
    useProfile<ProfessionalProfile>(professionalConfig)

  const { coreProfile, appProfile } = refs

  // canonical user to feed UI layer
  const { coreUser } = useUser()

  const computed = useProfessionalComputed(refs, pending)
  const ui = useProfessionalInterface(refs, coreUser)
  const update = useProfessionalUpdate(refs)

  return {
    // raw firestore refs
    profile: refs,
    coreProfile,
    appProfile,
    pending,

    // computed helpers
    ...computed,

    // UI helpers (pill etc., all using coreUser)
    ...ui,

    // update helpers
    ...update,
  }
}
