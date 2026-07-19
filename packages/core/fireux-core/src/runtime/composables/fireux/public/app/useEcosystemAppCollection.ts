import { useAsyncData } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../app/FireUXConfig'
import type {
  AppDirectoryController,
  AppDirectoryEntry,
  DirectoryOutcome,
} from '../../../../models/core/supporting/directory'
import type { PublicCollectionResponse } from '../../../../server/utils/public-projection/public-dto.types'

/** Read the current owning Ecosystem's allowlisted public App projection. */
export function useEcosystemAppCollection(): AppDirectoryController {
  const { ecosystemId } = useFireUXConfig()
  const key = `ecosystem-app-directory-${ecosystemId || 'none'}`
  const { data, pending, error, refresh } = useAsyncData(
    key,
    () => $fetch<PublicCollectionResponse<AppDirectoryEntry>>('/api/public/apps'),
    { server: true, lazy: false }
  )

  const apps = computed(() => data.value?.items ?? [])
  const count = computed(() => apps.value.length)
  const outcome = computed<DirectoryOutcome>(() => {
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return count.value ? 'ready' : 'empty'
  })

  return {
    apps,
    count,
    pending,
    error,
    outcome,
    source: 'ecosystem',
    refresh,
  }
}
