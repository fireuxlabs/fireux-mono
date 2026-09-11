import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed } from 'vue'
import type {
  DirectoryOutcome,
  EcosystemDirectoryController,
} from 'fireux-core/runtime/types/directory-controller.types'
import type {
  EcosystemDirectoryEntry,
  PlatformDirectoryResponse,
} from 'fireux-core/runtime/models/utils/directory'

export function usePlatformDirectory() {
  return useLiveAsyncData<PlatformDirectoryResponse>(
    'fireux-default-directory',
    (liveFetch) => liveFetch('/api/directory'),
    { server: true, lazy: false }
  )
}

export function usePlatformEcosystemDirectory(): EcosystemDirectoryController {
  const { data, pending, error, refresh } = usePlatformDirectory()
  const ecosystems = computed(() => data.value?.ecosystems ?? [])
  const count = computed(() => ecosystems.value.length)
  const outcome = computed<DirectoryOutcome>(() => {
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return count.value ? 'ready' : 'empty'
  })

  return {
    ecosystems,
    count,
    pending,
    error,
    outcome,
    source: 'platform',
    refresh,
  }
}

export function usePublishedPlatformEcosystemDirectory(): EcosystemDirectoryController {
  const { data, pending, error, refresh } = usePlatformDirectory()
  const ecosystems = computed(() =>
    (data.value?.ecosystems ?? []).filter(
      (ecosystem: EcosystemDirectoryEntry) => ecosystem.status === 'active'
    )
  )
  const count = computed(() => ecosystems.value.length)
  const outcome = computed<DirectoryOutcome>(() => {
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return count.value ? 'ready' : 'empty'
  })

  return {
    ecosystems,
    count,
    pending,
    error,
    outcome,
    source: 'platform',
    refresh,
  }
}
