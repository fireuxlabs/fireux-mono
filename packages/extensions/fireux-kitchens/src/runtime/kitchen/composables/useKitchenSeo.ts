import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { KitchenDetailPresentation } from '../models/kitchen-detail.model.ts'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).slice(0, 180)

export function buildKitchenJsonLd(
  kitchen: Partial<KitchenDetailPresentation> | null | undefined
) {
  const entry = kitchen as
    | (Partial<KitchenDetailPresentation> & Record<string, unknown>)
    | null
    | undefined
  const name = clean(entry?.display_name || entry?.name)
  if (entry?.visibility !== true || !clean(entry.slug) || !name) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name,
    description: excerpt(entry?.tagline || entry?.formatted_address),
    image:
      clean(
        entry?.cover_image || entry?.display_image_url || entry?.image_url
      ) || undefined,
    address: clean(entry?.formatted_address) || undefined,
  }
}

export function useKitchenSeo(
  kitchen: MaybeRefOrGetter<
    Partial<KitchenDetailPresentation> | null | undefined
  >
) {
  const entry = computed(() => toValue(kitchen))
  const view = computed(
    () =>
      entry.value as
        | (Partial<KitchenDetailPresentation> & Record<string, unknown>)
        | null
        | undefined
  )
  const slug = computed(() => clean(entry.value?.slug))
  const isIndexable = computed(() =>
    Boolean(entry.value?.visibility === true && slug.value)
  )

  return useSeo({
    title: computed(() => {
      return clean(view.value?.display_name || view.value?.name) || 'Kitchen'
    }),
    description: computed(() =>
      excerpt(
        view.value?.tagline ||
          view.value?.short_address ||
          view.value?.formatted_address ||
          view.value?.display_name ||
          view.value?.name ||
          ''
      )
    ),
    image: computed(() => {
      return clean(
        view.value?.cover_image ||
          view.value?.display_image_url ||
          view.value?.image_url
      )
    }),
    path: computed(() =>
      slug.value ? `/kitchens/${encodeURIComponent(slug.value)}` : ''
    ),
    robots: computed(() =>
      isIndexable.value ? 'index, follow' : 'noindex, nofollow'
    ),
    jsonLd: computed(() => buildKitchenJsonLd(entry.value)),
  })
}
