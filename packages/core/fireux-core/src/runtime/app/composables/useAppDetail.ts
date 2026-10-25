import { resolveHttpDocumentOutcome } from '../../utils/http-document-outcome'

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
  const pending = computed(() => outcome.value === 'pending')
  const app = computed(() =>
    !error.value &&
    !state.pending.value &&
    state.data.value?.endpoint === url.value
      ? (state.data.value.response?.item ?? null)
      : null
  )
  const outcome = computed(() =>
    resolveHttpDocumentOutcome({
      enabled: Boolean(url.value),
      pending: state.pending.value,
      error: error.value,
      present: Boolean(app.value),
    })
  )

  return {
    app,
    pending,
    error,
    outcome,
    refresh: state.refresh,
    ready: state.then(() => undefined),
  }
}
