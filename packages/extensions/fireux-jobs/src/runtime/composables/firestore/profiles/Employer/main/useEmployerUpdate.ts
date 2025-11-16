import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { EmployerProfile } from '../../../../../models/profiles/Employer.model.ts'

/**
 * useEmployerUpdate
 * - Split update surface:
 *   - updateCoreProfile: global Employer profile
 *   - updateAppProfile: tenant-scoped Employer profile
 *
 * For now:
 * - accepts only refs (no user cascading)
 * - both implementations are stubs until Firestore integration
 */
export function useEmployerUpdate(profile: ProfileRefs<EmployerProfile>) {
  /**
   * Update the CORE Employer profile
   * - global document (e.g. employers/{uid})
   */
  const updateCoreProfile = async (
    patch: Partial<EmployerProfile>
  ): Promise<void> => {
    console.warn(
      '[useEmployerUpdate] updateCoreProfile stub called with:',
      patch,
      'current coreProfile:',
      profile.coreProfile.value
    )
  }

  /**
   * Update the APP (tenant) Employer profile
   * - app-specific document (e.g. apps/{appId}/employers/{uid})
   */
  const updateAppProfile = async (
    patch: Partial<EmployerProfile>
  ): Promise<void> => {
    console.warn(
      '[useEmployerUpdate] updateAppProfile stub called with:',
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
