import type { NuxtConfig } from '@nuxt/schema'
import {
  normalizePaths,
  normalizePatterns,
  normalizeSiteUrl,
} from './seo-paths'

export {
  collectAutoSitemapPaths,
  mergeSitemapPaths,
  normalizeSiteUrl,
} from './seo-paths'

type AnyRecord = Record<string, any>

export type FireuxSeoConfig = {
  enabled?: boolean
  /** Optional canonical override. Normal apps derive siteUrl from APP_DOMAIN. */
  siteUrl?: string
  defaultDescription?: string

  /**
   * Optional app-level declarations (agnostic).
   * Extensions can also contribute via hooks.
   */
  hubs?: string[]
  staticPaths?: string[]
  /** App-owned sitemap documents backed by a bounded public projection. */
  sitemapDocuments?: string[]

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
  sitemapDocuments: string[]
  sitemapEntities: FireuxSitemapEntityRuntime[]
  disallowPaths: string[]
  noindexPaths: string[]
}

type ConfigureFireuxSeoOptions = {
  appName: string
  domain: string
  seo?: FireuxSeoConfig
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

export type FireuxSitemapEntity = {
  entityKey: string
  canonicalCollectionPath?: string
  routePrefix?: string
  routeIdentity?: 'document-id' | 'field'
  slugField?: string
  publicField?: string
  publicValue?: boolean | string | number
  pageSize?: number
  updatedAtField?: string
}

export type FireuxSitemapEntityRuntime = {
  entityKey: string
  canonicalCollectionPath: string
  routePrefix: string
  routeIdentity: 'document-id' | 'field'
  slugField: string
  publicField: string
  publicValue: boolean | string | number
  pageSize: number
  updatedAtField: string
}

export type FireuxSeoSitemapsExtendContext = {
  addEntity: (entity: FireuxSitemapEntity) => void
  /** Register an extension-owned XML document beneath `/sitemaps/`. */
  addDocument: (path: string) => void
}

const DEFAULT_DISALLOW = ['/console', '/admin']
const DEFAULT_NOINDEX = [
  '/console',
  '/console/**',
  '/admin',
  '/admin/**',
  '/dashboard',
  '/dashboard/**',
  '/account',
  '/account/**',
  '/member',
  '/member/**',
]
function normalizePageSize(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 5000
  const rounded = Math.max(100, Math.trunc(n))
  return Math.min(10000, rounded)
}

function normalizeSitemapEntity(
  input: FireuxSitemapEntity
): FireuxSitemapEntityRuntime | null {
  const entityKey = String(input?.entityKey ?? '').trim()
  const canonicalCollectionPath = String(
    input?.canonicalCollectionPath ?? ''
  ).trim()
  if (!entityKey || !canonicalCollectionPath) return null
  const publicField =
    input?.publicField === ''
      ? ''
      : String(input?.publicField ?? 'isPublic').trim() || 'isPublic'

  return {
    entityKey,
    canonicalCollectionPath,
    routePrefix:
      String(input?.routePrefix ?? `/${entityKey}`).trim() || `/${entityKey}`,
    routeIdentity:
      input.routeIdentity === 'document-id' ? 'document-id' : 'field',
    slugField: String(input?.slugField ?? 'slug').trim() || 'slug',
    publicField,
    publicValue: input.publicValue ?? true,
    pageSize: normalizePageSize(input.pageSize),
    updatedAtField:
      String(input.updatedAtField || 'updatedAt').trim() || 'updatedAt',
  }
}

async function collectSitemaps(nuxt: NuxtConfig | any): Promise<{
  documents: string[]
  entities: FireuxSitemapEntityRuntime[]
}> {
  if (!nuxt || typeof nuxt.callHook !== 'function') {
    return { documents: [], entities: [] }
  }
  const documents: string[] = []
  const entities: FireuxSitemapEntity[] = []
  const ctx: FireuxSeoSitemapsExtendContext = {
    addEntity: (entity: FireuxSitemapEntity) => {
      entities.push(entity)
    },
    addDocument: (path: string) => {
      documents.push(path)
    },
  }

  await nuxt.callHook('fireux:seo:sitemaps:extend', ctx)

  const byKey = new Map<string, FireuxSitemapEntityRuntime>()
  for (const entity of entities) {
    const normalized = normalizeSitemapEntity(entity)
    if (!normalized) continue
    byKey.set(normalized.entityKey, normalized)
  }

  const normalizedDocuments = normalizePaths(documents)
    .filter((path) => /^\/sitemaps\/[a-z0-9][a-z0-9-]*\.xml$/i.test(path))
    .filter((path) => path !== '/sitemaps/index.xml')
    .filter((path) => path !== '/sitemaps/static.xml')

  return {
    documents: normalizedDocuments,
    entities: Array.from(byKey.values()).sort((a, b) =>
      a.entityKey.localeCompare(b.entityKey)
    ),
  }
}

function setNoindexRouteRules(
  nuxt: NuxtConfig | any,
  patterns: readonly string[]
) {
  const root = (nuxt?.options ?? nuxt) as AnyRecord
  const routeRules = (root.routeRules ||= {}) as AnyRecord

  for (const pattern of patterns) {
    const current = (routeRules[pattern] ||= {}) as AnyRecord
    const headers = (current.headers ||= {}) as AnyRecord
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

  const { hubs, staticPaths, disallowPaths, noindexPaths, ctx } =
    createExtendCollector()
  await nuxt.callHook('fireux:seo:extend', ctx)

  return { hubs, staticPaths, disallowPaths, noindexPaths }
}

export async function configureSeoDefaults(
  nuxt: NuxtConfig | any,
  options: ConfigureFireuxSeoOptions
): Promise<FireuxSeoResolved> {
  const siteUrl = normalizeSiteUrl(options.seo?.siteUrl || options.domain)
  const ext = await collectSeoExtensions(nuxt)
  const sitemaps = await collectSitemaps(nuxt)
  const sitemapDocuments = normalizePaths([
    ...(options.seo?.sitemapDocuments || []),
    ...sitemaps.documents,
  ])
    .filter((path) => /^\/sitemaps\/[a-z0-9][a-z0-9-]*\.xml$/i.test(path))
    .filter((path) => path !== '/sitemaps/index.xml')
    .filter((path) => path !== '/sitemaps/static.xml')

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
    ...DEFAULT_DISALLOW,
    ...(options.seo?.disallowPaths || []),
    ...(ext.disallowPaths || []),
  ])

  const noindexPaths = normalizePatterns([
    ...DEFAULT_NOINDEX,
    ...(options.seo?.noindexPaths || []),
    ...(ext.noindexPaths || []),
  ])

  const resolved: FireuxSeoResolved = {
    enabled: options.seo?.enabled !== false,
    siteUrl,
    defaultDescription:
      options.seo?.defaultDescription?.trim() || `${options.appName} on FireUX`,
    hubs,
    sitemapPaths,
    sitemapDocuments,
    sitemapEntities: sitemaps.entities,
    disallowPaths,
    noindexPaths,
  }

  // runtimeConfig.public.fireux.seo
  const root = (nuxt?.options ?? nuxt) as AnyRecord
  const runtimeConfig = (root.runtimeConfig ||= {}) as AnyRecord
  const pub = (runtimeConfig.public ||= {}) as AnyRecord
  const fireux = (pub.fireux ||= {}) as AnyRecord
  const currentSeo = (
    fireux.seo && typeof fireux.seo === 'object' && !Array.isArray(fireux.seo)
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
    sitemapDocuments: resolved.sitemapDocuments,
    sitemapEntities: resolved.sitemapEntities,
    disallow: resolved.disallowPaths,
    noindexPaths: resolved.noindexPaths,
  }

  // Enforce noindex at the headers layer for private surfaces.
  setNoindexRouteRules(nuxt, resolved.noindexPaths)

  return resolved
}
