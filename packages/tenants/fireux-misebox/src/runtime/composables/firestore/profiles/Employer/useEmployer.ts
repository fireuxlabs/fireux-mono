import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profiles/useProfile.ts'
import {
  employerConfig,
  type EmployerCoreProfile,
  type EmployerAppProfile,
} from '../../../../models/profiles/Employer.model'

export function useEmployer() {
  const { profile } = useProfile<EmployerCoreProfile, EmployerAppProfile>(
    employerConfig
  )
  return { profile }
}
