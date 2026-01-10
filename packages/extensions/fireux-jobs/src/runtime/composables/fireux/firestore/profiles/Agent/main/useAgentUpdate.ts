import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
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
  const { updateDocument } = useFirestoreUpdate()
  const { appId, role } = useFireUXConfig()
  const isTenant = role === 'tenant' && Boolean(appId)

  const resolveUid = async (): Promise<string> => {
    const fromRefs =
      profile?.coreProfile?.value?.id ?? profile?.appProfile?.value?.id ?? null
    if (fromRefs?.trim()) return fromRefs.trim()

    const user = await useRequireUser()
    if (!user?.uid) {
      throw new Error('[useAgentUpdate] Unable to resolve agent id')
    }
    return user.uid
  }

  const pruneUndefined = <T extends Record<string, any>>(payload: T) => {
    const entries = Object.entries(payload).filter(
      ([, value]) => value !== undefined
    )
    return Object.fromEntries(entries) as Partial<T>
  }

  /**
   * Update the CORE Agent profile
   * - global document (e.g. agents/{uid})
   */
  const updateCoreProfile = async (
    patch: Partial<AgentCore>
  ): Promise<void> => {
    const uid = await resolveUid()
    await updateDocument<AgentCore>('agents', uid, pruneUndefined(patch))
  }

  /**
   * Update the APP (tenant) Agent profile
   * - app-specific document (e.g. apps/{appId}/agents/{uid})
   */
  const updateAppProfile = async (
    patch: Partial<AgentCore>
  ): Promise<void> => {
    if (!isTenant || !appId) {
      throw new Error(
        '[useAgentUpdate] Tenant context required for app profile updates'
      )
    }

    const uid = await resolveUid()
    await updateDocument<AgentCore>(
      `apps/${appId}/agents`,
      uid,
      pruneUndefined(patch)
    )
  }

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

  const cleanString = (value: string | null | undefined) => {
    const normalized = typeof value === 'string' ? value.trim() : ''
    return normalized.length ? normalized : null
  }

  const updateAgencyName = async (value: string) => {
    const normalized = cleanString(value)
    if (!normalized) {
      console.warn('[useAgentUpdate] Empty agency name ignored')
      return
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
    const normalized = cleanString(value)
    await updateCoreProfile({ bio_short: normalized ?? undefined })
  }

  const updateContactEmail = async (value: string) => {
    const normalized = cleanString(value)
    await updateCoreProfile({ contact_email: normalized ?? undefined })
  }

  const updateContactPhone = async (value: string) => {
    const normalized = cleanString(value)
    await updateCoreProfile({ contact_phone: normalized ?? undefined })
  }

  const setContactEmailFromProfile = async (enabled: boolean) => {
    // TODO: cascade update info
    // If enabled and the user's profile email changes, propagate it to any
    // derived/contact surfaces that rely on this agent contact.
    await updateCoreProfile({
      contact_email_from_profile: enabled,
      ...(enabled ? { contact_email: '' } : {}),
    })
  }

  const setContactPhoneFromProfile = async (enabled: boolean) => {
    // TODO: cascade update info
    await updateCoreProfile({
      contact_phone_from_profile: enabled,
      ...(enabled ? { contact_phone: '' } : {}),
    })
  }

  const updateWebsiteUrl = async (value: string) => {
    const normalized = cleanString(value)
    await updateCoreProfile({ website_url: normalized ?? undefined })
  }

  const updateBadges = async (value: string) => {
    const normalized = (value || '').trim()
    if (!normalized.length) {
      await updateCoreProfile({ tags: [] })
      return
    }

    const badges = Array.from(
      new Set(
        normalized
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      )
    )

    await updateCoreProfile({ tags: badges })
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
    updateContactEmail,
    updateContactPhone,
    setContactEmailFromProfile,
    setContactPhoneFromProfile,
    updateWebsiteUrl,
    updateBadges,
  }
}
