import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { PublicEcosystemDto } from '../../../server/utils/public-projection/public-dto.types'
import { useSeo } from '../seo/useSeo'

const text = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => text(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildEcosystemJsonLd(
  ecosystem: Partial<PublicEcosystemDto> | null | undefined
) {
  const id = text(ecosystem?.id)
  const name = text(ecosystem?.name)
  if (!id || !name || ecosystem?.status !== 'active') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description: excerpt(ecosystem?.description),
    image: text(ecosystem?.image_url) || undefined,
    sameAs: text(ecosystem?.website_url) || undefined,
  }
}

export function useEcosystemSeo(
  ecosystem: MaybeRefOrGetter<Partial<PublicEcosystemDto> | null | undefined>
) {
  const entry = computed(() => toValue(ecosystem))
  const id = computed(() => text(entry.value?.id))
  const isIndexable = computed(
    () => entry.value?.status === 'active' && Boolean(id.value)
  )

  return useSeo({
    title: computed(() => text(entry.value?.name) || 'Ecosystem'),
    description: computed(() => excerpt(entry.value?.description || 'FireUX ecosystem.')),
    image: computed(() => text(entry.value?.image_url)),
    path: computed(() => id.value ? `/ecosystems/${encodeURIComponent(id.value)}` : ''),
    robots: computed(() => isIndexable.value ? 'index, follow' : 'noindex, nofollow'),
    jsonLd: computed(() => buildEcosystemJsonLd(entry.value)),
  })
}
