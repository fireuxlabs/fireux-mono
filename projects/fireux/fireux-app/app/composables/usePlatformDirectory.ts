import { useAsyncData } from 'nuxt/app'

import { computed } from 'vue'
import type { EcosystemDirectoryEntry } from 'fireux-core/runtime/ecosystem/models/ecosystem-directory'
import type { PlatformDirectoryResponse } from '../../shared/platform-directory'

export function usePlatformDirectory() {
  return useAsyncData<PlatformDirectoryResponse>(
    'fireux-default-directory',
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return fetchRead('/api/directory')
    },
    { server: true, lazy: false }
  )
}

export function usePublishedPlatformEcosystemDirectory() {
  const { data, pending, error, refresh } = usePlatformDirectory()
  const ecosystems = computed(() =>
    (data.value?.ecosystems ?? []).filter(
      (ecosystem: EcosystemDirectoryEntry) => ecosystem.status === 'active'
    )
  )
  const count = computed(() => ecosystems.value.length)
  const outcome = computed(() => {
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
    source: 'platform' as const,
    refresh,
  }
}
