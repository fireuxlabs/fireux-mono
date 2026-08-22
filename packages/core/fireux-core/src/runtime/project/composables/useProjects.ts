import { useAsyncData } from '#imports'
import { computed, type Ref } from 'vue'
import type { CollectionResponse } from '../../models/utils/directory'
import type { DirectoryOutcome } from '../../types/directory-controller.types'
import type { Project } from '../models/project.model'

export type ProjectCollectionController = {
  projects: Ref<Project[]>
  count: Ref<number>
  pending: Ref<boolean>
  error: Ref<unknown>
  outcome: Ref<DirectoryOutcome>
  refresh: () => Promise<unknown>
}

/** Fetch the current server's canonical Project collection scope. */
export function useProjects(endpoint = '/api/projects'): ProjectCollectionController {
  const { data, pending, error, refresh } = useAsyncData(
    `projects:${endpoint}`,
    () => $fetch<CollectionResponse<Project>>(endpoint),
    { server: true, lazy: false }
  )
  const projects = computed<Project[]>(() => data.value?.items ?? [])
  const count = computed(() => projects.value.length)
  const outcome = computed<DirectoryOutcome>(() => {
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return count.value ? 'ready' : 'empty'
  })
  return { projects, count, pending, error, outcome, refresh }
}
