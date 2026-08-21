import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: keep Agent domain writes root-only, bounded, and HTTPS-only.
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import { normalizeHttpsUrlInput } from 'fireux-core/runtime/utils/httpsUrl'
import {
  AgentStorage,
  type Agent,
} from '../../../../../../models/profiles/Agent/Agent.model'

/**
 * useAgentUpdate
 * Root Agent domain fields are self-owned. The App overlay is stamps-only.
 */
export function useAgentUpdate(profile?: ProfileRefs<Agent> | null) {
  const base = useProfileUpdateBase<Agent>(AgentStorage.document, profile)
  type UpdateOptions = { id?: string | null }

  /**
   * Update the CORE Agent profile
   * - global document (e.g. agents/{uid})
   */
  const updateProfile = async (
    patch: Partial<Agent>,
    options: { id?: string | null } = {}
  ) => {
    await base.updateProfile(patch, options)
  }

  const commitUpdate = async (
    patch: Partial<Agent>,
    options: UpdateOptions = {}
  ) => {
    await base.updateProfile(patch, options)
  }
  const boundedStringList = (value: string | string[]) => {
    const entries = base.toStringArray(value)
    if (entries.length > 20)
      throw new Error('Agent lists support at most 20 items.')
    if (entries.some((entry) => entry.length > 240)) {
      throw new Error('Agent list items must be 240 characters or less.')
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

  const update = async (
    patch: Partial<Agent>,
    _id?: string | null
  ): Promise<'success'> => {
    await updateProfile(patch)
    return 'success'
  }

  const updateTitle = async (value: string) => {
    await updateProfile({ title: boundedText(value, 120) })
  }

  const updateSummary = async (value: string) => {
    await updateProfile({ summary: boundedText(value, 1_000) })
  }

  const updateBio = async (value: string) => {
    await updateProfile({ agent_bio: boundedText(value, 4_000) })
  }

  const updateImage = async (value: string) => {
    await updateProfile({
      agent_image: normalizeHttpsUrlInput(value, { label: 'Agent image URL' }),
    })
  }

  const updatePlacementTypes = async (value: string | string[]) => {
    await updateProfile({ agent_placement_types: boundedStringList(value) })
  }

  const updateTags = async (value: string | string[]) => {
    await updateProfile({ tags: boundedStringList(value) })
  }

  const updateCoverageAreas = async (value: string | string[]) => {
    await updateProfile({ agent_coverage_areas: boundedStringList(value) })
  }

  const updateContactEmail = async (value: string) => {
    await updateProfile({ agent_contact_email: boundedText(value, 320) })
  }

  const updateContactPhone = async (value: string) => {
    await updateProfile({ agent_contact_phone: boundedText(value, 40) })
  }

  const updateWebsiteUrl = async (value: string) => {
    await updateProfile({
      agent_website_url: normalizeHttpsUrlInput(value, {
        label: 'Agent website URL',
      }),
    })
  }

  return {
    updateProfile,
    commitUpdate,
    update,
    updateTitle,
    updateSummary,
    updateBio,
    updateImage,
    updatePlacementTypes,
    updateTags,
    updateCoverageAreas,
    updateContactEmail,
    updateContactPhone,
    updateWebsiteUrl,
  }
}
