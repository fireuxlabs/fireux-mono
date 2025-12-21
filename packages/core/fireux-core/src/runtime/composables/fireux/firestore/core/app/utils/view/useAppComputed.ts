import { computed } from 'vue'
import type { Ref } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'
import type { User } from '../../../../../../../models/core/user.model'

export function useAppComputed(
  app: Ref<App | null | undefined>,
  pending?: Ref<boolean>,
  currentUser?: Ref<User | null | undefined>
) {
  const adminIds = computed(() => {
    const raw = Array.isArray(app.value?.admin_ids)
      ? (app.value?.admin_ids as Array<string | null | undefined>)
      : []

    return Array.from(
      new Set(
        raw
          .map((id) => (typeof id === 'string' ? id.trim() : ''))
          .filter((id) => id.length > 0)
      )
    )
  })

  const isInitialized = computed(() => {
    if (pending?.value) return false
    const value = app.value
    if (value === undefined) return false
    if (!adminIds.value.length) return false
    return true
  })

  const isCurrentUserAdmin = computed(() => {
    const uid = currentUser?.value?.id
    if (!uid) return false
    return adminIds.value.includes(uid)
  })

  return {
    isInitialized,
    adminIds,
    isCurrentUserAdmin,
  }
}
