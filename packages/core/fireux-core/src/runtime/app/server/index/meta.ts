import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import type {
  FireuxMetaContent,
  FireuxMetaLegalContent,
  FireuxMetaLegalNotice,
  FireuxMetaLegalSource,
} from '../../../../config/app/meta-content'
import { getRuntimeFirestore } from '../../../server/utils/getRuntimeFirestore'
import {
  normalizePublicImgAsset,
  GLOBAL_BRAND_ASSETS as brandAssets,
} from '../../../../utils/brandAssets'

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

function normalizeLegalSource(value: unknown) {
  if (!isRecord(value)) return undefined

  const label = asString(value.label)
  const to = asString(value.to)
  if (!label || !to) return undefined

  try {
    const url = new URL(to)
    if (url.protocol !== 'https:') return undefined
  } catch {
    return undefined
  }

  return { label, to }
}

function normalizeLegalNotice(
  value: unknown
): FireuxMetaLegalNotice | undefined {
  if (!isRecord(value)) return undefined

  const id = asString(value.id)
  const title = asString(value.title)
  const description = asString(value.description)
  const items = asStringArray(value.items)
  if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) return undefined
  if (!title || !description || !items.length) return undefined

  const jurisdiction = asString(value.jurisdiction)
  const sources = Array.isArray(value.sources)
    ? value.sources
        .map((source) => normalizeLegalSource(source))
        .filter((source): source is FireuxMetaLegalSource => Boolean(source))
    : []

  return {
    id,
    title,
    description,
    ...(jurisdiction ? { jurisdiction } : {}),
    items,
    ...(sources.length ? { sources } : {}),
  }
}

function normalizeLegal(value: unknown): FireuxMetaLegalContent {
  const notices =
    isRecord(value) && Array.isArray(value.notices)
      ? value.notices
          .map((notice) => normalizeLegalNotice(notice))
          .filter((notice): notice is FireuxMetaLegalNotice => Boolean(notice))
      : []

  return { notices }
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

function toAbsoluteUrl(
  input: unknown,
  siteOrigin?: string
): string | undefined {
  const value = normalizePublicImgAsset(asString(input))
  if (!value) return undefined
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/') && siteOrigin) return `${siteOrigin}${value}`
  return undefined
}

export async function readAppMeta(event: H3Event) {
  const cfg = useFireUXConfig(event)
  const runtimeConfig = useRuntimeConfig(event)
  const meta: unknown = runtimeConfig.fireux?.meta
  const appDoc = await getRuntimeFirestore()
    .collection('apps')
    .doc(cfg.appId)
    .get()
    .catch(() => null)
  const appData = appDoc?.exists
    ? (appDoc.data() as Record<string, unknown>)
    : {}
  const media = isRecord(appData.media) ? appData.media : {}
  const siteOrigin =
    normalizeSiteUrl(runtimeConfig.public?.fireux?.siteUrl) ||
    normalizeSiteUrl(cfg.siteUrl) ||
    normalizeSiteUrl(
      (runtimeConfig.public?.fireux as Record<string, unknown> | undefined)
        ?.domain
    )
  const socialImageUrl =
    toAbsoluteUrl(media.thumbnail_url, siteOrigin) ||
    toAbsoluteUrl(media.logo_url, siteOrigin) ||
    toAbsoluteUrl(brandAssets.thumbnail, siteOrigin) ||
    toAbsoluteUrl(brandAssets.logo, siteOrigin)

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
      workspace_bridge_html: asString(meta.copy?.workspace_bridge_html),
      highlight_terms: asStringArray(meta.copy?.highlight_terms),
    },
    legal: normalizeLegal(meta.legal),
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
}
