import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

const sourceMeta = {
  name: 'FireUX',
  landing: {
    brand: {
      appName: 'fireux',
      bigPersonality: 'Ignite With',
      headline: 'Powerful Applications',
    },
    heroPrimaryLine:
      'FireUX is the <strong>console architecture</strong> for builders and operators. A low-code ecosystem for <strong>responsive</strong>, <strong>scalable</strong>, and <strong>data-driven</strong> applications built upon <strong>Nuxt 4</strong> and <strong>Firebase</strong>.',
    primaryCtaLabel: 'Get started',
    secondaryCtaLabel: 'Browse apps',
    secondaryCtaTo: '/apps',
    consoleBridgeLine:
      'The operating system for building and running domain applications from one shared, <strong>extensible core</strong>.',
    heroBullets: [
      'Nuxt 4 + Firebase orchestration out of the box',
      'Reusable design system and shared components',
      'Tenant-aware and white-label runtime',
      'Automations, PWA, and CI presets',
    ],
    rightPanelItems: [
      {
        title: 'Choose',
        description: 'Use an existing app or start a focused new one.',
        icon: 'i-lucide-layout-grid',
      },
      {
        title: 'Launch',
        description: 'We configure the brand, users, workflow, and hosting.',
        icon: 'i-lucide-rocket',
      },
      {
        title: 'Run',
        description: 'Manage the app, team access, and future changes.',
        icon: 'i-lucide-gauge',
      },
    ],
    seo: {
      title: 'FireUX — Powerful Applications',
      description:
        'Build, launch, and run branded applications with FireUX.',
    },
  },
  about: {
    hero: {
      label: 'About FireUX',
      supportingCopy:
        'We run ecosystem apps from one platform surface, so teams can ship faster, keep architecture aligned, and scale modules without fragmenting the system.',
      primaryAction: {
        label: 'Open apps',
        to: '/apps',
      },
      secondaryAction: {
        label: 'Browse modules',
        to: '/modules',
      },
    },
    panel: {
      title: 'What this page covers',
      subtitle: '',
      ticks: [
        'How platform modules fit together across apps',
        'The key platform records and their relationships',
        'Small realistic sample objects for context',
        'Direct links to public and console surfaces',
      ],
    },
    sections: {
      keyConceptsTitle: 'FireUX - Key Concepts (Priority Order)',
      modulesEyebrow: 'Modules',
      modulesTitle: 'How we organize the app',
      modulesDescription:
        'Each module owns a clear platform responsibility and together they run one operating core.',
      entitiesEyebrow: 'Entities',
      entitiesTitle: 'The records we work with every day',
      structureEyebrow: 'Structure',
      structureTitle: 'Relationship map',
      examplesEyebrow: 'Examples',
      examplesTitle: 'Sample objects',
      routesTitle: 'Key routes',
    },
    keyConcepts: [
      {
        title: 'Ecosystem',
        description: 'FireUX is the platform ecosystem that hosts domain apps and shared contracts.',
      },
      {
        title: 'Apps',
        description: 'Apps are product surfaces built from shared modules and runtime contracts.',
      },
      {
        title: 'Modules',
        description: 'Modules package domain capability so apps can compose features without rewrites.',
      },
      {
        title: 'Users',
        description: 'One user identity can move across multiple apps inside the ecosystem.',
      },
      {
        title: 'Runtime Modes',
        description: 'Live, test, and demo modes keep operations predictable across environments.',
      },
      {
        title: 'Console Pattern',
        description: 'Console entry follows one consistent runtime-driven pattern across apps.',
      },
      {
        title: 'Registry',
        description: 'App and module registry records keep ownership and wiring transparent.',
      },
      {
        title: 'Public Surfaces',
        description: 'Public routes describe what is available today without exposing private operations.',
      },
      {
        title: 'Service Surfaces',
        description: 'Service apps like Stitch run on the same platform contracts and identity model.',
      },
      {
        title: 'Extensibility',
        description: 'New ecosystems can launch quickly without rebuilding platform fundamentals.',
      },
    ],
    appSpec: {
      name: 'FireUX',
      tagline: 'Platform Operating System for Ecosystem Apps',
      description:
        'FireUX is the operating system for builders and operators. We run app discovery, module composition, and ecosystem operations from one structured platform.',
      modules: [
        {
          name: 'fireux-core',
          summary: 'Runtime contracts, identity surfaces, and shared cross-app behaviors.',
          entities: ['App', 'User'],
        },
        {
          name: 'Registry surfaces',
          summary: 'Ecosystem and module index records for platform discoverability and governance.',
          entities: ['Ecosystem registry doc', 'Module registry doc'],
        },
        {
          name: 'Catalog surfaces',
          summary: 'Public-facing catalog content used by platform pages.',
          entities: ['Product', 'BlogPost'],
        },
        {
          name: 'Stitch app surface',
          summary: 'Provider and request records for service matching flows.',
          entities: ['StitchProvider', 'StitchRequest'],
        },
      ],
      entities: [
        {
          name: 'App',
          purpose: 'Canonical app identity and metadata for platform routing and discovery.',
          keyFields: ['id', 'app_name', 'ecosystem', 'role', 'modules'],
          linksTo: ['User', 'Ecosystem registry doc', 'Module registry doc'],
        },
        {
          name: 'User',
          purpose: 'Cross-app member identity with memberships and profile flags.',
          keyFields: ['id', 'display_name', 'handle', 'userOf', 'adminOf'],
          linksTo: ['App', 'StitchProvider', 'StitchRequest'],
        },
        {
          name: 'Ecosystem directory entry',
          purpose: 'Safe public projection of an owning Ecosystem record.',
          keyFields: ['id', 'name', 'slug', 'status', 'app_count'],
          linksTo: ['App', 'Module registry doc'],
        },
        {
          name: 'Module registry doc',
          purpose: 'Registry index describing module ownership and availability.',
          keyFields: ['id', 'name', 'team', 'status'],
          linksTo: ['App', 'Ecosystem registry doc'],
        },
        {
          name: 'StitchProvider',
          purpose: 'Service provider profile record for capabilities and availability.',
          keyFields: ['id', 'display_name', 'type', 'availability', 'tags'],
          linksTo: ['User', 'StitchRequest'],
        },
        {
          name: 'StitchRequest',
          purpose: 'Service request record posted for matching and delivery planning.',
          keyFields: ['id', 'title', 'status', 'budget_type', 'tags'],
          linksTo: ['User', 'StitchProvider'],
        },
      ],
      samples: [
        {
          entity: 'App',
          example: {
            id: 'granite-app',
            app_name: 'Granite',
            ecosystem: 'granite',
            role: 'global',
            modules: ['fireux-properties', 'fireux-compliance'],
          },
        },
        {
          entity: 'Ecosystem directory entry',
          example: {
            id: 'granite',
            name: 'Granite',
            slug: 'granite',
            status: 'active',
            app_count: 1,
          },
        },
        {
          entity: 'StitchProvider',
          example: {
            id: 'sp_demo_blueoak',
            display_name: 'Blue Oak Studio (Demo)',
            type: 'agency',
            availability: 'available',
            tags: ['nuxt', 'firebase', 'design-system'],
          },
        },
        {
          entity: 'StitchRequest',
          example: {
            id: 'sr_demo_console_alignment',
            title: 'Align multi-app console navigation',
            status: 'open',
            budget_type: 'retainer',
            tags: ['platform', 'ux', 'architecture'],
          },
        },
      ],
      routes: [
        { label: 'Home', path: '/', kind: 'public' },
        { label: 'Get Started', path: '/get-started', kind: 'public' },
        { label: 'Apps', path: '/apps', kind: 'public' },
        { label: 'Modules', path: '/modules', kind: 'public' },
        { label: 'Ecosystems', path: '/ecosystems', kind: 'public' },
        { label: 'Console Entry', path: '/console', kind: 'console' },
        { label: 'Project Console', path: '/console/project', kind: 'console' },
        { label: 'Project Ecosystem', path: '/console/project/ecosystem', kind: 'console' },
        { label: 'Project Apps', path: '/console/project/apps', kind: 'console' },
      ],
    },
    relationshipMap: `
Project (FireUX control plane)
  <- Ecosystem.project_id
  <- App.project_id

Ecosystem
  <- App.ecosystem_id
Module registry doc
  -> App

User
  -> App (membership/admin)
  -> StitchRequest

StitchRequest
  <-> StitchProvider
`,
    seo: {
      title: 'About FireUX',
      description:
        'How FireUX organizes apps, modules, registry records, and service surfaces from one platform core.',
    },
  },
  getStarted: {
    eyebrow: 'FireUX App',
    title: 'Ignition',
    description: 'We configure and launch a FireUX app for your business.',
    setupPrice: '$150',
    monthlyPrice: '$15/month',
    included: [
      'Your branding',
      'Web app and installable PWA',
      'User accounts',
      'Operator console',
      'Hosting and deployment',
      'One job for the app to do',
    ],
    requirements: [
      'Business name, logo, and colours',
      'What the app needs to do',
      'Who needs access',
    ],
    action: {
      label: 'Start Ignition',
      to: 'mailto:fire@fireux.app?subject=FireUX%20App%20Ignition',
    },
    seo: {
      title: 'FireUX App Ignition',
      description: 'FireUX App Ignition costs $150 setup and $15 per month.',
    },
  },
  roadmap: {
    title: 'FireUX Road Map',
    summary:
      'FireUX is evolving from platform baseline into deeper cross-ecosystem operations, registry governance, and service marketplaces.',
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
    id: 'fireux',
    name: appMeta.name,
    ecosystem: 'fireux',
  },
  copy: {
    big_personality: appMeta.brand.bigPersonality,
    headline: appMeta.brand.headline,
    highlight_terms: [
      'focused business apps',
      'Misebox',
      'Cleanbox',
      'connected FireUX account',
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
      'FireUX business app',
      'branded business app',
      'managed web app',
      'hospitality app',
      'cleaning business app',
      'small business software',
    ],
    audience: ['small businesses', 'operators', 'founders', 'partners'],
    categories: [
      'business apps',
      'managed software',
      'industry platforms',
    ],
    primary_topic: 'managed business applications',
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
      slug: 'fireux-app',
      title: 'FireUX App',
      description: 'A hosted and maintained website plus app surface we run for you.',
      icon: 'i-lucide-panel-top',
    },
    {
      slug: 'fireux-template',
      title: 'FireUX Template',
      description: 'A neutral FireUX starter app you can buy once and run yourself.',
      icon: 'i-lucide-layout-template',
    },
    {
      slug: 'launch-ecosystem',
      title: 'Launch an ecosystem',
      description: 'Shape a parent app with shared identity, products, blogs, admin tools, and tenant-ready surfaces.',
      icon: 'i-lucide-network',
    },
    {
      slug: 'launch-tenant-app',
      title: 'Launch a tenant app',
      description: 'Create a focused child app inside an ecosystem with its own brand, pages, and product path.',
      icon: 'i-lucide-panel-top',
    },
    {
      slug: 'app-products-and-blog',
      title: 'Add products and blog',
      description: 'Use the baseline commercial and content surfaces every FireUX app can rely on.',
      icon: 'i-lucide-shopping-bag',
    },
  ],
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
