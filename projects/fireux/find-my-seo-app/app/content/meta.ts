import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

const sourceMeta = {
  name: 'Find My SEO',
  landing: {
    brand: {
      appName: 'find my seo',
      bigPersonality: 'Hire With',
      headline: 'Proof And Clarity',
    },
    heroPrimaryLine:
      '<strong>Connect your project with SEO professionals.</strong> Compare specialists by service, sector, and proof.',
    primaryCtaLabel: 'Find an SEO specialist',
    secondaryCtaLabel: 'Create a provider profile',
    secondaryCtaTo: '/dashboard/professional',
    consoleBridgeLine:
      'A standalone app for <strong>SEO discovery</strong>, <strong>profile trust</strong>, and <strong>better-fit enquiries</strong>.',
    heroBullets: [
      'Search by specialism and sector',
      'Profiles with proof',
      'Lead capture for enquiries',
      'Light provider dashboard',
    ],
    rightPanelItems: [
      {
        title: 'Directory',
        description: 'Match projects with SEO professionals.',
        icon: 'i-lucide-search',
      },
      {
        title: 'Proof',
        description: 'Compare services, outcomes and case studies.',
        icon: 'i-lucide-badge-check',
      },
      {
        title: 'Leads',
        description: 'Turn profile visits into enquiries.',
        icon: 'i-lucide-mail-plus',
      },
    ],
    seo: {
      title: 'Find My SEO - Trusted SEO providers with proof, not fluff',
      description:
        'Search vetted SEO consultants and agencies by specialism, sector, and engagement type. Compare profiles, case studies, and proof before you enquire.',
    },
  },
  about: {
    hero: {
      label: 'About Find My SEO',
      supportingCopy:
        'This app is intentionally thin. The Phase 1 loop is search, compare, review proof, and send a lead. It is not an SEO operating system and it is not a console-heavy workspace.',
      primaryAction: {
        label: 'Browse SEO professionals',
        to: '/professionals',
      },
      secondaryAction: {
        label: 'Open get started',
        to: '/get-started',
      },
    },
    panel: {
      title: 'What this page covers',
      subtitle: '',
      ticks: [
        'The public-first product shape for Phase 1',
        'The lean MVP entities and how they connect',
        'Which routes are public and which stay private',
        'How the app sits inside FireUX without tenant drift',
      ],
    },
    sections: {
      keyConceptsTitle: 'Find My SEO - Key Concepts (Priority Order)',
      modulesEyebrow: 'Surfaces',
      modulesTitle: 'How the app is organized',
      modulesDescription:
        'The app stays focused on discovery, trust signals, and lead capture rather than deep operational tooling.',
      entitiesEyebrow: 'Entities',
      entitiesTitle: 'The records that matter first',
      structureEyebrow: 'Structure',
      structureTitle: 'Relationship map',
      examplesEyebrow: 'Examples',
      examplesTitle: 'Sample objects',
      routesTitle: 'Key routes',
    },
    keyConcepts: [
      {
        title: 'Public discovery',
        description: 'The product starts as a public directory and comparison surface for SEO talent.',
      },
      {
        title: 'SEO profiles',
        description: 'Profiles are the main trust asset, combining services, positioning, proof, and availability.',
      },
      {
        title: 'Case studies',
        description: 'Structured proof gives buyers comparable evidence instead of vague claims.',
      },
      {
        title: 'Lead capture',
        description: 'The first conversion is a quote request, not a complex messaging workflow.',
      },
      {
        title: 'Light dashboard',
        description: 'SEO users need profile and proof management, not a full operational console family.',
      },
      {
        title: 'Standalone app',
        description:
          'This is a standalone FireUX-hosted product app inside the fireux ecosystem. It is not a tenant child and it is not the global ecosystem app.',
      },
    ],
    appSpec: {
      name: 'Find My SEO',
      tagline: 'Trust-First Marketplace for SEO Professionals',
      description:
        'Find My SEO is a standalone FireUX-hosted product app for discovering and contacting credible SEO providers through searchable profiles, proof of results, and lean lead capture.',
      modules: [
        {
          name: 'Public directory',
          summary: 'Search and compare profiles by specialism, sector, and engagement type.',
          entities: ['Professional', 'Company'],
        },
        {
          name: 'Proof layer',
          summary: 'Structured case-study content that helps buyers compare outcomes consistently.',
          entities: ['SeoCaseStudy'],
        },
        {
          name: 'Lead flow',
          summary: 'Simple enquiry capture from profile page to dashboard review.',
          entities: ['Lead'],
        },
        {
          name: 'Light dashboard',
          summary: 'Owner-facing profile, case-study, and lead management without console-family sprawl.',
          entities: ['Professional', 'Company', 'SeoCaseStudy', 'Lead'],
        },
      ],
      entities: [
        {
          name: 'Professional',
          purpose: 'Base identity for consultant listings shown in the public directory.',
          keyFields: ['id', 'slug', 'displayName', 'specialisms', 'pricingGuidance', 'availabilityStatus'],
          linksTo: ['SeoCaseStudy', 'Lead'],
        },
        {
          name: 'Company',
          purpose: 'Base identity for agency listings shown in the public directory.',
          keyFields: ['id', 'slug', 'brandName', 'specialisms', 'teamSizeLabel', 'availabilityStatus'],
          linksTo: ['SeoCaseStudy', 'Lead'],
        },
        {
          name: 'SeoCaseStudy',
          purpose: 'Structured proof record attached to either a consultant or an agency listing.',
          keyFields: ['id', 'ownerEntityId', 'problem', 'actions', 'metrics', 'timeframeLabel'],
          linksTo: ['Professional', 'Company'],
        },
        {
          name: 'Lead',
          purpose: 'Private quote request record submitted from a provider profile page.',
          keyFields: ['id', 'providerEntityId', 'budgetRange', 'timeline', 'projectSummary', 'status'],
          linksTo: ['Professional', 'Company'],
        },
      ],
      samples: [
        {
          entity: 'Professional',
          example: {
            id: 'professional-alex-mercer',
            slug: 'alex-mercer-technical-seo',
            displayName: 'Alex Mercer',
            specialisms: ['Technical SEO', 'Site migrations'],
            sectorExperience: ['SaaS', 'Finance'],
            availabilityStatus: 'Available in 2 weeks',
          },
        },
        {
          entity: 'Company',
          example: {
            id: 'company-serpforged',
            slug: 'serpforged-b2b-seo-agency',
            brandName: 'SERP Forged',
            specialisms: ['Technical SEO', 'Content strategy'],
            teamSizeLabel: '8-person specialist team',
          },
        },
        {
          entity: 'Lead',
          example: {
            id: 'lead-001',
            providerEntityId: 'professional-alex-mercer',
            budgetRange: 'GBP5k / month',
            timeline: 'Next month',
            status: 'new',
          },
        },
      ],
      routes: [
        { label: 'Home', path: '/', kind: 'public' },
        { label: 'Get Started', path: '/get-started', kind: 'public' },
        { label: 'About', path: '/about', kind: 'public' },
        { label: 'Road Map', path: '/road-map', kind: 'public' },
        { label: 'SEO Professionals', path: '/professionals', kind: 'public' },
        { label: 'Technical SEO', path: '/categories/technical-seo', kind: 'public' },
        { label: 'SEO for SaaS', path: '/seo-for-saas', kind: 'public' },
        { label: 'SEO for eCommerce', path: '/seo-for-ecommerce', kind: 'public' },
        { label: 'Case Studies', path: '/case-studies', kind: 'public' },
        { label: 'Provider Dashboard', path: '/dashboard/professional', kind: 'console' },
      ],
    },
    relationshipMap: `
Professional
  -> SeoCaseStudy
  -> Lead

Company
  -> SeoCaseStudy
  -> Lead

Lead
  -> Professional
  -> Company
`,
    seo: {
      title: 'About Find My SEO',
      description:
        'How Find My SEO organizes public discovery, profile trust, case studies, and lead capture inside FireUX.',
    },
  },
  getStarted: {
    hero: {
      eyebrow: 'Get live fast',
      title: 'Launch a credible SEO hiring surface without heavy platform weight',
      description:
        'Start with public profiles, structured proof, and simple lead capture. Keep the dashboard light until the app earns deeper workflow complexity.',
      primaryAction: {
        label: 'Open directory',
        to: '/professionals',
      },
      secondaryAction: {
        label: 'Review product shape',
        to: '/about',
      },
    },
    snapshotTitle: 'Rollout snapshot',
    snapshotTicks: [
      'Public profile structure defined',
      'Case-study proof shape aligned',
      'Lead capture flow ready for Phase 1',
      'Light dashboard paths prepared for SEO users',
    ],
    stepsHeading: {
      eyebrow: 'Three steps',
      title: 'A practical rollout in three steps',
      description:
        'Publish strong profiles first, add proof second, and make lead handling reliable before expanding scope.',
    },
    steps: [
      {
        badge: 'Step 1',
        title: 'Profile baseline',
        copy: 'Define the public profile shape and make the directory useful before chasing complexity.',
        items: ['Specialisms defined', 'Sector fit captured', 'Availability and pricing guidance set'],
      },
      {
        badge: 'Step 2',
        title: 'Proof system',
        copy: 'Add structured case studies so buyers can compare evidence instead of marketing claims.',
        items: ['Problem-action-result format', 'Metrics and timeframe included', 'Consistent comparison surface'],
      },
      {
        badge: 'Step 3',
        title: 'Lead flow',
        copy: 'Make the enquiry route fast, clear, and easy to manage from a light dashboard.',
        items: ['Budget and timeline captured', 'Goals clarified up front', 'Lead review path ready'],
      },
    ],
    seo: {
      title: 'Get Started · Find My SEO',
      description: 'Set up public SEO profiles, proof, and lean lead capture in Find My SEO.',
    },
  },
  roadmap: {
    title: 'Find My SEO Road Map',
    summary:
      'Find My SEO is moving from public profile discovery and proof-first lead capture toward moderation, trust tooling, and more structured marketplace confidence over time.',
    phases: [
      {
        label: 'Phase 1',
        title: 'Discovery baseline',
        copy: 'Public directory, profile pages, case studies, quote flow, and light profile management.',
      },
      {
        label: 'Phase 2',
        title: 'Trust layer',
        copy: 'Moderated reviews, verification signals, and more structured trust workflows once the MVP loop is working.',
      },
      {
        label: 'Phase 3',
        title: 'Marketplace depth',
        copy: 'Smarter ranking, richer lead handling, and better reputation signals after the core product proves itself.',
      },
    ],
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
  samples: sourceMeta.about.appSpec.samples,
  routes: sourceMeta.about.appSpec.routes,
  relationshipMap: sourceMeta.about.relationshipMap,

  getStarted: sourceMeta.getStarted,

  seoHome: sourceMeta.landing.seo,
  seoAbout: sourceMeta.about.seo,
  seoGetStarted: sourceMeta.getStarted.seo,
  seoBrowse: {
    title: 'Browse SEO professionals · Find My SEO',
    description:
      'Compare curated SEO consultants and agencies by specialism, sector fit, proof, reviews, and availability.',
  },

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
    id: 'find-my-seo-app',
    name: appMeta.name,
    ecosystem: 'fireux',
  },
  copy: {
    big_personality: appMeta.brand.bigPersonality,
    headline: appMeta.brand.headline,
    highlight_terms: [
      'SEO specialist marketplace',
      'sector fit',
      'delivery proof',
      'case studies',
      'discovery',
      'profile trust',
      'better-fit enquiries',
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
      'seo hiring platform',
      'seo consultant directory',
      'seo agency marketplace',
      'seo case studies',
      'find seo specialist',
      'seo lead generation',
    ],
    audience: ['business owners', 'marketing teams', 'seo buyers'],
    categories: [
      'seo marketplace',
      'seo hiring platform',
      'professional directory',
    ],
    primary_topic: 'seo hiring platform',
  },
  cta: {
    primary: {
      label: appMeta.landingPrimaryCtaLabel,
      to: '/professionals',
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
  entities: appMeta.entities.map((entity) => ({
    id: entity.name,
    purpose: entity.purpose,
  })),
  relations_ascii: appMeta.relationshipMap,
  examples: {
    samples: [...appMeta.samples],
  },
  routes: {
    public: publicRoutes,
    console: consoleRoutes,
  },
})
