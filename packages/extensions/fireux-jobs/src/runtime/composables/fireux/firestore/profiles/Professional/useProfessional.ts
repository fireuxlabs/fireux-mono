// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/useProfessional.ts

import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile.ts'

import {
  professionalConfig,
  type ProfessionalCore,
} from '../../../../../models/profiles/Professional/Professional.model.ts'
import type { ProfessionalCard } from '../../../../../types/profiles/ProfessionalCard'

import { useProfessionalComputed } from './main/useProfessionalComputed'
import { useProfessionalInterface } from './main/useProfessionalInterface'
import { useProfessionalUpdate } from './main/useProfessionalUpdate'
import { useProfessionalCreate } from './main/useProfessionalCreate'

export type { ProfessionalCore as ProfessionalProfile, ProfessionalCard }

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

  const computed = useProfessionalComputed(refs, pending)
  const ui = useProfessionalInterface(refs)
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
