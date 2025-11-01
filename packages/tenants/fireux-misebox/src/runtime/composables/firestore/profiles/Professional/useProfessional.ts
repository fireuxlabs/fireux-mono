import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profiles/useProfile.ts'
import {
  professionalConfig,
  type ProfessionalCoreProfile,
  type ProfessionalAppProfile,
} from '../../../../models/profiles/Professional.model'

export function useProfessional() {
  const { profile } = useProfile<
    ProfessionalCoreProfile,
    ProfessionalAppProfile
  >(professionalConfig)
  return { profile }
}
