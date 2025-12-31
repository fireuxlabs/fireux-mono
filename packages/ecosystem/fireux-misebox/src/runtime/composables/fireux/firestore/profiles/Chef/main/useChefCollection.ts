import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection.ts'
import {
  chefConfig,
  type ChefCore,
} from '../../../../../../models/profiles/Chef/Chef.model.ts'

export function useChefCollection() {
  const {
    globalProfiles,
    localProfiles,
    globalProfilesWithUser,
    localProfilesWithUser,
  } = useProfileCollection<ChefCore>(chefConfig)

  return {
    globalChefs: globalProfilesWithUser,
    localChefs: localProfilesWithUser,
    rawGlobalChefs: globalProfiles,
    rawLocalChefs: localProfiles,
  }
}
