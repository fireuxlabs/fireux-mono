import { useProfileCollection } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileCollection.ts'
import {
  chefConfig,
  type ChefProfile,
} from '../../../../../models/profiles/Chef.model.ts'

export function useChefCollection() {
  const { profiles, global, local } =
    useProfileCollection<ChefProfile>(chefConfig)

  return { chefs: profiles, global, local }
}
