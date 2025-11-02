import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import { employerConfig } from '../../../../models/profiles/Employer.model'

export function useEmployerCreate() {
  const { ensure } = useProfileEnsure(null, employerConfig)

  async function createEmployer() {
    return ensure({ domain: 'employer' })
  }

  return { createEmployer }
}
