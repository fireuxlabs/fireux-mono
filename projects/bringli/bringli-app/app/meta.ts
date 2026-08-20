// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: remove stale entity samples from product metadata.
// Concurrent edit — 2026-07-21 13:08 CEST — Operations catalogue: compose Bringli Supplier operations.
import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'
import { supplierOperations } from 'fireux-suppliers/runtime/supplier/models/operations'
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
    id: 'bringli',
    name: appMeta.name,
    ecosystem: 'bringli',
  },
  copy: {
    big_personality: appMeta.brand.bigPersonality,
    headline: appMeta.brand.headline,
    highlight_terms: [
      'operating system',
      'simple order and drop flow',
      'Drop',
      'delivery execution',
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
      'local producer delivery',
      'local food delivery platform',
      'supplier delivery marketplace',
      'producer logistics app',
      'local supply operations',
      'last mile producer delivery',
    ],
    audience: ['local producers', 'households', 'business buyers', 'operators'],
    categories: [
      'local delivery platform',
      'supplier marketplace',
      'supply operations software',
    ],
    primary_topic: 'local producer delivery platform',
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
  operations: [...supplierOperations],
  solutions: [
    {
      slug: 'supplier-profiles',
      title: 'Publish supplier profiles',
      description: 'Give local suppliers a clean public surface for who they are and what they provide.',
      icon: 'i-lucide-store',
    },
    {
      slug: 'product-catalogue-info',
      title: 'Share catalogue information',
      description: 'Expose simple product and supply information without turning the app into a full marketplace too soon.',
      icon: 'i-lucide-boxes',
    },
    {
      slug: 'delivery-supplier-leads',
      title: 'Collect supplier leads',
      description: 'Create an entry point for buyers, suppliers, and delivery operations to connect.',
      icon: 'i-lucide-handshake',
    },
    {
      slug: 'trade-supplier-pages',
      title: 'Create trade supplier pages',
      description: 'Build focused pages for producers and trade suppliers that need clear public information.',
      icon: 'i-lucide-file-text',
    },
    {
      slug: 'supplier-network',
      title: 'Grow a supplier network',
      description: 'Use Bringli as the public and operational surface for a connected local supply network.',
      icon: 'i-lucide-network',
    },
  ],
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
