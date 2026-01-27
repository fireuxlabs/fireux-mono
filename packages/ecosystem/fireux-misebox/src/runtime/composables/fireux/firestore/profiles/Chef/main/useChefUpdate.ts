import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import type { ChefCore } from '../../../../../../models/profiles/Chef/Chef.model'

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
export function useChefUpdate(profile?: ProfileRefs<ChefCore> | null) {
  const base = useProfileUpdateBase<ChefCore>('chefs', profile)

  /**
   * Update the CORE Chef profile
   * - global document (e.g. chefs/{uid})
   */
  const updateCoreProfile = base.updateCoreProfile

  /**
   * Update the APP (tenant) Chef profile
   * - app-specific document (e.g. apps/{appId}/chefs/{uid})
   */
  const updateAppProfile = base.updateAppProfile

  const updateHeadline = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ chef_headline: normalized ?? '' })
  }

  const updateSummary = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ chef_summary: normalized ?? '' })
  }

  const updateBio = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ chef_bio: normalized ?? '' })
  }

  const updateImage = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ chef_image: normalized ?? '' })
  }

  const updateSignatureDishesCsv = async (csv: string) => {
    await updateCoreProfile({ chef_signature_dishes: base.csvToArray(csv) })
  }

  const updateOrganizationName = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ chef_organization_name: normalized ?? '' })
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
    updateSignatureDishesCsv,
    updateOrganizationName,
    updateTagline,
    updateBioShort,
  }
}
