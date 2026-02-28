import type { NuxtConfig } from '@nuxt/schema'

type AnyRecord = Record<string, any>

export type FireuxSeoConfig = {
  enabled?: boolean
  siteUrl?: string
  defaultDescription?: string

  /**
   * Optional app-level declarations (agnostic).
   * Extensions can also contribute via hooks.
   */
  hubs?: string[]
  staticPaths?: string[]

  /**
   * robots.txt and indexing controls
   */
  disallowPaths?: string[]
  noindexPaths?: string[]
}

export type FireuxSeoResolved = {
  enabled: boolean
  siteUrl: string
  defaultDescription: string
  hubs: string[]
  sitemapPaths: string[]
  disallowPaths: string[]
  noindexPaths: string[]
}

type ConfigureFireuxSeoOptions = {
  appName: string
  domain: string
  seo?: FireuxSeoConfig
}

type FireuxPageRecord = {
  path?: string
  meta?: Record<string, any>
  children?: FireuxPageRecord[]
}

/**
 * FireUX hook contract:
 * Extensions (jobs/kitchens/blogs/etc.) can contribute SEO surfaces without core knowing anything about them.
 *
 * Usage in an extension module setup():
 *   nuxt.hook('fireux:seo:extend', (ctx) => {
 *     ctx.addHub('/jobs')
 *     ctx.addDisallow('/console/jobs')
 *     ctx.addNoindex('/console/jobs/**')
 *   })
 */
export type FireuxSeoExtendContext = {
  addHub: (path: string) => void
  addStaticPath: (path: string) => void
  addDisallow: (path: string) => void
  addNoindex: (pattern: string) => void
}

const DEFAULT_DISALLOW = ['/console', '/admin']
const DEFAULT_NOINDEX = [
  '/console',
  '/console/**',
  '/admin',
  '/admin/**',
]
const AUTO_EXCLUDED_PREFIXES = ['/api', '/_nuxt', '/dev', '/admin', '/console', '/dashboard', '/auth']
const AUTO_EXCLUDED_SEGMENTS = new Set([
  'admin',
  'console',
  'dashboard',
  'dev',
  'auth',
  'create',
  'edit',
  'checkout',
  'success',
])

function normalizeSiteUrl(input?: string): string {
  const raw = String(input || '').trim()
  if (!raw) return ''

  const withProtocol = /^https?:\/\//i.test(raw)
    ? raw
    : `${isLocalHost(raw) ? 'http' : 'https'}://${raw}`

  try {
    return new URL(withProtocol).origin
  } catch {
    return ''
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

function normalizePath(input: string): string | null {
  let path = input.trim()
  if (!path) return null

  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname || '/'
    } catch {
      return null
    }
  }

  const queryIdx = path.indexOf('?')
  if (queryIdx >= 0) path = path.slice(0, queryIdx)
  const hashIdx = path.indexOf('#')
  if (hashIdx >= 0) path = path.slice(0, hashIdx)

  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/+$/, '')
  return path || '/'
}

function normalizeNoindexPattern(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null
  if (raw.includes('*')) return raw.startsWith('/') ? raw : `/${raw}`
  return normalizePath(raw)
}

function uniq(values: (string | null | undefined)[]): string[] {
  const set = new Set<string>()
  for (const value of values) {
    const normalized = value?.trim()
    if (!normalized) continue
    set.add(normalized)
  }
  return Array.from(set)
}

function normalizePaths(values: readonly string[]): string[] {
  return uniq(values.map((v) => normalizePath(v)))
}

function normalizePatterns(values: readonly string[]): string[] {
  return uniq(values.map((v) => normalizeNoindexPattern(v)))
}

function globToRegex(pattern: string) {
  let regex = '^'
  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i]
    if (char === '*') {
      const next = pattern[i + 1]
      if (next === '*') {
        regex += '.*'
        i += 1
      } else {
        regex += '[^/]*'
      }
    } else if (char === '?') {
      regex += '[^/]'
    } else {
      regex += char.replace(/[\\^$+?.()|[\]{}]/g, '\\$&')
    }
  }
  regex += '$'
  return new RegExp(regex)
}

