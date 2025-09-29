// packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefUpdate.ts
import { useScopedUpdater } from 'fireux-core/runtime/composables/firestore/scopedUpdater'

const COLLECTION = 'chefs'

/**
 * Tenant-scoped updater for the signed-in user's chef profile.
 * Always writes under apps/{appId}/chefs/{uid}.
 */
export function useChefUpdate() {
  const { update } = useScopedUpdater()

  const updateDisplayName = async (display_name: string) => {
    await update(COLLECTION, { display_name })
  }

  // Accepts a final URL; uploading is handled by AvatarPicker
  const updateAvatar = async (avatarUrl: string) => {
    await update(COLLECTION, { avatar: avatarUrl })
  }

  return { updateDisplayName, updateAvatar }
}
