import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
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
  const base = useProfileUpdateBase<SupplierCore>('suppliers', profile)

  /**
   * Update the CORE Supplier profile
   * - global document (e.g. suppliers/{uid})
   */
  const updateCoreProfile = base.updateCoreProfile

  /**
   * Update the APP (tenant) Supplier profile
   * - app-specific document (e.g. apps/{appId}/suppliers/{uid})
   */
  const updateAppProfile = base.updateAppProfile

  const updateHeadline = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ supplier_headline: normalized ?? '' })
  }

  const updateSummary = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ supplier_summary: normalized ?? '' })
  }

  const updateBio = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ supplier_bio: normalized ?? '' })
  }

  const updateImage = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ supplier_image: normalized ?? '' })
  }

  const updateProductCategoriesCsv = async (value: string | string[]) => {
    await updateCoreProfile({
      supplier_product_categories: base.csvToArray(value),
    })
  }

  const updateDeliveryAreasCsv = async (value: string | string[]) => {
    await updateCoreProfile({
      supplier_delivery_areas: base.csvToArray(value),
    })
  }

  const updateOrganizationName = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ supplier_organization_name: normalized ?? '' })
  }

  const updateDisplayName = async (value: string) => {
    console.warn(
      '[useSupplierUpdate] updateDisplayName stub called with:',
      value
    )
  }

  const updateTagline = async (value: string) => updateHeadline(value)

  const updateBioShort = async (value: string) => updateSummary(value)

  return {
    commitUpdate: base.commitUpdate,
    updateCoreProfile,
    updateAppProfile,
    updateHeadline,
    updateSummary,
    updateBio,
    updateImage,
    updateProductCategoriesCsv,
    updateDeliveryAreasCsv,
    updateOrganizationName,
    updateDisplayName,
    updateTagline,
    updateBioShort,
  }
}
