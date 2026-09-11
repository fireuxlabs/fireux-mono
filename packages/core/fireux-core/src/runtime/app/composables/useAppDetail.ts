import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useLiveAsyncData } from '../../composables/fireux/firestore/useLiveAsyncData'
import type { App } from '../models/app.model'
import type { DetailResponse } from '../../models/utils/directory'

/** Public App projection. The endpoint owns visibility and database scope. */
export function useAppDetail(endpoint: MaybeRefOrGetter<string>) {
  const url = computed(() => String(toValue(endpoint) || '').trim())
  const state = useLiveAsyncData(
    () => `app-detail:${url.value}`,
    async (fetch) => ({
      endpoint: url.value,
      response: url.value ? await fetch<DetailResponse<App>>(url.value) : null,
    })
  )
  const error = state.error
  const pending = state.pending
  const app = computed(() =>
    !error.value && state.data.value?.endpoint === url.value
      ? (state.data.value.response?.item ?? null)
      : null
  )
  const outcome = computed(() => {
    if (!url.value) return 'idle' as const
    if (pending.value) return 'pending' as const
    if (error.value)
      return error.value.statusCode === 404
        ? ('missing' as const)
        : ('error' as const)
    return app.value ? ('ready' as const) : ('missing' as const)
  })
  return {
    app,
    pending,
    error,
    outcome,
    refresh: state.refresh,
    ready: state.then(() => undefined),
  }
}
