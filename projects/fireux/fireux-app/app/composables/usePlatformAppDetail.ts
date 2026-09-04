import { useAsyncData } from '#imports'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import type { DetailResponse } from 'fireux-core/runtime/models/utils/directory'

export function usePlatformAppDetail(id: MaybeRefOrGetter<string>) {
  const appId = computed(() => String(toValue(id) || '').trim())
  const state = useAsyncData<DetailResponse<App> | null>(
    () => `fireux-app-detail-${appId.value || 'none'}`,
    () =>
      appId.value
        ? $fetch(`/api/platform/apps/${encodeURIComponent(appId.value)}`)
        : null,
    { server: true, watch: [appId] }
  )
  const app = computed(() => state.data.value?.item ?? null)
  const outcome = computed(() => {
    if (state.pending.value) return 'pending' as const
    if (state.error.value) return 'error' as const
    return app.value ? ('ready' as const) : ('missing' as const)
  })

  return {
    app,
    outcome,
    ready: state.then(() => undefined),
  }
}
