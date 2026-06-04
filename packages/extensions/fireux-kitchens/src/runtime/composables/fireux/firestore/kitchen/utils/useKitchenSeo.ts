import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Kitchen } from '../../../../../models/kitchen.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).slice(0, 180)

export function buildKitchenJsonLd(kitchen: Partial<Kitchen> | null | undefined) {
  const entry = kitchen as (Partial<Kitchen> & Record<string, unknown>) | null | undefined
  const name = clean(entry?.display_name || entry?.name)
  if (!entry?.show || !clean(entry.slug) || !name) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name,
    description: excerpt(entry?.tagline || entry?.formatted_address),
    image: clean(entry?.display_image_url || entry?.image_url) || undefined,
    address: clean(entry?.formatted_address) || undefined,
  }
}

export function useKitchenSeo(kitchen: MaybeRefOrGetter<Partial<Kitchen> | null | undefined>) {
  const entry = computed(() => toValue(kitchen))
  const slug = computed(() => clean(entry.value?.slug))
  const isPublic = computed(() => Boolean(entry.value?.show === true && slug.value))

  return useSeo({
    title: computed(() => {
      const kitchen = entry.value as (Partial<Kitchen> & Record<string, unknown>) | null | undefined
      return clean(kitchen?.display_name || kitchen?.name) || 'Kitchen'
    }),
    description: computed(() =>
      excerpt(entry.value?.tagline || entry.value?.short_address || entry.value?.formatted_address || 'Kitchen details.')
    ),
    image: computed(() => {
      const kitchen = entry.value as (Partial<Kitchen> & Record<string, unknown>) | null | undefined
      return clean(kitchen?.display_image_url || kitchen?.image_url)
    }),
    path: computed(() => (slug.value ? `/kitchens/${encodeURIComponent(slug.value)}` : '')),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildKitchenJsonLd(entry.value)),
  })
}
