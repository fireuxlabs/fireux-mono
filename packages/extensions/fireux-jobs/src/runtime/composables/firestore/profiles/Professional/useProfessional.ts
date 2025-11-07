import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
} from '../../../../models/profiles/Professional.model.ts'

export function useProfessional() {
  const { profile } = useProfile<ProfessionalProfile>(professionalConfig)
  return { profile }
}
