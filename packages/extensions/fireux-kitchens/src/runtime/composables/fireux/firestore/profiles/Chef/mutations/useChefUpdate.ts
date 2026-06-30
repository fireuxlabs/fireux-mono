import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import {
  ChefStorage,
  type Chef,
} from '../../../../../../models/chef.model'

/**
 * useChefUpdate
 * - Split update surface:
 *   - updateCoreProfile: global Chef profile
 *   - updateAppProfile: app-scoped Chef profile
 *
 * Shared update surface for v1 scoped fields.
 */
export function useChefUpdate(profile?: ProfileRefs<Chef> | null) {
  const base = useProfileUpdateBase<Chef>(ChefStorage.rootCollection, profile)
  type UpdateOptions = { id?: string | null; scope?: 'core' | 'app' }

  /**
   * Update the CORE Chef profile
   * - global document (e.g. chefs/{uid})
   */
  const updateCoreProfile = async (
    patch: Partial<Chef>,
    options: { id?: string | null } = {}
  ) => {
    await base.updateCoreProfile(patch, options)
  }

  /**
   * Update the APP Chef profile
   * - app-specific document (e.g. apps/{appId}/chefs/{uid})
   */
  const updateAppProfile = base.updateAppProfile
  const commitUpdate = async (
    patch: Partial<Chef>,
    options: UpdateOptions = {}
  ) => {
    await base.commitUpdate(patch, options)
  }

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
    commitUpdate,
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
