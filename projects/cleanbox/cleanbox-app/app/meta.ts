// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: remove stale entity samples from product metadata.
import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

const sourceMeta = {
  name: 'Cleanbox',
  landing: {
    brand: {
      appName: 'cleanbox',
      bigPersonality: 'Bring Bling',
      headline: 'to your operations',
    },
    heroPrimaryLine:
      'Cleanbox is the <strong>operating system</strong> for cleaning companies and crews. Coordinate schedules, quality checks, and billing from one <strong>streamlined console</strong>. Keep every service <strong>verified</strong>, recurring, and client-ready.',
    primaryCtaLabel: 'Get started',
    secondaryCtaLabel: 'Browse crews',
    secondaryCtaTo: '/users',
    consoleBridgeLine:
      'The operating system for repeatable cleaning operations with <strong>proof</strong>, quality control, and billing discipline.',
    heroBullets: [
      'Smart scheduling and crew assignments',
      'QA checklists with photo proof',
      'Compliance and certification tracking',
      'Stripe-ready invoicing and exports',
    ],
    rightPanelItems: [
      {
        title: 'Scheduling',
        description: 'Plan crews and shifts across properties.',
        icon: 'i-lucide-calendar-check',
      },
      {
        title: 'QA proof',
        description: 'Photo receipts and sign-off updates.',
        icon: 'i-lucide-image',
      },
      {
        title: 'Billing',
        description: 'Invoice-ready service logs and exports.',
        icon: 'i-lucide-wallet',
      },
    ],
    seo: {
      title: 'Cleanbox — Cleaning operations you can trust',
      description: 'Schedule, verify, and invoice every clean with confidence.',
    },
  },
  about: {
    hero: {
      label: 'About Cleanbox',
      supportingCopy:
        'We run recurring cleaning operations with one structured flow for planning, service proof, and billing readiness.',
      primaryAction: {
        label: 'Open rollout',
        to: '/get-started',
      },
      secondaryAction: {
        label: 'Browse jobs',
        to: '/jobs',
      },
    },
    panel: {
      title: 'What this page covers',
      subtitle: '',
      ticks: [
        'How Cleanbox modules fit together in operations',
        'The core records and how they connect',
        'Small realistic sample objects for context',
        'Direct links to public and console surfaces',
      ],
    },
    sections: {
      keyConceptsTitle: 'Cleanbox - Key Concepts (Priority Order)',
      modulesEyebrow: 'Modules',
      modulesTitle: 'How we organize the app',
      modulesDescription:
        'Each module owns a clear operational area, and together they power one service workflow.',
      entitiesEyebrow: 'Entities',
      entitiesTitle: 'The records we work with every day',
      structureEyebrow: 'Structure',
      structureTitle: 'Relationship map',
      routesTitle: 'Key routes',
    },
    keyConcepts: [
      {
        title: 'Ecosystem',
        description: 'An ecosystem of apps for cleaning operations.',
      },
      {
        title: 'Service Locations',
        description: 'Locations are the operational units where recurring cleaning is delivered.',
      },
      {
        title: 'Jobs',
        description: 'Jobs define shifts, assignments, and service expectations.',
      },
      {
        title: 'Planning',
        description: 'Scheduling and assignment keep service coverage predictable.',
      },
      {
        title: 'Team Operations',
        description: 'Teams coordinate execution with clear ownership and handoff.',
      },
      {
        title: 'QA Proof',
        description: 'Proof records confirm that work was completed to standard.',
      },
      {
        title: 'Service History',
        description: 'History makes repeatable quality and accountability visible.',
      },
      {
        title: 'Billing Readiness',
        description: 'Completed service data is structured for invoicing and reporting.',
      },
      {
        title: 'Reliability',
        description: 'Cleanbox focuses on predictable recurring service, not one-off chaos.',
      },
      {
        title: 'Console',
        description: 'One console coordinates daily operations from plan to proof.',
      },
    ],
    appSpec: {
      name: 'Cleanbox',
      tagline: 'Operating System for Cleaning Operations',
      description:
        'Cleanbox is the operating system for cleaning companies and crews. We coordinate planning, execution proof, and billing readiness from one structured system.',
      modules: [
        {
          name: 'cleanbox runtime',
          summary: 'Service location context and operational records for recurring work.',
          entities: ['CleanboxLocation'],
        },
        {
          name: 'fireux-jobs',
          summary: 'Job and assignment flows for staffing service operations.',
          entities: ['Job'],
        },
        {
          name: 'fireux-places',
          summary: 'Canonical location identity used by operational records.',
          entities: ['Place'],
        },
        {
          name: 'fireux-core users',
          summary: 'Cross-app user identity and memberships.',
          entities: ['User'],
        },
      ],
      entities: [
        {
          name: 'CleanboxLocation',
          purpose: 'Serviced property/location record for recurring cleaning operations.',
          keyFields: ['id', 'label', 'city', 'postcode', 'core_place_id'],
          linksTo: ['Place', 'Job', 'User'],
        },
        {
          name: 'Job',
          purpose: 'Service assignment record for shifts, role scope, and status.',
          keyFields: ['id', 'title', 'status', 'type', 'place_id'],
          linksTo: ['CleanboxLocation', 'User'],
        },
        {
          name: 'Place',
          purpose: 'Canonical location identity shared across FireUX surfaces.',
          keyFields: ['id', 'name', 'formatted_address', 'lat', 'lng'],
          linksTo: ['CleanboxLocation', 'Job'],
        },
        {
          name: 'User',
          purpose: 'Authenticated member identity for operators and coordinators.',
          keyFields: ['id', 'display_name', 'profiles', 'userOf', 'adminOf'],
          linksTo: ['CleanboxLocation', 'Job'],
        },
      ],
      routes: [
        { label: 'Home', path: '/', kind: 'public' },
        { label: 'Get Started', path: '/get-started', kind: 'public' },
        { label: 'About', path: '/about', kind: 'public' },
        { label: 'Jobs', path: '/jobs', kind: 'public' },
        { label: 'Console Entry', path: '/console', kind: 'console' },
      ],
    },
    relationshipMap: `
Place
  -> CleanboxLocation
       -> Job
       -> User (assigned/coordinator)

User
  -> Job
  -> CleanboxLocation
`,
    seo: {
      title: 'About Cleanbox',
      description:
        'How Cleanbox organizes recurring cleaning operations, service records, and execution routes.',
    },
  },
  getStarted: {
    hero: {
      eyebrow: 'Get live fast',
      title: 'Run cleaning operations with proof and control',
      description:
        'Cleanbox unifies scheduling, quality checks, and billing so crews can execute reliably and clients can trust every service cycle.',
      primaryAction: {
        label: 'Open dashboard',
        to: '/dashboard',
      },
      secondaryAction: {
        label: 'Review rollout',
        to: '/get-started',
      },
    },
    snapshotTitle: 'Rollout snapshot',
    snapshotTicks: [
      'Service model and crew roles mapped clearly',
      'Scheduling and assignment logic activated',
      'QA proof flow and sign-off rules configured',
      'Billing-ready outputs verified for operations',
    ],
    stepsHeading: {
      eyebrow: 'Three steps',
      title: 'A practical rollout in three steps',
      description:
        'Structure service delivery, activate workflows, then run with operational discipline.',
    },
    steps: [
      {
        badge: 'Step 1',
        title: 'Service baseline',
        copy: 'Map service types, crew structure, and standards for consistent delivery.',
        items: ['Service model defined', 'Crew and role map', 'Accountability model'],
      },
      {
        badge: 'Step 2',
        title: 'Workflow activation',
        copy: 'Enable scheduling, QA checks, and status flow from assignment to completion.',
        items: ['Scheduling rules active', 'QA evidence flow enabled', 'Client update cadence set'],
      },
      {
        badge: 'Step 3',
        title: 'Billing handover',
        copy: 'Convert execution data into billing-ready records with minimal admin effort.',
        items: ['Billing fields validated', 'Exports and checks ready', 'Runbook finalized'],
      },
    ],
    seo: {
      title: 'Get Started · Cleanbox',
      description: 'Set up scheduling, QA proof, and billing workflows in Cleanbox.',
    },
  },
  roadmap: {
    title: 'Cleanbox Road Map',
    summary:
      'Cleanbox is evolving from baseline cleaning execution into deeper QA intelligence and operational automation.',
  },
} as const

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
    id: 'cleanbox',
    name: appMeta.name,
    ecosystem: 'cleanbox',
  },
  copy: {
    big_personality: appMeta.brand.bigPersonality,
    headline: appMeta.brand.headline,
    highlight_terms: [
      'operating system',
      'streamlined console',
      'verified',
      'proof',
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
      'cleaning operations software',
      'cleaning company scheduling',
      'cleaning qa proof',
      'cleaning service billing',
      'recurring cleaning management',
      'crew scheduling app',
    ],
    audience: ['cleaning companies', 'operations managers', 'cleaning crews'],
    categories: [
      'cleaning operations software',
      'service management platform',
      'field service workflow',
    ],
    primary_topic: 'cleaning operations software',
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
  solutions: [
    {
      slug: 'cleaning-jobs',
      title: 'Manage cleaning jobs',
      description: 'Create a clear job surface for service work, recurring tasks, and operational follow-up.',
      icon: 'i-lucide-clipboard-check',
    },
    {
      slug: 'field-agent-management',
      title: 'Support field agents',
      description: 'Give cleaners and service agents a focused place for work details and proof.',
      icon: 'i-lucide-user-check',
    },
    {
      slug: 'service-offers',
      title: 'Package cleaning services',
      description: 'Turn services into productised offers that are easier to explain, buy, and manage.',
      icon: 'i-lucide-package-check',
    },
    {
      slug: 'job-requests',
      title: 'Collect job requests',
      description: 'Capture lightweight service enquiries and turn them into structured cleaning work.',
      icon: 'i-lucide-inbox',
    },
    {
      slug: 'cleaning-business-app',
      title: 'Launch a cleaning business app',
      description: 'Run a branded cleaning app for customers, staff, service pages, and operations.',
      icon: 'i-lucide-sparkles',
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
