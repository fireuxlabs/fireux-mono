import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  professionalConfig,
  type ProfessionalCoreProfile,
  type ProfessionalAppProfile,
} from '../../../../models/profiles/Professional.model.ts'

/**
 * Public Professional composable (read-only).
 * Exposes separate reactive refs for core and app overlays.
 */
export function useProfessional() {
  const { coreProfile, appProfile } = useProfile<
    ProfessionalCoreProfile,
    ProfessionalAppProfile
  >(professionalConfig)

  return { coreProfile, appProfile }
}
