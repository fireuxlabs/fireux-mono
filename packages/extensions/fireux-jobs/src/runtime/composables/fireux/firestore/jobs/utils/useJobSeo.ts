import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { JobStorage, type Job } from '../../../../../models/job.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildJobJsonLd(job: Partial<Job> | null | undefined) {
  const title = clean(job?.title)
  const id = clean(job?.id)
  if (!title || !id || job?.visibility !== 'public' || job?.status !== 'open') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description: excerpt(job?.description),
    employmentType: clean(job?.job_type) || undefined,
    jobLocationType: clean(job?.workplace_type) || undefined,
    hiringOrganization: clean(job?.company_id) ? { '@type': 'Organization', identifier: clean(job?.company_id) } : undefined,
  }
}

export function useJobSeo(job: MaybeRefOrGetter<Partial<Job> | null | undefined>) {
  const entry = computed(() => toValue(job))
  const id = computed(() => clean(entry.value?.id))
  const isPublic = computed(() => Boolean(entry.value?.visibility === 'public' && id.value))

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
