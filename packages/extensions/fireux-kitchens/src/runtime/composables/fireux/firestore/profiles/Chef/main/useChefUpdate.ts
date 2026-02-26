import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import type { ChefCore } from '../../../../../../models/profiles/Chef/Chef.model'

/**
 * useChefUpdate
 * - Split update surface:
 *   - updateCoreProfile: global Chef profile
 *   - updateAppProfile: tenant-scoped Chef profile
 *
 * Shared update surface for v1 scoped fields.
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

  const updateTitle = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ title: normalized ?? undefined })
  }

  const updateSummary = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ summary: normalized ?? undefined })
  }

  const updateBio = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ chef_bio: normalized ?? undefined })
  }

  const updateImage = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ chef_image: normalized ?? undefined })
  }

  const updateSignatureDishes = async (value: string | string[]) => {
    await updateCoreProfile({ chef_signature_dishes: base.toStringArray(value) })
  }

  const updateOrganizationName = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ chef_organization_name: normalized ?? undefined })
  }

  const updateTagline = async (value: string) => updateTitle(value)

  const updateBioShort = async (value: string) => updateSummary(value)

  return {
    commitUpdate: base.commitUpdate,
    updateCoreProfile,
    updateAppProfile,
    updateTitle,
    updateSummary,
    updateBio,
    updateImage,
    updateSignatureDishes,
    updateOrganizationName,
    updateTagline,
    updateBioShort,
  }
}
