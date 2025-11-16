import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { ChefProfile } from '../../../../../models/profiles/Chef.model.ts'

/**
 * useChefUpdate
 * - Split update surface:
 *   - updateCoreProfile: global Chef profile
 *   - updateAppProfile: tenant-scoped Chef profile
 *
 * For now:
 * - accepts only refs (no user cascading)
 * - both implementations are stubs until Firestore integration
 */
export function useChefUpdate(profile: ProfileRefs<ChefProfile>) {
  /**
   * Update the CORE Chef profile
   * - global document (e.g. chefs/{uid})
   */
  const updateCoreProfile = async (
    patch: Partial<ChefProfile>
  ): Promise<void> => {
    console.warn(
      '[useChefUpdate] updateCoreProfile stub called with:',
      patch,
      'current coreProfile:',
      profile.coreProfile.value
    )
  }

  /**
   * Update the APP (tenant) Chef profile
   * - app-specific document (e.g. apps/{appId}/chefs/{uid})
   */
  const updateAppProfile = async (
    patch: Partial<ChefProfile>
  ): Promise<void> => {
    console.warn(
      '[useChefUpdate] updateAppProfile stub called with:',
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
