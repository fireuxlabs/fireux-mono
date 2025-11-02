import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import { chefConfig } from '../../../../models/profiles/Chef.model'

export function useChefCreate() {
  const { ensure } = useProfileEnsure(null, chefConfig)

  async function createChef() {
    return ensure({ domain: 'chef' })
  }

  return { createChef }
}
