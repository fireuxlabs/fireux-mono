import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, type Ref } from 'vue'
import type { CollectionResponse } from 'fireux-core/runtime/models/utils/directory'
import type { DirectoryOutcome } from 'fireux-core/runtime/types/directory-controller.types'
import type { ProjectPublicSummary } from '../models/project.model'

export type ProjectCollectionController = {
  projects: Ref<ProjectPublicSummary[]>
  count: Ref<number>
  pending: Ref<boolean>
  error: Ref<unknown>
  outcome: Ref<DirectoryOutcome>
  refresh: () => Promise<unknown>
}

/** Fetch the current server's canonical Project collection scope. */
export function useProjects(
  endpoint = '/api/projects'
): ProjectCollectionController {
  const { data, pending, error, refresh } = useLiveAsyncData(
    `projects:${endpoint}`,
    (liveFetch) => liveFetch<CollectionResponse<ProjectPublicSummary>>(endpoint),
    { server: true, lazy: false }
  )
  const candidates = computed<ProjectPublicSummary[]>(() => data.value?.items ?? [])
  const outcome = computed(() => resolveReadOutcome({
    kind: 'collection', active: true,
    pending: pending.value, error: error.value, present: candidates.value.length > 0,
  }) as DirectoryOutcome)
  const projects = computed(() => outcome.value === 'ready' ? candidates.value : [])
  const count = computed(() => projects.value.length)
  return { projects, count, pending, error, outcome, refresh }
}
