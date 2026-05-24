import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Kitchen } from '../../../../../models/kitchen.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).slice(0, 180)

export function buildKitchenJsonLd(kitchen: Partial<Kitchen> | null | undefined) {
  if (!kitchen?.show || !clean(kitchen.slug) || !clean(kitchen.name)) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: clean(kitchen.name),
    description: excerpt(kitchen.tagline || kitchen.formatted_address),
    image: clean(kitchen.image_url) || undefined,
    address: clean(kitchen.formatted_address) || undefined,
  }
}

export function useKitchenSeo(kitchen: MaybeRefOrGetter<Partial<Kitchen> | null | undefined>) {
  const entry = computed(() => toValue(kitchen))
  const slug = computed(() => clean(entry.value?.slug))
  const isPublic = computed(() => Boolean(entry.value?.show === true && slug.value))

  return useSeo({
    title: computed(() => clean(entry.value?.name) || 'Kitchen'),
    description: computed(() =>
      excerpt(entry.value?.tagline || entry.value?.short_address || entry.value?.formatted_address || 'Kitchen details.')
    ),
    image: computed(() => clean(entry.value?.image_url)),
    path: computed(() => (slug.value ? `/kitchens/${encodeURIComponent(slug.value)}` : '')),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildKitchenJsonLd(entry.value)),
  })
}
