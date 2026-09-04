import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'
import type { EcosystemDirectoryEntry } from 'fireux-core/runtime/models/utils/directory'
import { usePlatformDirectory } from './usePlatformDirectory'

export function usePlatformEcosystemDetail(
  id: MaybeRefOrGetter<string | null | undefined>
) {
  const ecosystemId = computed(() => String(toValue(id) || '').trim())
  const state = usePlatformDirectory()
  const entry = computed<EcosystemDirectoryEntry | null>(
    () =>
      state.data.value?.ecosystems.find(
        (candidate: EcosystemDirectoryEntry) =>
          candidate.id === ecosystemId.value ||
          candidate.detail_url === `/ecosystems/${ecosystemId.value}`
      ) ?? null
  )
  const ecosystem = computed<Ecosystem | null>(() => {
    const value = entry.value
    if (!value) return null
    return {
      id: value.id,
      project_id: value.project_id,
      status: value.status,
      name: value.name,
      description: value.description,
      image_url: value.image_url,
      website_url: value.website_url,
    }
  })
  const outcome = computed(() => {
    if (state.pending.value) return 'pending' as const
    if (state.error.value) return 'error' as const
    return ecosystem.value ? ('ready' as const) : ('missing' as const)
  })

  return {
    ecosystem,
    outcome,
    ready: state.then(() => undefined),
  }
}
