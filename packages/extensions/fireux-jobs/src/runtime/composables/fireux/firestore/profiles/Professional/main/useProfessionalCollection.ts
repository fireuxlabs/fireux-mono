// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection.ts

import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/collection/useProfileCollection.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
} from '../../../../../../models/profiles/Professional.model.ts'

export function useProfessionalCollection() {
  const {
    globalProfiles,
    localProfiles,
    globalProfilesWithUser,
    localProfilesWithUser,
  } = useProfileCollection<ProfessionalProfile>(professionalConfig)

  return {
    globalProfessionals: globalProfilesWithUser,
    localProfessionals: localProfilesWithUser,
    rawGlobalProfessionals: globalProfiles,
    rawLocalProfessionals: localProfiles,
  }
}
