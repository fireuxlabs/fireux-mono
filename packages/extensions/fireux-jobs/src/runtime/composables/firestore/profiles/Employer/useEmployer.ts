// packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Employer/useEmployer.ts
import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  employerConfig,
  type EmployerProfile,
} from '../../../../models/profiles/Employer.model.ts'
import { useEmployerComputed } from './main/useEmployerComputed.ts'
import { useEmployerInterface } from './main/useEmployerInterface.ts'
import { useEmployerCreate } from './main/useEmployerCreate.ts'
import { useEmployerUpdate } from './main/useEmployerUpdate.ts'
import { useEmployerDelete } from './main/useEmployerDelete.ts'

/** Minimal facade for Employer profiles. */
export function useEmployer() {
  const { profile } = useProfile<EmployerProfile>(employerConfig)
  return {
    profile,
    ...useEmployerComputed(profile),
    ...useEmployerInterface(profile),
    ...useEmployerCreate(),
    ...useEmployerUpdate(profile),
    ...useEmployerDelete(profile),
  }
}
