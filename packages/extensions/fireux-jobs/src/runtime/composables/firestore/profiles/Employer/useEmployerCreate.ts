import { useProfileCreate } from 'fireux-core/runtime/composables/firestore/profiles/useProfileCreate'
import {
  employerConfig,
  EmployerMapper,
} from '../../../../models/profiles/Employer.model'
import type { EmployerCoreProfile } from '../../../../models/profiles/Employer.model'

export function useEmployerCreate() {
  const { ensure } = useProfileCreate(employerConfig)

  async function createEmployer(profile?: Partial<EmployerCoreProfile>) {
    const fsPayload = EmployerMapper.toFs(profile ?? {}, { dropNullish: true })
    return ensure(fsPayload)
  }

  return { createEmployer }
}
