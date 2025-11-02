import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import { professionalConfig } from '../../../../models/profiles/Professional.model'

export function useProfessionalCreate() {
  const { ensure } = useProfileEnsure(null, professionalConfig)

  async function createProfessional() {
    return ensure({ domain: 'professional' })
  }

  return { createProfessional }
}
