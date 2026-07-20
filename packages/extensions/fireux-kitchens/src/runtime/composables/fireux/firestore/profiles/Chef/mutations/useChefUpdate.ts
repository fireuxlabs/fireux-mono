import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: keep Chef domain writes root-only, bounded, and HTTPS-only.
import { useProfileRootUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import { normalizeHttpsUrlInput } from 'fireux-core/runtime/utils/httpsUrl'
import { ChefStorage, type Chef } from '../../../../../../models/chef.model'

/**
 * useChefUpdate
 * Root Chef domain fields are self-owned. The App overlay is stamps-only.
 */
export function useChefUpdate(profile?: ProfileRefs<Chef> | null) {
  const base = useProfileRootUpdateBase<Chef>(
    ChefStorage.rootCollection,
    profile
  )
  type UpdateOptions = { id?: string | null }

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

  const commitUpdate = async (
    patch: Partial<Chef>,
    options: UpdateOptions = {}
  ) => {
    await base.updateCoreProfile(patch, options)
  }
  const boundedStringList = (value: string | string[]) => {
    const entries = base.toStringArray(value)
    if (entries.length > 20)
      throw new Error('Chef lists support at most 20 items.')
    if (entries.some((entry) => entry.length > 240)) {
      throw new Error('Chef list items must be 240 characters or less.')
    }
    return entries
  }
  const boundedText = (value: string, maxSize: number) => {
    const normalized = base.cleanString(value) ?? ''
    if (normalized.length > maxSize) {
      throw new Error(`Value must be ${maxSize} characters or less.`)
    }
    return normalized
  }

  const updateTitle = async (value: string) => {
    await updateCoreProfile({ title: boundedText(value, 120) })
  }

  const updateSummary = async (value: string) => {
    await updateCoreProfile({ summary: boundedText(value, 1_000) })
  }

  const updateBio = async (value: string) => {
    await updateCoreProfile({ chef_bio: boundedText(value, 4_000) })
  }

  const updateImage = async (value: string) => {
    await updateCoreProfile({
      chef_image: normalizeHttpsUrlInput(value, { label: 'Chef image URL' }),
    })
  }

  const updateSignatureDishes = async (value: string | string[]) => {
    await updateCoreProfile({ chef_signature_dishes: boundedStringList(value) })
  }

  const updateOrganizationName = async (value: string) => {
    await updateCoreProfile({
      chef_organization_name: boundedText(value, 160),
    })
  }

  return {
    commitUpdate,
    updateCoreProfile,
    updateTitle,
    updateSummary,
    updateBio,
    updateImage,
    updateSignatureDishes,
    updateOrganizationName,
  }
}
