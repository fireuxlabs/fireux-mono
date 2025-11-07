import { useProfileCollection } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileCollection.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
} from '../../../../../models/profiles/Professional.model.ts'

export function useProfessionalCollection() {
  const { profiles, global, local } =
    useProfileCollection<ProfessionalProfile>(professionalConfig)

  return { professionals: profiles, global, local }
}
