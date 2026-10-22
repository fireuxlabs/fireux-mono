import {
  normalizeSeoPath as normalizePath,
  matchesSeoPath as patternMatchesPath,
} from '../../utils/seoIndexing'
const AUTO_EXCLUDED_PREFIXES = [
  '/api',
  '/_nuxt',
  '/diagnostics',
  '/admin',
  '/workspace',
  '/auth',
]

type FireuxPageRecord = {
  path?: string
  meta?: Record<string, any>
  children?: FireuxPageRecord[]
}

const AUTO_EXCLUDED_SEGMENTS = new Set([
  'admin',
  'workspace',
  'dev',
  'auth',
  'create',
  'edit',
  'checkout',
  'success',
])

export function normalizeSiteUrl(input?: string): string {
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

export function normalizePaths(values: readonly string[]): string[] {
  return uniq(values.map((v) => normalizePath(v)))
}

export function normalizePatterns(values: readonly string[]): string[] {
  return uniq(values.map((v) => normalizeNoindexPattern(v)))
}

function matchesAnyPattern(path: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => patternMatchesPath(path, pattern))
}

function flattenPages(
  pages: FireuxPageRecord[],
  out: FireuxPageRecord[] = []
): FireuxPageRecord[] {
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
  if (typeof meta.robots === 'string' && /noindex/i.test(meta.robots))
    return true

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

export function mergeSitemapPaths(
  current: unknown,
  additions: readonly string[]
): string[] {
  const existing = Array.isArray(current)
    ? current.map((entry) => String(entry ?? ''))
    : []

  return normalizePaths([...existing, ...additions]).sort((a, b) =>
    a.localeCompare(b)
  )
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
      if (
        AUTO_EXCLUDED_PREFIXES.some(
          (prefix) => path === prefix || path.startsWith(`${prefix}/`)
        )
      )
        continue
      if (hasBlockedSegment(path)) continue
      if (matchesAnyPattern(path, blockedPatterns)) continue
    }

    out.push(path)
  }

  return normalizePaths(out).sort((a, b) => a.localeCompare(b))
}
