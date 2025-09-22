import { useProfile } from '#fireux-core-runtime/composables/firestore/profiles/useProfile'
import { employerConfig } from '../../../../models/profiles/Employer.model'
import type { EmployerCoreProfile } from '../../../../models/profiles/Employer.model'

export function useEmployerCreate() {
  const { ensure } = useProfile(employerConfig) as any

  async function createEmployer(profile?: Partial<EmployerCoreProfile>) {
    // Unified model: pass partial profile; mapper removed.
    return ensure(profile ?? {})
  }

  return { createEmployer }
}
