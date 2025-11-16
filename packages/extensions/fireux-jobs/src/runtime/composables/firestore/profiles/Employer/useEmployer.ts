// FILE: packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Employer/useEmployer.ts

import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import {
  employerConfig,
  type EmployerProfile,
  type EmployerCoreProfile,
  type EmployerCard,
} from '../../../../models/profiles/Employer.model.ts'
import { useEmployerComputed } from './main/useEmployerComputed.ts'
import { useEmployerInterface } from './main/useEmployerInterface.ts'
import { useEmployerUpdate } from './main/useEmployerUpdate.ts'

export type { EmployerProfile, EmployerCoreProfile, EmployerCard }

/**
 * useEmployer
 * - Runtime facade for Employer profiles
 * - Exposes:
 *   - raw refs: profile, coreProfile, appProfile, pending
 *   - computed helpers
 *   - UI helpers (pill, cell, profileCore, profileApp)
 *   - update helpers
 */
export function useEmployer() {
  const { profile: refs, pending } = useProfile<EmployerProfile>(employerConfig)
  const { coreProfile, appProfile } = refs

  // canonical user
  const { coreUser } = useUser()

  const computed = useEmployerComputed(refs, pending)
  const ui = useEmployerInterface(refs, coreUser)
  const update = useEmployerUpdate(refs)

  return {
    profile: refs,
    coreProfile,
    appProfile,
    pending,

    ...computed,
    ...ui,
    ...update,
  }
}
