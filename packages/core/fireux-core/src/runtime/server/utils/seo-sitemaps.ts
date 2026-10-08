import {
  readSitemapPublicFilters,
  matchesSitemapPublicFilters,
  type SitemapPublicFilter,
} from '../../utils/sitemap-public-filters'
import { setResponseHeaders, type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getRuntimeFirestore } from './getRuntimeFirestore'
import { normalizeSlug } from '../../utils/slug/normalizeSlug'
import { isFirestoreDocumentId } from '../../utils/firestoreDocumentId'

type AnyRecord = Record<string, unknown>

export type RuntimeSitemapEntity = {
  entityKey: string
  canonicalCollectionPath: string
  routePrefix: string
  routeIdentity: 'document-id' | 'field'
  slugField: string
  publicField: string
  publicValue: boolean | string | number
  additionalPublicFilters?: SitemapPublicFilter[]
  pageSize: number
  updatedAtField: string
}

export type RuntimeSeoSitemaps = {
  siteUrl: string
  staticPaths: string[]
  documents: string[]
  entities: RuntimeSitemapEntity[]
}

export const SITEMAP_CACHE_CONTROL =
  'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => String(entry ?? '').trim()).filter(Boolean)
}

function toEntityList(value: unknown): RuntimeSitemapEntity[] {
  if (!Array.isArray(value)) return []
  const out: RuntimeSitemapEntity[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const entry = raw as Record<string, unknown>
    const entityKey = String(entry.entityKey ?? '').trim()
    const canonicalCollectionPath = String(
      entry.canonicalCollectionPath ?? ''
    ).trim()
    if (!entityKey || !canonicalCollectionPath) continue
    const pageSizeRaw = Number(entry.pageSize ?? 5000)
    const pageSize = Number.isFinite(pageSizeRaw)
      ? Math.max(100, Math.min(10000, Math.trunc(pageSizeRaw)))
      : 5000
    const updatedAtField =
      String(entry.updatedAtField ?? 'updatedAt').trim() || 'updatedAt'
    const routePrefix =
      normalizePath(String(entry.routePrefix ?? `/${entityKey}`)) ||
      `/${entityKey}`
    const slugField = String(entry.slugField ?? 'slug').trim() || 'slug'
    const publicField =
      entry.publicField === ''
        ? ''
        : String(entry.publicField ?? 'isPublic').trim() || 'isPublic'
    out.push({
      entityKey,
      canonicalCollectionPath,
      routePrefix,
      routeIdentity:
        entry.routeIdentity === 'document-id' ? 'document-id' : 'field',
      slugField,
      publicField,
      publicValue: normalizePublicValue(entry.publicValue),
      additionalPublicFilters: readSitemapPublicFilters(
        entry.additionalPublicFilters
      ),
      pageSize,
      updatedAtField,
    })
  }
  return out.sort((a, b) => a.entityKey.localeCompare(b.entityKey))
}

