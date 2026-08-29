import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { type Place } from '../models/place.model.ts'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) =>
  clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildPlaceJsonLd(place: Place | null | undefined) {
  const name = clean(place?.name)
  const id = clean(place?.id)
  if (!name || !id || place?.verified !== true) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name,
    description: excerpt(
      place?.about || place?.tagline || place?.short_address
    ),
    image: clean(place?.cover_image || place?.image_url) || undefined,
    address: clean(place?.short_address) || undefined,
    url: clean(place?.website) || undefined,
  }
}

export function usePlaceSeo(place: MaybeRefOrGetter<Place | null | undefined>) {
  const entry = computed(() => toValue(place))
  const id = computed(() => clean(entry.value?.id))
  const isPublic = computed(() =>
    Boolean(entry.value?.verified === true && id.value)
  )

  return useSeo({
    title: computed(() => clean(entry.value?.name) || 'Place'),
    description: computed(() =>
      excerpt(
        entry.value?.about ||
          entry.value?.tagline ||
          entry.value?.short_address ||
          'Place details.'
      )
    ),
    image: computed(() =>
      clean(entry.value?.cover_image || entry.value?.image_url)
    ),
    path: computed(() =>
      id.value ? `/${'places'}/${encodeURIComponent(id.value)}` : ''
    ),
    robots: computed(() =>
      isPublic.value ? 'index, follow' : 'noindex, nofollow'
    ),
    jsonLd: computed(() => buildPlaceJsonLd(entry.value)),
  })
}
