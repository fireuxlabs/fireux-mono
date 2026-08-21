import { useAsyncData } from '#imports'
import { computed } from 'vue'
import type { Ecosystem } from '../../../models/ecosystem.model.ts'

export function useEcosystemFetch(id: string | { value: string }) {
  const ecosystemId = computed(() =>
    typeof id === 'string'
      ? String(id || '').trim()
      : String(id.value || '').trim()
  )
  const state = useAsyncData<{ ecosystem: Ecosystem } | null>(
    () => `ecosystem-fetch|${ecosystemId.value || 'none'}`,
    () =>
      ecosystemId.value
        ? $fetch<{ ecosystem: Ecosystem }>(
            `/api/ecosystems/${encodeURIComponent(ecosystemId.value)}`
          )
        : Promise.resolve(null),
    { watch: [ecosystemId] }
  )
  return {
    ecosystem: computed(() => state.data.value?.ecosystem ?? null),
    pending: state.pending,
  }
}
