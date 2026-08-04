import { useSeo } from '../../../../seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { EcosystemStorage } from '../../../../../../models/core/ecosystem.model'
import type { EcosystemSurface } from './view/useEcosystemInterface'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildEcosystemJsonLd(
  ecosystem: Partial<EcosystemSurface> | null | undefined
) {
  const name = clean(ecosystem?.name)
  const slug = clean(ecosystem?.slug)
  if (!name || !slug || ecosystem?.status !== 'active') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description: excerpt(ecosystem?.description),
    image: clean(ecosystem?.image_url) || undefined,
    sameAs:
      clean(ecosystem?.website_url || (ecosystem as any)?.source_url) || undefined,
  }
}

export function useEcosystemSeo(
  ecosystem: MaybeRefOrGetter<Partial<EcosystemSurface> | null | undefined>
) {
  const entry = computed(() => toValue(ecosystem))
  const slug = computed(() => clean(entry.value?.slug))
  const isPublic = computed(() => Boolean(entry.value?.status === 'active' && slug.value))

  return useSeo({
    title: computed(() => clean(entry.value?.name) || 'Ecosystem'),
    description: computed(() => excerpt(entry.value?.description || 'FireUX ecosystem.')),
    image: computed(() => clean(entry.value?.image_url)),
    path: computed(() =>
      slug.value
        ? `/${EcosystemStorage.collection}/${encodeURIComponent(slug.value)}`
        : ''
    ),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildEcosystemJsonLd(entry.value)),
  })
}
