// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection.ts

import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { professionalConfig } from '../config/professionalConfig'
import type { ProfessionalCore } from '../../../../../../models/profiles/Professional/Professional.model'

export function useProfessionalCollection() {
  const {
    globalProfiles,
    localProfiles,
  } = useProfileCollection<ProfessionalCore>(professionalConfig)

  return {
    coreProfessionals: globalProfiles,
    appProfessionals: localProfiles,
  }
}
