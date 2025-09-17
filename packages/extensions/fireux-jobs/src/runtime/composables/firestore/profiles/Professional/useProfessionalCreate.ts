import { useProfileCreate } from 'fireux-core/runtime/composables/firestore/profiles/useProfileCreate'
import {
  professionalConfig,
  ProfessionalMapper,
} from '../../../../models/profiles/Professional.model'
import type { ProfessionalCoreProfile } from '../../../../models/profiles/Professional.model'

export function useProfessionalCreate() {
  const { ensure } = useProfileCreate(professionalConfig)

  async function createProfessional(
    profile?: Partial<ProfessionalCoreProfile>
  ) {
    const fsPayload = ProfessionalMapper.toFs(profile ?? {}, {
      dropNullish: true,
    })
    return ensure(fsPayload)
  }

  return { createProfessional }
}
