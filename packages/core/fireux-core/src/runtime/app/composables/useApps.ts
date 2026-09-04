import { useAsyncData } from '#imports'
import { computed, type Ref } from 'vue'
import type { CollectionResponse } from '../../models/utils/directory'
import type { App } from '../models/app.model'
import { useAppCollection } from './firestore/fetch/useAppCollection'

export type AppCollectionController = {
  apps: Ref<App[]>
  count: Ref<number>
  pending: Ref<boolean>
  error: Ref<unknown | undefined>
  outcome: Ref<'idle' | 'pending' | 'error' | 'empty' | 'ready'>
}

/**
 * Read Apps. The canonical local collection is live Firestore; an explicit
 * platform endpoint remains a server-owned cross-database projection.
 */
export function useApps(endpoint = '/api/apps'): AppCollectionController {
  if (endpoint === '/api/apps') return useAppCollection()

  const state = useAsyncData(
    `apps:${endpoint}`,
    async () => {
      const response = await $fetch<CollectionResponse<App>>(endpoint)
      if (response?.ok !== true || !Array.isArray(response.items)) {
        throw new Error('The App collection response is invalid.')
      }
      return response
    },
    { server: true, lazy: false }
  )
  const apps = computed(() => state.data.value?.items ?? [])
  const count = computed(() => apps.value.length)
  const outcome = computed(() => {
    if (state.pending.value) return 'pending' as const
    if (state.error.value) return 'error' as const
    return count.value ? ('ready' as const) : ('empty' as const)
  })

  return {
    apps,
    count,
    pending: state.pending,
    error: state.error,
    outcome,
  }
}
