import { useHead, useRequestURL, useRuntimeConfig, useSeoMeta } from '#imports'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export type FireuxSeoJsonLd =
  | Record<string, unknown>
  | Array<Record<string, unknown>>

export type FireuxSeoBuilderContext = {
  canonicalUrl: string
  description: string
  image: string
  origin: string
  title: string
  absoluteUrl: (value: unknown) => string
}

export type UseSeoOptions = {
  title: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string | null | undefined>
  path: MaybeRefOrGetter<string | null | undefined>
  image?: MaybeRefOrGetter<string | null | undefined>
  robots?: MaybeRefOrGetter<string | null | undefined>
  jsonLd?: MaybeRefOrGetter<FireuxSeoJsonLd | null | undefined>
  jsonLdBuilder?: (
    context: FireuxSeoBuilderContext
  ) => FireuxSeoJsonLd | null | undefined
}

export type UseAppLandingSeoOptions = {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  path?: MaybeRefOrGetter<string | null | undefined>
  image?: MaybeRefOrGetter<string | null | undefined>
  logo?: MaybeRefOrGetter<string | null | undefined>
  appName?: MaybeRefOrGetter<string | null | undefined>
  language?: MaybeRefOrGetter<string | null | undefined>
}

export type FireuxPublicPageJsonLdItem = {
  name: string
  url: string
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
  const candidate = /^https?:\/\//i.test(raw)
    ? raw
    : `${raw.startsWith('localhost') || raw.startsWith('127.0.0.1') ? 'http' : 'https'}://${raw}`

  try {
    return new URL(candidate).origin
  } catch {
    return ''
  }
}

const absoluteUrl = (origin: string, value: unknown) => {
  const raw = clean(value)
  if (!raw) return ''

  try {
    return new URL(raw, origin || undefined).toString()
  } catch {
    return raw
  }
}

const serializeJsonLd = (value: FireuxSeoJsonLd) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

export function buildAppLandingJsonLd(input: {
  appName: string
  canonicalUrl: string
  description: string
  image?: string
  language?: string
  logo?: string
  title: string
}): FireuxSeoJsonLd | null {
  const appName = clean(input.appName)
  const canonicalUrl = clean(input.canonicalUrl)
  const description = clean(input.description)
  const title = clean(input.title)
  if (!appName || !canonicalUrl || !description || !title) return null

  let siteUrl = ''
  try {
    siteUrl = `${new URL(canonicalUrl).origin}/`
  } catch {
    return null
  }

  const organizationId = `${siteUrl}#organization`
  const websiteId = `${siteUrl}#website`
  const webpageId = `${canonicalUrl}#webpage`
  const image = clean(input.image)
  const language = clean(input.language)
  const logo = clean(input.logo)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: appName,
        url: siteUrl,
        ...(logo ? { logo } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: siteUrl,
        name: appName,
        description,
        publisher: { '@id': organizationId },
        ...(language ? { inLanguage: language } : {}),
      },
      {
        '@type': 'WebPage',
        '@id': webpageId,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: { '@id': websiteId },
        about: { '@id': organizationId },
        ...(language ? { inLanguage: language } : {}),
        ...(image ? { primaryImageOfPage: image } : {}),
      },
    ],
  }
}

export function buildPublicPageJsonLd(input: {
  canonicalUrl: string
  description: string
  image?: string
  items?: FireuxPublicPageJsonLdItem[]
  pageType?: 'CollectionPage' | 'WebPage'
  title: string
}): FireuxSeoJsonLd | null {
  const canonicalUrl = clean(input.canonicalUrl)
  const description = clean(input.description)
  const title = clean(input.title)
  if (!canonicalUrl || !description || !title) return null

  let siteUrl = ''
  try {
    siteUrl = `${new URL(canonicalUrl).origin}/`
  } catch {
    return null
  }

  const webpageId = `${canonicalUrl}#webpage`
  const itemListId = `${canonicalUrl}#item-list`
  const image = clean(input.image)
  const items = (input.items ?? [])
    .map((item) => ({ name: clean(item.name), url: clean(item.url) }))
    .filter((item) => item.name && item.url)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': input.pageType ?? 'WebPage',
        '@id': webpageId,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: { '@id': `${siteUrl}#website` },
        ...(image ? { primaryImageOfPage: image } : {}),
        ...(items.length ? { mainEntity: { '@id': itemListId } } : {}),
      },
      ...(items.length
        ? [
            {
              '@type': 'ItemList',
              '@id': itemListId,
              itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                url: item.url,
              })),
            },
          ]
        : []),
    ],
  }
}

export function useSeo(options: UseSeoOptions) {
  const runtimeConfig = useRuntimeConfig()
  const requestUrl = useRequestURL()
  const fireux = ((runtimeConfig.public as any)?.fireux ?? {}) as Record<
    string,
    any
  >
  const seo = (fireux.seo ?? {}) as Record<string, any>

  const origin = computed(() =>
    normalizeOrigin(
      seo.siteUrl || fireux.siteUrl || fireux.domain || requestUrl.origin
    )
  )
  const path = computed(() => normalizePath(toValue(options.path)))
  const canonicalUrl = computed(() => {
    if (!origin.value || !path.value) return ''
    return `${origin.value}${path.value}`
  })
  const title = computed(() => clean(toValue(options.title)))
  const description = computed(() => clean(toValue(options.description)))
  const image = computed(() =>
    absoluteUrl(origin.value, clean(toValue(options.image)))
  )
  const robots = computed(
    () => clean(toValue(options.robots)) || 'index, follow'
  )
  const jsonLd = computed(() => {
    if (options.jsonLdBuilder) {
      return (
        options.jsonLdBuilder({
          canonicalUrl: canonicalUrl.value,
          description: description.value,
          image: image.value,
          origin: origin.value,
          title: title.value,
          absoluteUrl: (value) => absoluteUrl(origin.value, value),
        }) ?? null
      )
    }
    return toValue(options.jsonLd) ?? null
  })

  useSeoMeta({
    title: () => title.value || undefined,
    description: () => description.value || undefined,
    ogTitle: () => title.value || undefined,
    ogDescription: () => description.value || undefined,
    ogUrl: () => canonicalUrl.value || undefined,
    ogImage: () => image.value || undefined,
    twitterCard: () => (image.value ? 'summary_large_image' : 'summary'),
    twitterTitle: () => title.value || undefined,
    twitterDescription: () => description.value || undefined,
    twitterImage: () => image.value || undefined,
    robots: () => robots.value,
  })

  useHead(() => ({
    link: canonicalUrl.value
      ? [{ rel: 'canonical', href: canonicalUrl.value }]
      : [],
    script: jsonLd.value
      ? [
          {
            key: 'fireux-entity-json-ld',
            type: 'application/ld+json',
            children: serializeJsonLd(jsonLd.value),
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

export function useAppLandingSeo(options: UseAppLandingSeoOptions) {
  const runtimeConfig = useRuntimeConfig()
  const fireux = ((runtimeConfig.public as any)?.fireux ?? {}) as Record<
    string,
    unknown
  >

  return useSeo({
    title: options.title,
    description: options.description,
    path: options.path ?? '/',
    image: options.image,
    jsonLdBuilder: (context) =>
      buildAppLandingJsonLd({
        appName: clean(toValue(options.appName)) || clean(fireux.name),
        canonicalUrl: context.canonicalUrl,
        description: context.description,
        image: context.image,
        language: clean(toValue(options.language)),
        logo: context.absoluteUrl(toValue(options.logo)),
        title: context.title,
      }),
  })
}
