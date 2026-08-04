// Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: emit SEO from the bounded canonical Job projection.
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { financialCurrencyMinorUnitDigits } from 'fireux-finance/runtime/utils/money'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { JobStorage } from '../../../../../models/job.model'
import type { JobView } from './view/useJobInterface'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

function compensationJsonLd(job: Partial<JobView>) {
  const compensation = job.compensation
  if (!compensation) return undefined
  const currencyCode = clean(compensation.currency_code).toUpperCase()
  let digits: number
  try {
    digits = financialCurrencyMinorUnitDigits(currencyCode)
  } catch {
    return undefined
  }

  return {
    '@type': 'MonetaryAmount',
    currency: currencyCode,
    value: {
      '@type': 'QuantitativeValue',
      value: compensation.amount_minor / 10 ** digits,
      unitText: compensation.unit.toUpperCase(),
    },
  }
}

export function buildJobJsonLd(job: Partial<JobView> | null | undefined) {
  const title = clean(job?.title)
  const id = clean(job?.id)
  if (!title || !id || job?.visibility !== 'public' || job?.status !== 'open') return null

  const companyName = clean(job.company?.short_name || job.company?.name)
  const placeName = clean(job.place?.short_name || job.place?.name)
  const placeAddress = clean(job.place?.short_address)

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description: excerpt(job.description),
    employmentType: clean(job.contract_type).replace(/_/g, ' '),
    hiringOrganization: companyName
      ? {
          '@type': 'Organization',
          name: companyName,
          logo: clean(job.company?.image_url) || undefined,
        }
      : undefined,
    jobLocation: placeName || placeAddress
      ? {
          '@type': 'Place',
          name: placeName || undefined,
          address: placeAddress
            ? { '@type': 'PostalAddress', streetAddress: placeAddress }
            : undefined,
        }
      : undefined,
    baseSalary: compensationJsonLd(job),
  }
}

export function useJobSeo(
  job: MaybeRefOrGetter<Partial<JobView> | null | undefined>
) {
  const entry = computed(() => toValue(job))
  const id = computed(() => clean(entry.value?.id))
  const isPublic = computed(() => Boolean(
    entry.value?.visibility === 'public' &&
    entry.value?.status === 'open' &&
    id.value
  ))

  return useSeo({
    title: computed(() => clean(entry.value?.title) || 'Job'),
    description: computed(() => excerpt(entry.value?.description || 'Job details.')),
    path: computed(() =>
      id.value ? `/${JobStorage.collection}/${encodeURIComponent(id.value)}` : ''
    ),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildJobJsonLd(entry.value)),
  })
}
