// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: remove stale entity samples from product metadata.
// Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: register the cleaning search-intent solution.
// Concurrent edit — 2026-07-21 12:08 CEST — Shared solutions catalogue: compose FireUX, Misebox, and Werkbox entries.
// Concurrent edit — 2026-07-21 12:20 CEST — FireUX SEO solutions: add seven distinct customer-intent pages.
// Concurrent edit — 2026-07-21 12:44 CEST — Operations catalogue: declare FireUX route-backed capabilities.
// Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: update the FireUX product highlight vocabulary.
// Concurrent edit — 2026-07-21 13:16 CEST — FireUX project positioning: publish Project Operations with working public and Console homes.
// Concurrent edit — 2026-07-22 12:49 CEST — Ignition delivery pass: publish the request-to-launch operation and its Console route.
// Concurrent edit — 2026-07-22 13:03 CEST — Origin-aware Ignition pipelines: retain FireUX solution intent through intake.
import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'
import { fireuxMiseboxSolutions } from 'fireux-misebox/runtime/content/solutions'

const fireuxOwner = {
  id: 'fireux',
  name: 'FireUX',
  to: '/',
} as const

const werkboxOwner = {
  id: 'werkbox',
  name: 'Werkbox',
  to: '/ecosystems/werkbox',
} as const

