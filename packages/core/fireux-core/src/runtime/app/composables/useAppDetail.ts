import { useAsyncData } from 'nuxt/app'
import { resolveHttpDocumentOutcome } from '../../utils/http-document-outcome'

import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type { App } from '../models/app.model'
import type { DetailResponse } from '../../models/utils/directory'

/** Public App projection. The endpoint owns visibility and database scope. */
export function useAppDetail(endpoint: MaybeRefOrGetter<string>) {
  const url = computed(() => String(toValue(endpoint) || '').trim())
  const state = useAsyncData(
    () => `app-detail:${url.value}`,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return {
        endpoint: url.value,
        response: url.value
          ? await fetchRead<DetailResponse<App>>(url.value)
          : null,
      }
    }
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
