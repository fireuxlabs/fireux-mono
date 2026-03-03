// packages/core/fireux-core/src/runtime/composables/fireux/app/runtime-app/useRuntimeAppData.ts

import { computed, type ComputedRef, type Ref } from 'vue'
import { useFireUXConfig } from '../../../FireUXConfig'

export function useRuntimeAppData(params: {
  id: Ref<string>
  isReadOnly: Ref<boolean>
  collectionPath: Ref<string>
  doc: ComputedRef<any | null>
  pending: Ref<boolean> | ComputedRef<boolean>
}) {
  const cfg = useFireUXConfig()

  const ecosystem = computed(() => String(cfg.ecosystem || '').trim())
  const role = computed(() => cfg.role)
  const modules = computed(() => cfg.modules ?? [])

  const isLoading = computed(() => Boolean(params.pending.value))
  const isReady = computed(() => {
    if (!params.id.value) return false
    if (isLoading.value) return false
    return Boolean(params.doc.value)
  })

  const name = computed(() =>
    String(params.doc.value?.app_name || cfg.appName || '').trim()
  )
  const shortName = computed(() =>
    String(params.doc.value?.app_short_name || cfg.appShortName || '').trim()
  )

  return {
    ecosystem,
    role,
    modules,
    isLoading,
    isReady,
    name,
    shortName,
  }
}