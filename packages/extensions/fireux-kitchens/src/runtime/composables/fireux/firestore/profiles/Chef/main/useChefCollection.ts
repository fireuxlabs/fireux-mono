import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { chefConfig } from '../config/chefConfig'
import type { Chef } from '../../../../../../models/profiles/Chef/Chef.model'

export function useChefCollection() {
  const {
    globalProfiles,
    localProfiles,
  } = useProfileCollection<Chef>(chefConfig)

  return {
    coreChefs: globalProfiles,
    appChefs: localProfiles,
  }
}
