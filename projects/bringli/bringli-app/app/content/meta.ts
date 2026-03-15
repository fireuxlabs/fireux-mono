import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

const sourceMeta = {
  name: 'Bringli',
  landing: {
    brand: {
      appName: 'bringli',
      bigPersonality: 'Local Producers,',
      headline: 'Delivered',
    },
    heroPrimaryLine:
      'Bringli is the <strong>operating system</strong> for producers and customers. Connect local producers, suppliers, and households in one <strong>simple order and drop flow</strong> powered by <strong>Drop</strong>.',
    primaryCtaLabel: 'Get started',
    secondaryCtaLabel: 'Browse producers',
    secondaryCtaTo: '/suppliers',
    consoleBridgeLine:
      'The operating system for local supply and <strong>delivery execution</strong> from one connected console.',
    heroBullets: [
      'Fresh local producers and suppliers in one directory',
      'Home and business dropoff flows built for reliability',
      'Supplier onboarding and profile management through Drop',
      'Launched in Interlaken with market-by-market expansion',
    ],
    rightPanelItems: [
      {
        title: 'Supplier management',
        description: 'Profiles, readiness, and contact details.',
        icon: 'i-lucide-users',
      },
      {
        title: 'Dropoff readiness',
        description: 'Delivery area and service-level capability.',
        icon: 'i-lucide-package-check',
      },
      {
        title: 'Operational confidence',
        description: 'Tighter first pipe before order expansion.',
        icon: 'i-lucide-shield-check',
      },
    ],
    seo: {
      title: 'Bringli | Local producer delivery',
      description:
        'Bringli is a local delivery marketplace for homes and businesses, starting with supplier operations powered by Drop.',
    },
  },
  about: {
    hero: {
      label: 'About Bringli',
      supportingCopy:
        'We connect local producers and customers in one structured flow for supply readiness, discovery, and delivery execution.',
      primaryAction: {
        label: 'Browse producers',
        to: '/suppliers',
      },
      secondaryAction: {
        label: 'Open rollout',
        to: '/get-started',
      },
    },
    panel: {
      title: 'What this page covers',
      subtitle: '',
      ticks: [
        'How Bringli modules fit together for local supply operations',
        'The core records and how they connect',
        'Small realistic sample objects for context',
        'Direct links to public and console surfaces',
      ],
    },
    sections: {
      keyConceptsTitle: 'Bringli - Key Concepts (Priority Order)',
      modulesEyebrow: 'Modules',
      modulesTitle: 'How we organize the app',
      modulesDescription:
        'Bringli starts simple with supplier, company, and place identity to support local delivery operations.',
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
        description: 'An ecosystem app for local producer supply and delivery operations.',
      },
      {
        title: 'Producers',
        description: 'Producers are represented as supplier records with readiness and coverage details.',
      },
      {
        title: 'Buyers',
        description: 'Bringli serves households and businesses buying from local producers.',
      },
      {
        title: 'Catalog Discovery',
        description: 'Supplier surfaces make local inventory and capabilities discoverable.',
      },
      {
        title: 'Operational Readiness',
        description: 'Producer onboarding focuses on quality, coverage, and delivery discipline.',
      },
      {
        title: 'Drop Execution',
        description: 'Delivery handoff is structured for reliable local fulfillment.',
      },
      {
        title: 'Coverage',
        description: 'Place and area identity records define where supply can be delivered.',
      },
      {
        title: 'Trust',
        description: 'Stable profiles and verified contact surfaces build buyer confidence.',
      },
      {
        title: 'Network Growth',
        description: 'More producers and buyers strengthen the local marketplace system.',
      },
      {
        title: 'Console',
        description: 'One console anchors operational control as Bringli scales market-by-market.',
      },
    ],
    appSpec: {
      name: 'Bringli',
      tagline: 'Operating System for Local Producer Delivery',
      description:
        'Bringli is the operating system for local producer and customer supply flow. We coordinate supplier readiness, local discovery, and delivery execution from one structured system.',
      modules: [
        {
          name: 'fireux-suppliers',
          summary: 'Supplier profile records used as producer identity and readiness surfaces.',
          entities: ['Supplier'],
        },
        {
          name: 'fireux-companies',
          summary: 'Company identity records for producer organizations.',
          entities: ['Company'],
        },
        {
          name: 'fireux-places',
          summary: 'Canonical place identity used for coverage and location discovery.',
          entities: ['Place'],
        },
        {
          name: 'fireux-core users',
          summary: 'Cross-app user identity for operators and producer owners.',
          entities: ['User'],
        },
      ],
      entities: [
        {
          name: 'Supplier',
          purpose: 'Producer profile record with categories, delivery areas, and readiness details.',
          keyFields: [
            'id',
            'supplier_headline',
            'supplier_product_categories',
            'supplier_delivery_areas',
          ],
          linksTo: ['Company', 'Place', 'User'],
        },
        {
          name: 'Company',
          purpose: 'Organization identity record for producer businesses.',
          keyFields: ['id', 'name', 'short_name', 'place_id'],
          linksTo: ['Place', 'Supplier'],
        },
        {
          name: 'Place',
          purpose: 'Canonical location record for producer presence and delivery area context.',
          keyFields: ['id', 'name', 'formatted_address', 'lat', 'lng'],
          linksTo: ['Company', 'Supplier'],
        },
        {
          name: 'User',
          purpose: 'Cross-app member identity for producer owners and operators.',
          keyFields: ['id', 'display_name', 'profiles', 'userOf', 'adminOf'],
          linksTo: ['Supplier', 'Company'],
        },
      ],
      samples: [
        {
          entity: 'Supplier',
          example: {
            id: 'supplier_demo_alpine_farm',
            supplier_headline: 'Alpine Farm Produce (Demo)',
            supplier_product_categories: ['vegetables', 'dairy'],
            supplier_delivery_areas: ['Interlaken', 'Matten'],
          },
        },
        {
          entity: 'Company',
          example: {
            id: 'company_demo_alpine_farm',
            name: 'Alpine Farm Co.',
            short_name: 'Alpine Farm',
            place_id: 'place_demo_interlaken_market',
          },
        },
        {
          entity: 'Place',
          example: {
            id: 'place_demo_interlaken_market',
            name: 'Interlaken Market Zone',
            formatted_address: 'Interlaken, Switzerland',
            lat: 46.6863,
            lng: 7.8632,
          },
        },
        {
          entity: 'User',
          example: {
            id: 'user_demo_producer_01',
            display_name: 'Demo Producer Operator',
            handle: 'demo-producer-ops',
            userOf: ['bringli-app'],
          },
        },
      ],
      routes: [
        { label: 'Home', path: '/', kind: 'public' },
        { label: 'Get Started', path: '/get-started', kind: 'public' },
        { label: 'About', path: '/about', kind: 'public' },
        { label: 'Suppliers', path: '/suppliers', kind: 'public' },
        { label: 'Console Entry', path: '/console', kind: 'console' },
      ],
    },
    relationshipMap: `
Place
  -> Company
       -> Supplier

User
  -> Supplier
  -> Company
`,
    seo: {
      title: 'About Bringli',
      description:
        'How Bringli organizes local producer records, delivery readiness, and public supply routes.',
    },
  },
  getStarted: {
    hero: {
      eyebrow: 'Get live fast',
      title: 'Activate local supply and delivery operations',
      description:
        'Bringli helps you run producer onboarding, supplier readiness, and delivery execution in one flow before expanding into broader marketplace operations.',
      primaryAction: {
        label: 'Open suppliers',
        to: '/suppliers',
      },
      secondaryAction: {
        label: 'Review rollout',
        to: '/get-started',
      },
    },
    snapshotTitle: 'Rollout snapshot',
    snapshotTicks: [
      'Supplier profiles and readiness criteria configured',
      'Coverage and drop logic aligned for launch zone',
      'Operational checks active for reliable handoff',
      'Expansion template prepared for next market',
    ],
    stepsHeading: {
      eyebrow: 'Three steps',
      title: 'A practical rollout in three steps',
      description:
        'Build supplier quality first, operationalize delivery next, then scale market-by-market.',
    },
    steps: [
      {
        badge: 'Step 1',
        title: 'Supplier baseline',
        copy: 'Define supplier quality, profile requirements, and readiness signals before go-live.',
        items: ['Supplier criteria mapped', 'Profile standards aligned', 'Readiness logic set'],
      },
      {
        badge: 'Step 2',
        title: 'Delivery activation',
        copy: 'Operationalize coverage and handoff rules for predictable drop execution.',
        items: ['Coverage boundaries set', 'Drop flow validated', 'Operational checks enabled'],
      },
      {
        badge: 'Step 3',
        title: 'Market expansion',
        copy: 'Replicate the launch model into new zones with minimal operational drift.',
        items: ['Launch model documented', 'Expansion checklist ready', 'Scale cadence defined'],
      },
    ],
    seo: {
      title: 'Get Started · Bringli',
      description: 'Set up supplier operations and delivery readiness in Bringli.',
    },
  },
  roadmap: {
    title: 'Bringli Road Map',
    summary:
      'Bringli is evolving from supplier readiness baseline into deeper demand, order orchestration, and local fulfillment operations.',
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
    id: 'bringli',
    name: appMeta.name,
    ecosystem: 'bringli',
  },
  copy: {
    big_personality: appMeta.brand.bigPersonality,
    headline: appMeta.brand.headline,
    positioning_html: appMeta.heroPrimaryHtml,
    promise_html: appMeta.aboutSupportingCopy,
    console_bridge_html: appMeta.consoleBridgeHtml,
    about_p1: appMeta.description,
    about_p2: appMeta.aboutSupportingCopy,
    seo_title: appMeta.seoHome.title,
    seo_description: appMeta.seoHome.description,
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
