import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import type { AgentCore } from '../../../../../../models/profiles/Agent/Agent.model'

/**
 * useAgentUpdate
 * - Split update surface:
 *   - updateCoreProfile: global Agent profile
 *   - updateAppProfile: tenant-scoped Agent profile
 *
 * For now:
 * - accepts only refs (no user cascading)
 * - both implementations are stubs until Firestore integration
 */
export function useAgentUpdate(profile?: ProfileRefs<AgentCore> | null) {
  const base = useProfileUpdateBase<AgentCore>('agents', profile)

  /**
   * Update the CORE Agent profile
   * - global document (e.g. agents/{uid})
   */
  const updateCoreProfile = base.updateCoreProfile

  /**
   * Update the APP (tenant) Agent profile
   * - app-specific document (e.g. apps/{appId}/agents/{uid})
   */
  const updateAppProfile = base.updateAppProfile

  const updateCore = async (
    patch: Partial<AgentCore>,
    _id?: string | null
  ): Promise<'success'> => {
    await updateCoreProfile(patch)
    return 'success'
  }

  const updateApp = async (
    patch: Partial<AgentCore>,
    _id?: string | null
  ): Promise<'success'> => {
    await updateAppProfile(patch)
    return 'success'
  }

  const updateHeadline = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ agent_headline: normalized ?? '' })
  }

  const updateSummary = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ agent_summary: normalized ?? '' })
  }

  const updateBio = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ agent_bio: normalized ?? '' })
  }

  const updateImage = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ agent_image: normalized ?? '' })
  }

  const updatePlacementTypesCsv = async (value: string | string[]) => {
    await updateCoreProfile({ agent_placement_types: base.csvToArray(value) })
  }

  const updateCoverageAreasCsv = async (value: string | string[]) => {
    await updateCoreProfile({ agent_coverage_areas: base.csvToArray(value) })
  }

  const updateContactEmail = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ agent_contact_email: normalized ?? '' })
  }

  const updateContactPhone = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ agent_contact_phone: normalized ?? '' })
  }

  const updateWebsiteUrl = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ agent_website_url: normalized ?? '' })
  }

  const updateAgencyName = async (value: string) => updateHeadline(value)

  const updateDisplayName = async (value: string) => {
    console.warn('[useAgentUpdate] updateDisplayName stub called with:', value)
  }

  const updateTagline = async (value: string) => updateHeadline(value)

  const updateBioShort = async (value: string) => updateSummary(value)

  const updateBadges = async (value: string) => updatePlacementTypesCsv(value)

  return {
    updateCoreProfile,
    updateAppProfile,
    commitUpdate: base.commitUpdate,
    updateCore,
    updateApp,
    updateDisplayName,
    updateAgencyName,
    updateHeadline,
    updateSummary,
    updateBio,
    updateImage,
    updatePlacementTypesCsv,
    updateCoverageAreasCsv,
    updateTagline,
    updateBioShort,
    updateContactEmail,
    updateContactPhone,
    updateWebsiteUrl,
    updateBadges,
  }
}
