import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Agent } from '../../../../../../models/profiles/Agent/Agent.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

type AgentSeoOptions = {
  id: MaybeRefOrGetter<string | null | undefined>
  displayName?: MaybeRefOrGetter<string | null | undefined>
}

export function buildAgentJsonLd(
  agent: Partial<Agent> | null | undefined,
  displayName?: string
) {
  const name = clean(displayName || agent?.title)
  const id = clean(agent?.id)
  if (!name || !id || (agent as any)?.visibility !== 'public') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description: excerpt(agent?.summary || agent?.agent_bio || agent?.tagline),
    image: clean(agent?.agent_image) || undefined,
    email: clean(agent?.agent_contact_email || agent?.contact_email) || undefined,
    telephone: clean(agent?.agent_contact_phone || agent?.contact_phone) || undefined,
    url: clean(agent?.agent_website_url || agent?.website_url) || undefined,
  }
}

export function useAgentSeo(
  agent: MaybeRefOrGetter<Partial<Agent> | null | undefined>,
  options: AgentSeoOptions
) {
  const entry = computed(() => toValue(agent))
  const id = computed(() => clean(toValue(options.id) || entry.value?.id))
  const displayName = computed(() => clean(toValue(options.displayName)))
  const isPublic = computed(() => Boolean((entry.value as any)?.visibility === 'public' && id.value))

  return useSeo({
    title: computed(() => displayName.value || clean(entry.value?.title) || 'Agent Profile'),
    description: computed(() => excerpt(entry.value?.summary || entry.value?.agent_bio || entry.value?.tagline || 'Agent profile.')),
    image: computed(() => clean(entry.value?.agent_image)),
    path: computed(() => (id.value ? `/agents/${encodeURIComponent(id.value)}` : '')),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildAgentJsonLd(entry.value, displayName.value)),
  })
}
