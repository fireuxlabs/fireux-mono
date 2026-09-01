// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: remove stale entity samples from product metadata.
// Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: register the cleaning search-intent solution.
// Concurrent edit — 2026-07-21 12:08 CEST — Shared solutions catalogue: compose FireUX, Misebox, and Werkbox entries.
// Concurrent edit — 2026-07-21 12:20 CEST — FireUX SEO solutions: add seven distinct customer-intent pages.
// Concurrent edit — 2026-07-21 12:44 CEST — Operations catalogue: declare FireUX route-backed capabilities.
// Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: update the FireUX product highlight vocabulary.
// Concurrent edit — 2026-07-21 13:16 CEST — FireUX project positioning: publish Project Operations with working public and Workspace homes.
// Concurrent edit — 2026-08-03 — Keep Ignition as App intake and a private delivery workflow, not a Project Operation.
// Concurrent edit — 2026-07-22 13:03 CEST — Origin-aware Ignition pipelines: retain FireUX solution intent through intake.
// Concurrent edit — 2026-07-23 12:13 CEST — FireUX landing makeover: align public metadata with the concrete Ignition offer.
import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'
import { sourceMeta } from './content/meta/source'
import { fireuxSolutions } from './content/meta/solutions'

export { fireuxOffer } from './content/meta/source'

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
  workspaceBridgeHtml: sourceMeta.landing.workspaceBridgeLine,
  landingPrimaryCtaLabel: sourceMeta.landing.primaryCtaLabel,
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

const workspaceRoutes = appMeta.routes
  .filter((route) => route.kind === 'workspace')
  .map((route) => route.path)

export const metaContent = defineFireuxMeta({
  app: {
    id: 'fireux',
    name: appMeta.name,
    ecosystem: 'fireux',
  },
  copy: {
    big_personality: appMeta.brand.bigPersonality,
    headline: appMeta.brand.headline,
    highlight_terms: [
      'FireUX Projects',
      'FireUX Apps',
      'FireUX Ecosystems',
      'Project Workspace',
    ],
    positioning_html: appMeta.heroPrimaryHtml,
    promise_html: appMeta.aboutSupportingCopy,
    workspace_bridge_html: appMeta.workspaceBridgeHtml,
    about_p1: appMeta.description,
    about_p2: appMeta.aboutSupportingCopy,
  },
  seo: {
    title: appMeta.seoHome.title,
    description: appMeta.seoHome.description,
    keywords: [
      'FireUX Project',
      'FireUX App',
      'FireUX Ecosystem',
      'Project Workspace',
      'app ignition',
      'modular web apps',
    ],
    audience: ['project owners', 'app operators', 'founders', 'partners'],
    categories: ['project operations', 'app platforms', 'ecosystem software'],
    primary_topic: 'FireUX Projects and Apps',
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
    workspace: appMeta.aboutPrimaryAction,
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
    {
      id: 'project.apps',
      slug: 'apps',
      title: 'Apps',
      description: 'Review the Apps connected to the selected Project.',
      to: '/workspace/project/apps',
      workspace: {
        id: 'project',
        name: 'Project workspace',
        to: '/',
      },
      capabilityFamilies: {
        surfaces: ['catalogue'],
        entries: [],
        tools: ['record'],
        scopes: ['local'],
      },
      icon: 'i-lucide-app-window',
    },
    {
      id: 'project.ecosystem',
      slug: 'ecosystem',
      title: 'Ecosystem',
      description:
        'Review the selected Project Ecosystem and the Apps inside it.',
      to: '/workspace/project/ecosystem',
      workspace: {
        id: 'project',
        name: 'Project workspace',
        to: '/',
      },
      capabilityFamilies: {
        surfaces: ['catalogue', 'relationship-directory'],
        entries: [],
        tools: ['record'],
        scopes: ['local'],
      },
      icon: 'i-lucide-orbit',
    },
  ],
  solutions: fireuxSolutions,
  entities: appMeta.entities.map((entity) => ({
    id: entity.name,
    purpose: entity.purpose,
  })),
  relations_ascii: appMeta.relationshipMap,
  routes: {
    public: publicRoutes,
    workspace: workspaceRoutes,
  },
})
