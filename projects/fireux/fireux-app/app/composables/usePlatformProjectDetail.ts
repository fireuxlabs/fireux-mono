import { useAsyncData } from '#imports'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import type { DetailResponse } from 'fireux-core/runtime/models/utils/directory'

export function usePlatformProjectDetail(id: MaybeRefOrGetter<string>) {
  const projectId = computed(() => String(toValue(id) || '').trim())
  const state = useAsyncData<DetailResponse<Project> | null>(
    () => `fireux-project-detail-${projectId.value || 'none'}`,
    () =>
      projectId.value
        ? $fetch(`/api/projects/${encodeURIComponent(projectId.value)}`)
        : null,
    { server: true, watch: [projectId] }
  )

  return {
    project: computed(() => state.data.value?.item ?? null),
    ready: state.then(() => undefined),
  }
}
