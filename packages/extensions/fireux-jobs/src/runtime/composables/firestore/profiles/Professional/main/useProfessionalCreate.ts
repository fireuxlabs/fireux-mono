import { useRouter } from 'vue-router'
import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/core/useProfileEnsure.ts'
import { professionalConfig } from '../../../../../models/profiles/Professional.model.ts'

export function useProfessionalCreate() {
  const { ensure } = useProfileEnsure(professionalConfig)
  const router = useRouter()

  const createProfessional = async () => {
    const result = await ensure()
    if (import.meta.client) router.push('/dashboard/professional/profile')
    return result
  }

  return { createProfessional }
}
