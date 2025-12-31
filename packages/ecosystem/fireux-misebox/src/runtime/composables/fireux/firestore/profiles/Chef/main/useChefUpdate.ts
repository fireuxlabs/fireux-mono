import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts'
import type { ChefCore } from '../../../../../../models/profiles/Chef/Chef.model.ts'

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
  const coreProfile = () => profile?.coreProfile?.value ?? null
  const appProfile = () => profile?.appProfile?.value ?? null

  /**
   * Update the CORE Chef profile
   * - global document (e.g. chefs/{uid})
   */
  const updateCoreProfile = async (
    patch: Partial<ChefCore>
  ): Promise<void> => {
    console.warn(
      '[useChefUpdate] updateCoreProfile stub called with:',
      patch,
      'current coreProfile:',
      coreProfile()
    )
  }

  /**
   * Update the APP (tenant) Chef profile
   * - app-specific document (e.g. apps/{appId}/chefs/{uid})
   */
  const updateAppProfile = async (
    patch: Partial<ChefCore>
  ): Promise<void> => {
    console.warn(
      '[useChefUpdate] updateAppProfile stub called with:',
      patch,
      'current appProfile:',
      appProfile()
    )
  }

  const cleanString = (value: string | null | undefined) => {
    const normalized = typeof value === 'string' ? value.trim() : ''
    return normalized.length ? normalized : ''
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
    updateTagline,
    updateBioShort,
  }
}
