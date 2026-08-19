import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { PortfolioStorage, type Portfolio } from '../models/portfolio.model.ts'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) =>
  clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildPortfolioJsonLd(
  portfolio: Partial<Portfolio> | null | undefined
) {
  const name = clean(portfolio?.name)
  const id = clean(portfolio?.id)
  if (!name || !id || portfolio?.status !== 'active') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description: excerpt(
      portfolio?.tagline || portfolio?.strategy_label || portfolio?.notes
    ),
    image: clean(portfolio?.image_url) || undefined,
  }
}

export function usePortfolioSeo(
  portfolio: MaybeRefOrGetter<Partial<Portfolio> | null | undefined>
) {
  const entry = computed(() => toValue(portfolio))
  const id = computed(() => clean(entry.value?.id))
  const isPublic = computed(() =>
    Boolean(entry.value?.status === 'active' && id.value)
  )

  return useSeo({
    title: computed(() => clean(entry.value?.name) || 'Portfolio'),
    description: computed(() =>
      excerpt(
        entry.value?.tagline ||
          entry.value?.strategy_label ||
          entry.value?.notes ||
          'Portfolio details.'
      )
    ),
    image: computed(() => clean(entry.value?.image_url)),
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
