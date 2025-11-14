// FILE: packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessional.ts
import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
} from '../../../../models/profiles/Professional.model.ts'
import { useProfessionalComputed } from './main/useProfessionalComputed.ts'

export type {
  ProfessionalProfile,
  ProfessionalCoreProfile,
  ProfessionalCard,
} from '../../../../models/profiles/Professional.model.ts'

/**
 * useProfessional
 * - Resolves core + app professional profiles via the generic profile stack
 * - Returns raw profile refs plus computed helpers
 */
export function useProfessional() {
  const { profile: refs, pending } =
    useProfile<ProfessionalProfile>(professionalConfig)
  const { coreProfile, appProfile } = refs

  return {
    profile: refs,
    coreProfile,
    appProfile,
    pending,
    ...useProfessionalComputed(refs, pending),
  }
}
