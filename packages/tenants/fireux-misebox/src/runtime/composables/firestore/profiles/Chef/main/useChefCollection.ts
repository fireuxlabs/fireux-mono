import { useProfileCollection } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileCollection.ts'
import {
  chefConfig,
  type ChefProfile,
} from '../../../../../models/profiles/Chef.model.ts'

export function useChefCollection() {
  const {
    globalProfiles,
    localProfiles,
    globalProfilesWithUser,
    localProfilesWithUser,
  } = useProfileCollection<ChefProfile>(chefConfig)

  return {
    globalChefs: globalProfilesWithUser,
    localChefs: localProfilesWithUser,
    rawGlobalChefs: globalProfiles,
    rawLocalChefs: localProfiles,
  }
}
