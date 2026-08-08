import { useAsyncData } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../app/FireUXConfig'
import type { AppDirectoryEntry } from '../../../../models/utils/directory'
import type {
  AppDirectoryController,
  DirectoryOutcome,
} from '../../../../types/directory-controller.types'
import type { PublicCollectionResponse } from '../../../../server/utils/public-projection/public-dto.types'

type UnknownError = {
  status?: unknown
  statusCode?: unknown
  response?: {
    status?: unknown
  }
}

function statusCode(error: unknown) {
  if (!error || typeof error !== 'object') return 0

  const candidate = error as UnknownError
  return Number(
    candidate.statusCode ?? candidate.status ?? candidate.response?.status ?? 0
  )
}

/** Read the current owning Ecosystem's allowlisted public App projection. */
export function useEcosystemAppCollection(): AppDirectoryController {
  const { ecosystemId } = useFireUXConfig()
  const key = `ecosystem-app-directory-${ecosystemId || 'none'}`
  const { data, pending, error, refresh } = useAsyncData(
    key,
    async () => {
      try {
        return await $fetch<PublicCollectionResponse<AppDirectoryEntry>>(
          '/api/public/apps'
        )
      } catch (cause) {
        if (statusCode(cause) === 404) {
          return {
            ok: true,
            count: 0,
            generatedAt: new Date().toISOString(),
            items: [],
          } as const
        }

        if (statusCode(cause) === 401 || statusCode(cause) === 403) {
          return {
            ok: false,
            count: 0,
            generatedAt: new Date().toISOString(),
            items: [],
          } as const
        }

        throw cause
      }
    },
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
