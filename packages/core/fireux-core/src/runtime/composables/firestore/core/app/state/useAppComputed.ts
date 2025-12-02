import { computed } from 'vue'
import type { Ref } from 'vue'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

export function useAppComputed(
  app: Ref<App | null | undefined>,
  pending?: Ref<boolean>
) {
  const isInitialized = computed(() => {
    if (pending?.value) {
      return true
    }

    const current = app.value
    if (current === undefined) {
      return true
    }

    return Boolean(current?.admin_ids?.length)
  })

  const adminIds = computed(() => {
    const ids = Array.isArray(app.value?.admin_ids)
      ? (app.value.admin_ids as Array<string | null | undefined>)
      : []

    return Array.from(
      new Set(
        ids
          .map((id) => (typeof id === 'string' ? id.trim() : ''))
          .filter((id) => id.length > 0)
      )
    )
  })

  return { isInitialized, adminIds }
}
