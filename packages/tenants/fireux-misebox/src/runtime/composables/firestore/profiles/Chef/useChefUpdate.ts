// packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefUpdate.ts
import { useScopedUpdater } from 'fireux-core/runtime/composables/firestore/scopedUpdater'

// Tenant-scoped profile collection; updates should affect only this doc.
const COLLECTION = 'chefs'

export function useChefUpdate() {
  const { update: updateChef } = useScopedUpdater(COLLECTION as 'chefs')

  const updateDisplayName = async (display_name: string) => {
    await updateChef({ display_name })
  }

  const updateAvatar = async (avatarUrl: string) => {
    const sep = avatarUrl.includes('?') ? '&' : '?'
    const versioned = `${avatarUrl}${sep}v=${Date.now()}`
    await updateChef({ avatar: versioned })
  }

  return { updateDisplayName, updateAvatar }
}
