// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection.ts

import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import {
    professionalConfig,
    type ProfessionalCore,
} from '../../../../../../models/profiles/Professional/Professional.model'

export function useProfessionalCollection() {
  const {
    globalProfiles,
    localProfiles,
    globalProfilesWithUser,
    localProfilesWithUser,
  } = useProfileCollection<ProfessionalCore>(professionalConfig)

  return {
    globalProfessionals: globalProfilesWithUser,
    localProfessionals: localProfilesWithUser,
    rawGlobalProfessionals: globalProfiles,
    rawLocalProfessionals: localProfiles,
  }
}