function patternMatchesPath(path: string, rawPattern: string): boolean {
  const pattern = rawPattern.trim()
  if (!pattern) return false

  if (pattern.includes('*') || pattern.includes('?')) {
    return globToRegex(pattern).test(path)
  }

  const normalized = normalizePath(pattern)
  if (!normalized) return false
  return path === normalized || path.startsWith(`${normalized}/`)
}

function matchesAnyPattern(path: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => patternMatchesPath(path, pattern))
}

function flattenPages(pages: FireuxPageRecord[], out: FireuxPageRecord[] = []): FireuxPageRecord[] {
  for (const page of pages) {
    out.push(page)
    if (Array.isArray(page.children) && page.children.length) {
      flattenPages(page.children, out)
    }
  }
  return out
}

function routeLooksDynamic(path: string): boolean {
  return /[:*()[\]]/.test(path)
}

function asRecord(value: unknown): Record<string, any> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, any>
}

function metaForcesSitemap(metaInput: unknown): boolean {
  const meta = asRecord(metaInput)
  if (!meta) return false
  if (meta.sitemap === true) return true
  const seo = asRecord(meta.seo)
  if (seo?.sitemap === true) return true
  return false
}

function metaRequestsNoindex(metaInput: unknown): boolean {
  const meta = asRecord(metaInput)
  if (!meta) return false
  if (meta.sitemap === false || meta.index === false) return true
  if (typeof meta.robots === 'string' && /noindex/i.test(meta.robots)) return true

  const seo = asRecord(meta.seo)
  if (!seo) return false
  if (seo.sitemap === false || seo.index === false) return true
  if (typeof seo.robots === 'string' && /noindex/i.test(seo.robots)) return true
  return false
}

function hasBlockedSegment(path: string): boolean {
  const segments = path
    .split('/')
    .map((segment) => segment.trim().toLowerCase())
    .filter(Boolean)

  return segments.some((segment) => AUTO_EXCLUDED_SEGMENTS.has(segment))
}

export function mergeSitemapPaths(current: unknown, additions: readonly string[]): string[] {
  const existing = Array.isArray(current)
    ? current.map((entry) => String(entry ?? ''))
    : []

  return normalizePaths([...existing, ...additions]).sort((a, b) => a.localeCompare(b))
}

export function collectAutoSitemapPaths(
  pagesInput: unknown,
  options: {
    disallowPaths?: readonly string[]
    noindexPaths?: readonly string[]
  } = {}
): string[] {
  if (!Array.isArray(pagesInput)) return []
  const pages = flattenPages(pagesInput as FireuxPageRecord[])
  const blockedPatterns = normalizePatterns([
    ...(options.disallowPaths || []),
    ...(options.noindexPaths || []),
  ])

  const out: string[] = []
  for (const page of pages) {
    const rawPath = typeof page.path === 'string' ? page.path : ''
    if (!rawPath) continue
    if (routeLooksDynamic(rawPath)) continue

    const path = normalizePath(rawPath)
    if (!path) continue

    const forced = metaForcesSitemap(page.meta)
    if (!forced) {
      if (metaRequestsNoindex(page.meta)) continue
      if (AUTO_EXCLUDED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)))
        continue
      if (hasBlockedSegment(path)) continue
      if (matchesAnyPattern(path, blockedPatterns)) continue
    }

    out.push(path)
  }

  return normalizePaths(out).sort((a, b) => a.localeCompare(b))
}

function setNoindexRouteRules(nuxt: NuxtConfig | any, patterns: readonly string[]) {
  const root = (nuxt?.options ?? nuxt) as AnyRecord
  const routeRules = ((root.routeRules ||= {}) as AnyRecord)

  for (const pattern of patterns) {
    const current = ((routeRules[pattern] ||= {}) as AnyRecord)
    const headers = ((current.headers ||= {}) as AnyRecord)
    if (!headers['X-Robots-Tag']) {
      headers['X-Robots-Tag'] = 'noindex, nofollow'
    }
  }
}

