import { computed } from 'vue'
import type { Ref } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'

export function useAppComputed(
  app: Ref<App | null | undefined>,
  pending?: Ref<boolean>
) {
  const isPending = computed(() => Boolean(pending?.value))
  const isLoading = computed(() => isPending.value || app.value === undefined)

  const isResolved = computed(() => {
    if (isPending.value) return false
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
    isLoading,
    isResolved,
    isInitialized,
  }
}
