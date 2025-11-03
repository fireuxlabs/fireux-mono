import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import {
  professionalConfig,
  type ProfessionalCoreProfile,
  type ProfessionalAppProfile,
} from '../../../../models/profiles/Professional.model.ts'

/**
 * Create a Professional profile.
 * Wraps the shared ensure helper and stamps the domain flag.
 */
export function useProfessionalCreate() {
  const { ensure } = useProfileEnsure(professionalConfig)

  async function createProfessional() {
    return ensure({
      domain: 'professional',
    } as Partial<ProfessionalCoreProfile & ProfessionalAppProfile>)
  }

  return { createProfessional }
}
