import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { DriverProfile } from '../../utils/driver.ts'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) =>
  clean(value).replace(/\s+/g, ' ').slice(0, 180)

type DriverSeoOptions = {
  displayName?: MaybeRefOrGetter<string | null | undefined>
  routeKey: MaybeRefOrGetter<string | null | undefined>
}

export function buildDriverJsonLd(
  driver: Partial<DriverProfile> | null | undefined,
  displayName?: string
) {
  const name = clean(displayName || driver?.title)
  if (!name || !clean(driver?.id)) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: excerpt(driver?.tagline || driver?.subtitle),
    jobTitle: clean(driver?.title) || 'Delivery driver',
  }
}

export function useDriverSeo(
  driver: MaybeRefOrGetter<Partial<DriverProfile> | null | undefined>,
  options: DriverSeoOptions
) {
  const entry = computed(() => toValue(driver))
  const routeKey = computed(() => clean(toValue(options.routeKey)))
  const displayName = computed(() => clean(toValue(options.displayName)))
  const isPublic = computed(() => Boolean(entry.value && routeKey.value))

  return useSeo({
    title: computed(
      () => displayName.value || clean(entry.value?.title) || 'Driver Profile'
    ),
    description: computed(() =>
      excerpt(
        entry.value?.tagline ||
          entry.value?.subtitle ||
          'Delivery driver profile.'
      )
    ),
    path: computed(() =>
      routeKey.value ? `/drivers/${encodeURIComponent(routeKey.value)}` : ''
    ),
    robots: computed(() =>
      isPublic.value ? 'index, follow' : 'noindex, nofollow'
    ),
    jsonLd: computed(() => buildDriverJsonLd(entry.value, displayName.value)),
  })
}
