import { useAsyncData } from '#imports'
import { computed, type Ref } from 'vue'
import type { CollectionResponse } from '../../models/utils/directory'
import type { DirectoryOutcome } from '../../types/directory-controller.types'
import type { App } from '../models/app.model'

export type AppCollectionController = {
  apps: Ref<App[]>
  count: Ref<number>
  pending: Ref<boolean>
  error: Ref<unknown>
  outcome: Ref<DirectoryOutcome>
  refresh: () => Promise<unknown>
}

/** Fetch the current server's canonical App collection scope. */
export function useApps(endpoint = '/api/apps'): AppCollectionController {
  const { data, pending, error, refresh } = useAsyncData(
    `apps:${endpoint}`,
    () => $fetch<CollectionResponse<App>>(endpoint),
    { server: true, lazy: false }
  )
  const apps = computed<App[]>(() => data.value?.items ?? [])
  const count = computed(() => apps.value.length)
  const outcome = computed<DirectoryOutcome>(() => {
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return count.value ? 'ready' : 'empty'
  })

  return { apps, count, pending, error, outcome, refresh }
}
