import { useRuntimeConfig } from '#imports'
import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { getRuntimeFirestore } from '../../../utils/getRuntimeFirestore'

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeSiteUrl(input: unknown): string | undefined {
  const raw = asString(input)
  if (!raw) return undefined

  const withProtocol = /^https?:\/\//i.test(raw)
    ? raw
    : `${isLocalHost(raw) ? 'http' : 'https'}://${raw}`

  try {
    return new URL(withProtocol).origin
  } catch {
    return undefined
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

function toAbsoluteUrl(input: unknown, siteOrigin?: string): string | undefined {
  const value = asString(input)
  if (!value) return undefined
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/') && siteOrigin) return `${siteOrigin}${value}`
  return undefined
}

function toSlug(input: string): string {
  return asString(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function appSlugFromId(appId: string): string {
  return toSlug(appId.replace(/-app$/i, ''))
}

function ecosystemIdFromSlug(slug: string): string {
  return slug.startsWith('fireux-') ? slug : `fireux-${slug}`
}

function labelize(input: string): string {
  return asString(input)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export default defineEventHandler(async (event: H3Event) => {
  const cfg = useFireUXConfig()
  const runtime = useRuntimeConfig()
  const appDoc = await getRuntimeFirestore()
    .collection('apps')
    .doc(cfg.appId)
    .get()
    .catch(() => null)
  const appData = appDoc?.exists ? asRecord(appDoc.data()) : {}
  const media = asRecord(appData.media)
  const siteOrigin =
    normalizeSiteUrl(runtime.public?.fireux?.siteUrl) ||
    normalizeSiteUrl(cfg.siteUrl) ||
    normalizeSiteUrl((runtime.public?.fireux as Record<string, unknown> | undefined)?.domain)
  const ecosystemSlug = toSlug(cfg.ecosystem)
  const appSlug = appSlugFromId(cfg.appId)
  const logoUrl =
    toAbsoluteUrl(media.logo_url, siteOrigin) || toAbsoluteUrl(cfg.appLogo, siteOrigin)
  const thumbnailUrl =
    toAbsoluteUrl(media.thumbnail_url, siteOrigin) ||
    toAbsoluteUrl(cfg.appThumbnail, siteOrigin)
  const ecosystemName =
    cfg.isGlobal && appSlug === ecosystemSlug
      ? cfg.appName
      : labelize(ecosystemSlug) || cfg.ecosystem
  const parentApp =
    cfg.isTenant && cfg.globalAppId
      ? {
          id: cfg.globalAppId,
          slug: appSlugFromId(cfg.globalAppId),
          name: labelize(cfg.globalAppId.replace(/-app$/i, '')) || cfg.globalAppId,
        }
      : undefined

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  return {
    ok: true,
    ecosystem: {
      id: ecosystemIdFromSlug(ecosystemSlug),
      slug: ecosystemSlug,
      name: ecosystemName,
    },
    app: {
      id: cfg.appId,
      slug: appSlug,
      name: cfg.appName,
      short_name: cfg.appShortName,
      ...(logoUrl || thumbnailUrl
        ? {
            media: {
              ...(logoUrl ? { logo_url: logoUrl } : {}),
              ...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
            },
          }
        : {}),
      ...(parentApp ? { parent_app: parentApp } : {}),
    },
    now: new Date().toISOString(),
  }
})
