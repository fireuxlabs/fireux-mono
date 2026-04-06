import { useRuntimeConfig } from '#imports'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import type { App } from '../../models/core/app.model'
import type { FireuxMetaContent } from '../../models/system/meta-content.model'
import type {
  FireuxPublicAppInfoResponse,
  FireuxPublicAppLanding,
  FireuxPublicAppLandingResponse,
  FireuxPublicAppMedia,
  FireuxPublicAppMetaResponse,
  FireuxPublicContentBootstrap,
  FireuxPublicLanding,
  FireuxPublicLandingAboutIntro,
  FireuxPublicLandingHero,
  FireuxPublicMetaDoc,
  FireuxPublicMessaging,
  FireuxPublicParentApp,
  FireuxPublicSeo,
} from '../../models/system/public-app-content.model'
import type { Ecosystem } from '../../models/system/ecosystem.model'
import { getRuntimeFirestore } from './getRuntimeFirestore'

type AnyRecord = Record<string, unknown>
type RuntimeFireuxPrivate = {
  meta?: FireuxMetaContent
  publicContent?: FireuxPublicContentBootstrap
}

type PublicAppContext = {
  now: string
  siteOrigin?: string
  appId: string
  appName: string
  appShortName?: string
  appSlug: string
  appDoc: (Partial<App> & { id: string }) | null
  ecosystemSlug: string
  ecosystemId: string
  ecosystemName: string
  ecosystemDoc: (Partial<Ecosystem> & { id: string }) | null
  media: FireuxPublicAppMedia
  fallbackImageUrl?: string
  parentApp?: FireuxPublicParentApp | null
  legacyMeta?: FireuxMetaContent
  bootstrap?: FireuxPublicContentBootstrap
}

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as AnyRecord)
    : {}
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asOptionalString(value: unknown): string | undefined {
  const normalized = asString(value)
  return normalized || undefined
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => asString(entry))
    .filter(Boolean)
}

