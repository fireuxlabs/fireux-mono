import { useRouter } from 'vue-router'
import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import { chefConfig } from '../../../../../models/profiles/Chef.model.ts'

export function useChefCreate() {
  const { ensure } = useProfileEnsure(chefConfig)
  const router = useRouter()

  const createChef = async () => {
    const result = await ensure()
    if (import.meta.client) router.push('/dashboard/chef-profile')
    return result
  }

  return { createChef }
}
