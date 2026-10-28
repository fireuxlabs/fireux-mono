import { useAsyncData } from 'nuxt/app'
import { resolveReadOutcome } from 'fireux-core/runtime/utils/read-outcome'

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
  const { data, pending, error, refresh } = useAsyncData(
    `projects:${endpoint}`,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return fetchRead<CollectionResponse<ProjectPublicSummary>>(endpoint)
    },
    { server: true, lazy: false }
  )
  const candidates = computed<ProjectPublicSummary[]>(
    () => data.value?.items ?? []
  )
  const outcome = computed(
    () =>
      resolveReadOutcome({
        enabled: true,
        pending: pending.value,
        failed: Boolean(error.value),
        present: candidates.value.length > 0,
      }) as DirectoryOutcome
  )
  const projects = computed(() =>
    outcome.value === 'ready' ? candidates.value : []
  )
  const count = computed(() => projects.value.length)
  return { projects, count, pending, error, outcome, refresh }
}
