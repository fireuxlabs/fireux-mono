import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
// Concurrent edit — 2026-07-20 19:32 CEST — Repo Efficiency Pass 2 of 6: constrain Professional meta and JSON-LD images to HTTPS.
import { readHttpsUrl } from 'fireux-core/runtime/utils/httpsUrl'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Professional } from '../../../../../../models/profiles/Professional/Professional.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

type ProfessionalSeoOptions = {
  id: MaybeRefOrGetter<string | null | undefined>
  displayName?: MaybeRefOrGetter<string | null | undefined>
}

export function buildProfessionalJsonLd(
  professional: Partial<Professional> | null | undefined,
  displayName?: string
) {
  const name = clean(displayName || professional?.title)
  const id = clean(professional?.id)
  if (!name || !id) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: excerpt(professional?.summary || professional?.bio || professional?.tagline),
    image: readHttpsUrl(professional?.image) || undefined,
    jobTitle: clean(professional?.title) || undefined,
    knowsAbout: professional?.tags?.length ? professional.tags : undefined,
  }
}

export function useProfessionalSeo(
  professional: MaybeRefOrGetter<Partial<Professional> | null | undefined>,
  options: ProfessionalSeoOptions
) {
  const entry = computed(() => toValue(professional))
  const id = computed(() => clean(toValue(options.id) || entry.value?.id))
  const displayName = computed(() => clean(toValue(options.displayName)))
  const isPublic = computed(() => Boolean(entry.value && id.value))

  return useSeo({
    title: computed(() => displayName.value || clean(entry.value?.title) || 'Professional Profile'),
    description: computed(() => excerpt(entry.value?.summary || entry.value?.bio || entry.value?.tagline || 'Professional profile.')),
    image: computed(() => readHttpsUrl(entry.value?.image)),
    path: computed(() => (id.value ? `/professionals/${encodeURIComponent(id.value)}` : '')),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildProfessionalJsonLd(entry.value, displayName.value)),
  })
}
