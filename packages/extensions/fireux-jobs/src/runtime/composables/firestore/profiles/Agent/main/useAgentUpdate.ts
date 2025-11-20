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
export function useAgentUpdate(profile: ProfileRefs<AgentProfile>) {
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
      profile.coreProfile.value
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
      profile.appProfile.value
    )
  }

  return {
    updateCoreProfile,
    updateAppProfile,
  }
}
