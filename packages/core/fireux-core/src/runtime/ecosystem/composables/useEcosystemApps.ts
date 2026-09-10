import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useAppCollection } from '../../app/composables/useAppCollection'

/** Public Apps belonging to one explicitly supplied Ecosystem. */
export function useEcosystemApps(id: MaybeRefOrGetter<string | null | undefined>) {
  const ecosystemId = computed(() => String(toValue(id) ?? '').trim())
  const endpoint = computed(() => ecosystemId.value
    ? `/api/platform/apps?ecosystemId=${encodeURIComponent(ecosystemId.value)}`
    : '')
  return { ecosystemId, ...useAppCollection(endpoint) }
}