function labelize(value: unknown): string {
  const normalized = asString(value)
  if (!normalized) return ''

  return normalized
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeSlug(value: unknown, fallback = ''): string {
  const normalized = asString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized || fallback
}

function appIdToSlug(appId: string, fallbackName?: string): string {
  const normalized = asString(appId).replace(/-app$/i, '')
  return normalizeSlug(normalized, normalizeSlug(fallbackName || 'app', 'app'))
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

function isLocalHost(input: string): boolean {
  const host = input.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase()
  return (
    host === 'localhost' ||
    host.startsWith('localhost:') ||
    host === '127.0.0.1' ||
    host.startsWith('127.0.0.1:')
  )
}

function toAbsoluteUrl(value: unknown, siteOrigin?: string): string | undefined {
  const normalized = asString(value)
  if (!normalized) return undefined

  if (/^https?:\/\//i.test(normalized)) return normalized
  if (normalized.startsWith('/') && siteOrigin) return `${siteOrigin}${normalized}`
  return undefined
}

function canonicalEcosystemId(value: unknown): string {
  const slug = normalizeSlug(value)
  if (!slug) return ''
  return slug.startsWith('fireux-') ? slug : `fireux-${slug}`
}

function normalizeCanonicalPath(value: unknown): string {
  const normalized = asString(value)
  if (!normalized) return '/'
  if (!normalized.startsWith('/')) return `/${normalized}`
  return normalized
}

async function readDocSafe<T>(
  path: { collection: string; id: string }
): Promise<(Partial<T> & { id: string }) | null> {
  const collection = asString(path.collection)
  const id = asString(path.id)
  if (!collection || !id) return null

  try {
    const snap = await getRuntimeFirestore().collection(collection).doc(id).get()
    if (!snap.exists) return null
    return {
      ...(asRecord(snap.data()) as Partial<T>),
      id: snap.id,
    }
  } catch {
    return null
  }
}

async function readNestedDocSafe<T>(
  path: { collection: string; id: string; childCollection: string; childId: string }
): Promise<(Partial<T> & { id: string }) | null> {
  const collection = asString(path.collection)
  const id = asString(path.id)
  const childCollection = asString(path.childCollection)
  const childId = asString(path.childId)
  if (!collection || !id || !childCollection || !childId) return null

  try {
    const snap = await getRuntimeFirestore()
      .collection(collection)
      .doc(id)
      .collection(childCollection)
      .doc(childId)
      .get()
    if (!snap.exists) return null
    return {
      ...(asRecord(snap.data()) as Partial<T>),
      id: snap.id,
    }
  } catch {
    return null
  }
}

async function readEcosystemDocSafe(
  candidates: string[]
): Promise<(Partial<Ecosystem> & { id: string }) | null> {
  for (const candidate of candidates.map((entry) => asString(entry)).filter(Boolean)) {
    const direct = await readDocSafe<Ecosystem>({ collection: 'ecosystems', id: candidate })
    if (direct) return direct
  }

  const slug = candidates.map((entry) => normalizeSlug(entry)).find(Boolean)
  if (!slug) return null

  try {
    const snap = await getRuntimeFirestore()
      .collection('ecosystems')
      .where('slug', '==', slug)
      .limit(1)
      .get()

    const doc = snap.docs[0]
    if (!doc) return null
    return {
      ...(asRecord(doc.data()) as Partial<Ecosystem>),
      id: doc.id,
    }
  } catch {
    return null
  }
}

function sanitizeMedia(
  appDoc: (Partial<App> & { id: string }) | null,
  siteOrigin?: string,
  fallbacks?: { logo?: string; thumbnail?: string }
): FireuxPublicAppMedia {
  const media = asRecord(appDoc?.media)
  const logo =
    toAbsoluteUrl(media.logo_url, siteOrigin) ||
    toAbsoluteUrl(fallbacks?.logo, siteOrigin)
  const thumbnail =
    toAbsoluteUrl(media.thumbnail_url, siteOrigin) ||
    toAbsoluteUrl(fallbacks?.thumbnail, siteOrigin)
  const wordmarkLight = toAbsoluteUrl(media.wordmark_light_url, siteOrigin)
  const wordmarkDark = toAbsoluteUrl(media.wordmark_dark_url, siteOrigin)

  return {
    ...(logo ? { logo_url: logo } : {}),
    ...(thumbnail ? { thumbnail_url: thumbnail } : {}),
    ...(wordmarkLight ? { wordmark_light_url: wordmarkLight } : {}),
    ...(wordmarkDark ? { wordmark_dark_url: wordmarkDark } : {}),
  }
}

function fallbackParentApp(
  role: unknown,
  globalAppId: unknown
): FireuxPublicParentApp | null | undefined {
  if (asString(role) !== 'tenant') return undefined

  const parentId = asString(globalAppId)
  if (!parentId) return null

  return {
    id: parentId,
    slug: appIdToSlug(parentId, parentId),
    name: labelize(parentId.replace(/-app$/i, '')) || parentId,
  }
}

async function loadPublicAppContext(): Promise<PublicAppContext> {
  const cfg = useFireUXConfig()
  const runtime = useRuntimeConfig()
  const runtimeFireux = asRecord(runtime.fireux) as RuntimeFireuxPrivate
  const runtimePublicFireux = asRecord(runtime.public?.fireux)
  const now = new Date().toISOString()

  const siteOrigin =
    normalizeSiteUrl(runtimePublicFireux.siteUrl) ||
    normalizeSiteUrl(cfg.siteUrl) ||
    normalizeSiteUrl(runtimePublicFireux.domain) ||
    normalizeSiteUrl(cfg.appId === 'fireux-app' ? 'fireux.app' : '')

  const appDoc = await readDocSafe<App>({
    collection: 'apps',
    id: cfg.appId,
  })

  const ecosystemSlug =
    normalizeSlug(appDoc?.ecosystem, normalizeSlug(cfg.ecosystem, 'fireux')) ||
    'fireux'
  const ecosystemDoc = await readEcosystemDocSafe([
    asString(appDoc?.ecosystem_id),
    ecosystemSlug,
    canonicalEcosystemId(ecosystemSlug),
  ])

  const media = sanitizeMedia(appDoc, siteOrigin, {
    logo: cfg.appLogo,
    thumbnail: cfg.appThumbnail,
  })
  const fallbackImageUrl =
    asOptionalString(asRecord(appDoc?.media).cover_url) ||
    media.thumbnail_url ||
    media.logo_url

  return {
    now,
    siteOrigin,
    appId: cfg.appId,
    appName: asString(appDoc?.app_name) || cfg.appName,
    appShortName: asOptionalString(appDoc?.app_short_name) || cfg.appShortName,
    appSlug:
      normalizeSlug(appDoc?.slug) ||
      appIdToSlug(cfg.appId, cfg.appName),
    appDoc,
    ecosystemSlug:
      normalizeSlug(ecosystemDoc?.slug) ||
      ecosystemSlug,
    ecosystemId:
      canonicalEcosystemId(ecosystemDoc?.id || appDoc?.ecosystem_id || ecosystemSlug) ||
      canonicalEcosystemId(ecosystemSlug),
    ecosystemName:
      asString(ecosystemDoc?.name) ||
      labelize(ecosystemSlug) ||
      'FireUX',
    ecosystemDoc,
    media,
    fallbackImageUrl,
    parentApp:
      fallbackParentApp(appDoc?.role || cfg.role, runtimePublicFireux.globalAppId || cfg.globalAppId),
    legacyMeta: runtimeFireux.meta,
    bootstrap: runtimeFireux.publicContent,
  }
}

function sanitizeMessaging(value: unknown): FireuxPublicMessaging {
  const input = asRecord(value)
  return {
    ...(asOptionalString(input.hero_prefix) ? { hero_prefix: asString(input.hero_prefix) } : {}),
    ...(asOptionalString(input.hero_headline) ? { hero_headline: asString(input.hero_headline) } : {}),
    ...(asOptionalString(input.hero_html) ? { hero_html: asString(input.hero_html) } : {}),
    ...(asOptionalString(input.summary) ? { summary: asString(input.summary) } : {}),
    ...(asOptionalString(input.console_bridge_html)
      ? { console_bridge_html: asString(input.console_bridge_html) }
      : {}),
    ...(asStringArray(input.highlight_terms).length
      ? { highlight_terms: asStringArray(input.highlight_terms) }
      : {}),
  }
}

function sanitizeSeo(
  value: unknown,
  fallback: {
    imageUrl?: string
  } = {}
): FireuxPublicSeo {
  const input = asRecord(value)
  const title = asOptionalString(input.title)
  const description = asOptionalString(input.description)
  const imageUrl =
    toAbsoluteUrl(asRecord(input.open_graph).image_url, undefined) ||
    toAbsoluteUrl(asRecord(input.twitter).image_url, undefined) ||
    fallback.imageUrl

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(asStringArray(input.keywords).length ? { keywords: asStringArray(input.keywords) } : {}),
    ...(asStringArray(input.audience).length ? { audience: asStringArray(input.audience) } : {}),
    ...(asStringArray(input.categories).length ? { categories: asStringArray(input.categories) } : {}),
    ...(asOptionalString(input.primary_topic)
      ? { primary_topic: asString(input.primary_topic) }
      : {}),
    canonical_path: normalizeCanonicalPath(input.canonical_path),
    open_graph: {
      ...(asOptionalString(asRecord(input.open_graph).title) || title
        ? { title: asString(asRecord(input.open_graph).title) || title }
        : {}),
      ...(asOptionalString(asRecord(input.open_graph).description) || description
        ? {
            description:
              asString(asRecord(input.open_graph).description) || description,
          }
        : {}),
      ...(imageUrl ? { image_url: imageUrl } : {}),
    },
    twitter: {
      card:
        (asString(asRecord(input.twitter).card) as 'summary' | 'summary_large_image') ||
        'summary_large_image',
      ...(asOptionalString(asRecord(input.twitter).title) || title
        ? { title: asString(asRecord(input.twitter).title) || title }
        : {}),
      ...(asOptionalString(asRecord(input.twitter).description) || description
        ? {
            description:
              asString(asRecord(input.twitter).description) || description,
          }
        : {}),
      ...(imageUrl ? { image_url: imageUrl } : {}),
    },
  }
}

function legacyMetaToPublicMeta(
  legacyMeta: FireuxMetaContent | undefined,
  fallback: { imageUrl?: string } = {}
): FireuxPublicMetaDoc {
  const copy = asRecord(legacyMeta?.copy)
  const seo = asRecord(legacyMeta?.seo)

  return {
    messaging: sanitizeMessaging({
      hero_prefix: copy.big_personality,
      hero_headline: copy.headline,
      hero_html: copy.positioning_html,
      summary: copy.about_p1 || copy.promise_html,
      console_bridge_html: copy.console_bridge_html,
      highlight_terms: copy.highlight_terms,
    }),
    seo: sanitizeSeo(
      {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        audience: seo.audience,
        categories: seo.categories,
        primary_topic: seo.primary_topic,
        canonical_path: '/',
        open_graph: {
          title: seo.title,
          description: seo.description,
          image_url: fallback.imageUrl,
        },
        twitter: {
          card: 'summary_large_image',
          title: seo.title,
          description: seo.description,
          image_url: fallback.imageUrl,
        },
      },
      fallback
    ),
  }
}

function sanitizeAction(value: unknown) {
  const input = asRecord(value)
  const label = asOptionalString(input.label)
  const to = asOptionalString(input.to)
  if (!label || !to) return undefined
  return { label, to }
}

function sanitizeAboutIntro(value: unknown): FireuxPublicLandingAboutIntro | undefined {
  const input = asRecord(value)
  const panelTicks = asStringArray(input.panel_ticks)

  const result: FireuxPublicLandingAboutIntro = {
    ...(asOptionalString(input.label) ? { label: asString(input.label) } : {}),
    ...(asOptionalString(input.title) ? { title: asString(input.title) } : {}),
    ...(asOptionalString(input.description) ? { description: asString(input.description) } : {}),
    ...(asOptionalString(input.supporting_copy)
      ? { supporting_copy: asString(input.supporting_copy) }
      : {}),
    ...(sanitizeAction(input.primary_action)
      ? { primary_action: sanitizeAction(input.primary_action) }
      : {}),
    ...(sanitizeAction(input.secondary_action)
      ? { secondary_action: sanitizeAction(input.secondary_action) }
      : {}),
    ...(asOptionalString(input.panel_title)
      ? { panel_title: asString(input.panel_title) }
      : {}),
    ...(panelTicks.length ? { panel_ticks: panelTicks } : {}),
  }

  return Object.keys(result).length ? result : undefined
}

function sanitizeLanding(
  value: unknown,
  fallback: { appName: string; highlightTerms?: string[] } = {
    appName: 'app',
  }
): FireuxPublicLanding {
  const input = asRecord(value)
  const hero = asRecord(input.hero)
  const actionBlock = asRecord(input.actions)
  const panelItems = Array.isArray(input.panel_items)
    ? input.panel_items
        .map((entry) => {
          const item = asRecord(entry)
          const title = asOptionalString(item.title)
          const description = asOptionalString(item.description)
          if (!title || !description) return null
          return {
            title,
            description,
            ...(asOptionalString(item.icon) ? { icon: asString(item.icon) } : {}),
          }
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    : []

  const heroResult: FireuxPublicLandingHero = {
    app_name: asString(hero.app_name) || fallback.appName,
    ...(asOptionalString(hero.prefix) ? { prefix: asString(hero.prefix) } : {}),
    ...(asOptionalString(hero.headline) ? { headline: asString(hero.headline) } : {}),
    ...(asOptionalString(hero.body_html) ? { body_html: asString(hero.body_html) } : {}),
    ...(asOptionalString(hero.console_bridge_html)
      ? { console_bridge_html: asString(hero.console_bridge_html) }
      : {}),
    ...(asStringArray(hero.highlight_terms).length
      ? { highlight_terms: asStringArray(hero.highlight_terms) }
      : fallback.highlightTerms?.length
        ? { highlight_terms: [...fallback.highlightTerms] }
        : {}),
  }

  return {
    hero: heroResult,
    ...(sanitizeAction(actionBlock.primary) || sanitizeAction(actionBlock.secondary)
      ? {
          actions: {
            ...(sanitizeAction(actionBlock.primary)
              ? { primary: sanitizeAction(actionBlock.primary) }
              : {}),
            ...(sanitizeAction(actionBlock.secondary)
              ? { secondary: sanitizeAction(actionBlock.secondary) }
              : {}),
          },
        }
      : {}),
    ...(asStringArray(input.bullets).length ? { bullets: asStringArray(input.bullets) } : {}),
    ...(panelItems.length ? { panel_items: panelItems } : {}),
    ...(sanitizeAboutIntro(input.about_intro)
      ? { about_intro: sanitizeAboutIntro(input.about_intro) }
      : {}),
    ...(asOptionalString(input.updated_at) ? { updated_at: asString(input.updated_at) } : {}),
  }
}

function legacyMetaToLanding(
  legacyMeta: FireuxMetaContent | undefined,
  fallback: { appName: string }
): FireuxPublicLanding {
  const copy = asRecord(legacyMeta?.copy)
  const lists = asRecord(legacyMeta?.lists)
  return sanitizeLanding(
    {
      hero: {
        app_name: fallback.appName,
        prefix: copy.big_personality,
        headline: copy.headline,
        body_html: copy.positioning_html,
        console_bridge_html: copy.console_bridge_html,
        highlight_terms: copy.highlight_terms,
      },
      bullets: lists.hero_bullets,
      about_intro: {
        description: copy.about_p1,
        supporting_copy: copy.about_p2 || copy.promise_html,
        panel_ticks: lists.about_ticks,
      },
    },
    {
      appName: fallback.appName,
      highlightTerms: asStringArray(copy.highlight_terms),
    }
  )
}

export async function resolvePublicAppInfo(): Promise<FireuxPublicAppInfoResponse> {
  const context = await loadPublicAppContext()

  return {
    ok: true,
    ecosystem: {
      id: context.ecosystemId,
      slug: context.ecosystemSlug,
      name: context.ecosystemName,
    },
    app: {
      id: context.appId,
      slug: context.appSlug,
      name: context.appName,
      ...(context.appShortName ? { short_name: context.appShortName } : {}),
      ...(Object.keys(context.media).length ? { media: context.media } : {}),
      ...(context.parentApp !== undefined ? { parent_app: context.parentApp } : {}),
    },
    now: context.now,
  }
}

export async function resolvePublicAppMeta(): Promise<FireuxPublicAppMetaResponse> {
  const context = await loadPublicAppContext()

  const firestoreMetaDoc = await readNestedDocSafe<FireuxPublicMetaDoc>({
    collection: 'apps',
    id: context.appId,
    childCollection: 'public',
    childId: 'meta',
  })

  const source =
    firestoreMetaDoc ||
    context.bootstrap?.meta ||
    legacyMetaToPublicMeta(context.legacyMeta, {
      imageUrl: context.fallbackImageUrl,
    })

  const messaging = sanitizeMessaging(asRecord(source).messaging)
  const seo = sanitizeSeo(asRecord(source).seo, {
    imageUrl: context.fallbackImageUrl,
  })

  return {
    ok: true,
    messaging,
    seo,
    now: context.now,
  }
}

export async function resolvePublicAppLanding(): Promise<FireuxPublicAppLandingResponse> {
  const context = await loadPublicAppContext()

  const firestoreLandingDoc = await readNestedDocSafe<FireuxPublicLanding>({
    collection: 'apps',
    id: context.appId,
    childCollection: 'public',
    childId: 'landing',
  })

  const source =
    firestoreLandingDoc ||
    context.bootstrap?.landing ||
    legacyMetaToLanding(context.legacyMeta, {
      appName: context.appName,
    })

  return {
    ok: true,
    landing: sanitizeLanding(source, {
      appName: context.appName,
      highlightTerms:
        sanitizeMessaging(asRecord(context.bootstrap?.meta).messaging).highlight_terms ||
        sanitizeMessaging(legacyMetaToPublicMeta(context.legacyMeta).messaging).highlight_terms,
    }),
    now: context.now,
  }
}
