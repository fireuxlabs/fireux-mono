import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { chefConfig } from '../config/chefConfig'
import type { ChefCore } from '../../../../../../models/profiles/Chef/Chef.model'

export function useChefCollection() {
  const {
    globalProfiles,
    localProfiles,
  } = useProfileCollection<ChefCore>(chefConfig)

  return {
    coreChefs: globalProfiles,
    appChefs: localProfiles,
  }
}
