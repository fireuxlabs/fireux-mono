import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { CompanyStorage } from 'fireux-companies/runtime/models/company.model'
import type { CompanyHydrated } from '../fetch/types'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildCompanyJsonLd(company: Partial<CompanyHydrated> | null | undefined) {
  const name = clean(company?.name)
  const id = clean(company?.id)
  if (!name || !id || (company as any)?.verified !== true) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description: excerpt((company as any)?.about || (company as any)?.brand_tagline || company?.formatted_address),
    image: clean((company as any)?.image_url || (company as any)?.cover_image) || undefined,
    address: clean(company?.formatted_address) || undefined,
    url: clean((company as any)?.website) || undefined,
  }
}

export function useCompanySeo(company: MaybeRefOrGetter<Partial<CompanyHydrated> | null | undefined>) {
  const entry = computed(() => toValue(company))
  const id = computed(() => clean(entry.value?.id))
  const isPublic = computed(() => Boolean((entry.value as any)?.verified === true && id.value))

  return useSeo({
    title: computed(() => clean(entry.value?.name) || 'Company'),
    description: computed(() => excerpt((entry.value as any)?.about || (entry.value as any)?.brand_tagline || entry.value?.formatted_address || (entry.value as any)?.website || 'Company details.')),
    image: computed(() => clean((entry.value as any)?.image_url || (entry.value as any)?.cover_image)),
    path: computed(() =>
      id.value ? `/${CompanyStorage.collection}/${encodeURIComponent(id.value)}` : ''
    ),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildCompanyJsonLd(entry.value)),
  })
}
