import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { PortfolioStorage } from '../models/portfolio.model.ts'
import type { PortfolioPublicSummary } from '../models/portfolio-read.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) =>
  clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildPortfolioJsonLd(
  portfolio: Partial<PortfolioPublicSummary> | null | undefined
) {
  const name = clean(portfolio?.identity?.name)
  const id = clean(portfolio?.id)
  if (!name || !id || portfolio?.identity?.status !== 'active') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description: excerpt(portfolio?.identity?.tagline),
    image: clean(portfolio?.identity?.image_url) || undefined,
  }
}

export function usePortfolioSeo(
  portfolio: MaybeRefOrGetter<
    Partial<PortfolioPublicSummary> | null | undefined
  >
) {
  const entry = computed(() => toValue(portfolio))
  const id = computed(() => clean(entry.value?.id))
  const isPublic = computed(() =>
    Boolean(entry.value?.identity?.status === 'active' && id.value)
  )

  return useSeo({
    title: computed(() => clean(entry.value?.identity?.name) || 'Portfolio'),
    description: computed(() =>
      excerpt(entry.value?.identity?.tagline || 'Portfolio details.')
    ),
    image: computed(() => clean(entry.value?.identity?.image_url)),
    path: computed(() =>
      id.value
        ? `/${PortfolioStorage.rootCollection}/${encodeURIComponent(id.value)}`
        : ''
    ),
    robots: computed(() =>
      isPublic.value ? 'index, follow' : 'noindex, nofollow'
    ),
    jsonLd: computed(() => buildPortfolioJsonLd(entry.value)),
  })
}
