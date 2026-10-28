import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
// Concurrent edit — 2026-07-20 19:32 CEST — Repo Efficiency Pass 2 of 6: constrain Professional meta and JSON-LD images to HTTPS.
import { readHttpsUrl } from 'fireux-core/runtime/utils/https-url'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Professional } from '../../../../utils/profiles/Professional/professional'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) =>
  clean(value).replace(/\s+/g, ' ').slice(0, 180)

type ProfessionalSeoOptions = {
  routeKey: MaybeRefOrGetter<string | null | undefined>
  displayName?: MaybeRefOrGetter<string | null | undefined>
}

export function buildProfessionalJsonLd(
  professional: Partial<Professional> | null | undefined,
  displayName?: string
) {
  const name = clean(displayName || professional?.title)
  const id = clean(professional?.id)
  if (!name || !id) return null

  const knowsAbout = (
    professional?.tags?.length
      ? professional.tags
      : (professional?.positions ?? [])
  )
    .map(clean)
    .filter(Boolean)
  const knowsLanguage = (professional?.languages ?? [])
    .map((entry) => clean(entry.language))
    .filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: excerpt(
      professional?.summary || professional?.bio || professional?.tagline
    ),
    image: readHttpsUrl(professional?.image) || undefined,
    jobTitle: clean(professional?.title) || undefined,
    knowsAbout: knowsAbout.length ? knowsAbout : undefined,
    knowsLanguage: knowsLanguage.length ? knowsLanguage : undefined,
  }
}

export function useProfessionalSeo(
  professional: MaybeRefOrGetter<Partial<Professional> | null | undefined>,
  options: ProfessionalSeoOptions
) {
  const entry = computed(() => toValue(professional))
  const routeKey = computed(() => clean(toValue(options.routeKey)))
  const displayName = computed(() => clean(toValue(options.displayName)))
  const isPublic = computed(() => Boolean(entry.value && routeKey.value))

  return useSeo({
    title: computed(() => {
      const role = clean(entry.value?.title)
      if (displayName.value && role && displayName.value !== role) {
        return `${displayName.value} — ${role}`
      }
      return displayName.value || role || 'Professional Profile'
    }),
    description: computed(() =>
      excerpt(
        entry.value?.summary ||
          entry.value?.bio ||
          entry.value?.tagline ||
          'Professional profile.'
      )
    ),
    image: computed(() => readHttpsUrl(entry.value?.image)),
    path: computed(() =>
      routeKey.value
        ? `/professionals/${encodeURIComponent(routeKey.value)}`
        : ''
    ),
    robots: computed(() =>
      isPublic.value ? 'index, follow' : 'noindex, nofollow'
    ),
    jsonLd: computed(() =>
      buildProfessionalJsonLd(entry.value, displayName.value)
    ),
  })
}
