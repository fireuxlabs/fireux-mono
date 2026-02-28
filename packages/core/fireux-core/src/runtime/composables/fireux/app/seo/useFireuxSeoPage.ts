import { useHead, useRoute, useRuntimeConfig, useSeoMeta } from '#imports'
import { useFireUXConfig } from '../FireUXConfig'

type AnyRecord = Record<string, unknown>

export type FireuxSeoPageInput = {
  title?: string
  description?: string
  path?: string
  image?: string
  noindex?: boolean
  type?: 'website' | 'article'
}

function normalizeSiteUrl(input: unknown): string | null {
  const value = typeof input === 'string' ? input.trim() : ''
  if (!value) return null

  const withProtocol = /^https?:\/\//i.test(value)
    ? value
    : `${isLocalHost(value) ? 'http' : 'https'}://${value}`

  try {
    return new URL(withProtocol).origin
  } catch {
    return null
  }
}

function isLocalHost(value: string): boolean {
  const host = value.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase()
  return (
    host === 'localhost' ||
    host.startsWith('localhost:') ||
    host === '127.0.0.1' ||
    host.startsWith('127.0.0.1:')
  )
}

function normalizePath(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return '/'
  if (!trimmed.startsWith('/')) return `/${trimmed}`
  return trimmed.replace(/\/+$/, '') || '/'
}

export function useFireuxSeoPage(input: FireuxSeoPageInput = {}) {
  const route = useRoute()
  const runtime = useRuntimeConfig()
  const fireuxConfig = useFireUXConfig()
  const fireux = ((runtime.public?.fireux || {}) as AnyRecord)
  const seo = ((fireux.seo || {}) as AnyRecord)

  const siteUrl =
    normalizeSiteUrl(seo.siteUrl) ||
    normalizeSiteUrl(fireuxConfig.siteUrl) ||
    normalizeSiteUrl(fireux.domain)

  const canonicalPath = normalizePath(input.path || route.path || '/')
  const canonicalUrl = siteUrl ? `${siteUrl}${canonicalPath}` : undefined

  const baseTitle = fireuxConfig.appName || 'FireUX'
  const pageTitle = input.title?.trim()
  const title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle
  const description =
    input.description?.trim() ||
    (typeof seo.defaultDescription === 'string' ? seo.defaultDescription : '') ||
    `${baseTitle} on FireUX`

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: input.type || 'website',
    ogUrl: canonicalUrl,
    ...(input.image ? { ogImage: input.image, twitterImage: input.image } : {}),
    robots: input.noindex ? 'noindex, nofollow' : 'index, follow',
    twitterCard: 'summary_large_image',
  })

  if (canonicalUrl) {
    useHead({
      link: [{ rel: 'canonical', href: canonicalUrl }],
    })
  }

  return {
    title,
    description,
    canonicalUrl,
  }
}
