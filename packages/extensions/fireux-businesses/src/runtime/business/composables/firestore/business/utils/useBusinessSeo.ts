import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Business } from '../../../../models/business.model'

/** Public indexing awaits a Business-owned publication contract. */
export function useBusinessSeo(business: MaybeRefOrGetter<Business | null | undefined>) {
  const entry = computed(() => toValue(business))
  return useSeo({
    title: computed(() => entry.value?.name || 'Business'),
    description: computed(() => entry.value?.description || 'Business details.'),
    path: computed(() => entry.value ? `/businesses/${encodeURIComponent(entry.value.id)}` : ''),
    robots: 'noindex, nofollow',
  })
}
