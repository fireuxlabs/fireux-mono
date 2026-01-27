import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import type { SupplierCore } from '../../../../../../models/profiles/Supplier/Supplier.model'

/**
 * useSupplierUpdate
 * - Split update surface:
 *   - updateCoreProfile: global Supplier profile
 *   - updateAppProfile: tenant-scoped Supplier profile
 *
 * Shared update surface for v1 scoped fields.
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
    await updateCoreProfile({ supplier_headline: normalized ?? undefined })
  }

  const updateSummary = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ supplier_summary: normalized ?? undefined })
  }

  const updateBio = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ supplier_bio: normalized ?? undefined })
  }

  const updateImage = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ supplier_image: normalized ?? undefined })
  }

  const updateProductCategories = async (value: string | string[]) => {
    await updateCoreProfile({
      supplier_product_categories: base.toStringArray(value),
    })
  }

  const updateDeliveryAreas = async (value: string | string[]) => {
    await updateCoreProfile({
      supplier_delivery_areas: base.toStringArray(value),
    })
  }

  const updateOrganizationName = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ supplier_organization_name: normalized ?? undefined })
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
    updateProductCategories,
    updateDeliveryAreas,
    updateOrganizationName,
    updateTagline,
    updateBioShort,
  }
}
