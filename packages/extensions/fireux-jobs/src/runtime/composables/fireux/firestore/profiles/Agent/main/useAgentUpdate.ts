import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts'
import { useUserUpdateForUid } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserUpdate.ts'
import type { AgentProfile } from 'fireux-jobs/runtime/models/profiles/Agent/Agent.model.ts'

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
  let cachedUserUpdater: ReturnType<typeof useUserUpdateForUid> | null = null
  let cachedUserId: string | null = null

  const resolveUserId = () =>
    profile?.coreProfile?.value?.user?.id ??
    profile?.appProfile?.value?.user?.id ??
    null

  const requireUserUpdater = () => {
    const userId = resolveUserId()
    if (!userId) return null
    if (cachedUserId === userId && cachedUserUpdater) {
      return cachedUserUpdater
    }
    cachedUserUpdater = useUserUpdateForUid(userId)
    cachedUserId = userId
    return cachedUserUpdater
  }

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

  const updateAgencyName = async (value: string) => {
    const updater = requireUserUpdater()
    const normalized = cleanString(value)
    if (!normalized) {
      console.warn('[useAgentUpdate] Empty agency name ignored')
      return
    }

    if (updater) {
      await updater.profile.rename(normalized)
    } else {
      console.warn('[useAgentUpdate] Unable to resolve user for rename')
    }

    await updateCoreProfile({
      title: normalized,
    })
  }

  const updateDisplayName = async (value: string) => {
    console.warn('[useAgentUpdate] updateDisplayName stub called with:', value)
  }

  const updateTagline = async (value: string) => {
    const normalized = cleanString(value)
    await updateCoreProfile({ tagline: normalized ?? undefined })
  }

  const updateBioShort = async (value: string) => {
    const updater = requireUserUpdater()
    if (!updater) {
      console.warn('[useAgentUpdate] Unable to resolve user for bio update')
      return
    }
    await updater.profile.setBio(value)
  }

  return {
    updateCoreProfile,
    updateAppProfile,
    updateCore,
    updateApp,
    updateDisplayName,
    updateAgencyName,
    updateTagline,
    updateBioShort,
  }
}