function createExtendCollector(): {
  hubs: string[]
  staticPaths: string[]
  disallowPaths: string[]
  noindexPaths: string[]
  ctx: FireuxSeoExtendContext
} {
  const hubs: string[] = []
  const staticPaths: string[] = []
  const disallowPaths: string[] = []
  const noindexPaths: string[] = []

  const ctx: FireuxSeoExtendContext = {
    addHub: (path: string) => hubs.push(path),
    addStaticPath: (path: string) => staticPaths.push(path),
    addDisallow: (path: string) => disallowPaths.push(path),
    addNoindex: (pattern: string) => noindexPaths.push(pattern),
  }

  return { hubs, staticPaths, disallowPaths, noindexPaths, ctx }
}

async function collectSeoExtensions(nuxt: NuxtConfig | any) {
  // If hooks system isn't present (or we're being called in a non-module context),
  // just return empty contributions.
  if (!nuxt || typeof nuxt.callHook !== 'function') {
    return {
      hubs: [] as string[],
      staticPaths: [] as string[],
      disallowPaths: [] as string[],
      noindexPaths: [] as string[],
    }
  }

  const { hubs, staticPaths, disallowPaths, noindexPaths, ctx } = createExtendCollector()
  await nuxt.callHook('fireux:seo:extend', ctx)

  return { hubs, staticPaths, disallowPaths, noindexPaths }
}

export async function configureSeoDefaults(
  nuxt: NuxtConfig | any,
  options: ConfigureFireuxSeoOptions
): Promise<FireuxSeoResolved> {
  const siteUrl = normalizeSiteUrl(options.seo?.siteUrl || options.domain)
  const ext = await collectSeoExtensions(nuxt)

  const hubs = normalizePaths([
    ...(options.seo?.hubs || []),
    ...(ext.hubs || []),
  ])

  const sitemapPaths = normalizePaths([
    '/',
    ...hubs,
    ...(options.seo?.staticPaths || []),
    ...(ext.staticPaths || []),
  ])

  const disallowPaths = normalizePaths([
    ...(options.seo?.disallowPaths || DEFAULT_DISALLOW),
    ...(ext.disallowPaths || []),
  ])

  const noindexPaths = normalizePatterns([
    ...(options.seo?.noindexPaths || DEFAULT_NOINDEX),
    ...(ext.noindexPaths || []),
  ])

  const resolved: FireuxSeoResolved = {
    enabled: options.seo?.enabled !== false,
    siteUrl,
    defaultDescription:
      options.seo?.defaultDescription?.trim() || `${options.appName} on FireUX`,
    hubs,
    sitemapPaths,
    disallowPaths,
    noindexPaths,
  }

  // runtimeConfig.public.fireux.seo
  const root = (nuxt?.options ?? nuxt) as AnyRecord
  const runtimeConfig = ((root.runtimeConfig ||= {}) as AnyRecord)
  const pub = ((runtimeConfig.public ||= {}) as AnyRecord)
  const fireux = ((pub.fireux ||= {}) as AnyRecord)
  const currentSeo = (
    fireux.seo &&
    typeof fireux.seo === 'object' &&
    !Array.isArray(fireux.seo)
      ? fireux.seo
      : {}
  ) as AnyRecord

  fireux.seo = {
    ...currentSeo,
    enabled: resolved.enabled,
    siteUrl: resolved.siteUrl,
    defaultDescription: resolved.defaultDescription,
    hubs: resolved.hubs,
    sitemapPaths: resolved.sitemapPaths,
    disallow: resolved.disallowPaths,
    noindexPaths: resolved.noindexPaths,
  }

  // Enforce noindex at the headers layer for private surfaces.
  setNoindexRouteRules(nuxt, resolved.noindexPaths)

  return resolved
}
