import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
// Concurrent edit — 2026-07-20 19:32 CEST — Repo Efficiency Pass 2 of 6: constrain Agent meta and JSON-LD URLs to HTTPS.
import { readHttpsUrl } from 'fireux-core/runtime/utils/httpsUrl'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Agent } from '../../../../../../models/profiles/Agent/Agent.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) =>
  clean(value).replace(/\s+/g, ' ').slice(0, 180)

type AgentSeoOptions = {
  routeKey: MaybeRefOrGetter<string | null | undefined>
  displayName?: MaybeRefOrGetter<string | null | undefined>
}

export function buildAgentJsonLd(
  agent: Partial<Agent> | null | undefined,
  displayName?: string
) {
  const name = clean(displayName || agent?.title)
  const id = clean(agent?.id)
  if (!name || !id) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description: excerpt(agent?.summary || agent?.agent_bio || agent?.tagline),
    image: readHttpsUrl(agent?.agent_image) || undefined,
    email: clean(agent?.agent_contact_email) || undefined,
    telephone: clean(agent?.agent_contact_phone) || undefined,
    url: readHttpsUrl(agent?.agent_website_url) || undefined,
  }
}

export function useAgentSeo(
  agent: MaybeRefOrGetter<Partial<Agent> | null | undefined>,
  options: AgentSeoOptions
) {
  const entry = computed(() => toValue(agent))
  const routeKey = computed(() => clean(toValue(options.routeKey)))
  const displayName = computed(() => clean(toValue(options.displayName)))
  const isPublic = computed(() => Boolean(entry.value && routeKey.value))

  return useSeo({
    title: computed(
      () => displayName.value || clean(entry.value?.title) || 'Hiring profile'
    ),
    description: computed(() =>
      excerpt(
        entry.value?.summary ||
          entry.value?.agent_bio ||
          entry.value?.tagline ||
          'Hiring profile.'
      )
    ),
    image: computed(() => readHttpsUrl(entry.value?.agent_image)),
    path: computed(() =>
      routeKey.value ? `/agents/${encodeURIComponent(routeKey.value)}` : ''
    ),
    robots: computed(() =>
      isPublic.value ? 'index, follow' : 'noindex, nofollow'
    ),
    jsonLd: computed(() => buildAgentJsonLd(entry.value, displayName.value)),
  })
}
