// packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Employer/useEmployer.ts
import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profiles/useProfile.ts'
import {
  employerConfig,
  type EmployerCoreProfile,
  type EmployerAppProfile,
} from '../../../../models/profiles/Employer.model'

/** Minimal facade for Employer profiles. */
export function useEmployer() {
  const { profile } = useProfile<EmployerCoreProfile, EmployerAppProfile>(
    employerConfig
  )
  return { profile }
}
