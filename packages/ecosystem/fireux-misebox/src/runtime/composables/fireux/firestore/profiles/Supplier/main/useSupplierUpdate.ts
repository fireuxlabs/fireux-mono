import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { SupplierCore } from '../../../../../../models/profiles/Supplier/Supplier.model'

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
export function useSupplierUpdate(
  profile?: ProfileRefs<SupplierCore> | null
) {
  const coreProfile = () => profile?.coreProfile?.value ?? null
  const appProfile = () => profile?.appProfile?.value ?? null

  /**
   * Update the CORE Supplier profile
   * - global document (e.g. suppliers/{uid})
   */
  const updateCoreProfile = async (
    patch: Partial<SupplierCore>
  ): Promise<void> => {
    console.warn(
      '[useSupplierUpdate] updateCoreProfile stub called with:',
      patch,
      'current coreProfile:',
      coreProfile()
    )
  }

  /**
   * Update the APP (tenant) Supplier profile
   * - app-specific document (e.g. apps/{appId}/suppliers/{uid})
   */
  const updateAppProfile = async (
    patch: Partial<SupplierCore>
  ): Promise<void> => {
    console.warn(
      '[useSupplierUpdate] updateAppProfile stub called with:',
      patch,
      'current appProfile:',
      appProfile()
    )
  }

  const cleanString = (value: string | null | undefined) => {
    const normalized = typeof value === 'string' ? value.trim() : ''
    return normalized
  }

  const updateDisplayName = async (value: string) => {
    console.warn(
      '[useSupplierUpdate] updateDisplayName stub called with:',
      value
    )
  }

  const updateTagline = async (value: string) => {
    await updateCoreProfile({ tagline: cleanString(value) })
  }

  const updateBioShort = async (value: string) => {
    await updateCoreProfile({ bio_short: cleanString(value) })
  }

  return {
    updateCoreProfile,
    updateAppProfile,
    updateDisplayName,
    updateTagline,
    updateBioShort,
  }
}
