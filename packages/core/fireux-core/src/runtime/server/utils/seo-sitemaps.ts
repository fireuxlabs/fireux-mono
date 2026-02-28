import { setResponseHeaders, type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from './getAdmin'

type AnyRecord = Record<string, unknown>

export type RuntimeSitemapEntity = {
  entityKey: string
  indexCollectionPath: string
  pageSize: number
  updatedAtField: string
}

export type RuntimeSeoSitemaps = {
  siteUrl: string
  staticPaths: string[]
  entities: RuntimeSitemapEntity[]
}

export const SITEMAP_CACHE_CONTROL =
  'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => String(entry ?? '').trim())
    .filter(Boolean)
}

function toEntityList(value: unknown): RuntimeSitemapEntity[] {
  if (!Array.isArray(value)) return []
  const out: RuntimeSitemapEntity[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const entry = raw as Record<string, unknown>
    const entityKey = String(entry.entityKey ?? '').trim()
    const indexCollectionPath = String(entry.indexCollectionPath ?? '').trim()
    if (!entityKey || !indexCollectionPath) continue
    const pageSizeRaw = Number(entry.pageSize ?? 5000)
    const pageSize = Number.isFinite(pageSizeRaw)
      ? Math.max(100, Math.min(10000, Math.trunc(pageSizeRaw)))
      : 5000
    const updatedAtField =
      String(entry.updatedAtField ?? 'updatedAt').trim() || 'updatedAt'
    out.push({ entityKey, indexCollectionPath, pageSize, updatedAtField })
  }
  return out.sort((a, b) => a.entityKey.localeCompare(b.entityKey))
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
  const host = value.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase()
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
  const fireux = ((pub.fireux || {}) as AnyRecord)
  const seo = ((fireux.seo || {}) as AnyRecord)

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

  return { siteUrl, staticPaths, entities }
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

export async function countPublicEntityIndexDocs(entity: RuntimeSitemapEntity): Promise<number> {
  const db = getFirestore(getAdminApp())
  const snap = await db
    .collection(entity.indexCollectionPath)
    .where('isPublic', '==', true)
    .count()
    .get()

  const count = Number((snap.data() as any)?.count ?? 0)
  return Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0
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
    if (d instanceof Date && Number.isFinite(d.getTime())) return d.toISOString()
  }
  return undefined
}

export async function fetchEntitySitemapPage(
  entity: RuntimeSitemapEntity,
  page: number
): Promise<SitemapIndexEntry[]> {
  const pageSize = entity.pageSize || 5000
  const offset = Math.max(0, (page - 1) * pageSize)
  const db = getFirestore(getAdminApp())

  const snap = await db
    .collection(entity.indexCollectionPath)
    .where('isPublic', '==', true)
    .orderBy('__name__')
    .offset(offset)
    .limit(pageSize)
    .get()

  const out: SitemapIndexEntry[] = []
  for (const doc of snap.docs) {
    const data = (doc.data() || {}) as Record<string, unknown>
    const rawPath = typeof data.path === 'string' ? data.path : ''
    const path = normalizePath(rawPath)
    if (!path) continue
    const lastmod = toIsoString(data[entity.updatedAtField])
    out.push(lastmod ? { path, lastmod } : { path })
  }

  return out
}
