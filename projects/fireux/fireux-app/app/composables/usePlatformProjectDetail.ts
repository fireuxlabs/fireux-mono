import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import type { DetailResponse } from 'fireux-core/runtime/models/utils/directory'

export function usePlatformProjectDetail(id: MaybeRefOrGetter<string>) {
  const projectId = computed(() => String(toValue(id) || '').trim())
  const state = useLiveAsyncData<DetailResponse<Project> | null>(
    () => `fireux-project-detail-${projectId.value || 'none'}`,
    (liveFetch) =>
      projectId.value
        ? liveFetch(`/api/projects/${encodeURIComponent(projectId.value)}`)
        : null,
    { server: true, watch: [projectId] }
  )

  return {
    project: computed(() => state.data.value?.item ?? null),
    ready: state.then(() => undefined),
  }
}
