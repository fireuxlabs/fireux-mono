import { useRouter } from 'vue-router'
import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import { employerConfig } from '../../../../../models/profiles/Employer.model.ts'

export function useEmployerCreate() {
  const { ensure } = useProfileEnsure(employerConfig)
  const router = useRouter()

  const createEmployer = async () => {
    const result = await ensure()
    if (import.meta.client) router.push('/dashboard/employer-profile')
    return result
  }

  return { createEmployer }
}
