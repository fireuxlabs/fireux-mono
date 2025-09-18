import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import {
  employerConfig,
  EmployerMapper,
} from '../../../../models/profiles/Employer.model'
import type { EmployerCoreProfile } from '../../../../models/profiles/Employer.model'

export function useEmployerCreate() {
  const { ensure } = useProfile(employerConfig) as any

  async function createEmployer(profile?: Partial<EmployerCoreProfile>) {
    const fsPayload = EmployerMapper.toFs(profile ?? {}, { dropNullish: true })
    return ensure(fsPayload)
  }

  return { createEmployer }
}
