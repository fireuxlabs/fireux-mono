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

function normalizeDisallowPath(value: string): string | null {
  let path = value.trim()
  if (!path) return null

  if (path.includes('*')) {
    path = path.replace(/\/\*\*$/, '')
  }

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

export default defineEventHandler((event) => {
  const runtime = useRuntimeConfig()
  const pub = (runtime.public || {}) as AnyRecord
  const fireux = ((pub.fireux || {}) as AnyRecord)
  const seo = ((fireux.seo || {}) as AnyRecord)
  const enabled = seo.enabled !== false
  const disallow = toStrings(seo.disallow)
    .map((path) => normalizeDisallowPath(path))
    .filter((path): path is string => !!path)
  const siteUrl =
    normalizeSiteUrl(seo.siteUrl) ||
    normalizeSiteUrl(fireux.siteUrl) ||
    normalizeSiteUrl(fireux.domain)

  const lines = ['User-agent: *']

  if (!enabled) {
    lines.push('Disallow: /')
  } else if (!disallow.length) {
    lines.push('Disallow:')
  } else {
    for (const path of disallow) lines.push(`Disallow: ${path}`)
  }

  if (siteUrl) {
    lines.push(`Sitemap: ${siteUrl}/sitemap.xml`)
  }

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `${lines.join('\n')}\n`
})
