import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  professionalConfig,
  type ProfessionalCoreProfile,
  type ProfessionalAppProfile,
} from '../../../../models/profiles/Professional.model'

/** Minimal facade for Professional profiles. */
export function useProfessional() {
  const { profile } = useProfile<
    ProfessionalCoreProfile,
    ProfessionalAppProfile
  >(professionalConfig)
  return { profile }
}
