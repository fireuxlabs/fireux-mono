import type { Ref } from 'vue'
import { computed } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'

export function useAppComputed(
  app: Ref<App | null | undefined>,
  pending?: Ref<boolean>
) {
  const isPending = computed(() => Boolean(pending?.value))
  const isLoading = computed(() => isPending.value || app.value === undefined)
  const hasAppDoc = computed(() => app.value !== undefined && app.value !== null)

  const isResolved = computed(() => {
    if (isPending.value) return false
    return app.value !== undefined
  })

  const isInitialized = computed(() => {
    if (!isResolved.value) return false
    return hasAppDoc.value
  })

  return {
    isLoading,
    isResolved,
    isInitialized,
  }
}
