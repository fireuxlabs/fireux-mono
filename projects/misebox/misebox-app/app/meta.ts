// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: remove stale entity samples from product metadata.
// Concurrent edit — 2026-07-21 12:08 CEST — Shared solutions catalogue: consume Misebox ecosystem-owned entries.
// Concurrent edit — 2026-07-21 12:58 CEST — Console operations catalogue: compose Kitchen and Supplier operations.
// Concurrent edit — 2026-07-23 09:40 CEST — Align landing metadata with the live restaurant workflow promise.
// Concurrent edit — 2026-07-23 15:48 CEST — Separate the Kitchen acquisition promise from the focused Jobs doorway.
import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'
import { kitchenOperations } from 'fireux-kitchens/runtime/content/operations'
import { miseboxSolutions } from 'fireux-misebox/runtime/content/solutions'
import { sourceMeta } from './content/meta/source'

const aboutHero = sourceMeta.about.hero as {
  label: string
  supportingCopy: string
  primaryAction: { label: string; to: string }
  secondaryAction: { label: string; to: string }
  tagline?: string
  description?: string
}

export const appMeta = {
  name: sourceMeta.name,

  brand: sourceMeta.landing.brand,
  heroPrimaryHtml: sourceMeta.landing.heroPrimaryLine,
  consoleBridgeHtml: sourceMeta.landing.consoleBridgeLine,
  landingPrimaryCtaLabel: sourceMeta.landing.primaryCtaLabel,
  landingPrimaryCtaTo: sourceMeta.landing.primaryCtaTo,
  landingSecondaryCtaLabel: sourceMeta.landing.secondaryCtaLabel ?? '',
  landingSecondaryCtaTo: sourceMeta.landing.secondaryCtaTo ?? '',
  heroBullets: sourceMeta.landing.heroBullets,
  heroPanelItems: sourceMeta.landing.rightPanelItems,

  aboutLabel: aboutHero.label,
  tagline: aboutHero.tagline ?? sourceMeta.about.appSpec.tagline,
  description: aboutHero.description ?? sourceMeta.about.appSpec.description,
  aboutSupportingCopy: aboutHero.supportingCopy,
  aboutPrimaryAction: aboutHero.primaryAction,
  aboutSecondaryAction: aboutHero.secondaryAction,
  aboutPanelTitle: sourceMeta.about.panel.title,
  aboutPanelSubtitle: sourceMeta.about.panel.subtitle,
  aboutPanelTicks: sourceMeta.about.panel.ticks,
  aboutSections: sourceMeta.about.sections,
  keyConcepts: sourceMeta.about.keyConcepts,
  modules: sourceMeta.about.appSpec.modules,
  entities: sourceMeta.about.appSpec.entities,
  routes: sourceMeta.about.appSpec.routes,
  relationshipMap: sourceMeta.about.relationshipMap,

  getStarted: sourceMeta.getStarted,

  seoHome: sourceMeta.landing.seo,
  seoAbout: sourceMeta.about.seo,
  seoGetStarted: sourceMeta.getStarted.seo,

  roadmap: sourceMeta.roadmap,
} as const

const publicRoutes = appMeta.routes
  .filter((route) => route.kind === 'public')
  .map((route) => route.path)

const consoleRoutes = appMeta.routes
  .filter((route) => route.kind === 'console')
  .map((route) => route.path)

export const metaContent = defineFireuxMeta({
  app: {
    id: 'misebox',
    name: appMeta.name,
    ecosystem: 'misebox',
  },
  copy: {
    big_personality: appMeta.brand.bigPersonality,
    headline: appMeta.brand.headline,
    highlight_terms: [
      'kitchens',
      'menus',
      'recipes',
      'prep',
      'orders',
      'team',
      'service',
      'handoff',
      'connected workflow',
    ],
    positioning_html: appMeta.heroPrimaryHtml,
    promise_html: appMeta.aboutSupportingCopy,
    console_bridge_html: appMeta.consoleBridgeHtml,
    about_p1: appMeta.description,
    about_p2: appMeta.aboutSupportingCopy,
  },
  seo: {
    title: appMeta.seoHome.title,
    description: appMeta.seoHome.description,
    keywords: [
      'kitchen operations software',
      'restaurant kitchen management',
      'restaurant menu management',
      'kitchen preparation workflow',
      'restaurant service workflow',
      'menu recipe operations',
    ],
    audience: [
      'restaurant owners',
      'kitchen operators',
      'head chefs',
      'restaurant service teams',
    ],
    categories: [
      'kitchen operations software',
      'restaurant menu management',
      'restaurant service operations',
    ],
    primary_topic: 'kitchen operations software',
  },
  cta: {
    primary: {
      label: appMeta.landingPrimaryCtaLabel,
      to: appMeta.landingPrimaryCtaTo,
    },
    secondary:
      appMeta.landingSecondaryCtaLabel && appMeta.landingSecondaryCtaTo
        ? {
            label: appMeta.landingSecondaryCtaLabel,
            to: appMeta.landingSecondaryCtaTo,
          }
        : undefined,
    console: appMeta.aboutPrimaryAction,
    roadmap: {
      label: 'Road map',
      to: '/road-map',
    },
  },
  lists: {
    hero_bullets: [...appMeta.heroBullets],
    about_ticks: [...appMeta.aboutPanelTicks],
  },
  operations: [
    ...kitchenOperations,
  ],
  solutions: miseboxSolutions,
  entities: appMeta.entities.map((entity) => ({
    id: entity.name,
    purpose: entity.purpose,
  })),
  relations_ascii: appMeta.relationshipMap,
  routes: {
    public: publicRoutes,
    console: consoleRoutes,
  },
})
