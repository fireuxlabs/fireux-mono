import { useHead, useRequestURL, useRuntimeConfig, useSeoMeta } from '#imports'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export type FireuxSeoJsonLd =
  | Record<string, unknown>
  | Array<Record<string, unknown>>

export type UseSeoOptions = {
  title: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string | null | undefined>
  path: MaybeRefOrGetter<string | null | undefined>
  image?: MaybeRefOrGetter<string | null | undefined>
  robots?: MaybeRefOrGetter<string | null | undefined>
  jsonLd?: MaybeRefOrGetter<FireuxSeoJsonLd | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()

const normalizePath = (value: unknown) => {
  const path = clean(value)
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

const normalizeOrigin = (value: unknown) => {
  const raw = clean(value).replace(/\/$/, '')
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('localhost') || raw.startsWith('127.0.0.1')) {
    return `http://${raw}`
  }
  return `https://${raw}`
}

export function useSeo(options: UseSeoOptions) {
  const runtimeConfig = useRuntimeConfig()
  const requestUrl = useRequestURL()
  const fireux = ((runtimeConfig.public as any)?.fireux ?? {}) as Record<string, any>
  const seo = (fireux.seo ?? {}) as Record<string, any>

  const origin = computed(() =>
    normalizeOrigin(seo.siteUrl || fireux.siteUrl || fireux.domain || requestUrl.origin)
  )
  const path = computed(() => normalizePath(toValue(options.path)))
  const canonicalUrl = computed(() => {
    if (!origin.value || !path.value) return ''
    return `${origin.value}${path.value}`
  })
  const title = computed(() => clean(toValue(options.title)))
  const description = computed(() => clean(toValue(options.description)))
  const image = computed(() => clean(toValue(options.image)))
  const robots = computed(() => clean(toValue(options.robots)) || 'index, follow')
  const jsonLd = computed(() => toValue(options.jsonLd) ?? null)

  useSeoMeta(() => ({
    title: title.value || undefined,
    description: description.value || undefined,
    ogTitle: title.value || undefined,
    ogDescription: description.value || undefined,
    ogUrl: canonicalUrl.value || undefined,
    ogImage: image.value || undefined,
    twitterCard: image.value ? 'summary_large_image' : 'summary',
    twitterTitle: title.value || undefined,
    twitterDescription: description.value || undefined,
    twitterImage: image.value || undefined,
    robots: robots.value,
  }))

  useHead(() => ({
    link: canonicalUrl.value
      ? [{ rel: 'canonical', href: canonicalUrl.value }]
      : [],
    script: jsonLd.value
      ? [
          {
            key: 'fireux-entity-json-ld',
            type: 'application/ld+json',
            children: JSON.stringify(jsonLd.value),
          },
        ]
      : [],
  }))

  return {
    canonicalUrl,
    title,
    description,
    image,
    robots,
  }
}
