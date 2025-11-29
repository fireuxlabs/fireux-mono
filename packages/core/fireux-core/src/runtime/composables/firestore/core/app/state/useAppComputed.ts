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

  return { isInitialized }
}
