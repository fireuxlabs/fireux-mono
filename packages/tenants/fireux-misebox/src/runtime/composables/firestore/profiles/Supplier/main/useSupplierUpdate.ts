import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { SupplierProfile } from '../../../../../models/profiles/Supplier.model.ts'

/**
 * useSupplierUpdate
 * - Split update surface:
 *   - updateCoreProfile: global Supplier profile
 *   - updateAppProfile: tenant-scoped Supplier profile
 *
 * For now:
 * - accepts only refs (no user cascading)
 * - both implementations are stubs until Firestore integration
 */
export function useSupplierUpdate(profile: ProfileRefs<SupplierProfile>) {
  /**
   * Update the CORE Supplier profile
   * - global document (e.g. suppliers/{uid})
   */
  const updateCoreProfile = async (
    patch: Partial<SupplierProfile>
  ): Promise<void> => {
    console.warn(
      '[useSupplierUpdate] updateCoreProfile stub called with:',
      patch,
      'current coreProfile:',
      profile.coreProfile.value
    )
  }

  /**
   * Update the APP (tenant) Supplier profile
   * - app-specific document (e.g. apps/{appId}/suppliers/{uid})
   */
  const updateAppProfile = async (
    patch: Partial<SupplierProfile>
  ): Promise<void> => {
    console.warn(
      '[useSupplierUpdate] updateAppProfile stub called with:',
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
