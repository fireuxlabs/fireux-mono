import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { AgentProfile } from '../../../../../models/profiles/Agent.model.ts'

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
export function useAgentUpdate(profile?: ProfileRefs<AgentProfile> | null) {
  const coreProfile = () => profile?.coreProfile?.value ?? null
  const appProfile = () => profile?.appProfile?.value ?? null

  /**
   * Update the CORE Agent profile
   * - global document (e.g. agents/{uid})
   */
  const updateCoreProfile = async (
    patch: Partial<AgentProfile>
  ): Promise<void> => {
    console.warn(
      '[useAgentUpdate] updateCoreProfile stub called with:',
      patch,
      'current coreProfile:',
      coreProfile()
    )
  }

  /**
   * Update the APP (tenant) Agent profile
   * - app-specific document (e.g. apps/{appId}/agents/{uid})
   */
  const updateAppProfile = async (
    patch: Partial<AgentProfile>
  ): Promise<void> => {
    console.warn(
      '[useAgentUpdate] updateAppProfile stub called with:',
      patch,
      'current appProfile:',
      appProfile()
    )
  }

  const updateCore = async (
    patch: Partial<AgentProfile>,
    _id?: string | null
  ): Promise<'success'> => {
    await updateCoreProfile(patch)
    return 'success'
  }

  const updateApp = async (
    patch: Partial<AgentProfile>,
    _id?: string | null
  ): Promise<'success'> => {
    await updateAppProfile(patch)
    return 'success'
  }

  const cleanString = (value: string | null | undefined) => {
    const normalized = typeof value === 'string' ? value.trim() : ''
    return normalized.length ? normalized : null
  }

  const updateDisplayName = async (value: string) => {
    console.warn('[useAgentUpdate] updateDisplayName stub called with:', value)
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
    updateCore,
    updateApp,
    updateDisplayName,
    updateTagline,
    updateBioShort,
  }
}
