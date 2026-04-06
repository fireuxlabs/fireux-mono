/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System support
 * Storage: Firestore-backed public content docs plus runtime bootstrap fallback
 * Scope: public app identity, messaging, landing, and SEO contracts
 */

export type FireuxPublicAction = {
  label: string
  to: string
}

export type FireuxPublicPanelItem = {
  title: string
  description: string
  icon?: string
}

export type FireuxPublicParentApp = {
  id: string
  slug: string
  name: string
}

export type FireuxPublicAppMedia = {
  logo_url?: string
  thumbnail_url?: string
  wordmark_light_url?: string
  wordmark_dark_url?: string
}

export type FireuxPublicAppInfo = {
  id: string
  slug: string
  name: string
  short_name?: string
  media?: FireuxPublicAppMedia
  parent_app?: FireuxPublicParentApp | null
}

export type FireuxPublicEcosystemInfo = {
  id: string
  slug: string
  name: string
}

export type FireuxPublicMessaging = {
  hero_prefix?: string
  hero_headline?: string
  hero_html?: string
  summary?: string
  console_bridge_html?: string
  highlight_terms?: string[]
}

export type FireuxPublicSeoOpenGraph = {
  title?: string
  description?: string
  image_url?: string
}

export type FireuxPublicSeoTwitter = {
  card?: 'summary' | 'summary_large_image'
  title?: string
  description?: string
  image_url?: string
}

export type FireuxPublicSeo = {
  title?: string
  description?: string
  keywords?: string[]
  audience?: string[]
  categories?: string[]
  primary_topic?: string
  canonical_path?: string
  open_graph?: FireuxPublicSeoOpenGraph
  twitter?: FireuxPublicSeoTwitter
}

export type FireuxPublicMetaDoc = {
  messaging?: FireuxPublicMessaging
  seo?: FireuxPublicSeo
  updated_at?: string
}

export type FireuxPublicLandingHero = {
  app_name: string
  prefix?: string
  headline?: string
  body_html?: string
  console_bridge_html?: string
  highlight_terms?: string[]
}

export type FireuxPublicLandingAboutIntro = {
  label?: string
  title?: string
  description?: string
  supporting_copy?: string
  primary_action?: FireuxPublicAction
  secondary_action?: FireuxPublicAction
  panel_title?: string
  panel_ticks?: string[]
}

export type FireuxPublicLanding = {
  hero: FireuxPublicLandingHero
  actions?: {
    primary?: FireuxPublicAction
    secondary?: FireuxPublicAction
  }
  bullets?: string[]
  panel_items?: FireuxPublicPanelItem[]
  about_intro?: FireuxPublicLandingAboutIntro
  updated_at?: string
}

export type FireuxPublicContentBootstrap = {
  meta: FireuxPublicMetaDoc
  landing: FireuxPublicLanding
}

export type FireuxPublicAppInfoResponse = {
  ok: true
  ecosystem: FireuxPublicEcosystemInfo
  app: FireuxPublicAppInfo
  now: string
}

export type FireuxPublicAppMetaResponse = {
  ok: true
  messaging: FireuxPublicMessaging
  seo: FireuxPublicSeo
  now: string
}

export type FireuxPublicAppLandingResponse = {
  ok: true
  landing: FireuxPublicLanding
  now: string
}

export function defineFireuxPublicContentBootstrap<const T extends FireuxPublicContentBootstrap>(
  value: T
): T {
  return value
}
