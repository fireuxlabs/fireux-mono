// packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Employer/useEmployer.ts
import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
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
 * - Thin facade over generic profile stack
 * - Exposes:
 *   - raw refs: profile, coreProfile, appProfile
 *   - computed helpers
 *   - UI helpers
 *   - update helpers
 */
export function useEmployer() {
  const { profile: refs, pending } = useProfile<EmployerProfile>(employerConfig)
  const { coreProfile, appProfile } = refs

  const computed = useEmployerComputed(refs, pending)
  const ui = useEmployerInterface(refs)
  const update = useEmployerUpdate(refs)

  return {
    // raw
    profile: refs,
    coreProfile,
    appProfile,
    pending,

    // helpers
    ...computed,
    ...ui,
    ...update,
  }
}
