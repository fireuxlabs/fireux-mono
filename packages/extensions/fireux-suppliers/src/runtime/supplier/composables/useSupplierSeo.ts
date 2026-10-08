import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { SupplierStorage, type Supplier } from '../models/Supplier.model.ts'
import type { Place } from 'fireux-places/runtime/place/models/place.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) =>
  clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildSupplierJsonLd(
  supplier: Partial<Supplier> | null | undefined,
  place: Partial<Place> | null | undefined
) {
  const name = clean(place?.short_name || place?.name)
  const id = clean(supplier?.id)
  if (
    !name ||
    !id ||
    supplier?.identity?.status !== 'active' ||
    !supplier.identity.visibility
  ) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description: excerpt(place?.about || place?.tagline),
    image: clean(place?.logo_image || place?.image_url) || undefined,
  }
}

export function useSupplierSeo(
  supplier: MaybeRefOrGetter<Partial<Supplier> | null | undefined>,
  place: MaybeRefOrGetter<Partial<Place> | null | undefined>
) {
  const entry = computed(() => toValue(supplier))
  const location = computed(() => toValue(place))
  const id = computed(() => clean(entry.value?.id))
  const slug = computed(() => clean(entry.value?.identity?.slug))
  const routeId = computed(() => slug.value || id.value)
  const isPublished = computed(() =>
    Boolean(
      id.value &&
        routeId.value &&
        entry.value?.identity?.status === 'active' &&
        entry.value?.identity?.visibility === true
    )
  )

  return useSeo({
    title: computed(
      () =>
        clean(location.value?.short_name || location.value?.name) || 'Supplier'
    ),
    description: computed(() =>
      excerpt(
        location.value?.about || location.value?.tagline || 'Supplier details.'
      )
    ),
    image: computed(() =>
      clean(location.value?.logo_image || location.value?.image_url)
    ),
    path: computed(() =>
      routeId.value
        ? `/${SupplierStorage.collection}/${encodeURIComponent(routeId.value)}`
        : ''
    ),
    robots: computed(() =>
      isPublished.value ? 'index, follow' : 'noindex, nofollow'
    ),
    jsonLd: computed(() => buildSupplierJsonLd(entry.value, location.value)),
  })
}
