import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Place } from '../../../../../models/place.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildPlaceJsonLd(place: Partial<Place> | null | undefined) {
  const name = clean(place?.name)
  const id = clean(place?.id)
  if (!name || !id || place?.verified !== true) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name,
    description: excerpt(place?.about || place?.brand_tagline || place?.formatted_address),
    image: clean(place?.image_url || place?.cover_image) || undefined,
    address: clean(place?.formatted_address) || undefined,
    telephone: clean(place?.phone) || undefined,
    url: clean(place?.website) || undefined,
  }
}

export function usePlaceSeo(place: MaybeRefOrGetter<Partial<Place> | null | undefined>) {
  const entry = computed(() => toValue(place))
  const id = computed(() => clean(entry.value?.id))
  const isPublic = computed(() => Boolean(entry.value?.verified === true && id.value))

  return useSeo({
    title: computed(() => clean(entry.value?.name) || 'Place'),
    description: computed(() => excerpt(entry.value?.about || entry.value?.brand_tagline || entry.value?.formatted_address || 'Place details.')),
    image: computed(() => clean(entry.value?.image_url || entry.value?.cover_image)),
    path: computed(() => (id.value ? `/places/${encodeURIComponent(id.value)}` : '')),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildPlaceJsonLd(entry.value)),
  })
}
