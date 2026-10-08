import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { ProjectPublicSummary } from '../models/project.model'
import type { DetailResponse } from 'fireux-core/runtime/models/utils/directory'

export function useProjectDetail(id: MaybeRefOrGetter<string>) {
  const projectId = computed(() => String(toValue(id) || '').trim())
  const state = useLiveAsyncData<DetailResponse<ProjectPublicSummary> | null>(
    () => `project-detail-${projectId.value || 'none'}`,
    (liveFetch) =>
      projectId.value
        ? liveFetch(`/api/projects/${encodeURIComponent(projectId.value)}`)
        : null,
    { server: true, watch: [projectId] }
  )

  const outcome = computed(() =>
    resolveReadOutcome({
      active: Boolean(projectId.value),
      pending: state.pending.value,
      error: state.error.value,
      kind: 'document',
      present: state.data.value?.item?.id === projectId.value,
    })
  )
  return {
    project: computed(() =>
      outcome.value === 'ready' ? (state.data.value?.item ?? null) : null
    ),
    pending: computed(() => outcome.value === 'pending'),
    error: state.error,
    outcome,
    ready: state.then(() => undefined),
  }
}
