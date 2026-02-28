import { defineEventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'

type AnyRecord = Record<string, unknown>

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => (typeof entry === 'string' ? entry : String(entry ?? '')))
    .map((entry) => entry.trim())
    .filter(Boolean)
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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default defineEventHandler((event) => {
  const runtime = useRuntimeConfig()
  const pub = (runtime.public || {}) as AnyRecord
  const fireux = ((pub.fireux || {}) as AnyRecord)
  const seo = ((fireux.seo || {}) as AnyRecord)

  const siteUrl =
    normalizeSiteUrl(seo.siteUrl) ||
    normalizeSiteUrl(fireux.siteUrl) ||
    normalizeSiteUrl(fireux.domain)

  const paths = new Set<string>()
  const candidates = [
    '/',
    ...toStrings(seo.hubs),
    ...toStrings(seo.sitemapPaths),
  ]

  for (const candidate of candidates) {
    const path = normalizePath(candidate)
    if (path) paths.add(path)
  }

  if (!paths.size) paths.add('/')

  const urlNodes = Array.from(paths)
    .sort((a, b) => a.localeCompare(b))
    .map((path) => {
      const loc = siteUrl ? `${siteUrl}${path}` : path
      return `<url><loc>${escapeXml(loc)}</loc></url>`
    })
    .join('')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlNodes,
    '</urlset>',
  ].join('')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})
