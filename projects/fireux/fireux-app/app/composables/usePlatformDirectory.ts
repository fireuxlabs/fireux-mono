import { computed } from 'vue'
import type {
  AppDirectoryController,
  DirectoryOutcome,
  EcosystemDirectoryController,
  PlatformDirectoryResponse,
} from 'fireux-core/runtime/models/utils/directory'

const retiredPublicEcosystemSlugs = new Set(['cleanbox'])

export function usePlatformDirectory() {
  return useAsyncData<PlatformDirectoryResponse>(
    'fireux-platform-directory',
    () => $fetch('/api/public/directory'),
    { server: true, lazy: false }
  )
}

export function usePlatformAppDirectory(): AppDirectoryController {
  const { data, pending, error, refresh } = usePlatformDirectory()
  const apps = computed(() => data.value?.apps ?? [])
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
    source: 'platform',
    refresh,
  }
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
      (ecosystem) =>
        ecosystem.status === 'active' &&
        !retiredPublicEcosystemSlugs.has(ecosystem.slug)
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
