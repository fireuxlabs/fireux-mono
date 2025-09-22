import { useProfile } from '#fireux-core-runtime/composables/firestore/profiles/useProfile'
import { professionalConfig } from '../../../../models/profiles/Professional.model'
import type { ProfessionalCoreProfile } from '../../../../models/profiles/Professional.model'

export function useProfessionalCreate() {
  const { ensure } = useProfile(professionalConfig) as any

  async function createProfessional(
    profile?: Partial<ProfessionalCoreProfile>
  ) {
    // Unified model: pass partial profile; mapper removed.
    return ensure(profile ?? {})
  }

  return { createProfessional }
}
