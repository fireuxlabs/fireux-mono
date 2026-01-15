// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/useProfessional.ts

import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

import {
  professionalConfig,
  type ProfessionalCore,
} from '../../../../../models/profiles/Professional/Professional.model'

import { useProfessionalComputed } from './main/useProfessionalComputed'
import { useProfessionalCreate } from './main/useProfessionalCreate'
import { useProfessionalUpdate } from './main/useProfessionalUpdate'
import { useProfessionalInterface, type ProfessionalCard } from './utils/view/useProfessionalInterface'

export type { ProfessionalCard, ProfessionalCore as ProfessionalProfile }

/**
 * useProfessional
 * - Runtime facade for Professional profiles
 * - Exposes:
 *   - raw refs: profile, coreProfile, appProfile, pending
 *   - computed helpers
 *   - UI helpers (pill, cell, profileCore, profileApp)
 *   - update helpers
 */
export function useProfessional() {
  const { profile: refs, pending } =
    useProfile<ProfessionalCore>(professionalConfig)

  const { coreProfile, appProfile } = refs

  // canonical user for UI layer
  const { coreUser } = useUser()

  const computed = useProfessionalComputed(refs, pending)
  const ui = useProfessionalInterface(refs, coreUser)
  const update = useProfessionalUpdate(refs)
  const create = useProfessionalCreate()

  return {
    profile: refs,
    coreProfile,
    appProfile,
    pending,

    ...computed,
    ...ui,
    ...update,
    ...create,
  }
}
