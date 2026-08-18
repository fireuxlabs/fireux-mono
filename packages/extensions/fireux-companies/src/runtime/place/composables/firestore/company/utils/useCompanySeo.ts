import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { CompanyStorage } from '../../../../models/company.model.ts'
import type { CompanyView } from '../../../../models/company-public.model.ts'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildCompanyJsonLd(company: Partial<CompanyView> | null | undefined) {
  const name = clean(company?.name)
  const id = clean(company?.id)
  if (!name || !id || (company as any)?.verified !== true) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description: excerpt(company?.about || company?.brand_tagline || company?.short_address),
    image: clean(company?.image_url || company?.cover_image) || undefined,
    address: clean(company?.short_address) || undefined,
    url: clean(company?.website) || undefined,
  }
}

export function useCompanySeo(company: MaybeRefOrGetter<Partial<CompanyView> | null | undefined>) {
  const entry = computed(() => toValue(company))
  const id = computed(() => clean(entry.value?.id))
  const isPublic = computed(() => Boolean((entry.value as any)?.verified === true && id.value))

  return useSeo({
    title: computed(() => clean(entry.value?.name) || 'Company'),
    description: computed(() => excerpt(entry.value?.about || entry.value?.brand_tagline || entry.value?.short_address || entry.value?.website || 'Company details.')),
    image: computed(() => clean(entry.value?.image_url || entry.value?.cover_image)),
    path: computed(() =>
      id.value ? `/${CompanyStorage.collection}/${encodeURIComponent(id.value)}` : ''
    ),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildCompanyJsonLd(entry.value)),
  })
}
