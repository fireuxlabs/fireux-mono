// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: remove stale entity samples from product metadata.
// Concurrent edit — 2026-07-21 13:08 CEST — Operations catalogue: keep parked Portfolio work out of the public index.
import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'
import { portfolioOperations } from 'fireux-properties/runtime/content/operations'
import { sourceMeta } from './content/meta/source'

const aboutHero = sourceMeta.about.hero as {
  label: string
  supportingCopy: string
  primaryAction: { label: string; to: string }
  secondaryAction: { label: string; to: string }
  tagline?: string
  description?: string
}

const landing = sourceMeta.landing as typeof sourceMeta.landing & {
  secondaryCtaLabel?: string
  secondaryCtaTo?: string
}

export const appMeta = {
  name: sourceMeta.name,

  brand: landing.brand,
  heroPrimaryHtml: landing.heroPrimaryLine,
  consoleBridgeHtml: landing.consoleBridgeLine,
  landingPrimaryCtaLabel: landing.primaryCtaLabel,
  landingSecondaryCtaLabel: landing.secondaryCtaLabel ?? '',
  landingSecondaryCtaTo: landing.secondaryCtaTo ?? '',
  heroBullets: landing.heroBullets,
  heroPanelItems: landing.rightPanelItems,

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
    id: 'granite',
    name: appMeta.name,
    ecosystem: 'granite',
  },
  copy: {
    big_personality: appMeta.brand.bigPersonality,
    headline: appMeta.brand.headline,
    highlight_terms: [
      'operating system',
      'portfolio control',
      'compliance exposure',
      'financial signals',
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
      'property portfolio management',
      'landlord operations software',
      'property compliance tracking',
      'portfolio incident management',
      'property finance oversight',
      'asset management platform',
    ],
    audience: ['landlords', 'portfolio managers', 'property agencies'],
    categories: [
      'property management software',
      'portfolio operations platform',
      'compliance management',
    ],
    primary_topic: 'property portfolio management',
  },
  cta: {
    primary: {
      label: appMeta.landingPrimaryCtaLabel,
      to: '/get-started',
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
  operations: [...portfolioOperations],
  solutions: [
    {
      slug: 'property-showcase',
      title: 'Showcase a property',
      description:
        'Create a public property page when a property needs a clean, shareable presentation.',
      icon: 'i-lucide-building-2',
    },
    {
      slug: 'property-portfolio-pages',
      title: 'Explain a property portfolio',
      description:
        'Use portfolio-style pages when properties need a public narrative and investor-ready context.',
      icon: 'i-lucide-layout-dashboard',
    },
    {
      slug: 'private-property-records',
      title: 'Manage private property records',
      description:
        'Keep operational property information private while still using shared FireUX app structure.',
      icon: 'i-lucide-lock-keyhole',
    },
    {
      slug: 'investor-property-summaries',
      title: 'Prepare investor summaries',
      description:
        'Shape property information into concise summaries for portfolio and stakeholder conversations.',
      icon: 'i-lucide-chart-no-axes-combined',
    },
    {
      slug: 'property-operator-app',
      title: 'Launch a property operator app',
      description:
        'Run a branded property operations app for portfolios, compliance, and team workflows.',
      icon: 'i-lucide-landmark',
    },
  ],
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