const ignitionFromSolution = (slug: string) =>
  `/get-started?solution=${slug}`

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
        title: 'Directory + Package Metadata',
        description: 'Public entity projections and tracked package manifests have separate authority.',
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
          name: 'Directory and package metadata surfaces',
          summary: 'Public entity projections stay separate from source-controlled package manifests.',
          entities: ['App directory entry', 'Ecosystem directory entry', 'Module package manifest'],
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
          name: 'App directory entry',
          purpose: 'Safe directory projection of canonical owning App identity.',
          keyFields: ['id', 'app_name', 'ecosystem_id', 'slug', 'status'],
          linksTo: ['User', 'Ecosystem directory entry'],
        },
        {
          name: 'User',
          purpose: 'Public root identity with app and profile relationship indexes.',
          keyFields: ['id', 'display_name', 'handle', 'app_ids', 'profiles'],
          linksTo: ['App', 'StitchProvider', 'StitchRequest'],
        },
        {
          name: 'Ecosystem directory entry',
          purpose: 'Safe public projection of an owning Ecosystem record.',
          keyFields: ['id', 'name', 'slug', 'status', 'app_count'],
          linksTo: ['App directory entry'],
        },
        {
          name: 'Module package manifest',
          purpose: 'Source-controlled package metadata; not an entity or public directory row.',
          keyFields: ['type', 'id', 'name', 'team'],
          linksTo: [],
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
      routes: [
        { label: 'Home', path: '/', kind: 'public' },
        { label: 'Get Started', path: '/get-started', kind: 'public' },
        { label: 'Operations', path: '/operations', kind: 'public' },
        { label: 'Apps', path: '/apps', kind: 'public' },
        { label: 'Modules', path: '/modules', kind: 'public' },
        { label: 'Ecosystems', path: '/ecosystems', kind: 'public' },
        { label: 'Console Entry', path: '/console', kind: 'console' },
        { label: 'Project Console', path: '/console/project', kind: 'console' },
        { label: 'Project Ignition', path: '/console/project/ignitions', kind: 'console' },
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
Module package manifest
  -> package/runtime wiring only

User
  -> App (membership/admin)
  -> StitchRequest

StitchRequest
  <-> StitchProvider
`,
    seo: {
      title: 'About FireUX',
      description:
        'How FireUX separates entity directories, package metadata, and service surfaces in one platform core.',
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
      label: 'Email instead',
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
      'FireUX is evolving from platform baseline into deeper cross-ecosystem operations, directory publication, and service marketplaces.',
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
      'Werkbox',
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
  operations: [
    {
      id: 'project.ignition',
      slug: 'ignition',
      title: 'Ignition',
      description: 'Manage new app requests from intake to launch.',
      to: '/console/project/ignitions',
      console: {
        id: 'project',
        name: 'Project console',
        to: '/console/project',
      },
      icon: 'i-lucide-rocket',
    },
    {
      id: 'project.apps',
      slug: 'apps',
      title: 'Apps',
      description: "Manage your project's apps.",
      to: '/console/project/apps',
      console: {
        id: 'project',
        name: 'Project console',
        to: '/console/project',
      },
      icon: 'i-lucide-app-window',
    },
    {
      id: 'project.ecosystem',
      slug: 'ecosystem',
      title: 'Ecosystem',
      description: "Manage your project's ecosystem.",
      to: '/console/project/ecosystem',
      console: {
        id: 'project',
        name: 'Project console',
        to: '/console/project',
      },
      icon: 'i-lucide-orbit',
    },
    {
      id: 'project.users',
      slug: 'users',
      title: 'Users',
      description: 'Manage your users.',
      to: '/console/project/users',
      console: {
        id: 'project',
        name: 'Project console',
        to: '/console/project',
      },
      icon: 'i-lucide-users',
    },
  ],
  solutions: [
    {
      slug: 'fireux-project-overview',
      title: 'FireUX project overview',
      description: 'See a FireUX project, its ecosystem, and its connected apps in one console.',
      icon: 'i-lucide-panels-top-left',
      status: 'live',
      owner: fireuxOwner,
      body: 'The Project Console brings the existing parts of a FireUX ecosystem project together. Select a project, review its identity, then see the ecosystem and apps connected to it.',
      steps: [
        'Select an existing FireUX project.',
        'Review its name, description, and image.',
        'See its connected ecosystem and apps.',
      ],
      cta: {
        label: 'Open Project Console',
        to: '/console/project',
        icon: 'i-lucide-arrow-right',
      },
      keywords: [
        'FireUX project management',
        'FireUX ecosystem project',
        'manage FireUX apps',
      ],
    },
    {
      slug: 'app-for-small-business',
      title: 'App for small business',
      description: 'A branded website and installable app for a small business, with hosting and maintenance included.',
      icon: 'i-lucide-store',
      status: 'live',
      owner: fireuxOwner,
      featured: true,
      body: 'Put your public website, customer entry points, team access, and day-to-day tools in one branded app. Start with the work your business needs now and add more only when it earns its place.',
      steps: [
        'Tell us what the business does and what the app must handle first.',
        'We configure the brand, pages, accounts, console, and hosting.',
        'Launch the first useful version and improve it from real use.',
      ],
      cta: {
        label: 'Start an app',
        to: ignitionFromSolution('app-for-small-business'),
        icon: 'i-lucide-arrow-right',
      },
      keywords: ['app for small business', 'small business app', 'business app development'],
    },
    {
      slug: 'customer-portal',
      title: 'Customer portal',
      description: 'Give customers one secure place to sign in, make requests, and follow what is happening.',
      icon: 'i-lucide-circle-user-round',
      status: 'live',
      owner: fireuxOwner,
      featured: true,
      body: 'Replace scattered email threads and repeated status questions with a branded customer area. Choose what customers can submit, see, and update while your team manages the work from its console.',
      steps: [
        'Choose what customers need to request or view.',
        'Set customer and team access separately.',
        'Launch the portal under your business brand.',
      ],
      cta: {
        label: 'Discuss a customer portal',
        to: ignitionFromSolution('customer-portal'),
        icon: 'i-lucide-arrow-right',
      },
      keywords: ['customer portal', 'client portal for small business', 'branded customer portal'],
    },
    {
      slug: 'employee-portal',
      title: 'Employee portal',
      description: 'A private app where employees can access the information and tools needed for their work.',
      icon: 'i-lucide-users-round',
      status: 'live',
      owner: fireuxOwner,
      featured: true,
      body: 'Give employees a clear starting point for shared information, work updates, forms, and role-based tools. Each person signs in and sees the parts of the app their role needs.',
      steps: [
        'List the information and actions employees need most often.',
        'Set roles and access for staff and managers.',
        'Launch one reliable home for the team.',
      ],
      cta: {
        label: 'Discuss an employee portal',
        to: ignitionFromSolution('employee-portal'),
        icon: 'i-lucide-arrow-right',
      },
      keywords: ['employee portal', 'staff portal app', 'employee self service portal'],
    },
    {
      slug: 'internal-business-app',
      title: 'Internal business app',
      description: 'Move a recurring business workflow out of spreadsheets, messages, and disconnected tools.',
      icon: 'i-lucide-workflow',
      status: 'live',
      owner: fireuxOwner,
      featured: true,
      body: 'Choose one workflow that repeatedly costs the team time or causes mistakes. FireUX turns it into a focused internal app with shared records, controlled access, and an operator console.',
      steps: [
        'Pick one repeated workflow with a clear owner.',
        'Define the records, decisions, and people involved.',
        'Run the workflow in one app and extend it when proven.',
      ],
      cta: {
        label: 'Show us the workflow',
        to: ignitionFromSolution('internal-business-app'),
        icon: 'i-lucide-arrow-right',
      },
      keywords: ['internal business app', 'internal workflow app', 'replace spreadsheets with app'],
    },
    {
      slug: 'business-directory-app',
      title: 'Business directory app',
      description: 'Publish searchable profiles for businesses, professionals, places, or services.',
      icon: 'i-lucide-list-filter',
      status: 'live',
      owner: fireuxOwner,
      body: 'Create a public directory around a useful group of businesses, people, places, or services. Providers manage structured profiles while visitors browse the information that matters.',
      steps: [
        'Define who belongs in the directory and what their profiles show.',
        'Add submission, review, and publication rules.',
        'Launch searchable public profiles under one brand.',
      ],
      cta: {
        label: 'Discuss a directory',
        to: ignitionFromSolution('business-directory-app'),
        icon: 'i-lucide-arrow-right',
      },
      keywords: ['business directory app', 'online directory software', 'professional directory app'],
    },
    {
      slug: 'marketplace-app',
      title: 'Marketplace app',
      description: 'Connect people offering work, services, products, or capacity with people who need them.',
      icon: 'i-lucide-handshake',
      status: 'live',
      owner: fireuxOwner,
      body: 'Start with the smallest useful exchange: who offers what, who needs it, and how they make contact. FireUX can combine profiles, listings, accounts, and operator controls without pretending every marketplace needs the same workflow.',
      steps: [
        'Define the two sides of the marketplace.',
        'Choose the profiles, listings, and contact path required at launch.',
        'Add matching, payments, or managed operations only when needed.',
      ],
      cta: {
        label: 'Discuss a marketplace',
        to: ignitionFromSolution('marketplace-app'),
        icon: 'i-lucide-arrow-right',
      },
      keywords: ['marketplace app', 'service marketplace app', 'build an online marketplace'],
    },
    {
      slug: 'branded-web-app',
      title: 'Branded web app',
      description: 'A fast, installable web app using your name, colours, content, and domain.',
      icon: 'i-lucide-panels-top-left',
      status: 'live',
      owner: fireuxOwner,
      body: 'Launch a web app that feels like your business rather than a generic software account. It works in the browser, can be installed on a phone, and stays connected to the FireUX platform for hosting and maintenance.',
      steps: [
        'Bring your business name, logo, colours, and domain.',
        'Choose the public pages and signed-in tools needed for launch.',
        'We configure, deploy, host, and maintain the app.',
      ],
      cta: {
        label: 'Start a branded app',
        to: ignitionFromSolution('branded-web-app'),
        icon: 'i-lucide-arrow-right',
      },
      keywords: ['branded web app', 'custom branded app', 'installable business web app'],
    },
    {
      slug: 'cleaning',
      title: 'App for a cleaning business',
      description: 'Start on Werkbox, run cleaning work, and move to your own app only when you need it.',
      icon: 'i-lucide-sparkles',
      status: 'coming-soon',
      owner: werkboxOwner,
      body: 'Werkbox is the conservative starting point: use the shared app first, then move to a dedicated branded app when the business has proved the need.',
      relatedApp: {
        name: 'Werkbox cleaning',
        to: '/ecosystems/werkbox/cleaning',
        description: 'See the shared cleaning offer, capacity network, and upgrade path inside Werkbox.',
      },
      cta: {
        label: 'See Werkbox cleaning',
        to: '/ecosystems/werkbox/cleaning',
        icon: 'i-lucide-arrow-right',
      },
      keywords: [
        'app for cleaning business',
        'cleaning job management app',
        'find temporary cleaners',
        'cleaning business software',
      ],
    },
    {
      slug: 'fireux-app',
      title: 'FireUX App',
      description: 'A hosted and maintained website plus app surface we run for you.',
      icon: 'i-lucide-panel-top',
      owner: fireuxOwner,
    },
    {
      slug: 'fireux-template',
      title: 'FireUX Template',
      description: 'A neutral FireUX starter app you can buy once and run yourself.',
      icon: 'i-lucide-layout-template',
      owner: fireuxOwner,
    },
    {
      slug: 'launch-ecosystem',
      title: 'Launch an ecosystem',
      description: 'Shape a parent app with shared identity, products, blogs, admin tools, and tenant-ready surfaces.',
      icon: 'i-lucide-network',
      owner: fireuxOwner,
    },
    {
      slug: 'launch-tenant-app',
      title: 'Launch a tenant app',
      description: 'Create a focused child app inside an ecosystem with its own brand, pages, and product path.',
      icon: 'i-lucide-panel-top',
      owner: fireuxOwner,
    },
    {
      slug: 'app-products-and-blog',
      title: 'Add products and blog',
      description: 'Use the baseline commercial and content surfaces every FireUX app can rely on.',
      icon: 'i-lucide-shopping-bag',
      owner: fireuxOwner,
    },
    ...fireuxMiseboxSolutions,
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
