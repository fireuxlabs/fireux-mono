import { useRouter } from 'vue-router'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { chefConfig } from '../../../../../../models/profiles/Chef/Chef.model'

export function useChefCreate() {
  const { ensure } = useProfileEnsure(chefConfig)
  const router = useRouter()

  const createChef = async () => {
    const result = await ensure()
    if (import.meta.client) router.push('/dashboard/chef/profile')
    return result
  }

  return { createChef }
}
