import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import type { FireuxMetaContent } from '../../../../models/system/meta-content.model'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isFireuxMetaContent(value: unknown): value is FireuxMetaContent {
  if (!isRecord(value)) return false

  const app = value.app
  return (
    isRecord(app) &&
    typeof app.id === 'string' &&
    typeof app.name === 'string' &&
    typeof app.ecosystem === 'string'
  )
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => asString(entry))
    .filter((entry): entry is string => Boolean(entry))
}

function normalizeSiteUrl(input: unknown): string | undefined {
  const raw = asString(input)
  if (!raw) return undefined

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`

  try {
    return new URL(withProtocol).origin
  } catch {
    return undefined
  }
}

function toAbsoluteUrl(input: unknown, siteOrigin?: string): string | undefined {
  const value = asString(input)
  if (!value) return undefined
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/') && siteOrigin) return `${siteOrigin}${value}`
  return undefined
}

export default defineEventHandler((event: H3Event) => {
  const cfg = useFireUXConfig()
  const runtimeConfig = useRuntimeConfig()
  const meta = runtimeConfig.fireux?.meta
  const siteOrigin =
    normalizeSiteUrl(runtimeConfig.public?.fireux?.siteUrl) ||
    normalizeSiteUrl(cfg.siteUrl) ||
    normalizeSiteUrl(
      (runtimeConfig.public?.fireux as Record<string, unknown> | undefined)?.domain
    )
  const socialImageUrl =
    toAbsoluteUrl(cfg.appThumbnail, siteOrigin) || toAbsoluteUrl(cfg.appLogo, siteOrigin)

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  if (!isFireuxMetaContent(meta)) {
    throw createError({
      statusCode: 404,
      statusMessage: `[app/meta] App meta is not configured for "${cfg.appId}"`,
    })
  }

  const summary =
    asString(meta.copy?.about_p1) ||
    asString(meta.copy?.promise_html) ||
    asString(meta.copy?.about_p2)
  const seoTitle = asString(meta.seo?.title)
  const seoDescription = asString(meta.seo?.description)

  return {
    ok: true,
    messaging: {
      hero_prefix: asString(meta.copy?.big_personality),
      hero_headline: asString(meta.copy?.headline),
      hero_html: asString(meta.copy?.positioning_html),
      summary,
      console_bridge_html: asString(meta.copy?.console_bridge_html),
      highlight_terms: asStringArray(meta.copy?.highlight_terms),
    },
    seo: {
      title: seoTitle,
      description: seoDescription,
      keywords: asStringArray(meta.seo?.keywords),
      audience: asStringArray(meta.seo?.audience),
      categories: asStringArray(meta.seo?.categories),
      primary_topic: asString(meta.seo?.primary_topic),
      canonical_path: '/',
      open_graph: {
        title: seoTitle,
        description: seoDescription,
        image_url: socialImageUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
        image_url: socialImageUrl,
      },
    },
    now: new Date().toISOString(),
  }
})