function normalizePublicValue(value: unknown): boolean | string | number {
  if (
    typeof value === 'boolean' ||
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return value
  }

  return true
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

function normalizeSiteUrl(input: unknown): string {
  const value = typeof input === 'string' ? input.trim() : ''
  if (!value) return ''

  const withProtocol = /^https?:\/\//i.test(value)
    ? value
    : `${isLocalHost(value) ? 'http' : 'https'}://${value}`

  try {
    return new URL(withProtocol).origin
  } catch {
    return ''
  }
}

function isLocalHost(value: string): boolean {
  const host = (
    value.replace(/^https?:\/\//i, '').split('/')[0] ?? ''
  ).toLowerCase()
  return (
    host === 'localhost' ||
    host.startsWith('localhost:') ||
    host === '127.0.0.1' ||
    host.startsWith('127.0.0.1:')
  )
}

export function absoluteUrl(siteUrl: string, path: string): string {
  const normalizedPath = normalizePath(path)
  if (!normalizedPath) return siteUrl || '/'
  return siteUrl ? `${siteUrl}${normalizedPath}` : normalizedPath
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function readRuntimeSeoSitemaps(): RuntimeSeoSitemaps {
  const runtime = useRuntimeConfig()
  const pub = (runtime.public || {}) as AnyRecord
  const fireux = (pub.fireux || {}) as AnyRecord
  const seo = (fireux.seo || {}) as AnyRecord

  const siteUrl =
    normalizeSiteUrl(seo.siteUrl) ||
    normalizeSiteUrl(fireux.siteUrl) ||
    normalizeSiteUrl(fireux.domain)

  const staticPaths = Array.from(
    new Set(
      ['/', ...toStrings(seo.sitemapPaths), ...toStrings(seo.hubs)]
        .map((path) => normalizePath(path))
        .filter((path): path is string => !!path)
    )
  ).sort((a, b) => a.localeCompare(b))

  const entities = toEntityList(seo.sitemapEntities)
  const documents = Array.from(
    new Set(
      toStrings(seo.sitemapDocuments)
        .map((path) => normalizePath(path))
        .filter((path): path is string =>
          Boolean(path && /^\/sitemaps\/[a-z0-9][a-z0-9-]*\.xml$/i.test(path))
        )
        .filter((path) => path !== '/sitemaps/index.xml')
        .filter((path) => path !== '/sitemaps/static.xml')
    )
  ).sort((a, b) => a.localeCompare(b))

  return { siteUrl, staticPaths, documents, entities }
}

export function setSitemapResponseHeaders(
  event: H3Event,
  contentType = 'application/xml; charset=utf-8'
) {
  setResponseHeaders(event, {
    'content-type': contentType,
    'cache-control': SITEMAP_CACHE_CONTROL,
  })
}

export async function countPublicEntitySitemapDocs(
  entity: RuntimeSitemapEntity
): Promise<number> {
  return countPublicCanonicalDocs(entity)
}

export type SitemapIndexEntry = {
  path: string
  lastmod?: string
}

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'number') {
    const d = new Date(value)
    return Number.isFinite(d.getTime()) ? d.toISOString() : undefined
  }
  if (typeof value === 'string') {
    const d = new Date(value)
    return Number.isFinite(d.getTime()) ? d.toISOString() : undefined
  }
  if (typeof (value as any)?.toDate === 'function') {
    const d = (value as any).toDate()
    if (d instanceof Date && Number.isFinite(d.getTime()))
      return d.toISOString()
  }
  return undefined
}

function resolveCanonicalDocPath(
  entity: RuntimeSitemapEntity,
  docId: string,
  data: Record<string, unknown>
): string | null {
  const rawPath = typeof data.path === 'string' ? data.path : ''
  const normalizedPath = normalizePath(rawPath)
  if (normalizedPath) return normalizedPath

  const slug = resolveRouteIdentity(entity, docId, data)
  if (!slug) {
    if (import.meta.dev) {
      console.warn(
        `[seo-sitemaps] Skipping ${entity.entityKey}/${docId}: missing ${entity.slugField}`
      )
    }
    return null
  }
  const encodedSlug = encodeURIComponent(slug)
  const routePrefix = normalizePath(
    entity.routePrefix || `/${entity.entityKey}`
  )
  if (!routePrefix) return null
  return routePrefix === '/'
    ? `/${encodedSlug}`
    : `${routePrefix}/${encodedSlug}`
}

function resolveRouteIdentity(
  entity: RuntimeSitemapEntity,
  docId: string,
  data: Record<string, unknown>
): string {
  if (entity.routeIdentity === 'document-id') {
    return isFirestoreDocumentId(docId) ? docId.trim() : ''
  }
  return normalizeSlug(data[entity.slugField])
}

function isCanonicalDocPublic(
  entity: RuntimeSitemapEntity,
  data: Record<string, unknown>,
  slug: string
): boolean {
  if (!matchesSitemapPublicFilters(data, entity.additionalPublicFilters ?? []))
    return false
  // Root User is public by definition; its handle is its canonical slug.
  if (entity.entityKey === 'users') return Boolean(slug)

  if (entity.publicField) {
    return matchesSitemapPublicFilters(data, [
      { field: entity.publicField, value: entity.publicValue },
    ])
  }

  const isPublic = data.isPublic
  if (typeof isPublic === 'boolean') return isPublic

  const visibility = normalizeSlug(data.visibility).toLowerCase()
  if (visibility === 'public') return true
  if (visibility === 'private') return false

  return false
}

async function countPublicCanonicalDocs(
  entity: RuntimeSitemapEntity
): Promise<number> {
  if (!entity.canonicalCollectionPath) return 0
  try {
    const db = getRuntimeFirestore()
    let query: FirebaseFirestore.Query = db.collection(
      entity.canonicalCollectionPath
    )

    if (entity.publicField) {
      query = query.where(entity.publicField, '==', entity.publicValue)
    }
    for (const filter of entity.additionalPublicFilters ?? [])
      query = query.where(filter.field, '==', filter.value)
    const snap = await query.count().get()
    const count = Number((snap.data() as any)?.count ?? 0)
    if (!Number.isFinite(count)) return 0
    return Math.max(0, Math.trunc(count))
  } catch {
    return 0
  }
}

async function fetchCanonicalEntitySitemapPage(
  entity: RuntimeSitemapEntity,
  page: number
): Promise<SitemapIndexEntry[]> {
  if (!entity.canonicalCollectionPath) return []

  const pageSize = entity.pageSize || 5000
  const offset = Math.max(0, (page - 1) * pageSize)
  const db = getRuntimeFirestore()

  let query: FirebaseFirestore.Query = db.collection(
    entity.canonicalCollectionPath
  )
  if (entity.publicField) {
    query = query.where(entity.publicField, '==', entity.publicValue)
  }
  for (const filter of entity.additionalPublicFilters ?? [])
    query = query.where(filter.field, '==', filter.value)
  query = query.orderBy('__name__')

  const snap = await query.offset(offset).limit(pageSize).get()

  const out: SitemapIndexEntry[] = []
  for (const doc of snap.docs) {
    const data = (doc.data() || {}) as Record<string, unknown>
    const slug = resolveRouteIdentity(entity, doc.id, data)
    if (!isCanonicalDocPublic(entity, data, slug)) continue

    const path = resolveCanonicalDocPath(entity, doc.id, data)
    if (!path) continue

    const lastmod =
      toIsoString(data[entity.updatedAtField]) ||
      toIsoString((data.updated as any)?.at)

    out.push(lastmod ? { path, lastmod } : { path })
  }

  return out
}

export async function fetchEntitySitemapPage(
  entity: RuntimeSitemapEntity,
  page: number
): Promise<SitemapIndexEntry[]> {
  try {
    return await fetchCanonicalEntitySitemapPage(entity, page)
  } catch {
    if (import.meta.dev) {
      console.warn(
        `[seo-sitemaps] Failed to read canonical sitemap page for ${entity.entityKey}`
      )
    }
    return []
  }
}
