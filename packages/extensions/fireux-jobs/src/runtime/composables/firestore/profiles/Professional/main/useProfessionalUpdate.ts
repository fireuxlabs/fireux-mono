import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { ProfessionalProfile } from '../../../../../models/profiles/Professional.model.ts'

/**
 * useProfessionalUpdate
 * - Split update surface:
 *   - updateCoreProfile: global professional doc
 *   - updateAppProfile: tenant-scoped professional doc
 *
 * For now:
 * - accepts refs only (no user cascading yet)
 * - implementations are stubs (safe no-ops) so we don't break runtime
 */
export function useProfessionalUpdate(
  profile: ProfileRefs<ProfessionalProfile>
) {
  /**
   * Update the CORE professional profile
   * - global document (e.g. professionals/{uid})
   */
  const updateCoreProfile = async (
    patch: Partial<ProfessionalProfile>
  ): Promise<void> => {
    // TODO: wire to actual Firestore update for core profile
    console.warn(
      '[useProfessionalUpdate] updateCoreProfile stub called with:',
      patch,
      'current coreProfile:',
      profile.coreProfile.value
    )
  }

  /**
   * Update the APP (tenant) professional profile
   * - app-specific document (e.g. apps/{appId}/professionals/{uid})
   */
  const updateAppProfile = async (
    patch: Partial<ProfessionalProfile>
  ): Promise<void> => {
    // TODO: wire to actual Firestore update for app profile
    console.warn(
      '[useProfessionalUpdate] updateAppProfile stub called with:',
      patch,
      'current appProfile:',
      profile.appProfile.value
    )
  }

  return {
    updateCoreProfile,
    updateAppProfile,
  }
}
