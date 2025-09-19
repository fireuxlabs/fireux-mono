import { useProfile } from '#fireux-core-runtime/composables/firestore/profiles/useProfile'
import {
  professionalConfig,
  ProfessionalMapper,
} from '../../../../models/profiles/Professional.model'
import type { ProfessionalCoreProfile } from '../../../../models/profiles/Professional.model'

export function useProfessionalCreate() {
  const { ensure } = useProfile(professionalConfig) as any

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
