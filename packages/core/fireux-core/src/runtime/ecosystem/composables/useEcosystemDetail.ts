import { resolveHttpDocumentOutcome } from '../../utils/http-document-outcome'

import { useLiveAsyncData } from '../../composables/fireux/firestore/useLiveAsyncData'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Ecosystem } from '../models/ecosystem.model'

export function useEcosystemDetail(id: MaybeRefOrGetter<string>) {
  const ecosystemId = computed(() => String(toValue(id) || '').trim())
  const state = useLiveAsyncData<{ ecosystem: Ecosystem } | null>(
    () => `ecosystem-detail-${ecosystemId.value || 'none'}`,
    (liveFetch) =>
      ecosystemId.value
        ? liveFetch(`/api/ecosystems/${encodeURIComponent(ecosystemId.value)}`)
        : null,
    { server: true, watch: [ecosystemId] }
  )

  const outcome = computed(() =>
    resolveHttpDocumentOutcome({
      enabled: Boolean(ecosystemId.value),
      pending: state.pending.value,
      error: state.error.value,
      present: state.data.value?.ecosystem?.id === ecosystemId.value,
    })
  )
  return {
    ecosystem: computed(() =>
      outcome.value === 'ready' ? (state.data.value?.ecosystem ?? null) : null
    ),
    pending: computed(() => outcome.value === 'pending'),
    error: state.error,
    outcome,
    ready: state.then(() => undefined),
  }
}
