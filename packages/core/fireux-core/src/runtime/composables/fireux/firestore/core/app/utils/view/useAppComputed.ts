import { computed } from 'vue'
import type { Ref } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'

export function useAppComputed(
  app: Ref<App | null | undefined>,
  pending?: Ref<boolean>
) {
  const isResolved = computed(() => {
    if (pending?.value) return false
    return app.value !== undefined
  })

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
    if (!isResolved.value) return false
    return adminIds.value.length > 0
  })

  return {
    isResolved,
    isInitialized,
  }
}
