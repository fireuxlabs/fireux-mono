import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
// Concurrent edit — 2026-07-20 19:32 CEST — Repo Efficiency Pass 2 of 6: constrain Chef meta and JSON-LD images to HTTPS.
import { readHttpsUrl } from 'fireux-core/runtime/utils/httpsUrl'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Chef } from '../../../../../../models/chef.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

type ChefSeoOptions = {
  id: MaybeRefOrGetter<string | null | undefined>
  displayName?: MaybeRefOrGetter<string | null | undefined>
}

export function buildChefJsonLd(
  chef: Partial<Chef> | null | undefined,
  displayName?: string
) {
  const name = clean(displayName || chef?.title)
  const id = clean(chef?.id)
  if (!name || !id) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: excerpt(chef?.summary || chef?.chef_bio),
    image: readHttpsUrl(chef?.chef_image) || undefined,
    jobTitle: clean(chef?.title) || 'Chef',
  }
}

export function useChefSeo(
  chef: MaybeRefOrGetter<Partial<Chef> | null | undefined>,
  options: ChefSeoOptions
) {
  const entry = computed(() => toValue(chef))
  const id = computed(() => clean(toValue(options.id) || entry.value?.id))
  const displayName = computed(() => clean(toValue(options.displayName)))
  const isPublic = computed(() => Boolean(entry.value && id.value))

  return useSeo({
    title: computed(() => displayName.value || clean(entry.value?.title) || 'Chef Profile'),
    description: computed(() => excerpt(entry.value?.summary || entry.value?.chef_bio || 'Chef profile details.')),
    image: computed(() => readHttpsUrl(entry.value?.chef_image)),
    path: computed(() => (id.value ? `/chefs/${encodeURIComponent(id.value)}` : '')),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildChefJsonLd(entry.value, displayName.value)),
  })
}
