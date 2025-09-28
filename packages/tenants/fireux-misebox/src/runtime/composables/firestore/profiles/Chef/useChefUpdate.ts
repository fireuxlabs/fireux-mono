// packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefUpdate.ts
import { useScopedUpdater } from 'fireux-core/runtime/composables/firestore/useScopedUpdater'

// Tenant-scoped profile collection; updates should affect only this doc.
const COLLECTION = 'chefs'

export function useChefUpdate() {
  const { updateTenantCollection } = useScopedUpdater()

  const updateDisplayName = async (display_name: string) => {
    await updateTenantCollection(COLLECTION, { display_name })
  }

  const updateAvatar = async (avatarUrl: string) => {
    const sep = avatarUrl.includes('?') ? '&' : '?'
    const versioned = `${avatarUrl}${sep}v=${Date.now()}`
    await updateTenantCollection(COLLECTION, { avatar: versioned })
  }

  return { updateDisplayName, updateAvatar }
}
