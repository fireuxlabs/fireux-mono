import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

const sourceMeta = {
  name: 'Misebox',
  landing: {
    brand: {
      appName: 'misebox',
      bigPersonality: 'Command <br> the Line',
      headline: 'Operating System for Kitchens',
    },
    heroPrimaryLine:
      "Misebox is the <strong>operating system</strong> for <a href='/kitchens'><strong>kitchens</strong></a> and <a href='/professionals'><strong>professionals</strong></a>.<br>Run your kitchen with connected <strong>ops</strong>, <strong>team</strong>, and <strong>service</strong>.<br>Publish <a href='/jobs'><strong>roles</strong></a> and connect with professionals across the <strong>Misebox ecosystem</strong>.",
    primaryCtaLabel: 'Get started',
    secondaryCtaLabel: 'Browse professionals',
    secondaryCtaTo: '/professionals',
    consoleBridgeLine:
      'One <strong>connected console</strong> to run service, grow your team, and keep execution tight.',
    heroBullets: [
      'Post jobs and preview candidates',
      'Professional profiles instead of CVs',
      'Kitchen pages that attract the right people',
      'Contact candidates directly',
    ],
    rightPanelItems: [
      {
        title: 'Job posts',
        description: 'Publish fixed or temporary roles.',
        icon: 'i-lucide-briefcase',
      },
      {
        title: 'Professional profiles',
        description: 'Showcase your experience or browse the professional database.',
        icon: 'i-lucide-user',
      },
      {
        title: 'Kitchen profiles',
        description: 'Showcase your kitchen, menu, and culture.',
        icon: 'i-lucide-chef-hat',
      },
    ],
    seo: {
      title: 'Misebox — Kitchen operations workspace',
      description:
        'Run your kitchen from one platform - managing menus, recipes, dishes, prep tasks, team coordination, and recruitment.',
    },
  },
  about: {
    hero: {
      label: 'About Misebox',
      supportingCopy:
        'We run menus, recipes, dishes, prep tasks, team coordination, and hiring in one operating flow so service teams can move faster with less friction.',
      primaryAction: {
        label: 'Open kitchens',
        to: '/kitchens',
      },
      secondaryAction: {
        label: 'Publish roles',
        to: '/jobs',
      },
    },
    panel: {
      title: 'What this page covers',
      subtitle: '',
      ticks: [
        'How the core Misebox modules fit together',
        'The key entities and how they connect',
        'Small realistic sample objects for context',
        'Quick links to public and console routes',
      ],
    },
    sections: {
      keyConceptsTitle: 'Misebox - Key Concepts (Priority Order)',
      modulesEyebrow: 'Modules',
      modulesTitle: 'How we organize the app',
      modulesDescription:
        'Each module owns a clear part of operations, and together they power one kitchen workflow.',
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
        description: 'An ecosystem of apps for kitchen operations and recruitment.',
      },
      {
        title: 'Kitchen Operations',
        description: 'The systems kitchens use to organise menus, prep, service, and team.',
      },
      {
        title: 'Kitchens',
        description: 'Each kitchen has its own workspace to run operations and organise its team.',
      },
      {
        title: 'Professionals',
        description: 'Hospitality professionals create profiles that showcase experience instead of CVs.',
      },
      {
        title: 'Jobs',
        description: 'Kitchens publish roles and connect directly with professionals.',
      },
      {
        title: 'Menus & Dishes',
        description: 'Menus, dishes, and recipes live in one structured system.',
      },
      {
        title: 'Prep & Service',
        description: 'Prep tasks and service coordination keep the kitchen organised.',
      },
      {
        title: 'Team',
        description: 'Kitchens organise and manage the people running service.',
      },
      {
        title: 'Suppliers',
        description: 'Suppliers connect kitchens with the ingredients and products they need.',
      },
      {
        title: 'Apps',
        description: 'Specialised apps extend the Misebox ecosystem over time.',
      },
    ],
    appSpec: {
      name: 'Misebox',
      tagline: 'Operating System for Kitchen Teams',
      description:
        'We run kitchen operations and hiring from one platform, with one consistent flow from prep to service and staffing.',
      modules: [
        {
          name: 'fireux-kitchens',
          summary: 'Kitchen operations module for day-to-day execution.',
          entities: [
            'Kitchen',
            'Menu',
            'Dish',
            'Ingredient',
            'KitchenRecipe',
            'KitchenMiseTask',
            'KitchenTeamMember',
          ],
        },
        {
          name: 'fireux-orders',
          summary: 'Order flow model for customer and service orders.',
          entities: ['Order'],
        },
        {
          name: 'fireux-jobs',
          summary: 'Hiring and profile module for talent matching.',
          entities: ['Job', 'Professional', 'Agent'],
        },
        {
          name: 'fireux-suppliers',
          summary: 'Supplier profile module for sourcing and catalog coordination.',
          entities: ['Supplier', 'Company'],
        },
        {
          name: 'fireux-places',
          summary: 'Location identity used across kitchens and companies.',
          entities: ['Place'],
        },
        {
          name: 'Chef profile',
          summary: 'Kitchen-side professional profile used in Misebox operations.',
          entities: ['Chef'],
        },
      ],
      entities: [
        {
          name: 'Place',
          purpose: 'Canonical location identity used by multiple domain records.',
          keyFields: ['id', 'name', 'formatted_address', 'lat', 'lng'],
          linksTo: ['Kitchen', 'Company'],
        },
        {
          name: 'Kitchen',
          purpose: 'Operational kitchen identity and runtime context.',
          keyFields: ['id', 'name', 'short_address', 'image_url', 'is_test_kitchen'],
          linksTo: [
            'Menu',
            'Dish',
            'Ingredient',
            'KitchenRecipe',
            'KitchenMiseTask',
            'KitchenTeamMember',
            'Order',
            'Job',
          ],
        },
        {
          name: 'Menu',
          purpose: 'Service-ready menu with sections and sellable items.',
          keyFields: ['id', 'kitchen_id', 'name', 'sections', 'active'],
          linksTo: ['Dish'],
        },
        {
          name: 'Dish',
          purpose: 'Individual food item with recipe and ingredient links.',
          keyFields: ['id', 'kitchen_id', 'name', 'ingredient_ids', 'recipe_ids'],
          linksTo: ['Ingredient', 'KitchenRecipe'],
        },
        {
          name: 'Ingredient',
          purpose: 'Stock and costing ingredient identity for dishes and purchasing.',
          keyFields: ['id', 'name', 'default_unit', 'allergens', 'active'],
          linksTo: ['Dish', 'KitchenRecipe', 'Supplier'],
        },
        {
          name: 'KitchenRecipe',
          purpose: 'Standardized prep/cook instructions for consistent output.',
          keyFields: ['id', 'name', 'yield_qty', 'ingredient_lines', 'steps'],
          linksTo: ['Dish', 'Ingredient'],
        },
        {
          name: 'KitchenMiseTask',
          purpose: 'Prep and service task tracking for kitchen operations.',
          keyFields: ['id', 'kitchen_id', 'title', 'station', 'status'],
          linksTo: ['KitchenTeamMember', 'Menu', 'KitchenRecipe'],
        },
        {
          name: 'KitchenTeamMember',
          purpose: 'Team assignment record for stations, roles, and capability tags.',
          keyFields: ['id', 'kitchen_id', 'name', 'role', 'station'],
          linksTo: ['KitchenMiseTask'],
        },
        {
          name: 'Order',
          purpose: 'Customer/service order with scope, lines, totals, and status.',
          keyFields: ['id', 'scope_type', 'scope_id', 'status', 'totals'],
          linksTo: ['Kitchen', 'Menu'],
        },
        {
          name: 'Job',
          purpose: 'Open role advertised to professionals in the ecosystem.',
          keyFields: ['id', 'title', 'status', 'type', 'place_id'],
          linksTo: ['Kitchen', 'Professional', 'Agent'],
        },
        {
          name: 'Chef',
          purpose: 'Chef profile overlay used in Misebox workflow.',
          keyFields: ['id', 'title', 'summary', 'positions', 'user.id'],
          linksTo: ['User', 'Kitchen', 'Job'],
        },
        {
          name: 'Professional',
          purpose: 'Cross-role profile with experience and contact surfaces.',
          keyFields: ['id', 'title', 'summary', 'positions', 'user.id'],
          linksTo: ['Job', 'Agent'],
        },
        {
          name: 'Agent',
          purpose: 'Recruiting/operator profile for staffing and outreach.',
          keyFields: ['id', 'title', 'summary', 'user.id', 'coverage'],
          linksTo: ['Professional', 'Job'],
        },
        {
          name: 'Supplier',
          purpose: 'Supplier profile and sourcing identity for kitchens.',
          keyFields: ['id', 'name', 'email', 'phone', 'place_id'],
          linksTo: ['Company', 'Ingredient', 'Kitchen'],
        },
        {
          name: 'Company',
          purpose: 'Business identity tied to places and supplier/client structures.',
          keyFields: ['id', 'name', 'place_id', 'short_name'],
          linksTo: ['Place', 'Supplier'],
        },
      ],
      samples: [
        {
          entity: 'Kitchen',
          example: {
            id: 'k_demo_grill_yard',
            name: 'Grill Yard Kitchen',
            short_address: 'Market Street 12',
            is_test_kitchen: false,
            image_url:
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=640&q=80',
          },
        },
        {
          entity: 'Menu',
          example: {
            id: 'menu_lunch_core',
            kitchen_id: 'k_demo_grill_yard',
            name: 'Lunch Core',
            active: true,
            sections: [{ id: 'sec_main', label: 'Main', items: [{ dish_id: 'dish_smash_burger' }] }],
          },
        },
        {
          entity: 'Order',
          example: {
            id: 'ord_demo_1024',
            scope_type: 'kitchen',
            scope_id: 'k_demo_grill_yard',
            status: 'open',
            totals: { subtotal_minor: 2450, total_minor: 2646, currency_code: 'CHF' },
          },
        },
        {
          entity: 'Job',
          example: {
            id: 'job_demo_cdpline',
            title: 'Chef de Partie - Grill',
            status: 'open',
            type: 'fixed',
            place_id: 'place_demo_interlaken',
          },
        },
        {
          entity: 'Professional',
          example: {
            id: 'prof_demo_ivy_lane',
            title: 'Sous Chef',
            summary: 'Experienced in alpine hotel and event kitchens.',
            positions: ['Sous Chef', 'Chef de Partie'],
            user: { id: 'user_demo_ivy', display_name: 'Ivy Lane' },
          },
        },
      ],
      routes: [
        { label: 'Home', path: '/', kind: 'public' },
        { label: 'Get Started', path: '/get-started', kind: 'public' },
        { label: 'Kitchens', path: '/kitchens', kind: 'public' },
        { label: 'Jobs', path: '/jobs', kind: 'public' },
        { label: 'Professionals', path: '/professionals', kind: 'public' },
        { label: 'Console Entry', path: '/console', kind: 'console' },
        { label: 'Kitchen Console', path: '/console/kitchen', kind: 'console' },
      ],
    },
    relationshipMap: `
Place
  -> Kitchen
       -> Menu -> Dish -> Ingredient
       -> KitchenRecipe
       -> KitchenMiseTask -> KitchenTeamMember
       -> Order
       -> Job -> Professional
                       -> Agent
Company
  -> Supplier
       -> Ingredient
`,
    seo: {
      title: 'About Misebox',
      description:
        'We run kitchen operations and hiring from one platform with a consistent operating workflow.',
    },
  },
  getStarted: {
    hero: {
      eyebrow: 'Get live fast',
      title: 'Run kitchen operations from one console',
      description:
        'Misebox connects kitchens, roles, professionals, and supplier workflows in one operating model so service teams can execute with less friction, hire faster, subscribe to the right plan, and extend into your own app.',
      primaryAction: {
        label: 'Open kitchens',
        to: '/kitchens',
      },
      secondaryAction: {
        label: 'Post a role',
        to: '/jobs',
      },
    },
    snapshotTitle: 'Rollout snapshot',
    snapshotTicks: [
      'Kitchen, manager, and hiring access mapped by role',
      'Recipes, suppliers, and operational data loaded cleanly',
      'Job publishing and professional hiring flow switched on',
      'Kitchen and supplier consoles ready for daily execution',
    ],
    stepsHeading: {
      eyebrow: 'Three steps',
      title: 'A practical rollout in three steps',
      description:
        'Start with structure, activate workflows, then run service with your team on one consistent operating flow.',
    },
    steps: [
      {
        badge: 'Step 1',
        title: 'Baseline and structure',
        copy: 'Define your kitchen model, role structure, and data shape so every team works from the same operating baseline.',
        items: ['Role and permission map', 'Data and source inventory', 'Owners and rollout timeline'],
      },
      {
        badge: 'Step 2',
        title: 'Workspace activation',
        copy: 'Activate kitchens, jobs, professionals, and supplier workflows with one consistent structure across locations.',
        items: [
          'Core entities provisioned',
          'Workflow rules configured',
          'Kitchen + supplier consoles validated',
        ],
      },
      {
        badge: 'Step 3',
        title: 'Execution and handover',
        copy: 'Run live service and hiring operations in Misebox with clear accountability and repeatable workflows.',
        items: ['Operator runbook sign-off', 'Shift and hiring flow checks', 'Subscription and scale plan review'],
      },
    ],
    afterSetup: {
      title: 'What happens after setup starts',
      faqs: [
        {
          title: 'Data migration',
          copy: 'Import from spreadsheets, exports, or Firestore sources. Data is normalized before production use.',
        },
        {
          title: 'Role and access control',
          copy: 'Use role-based access with clear responsibility boundaries for kitchens, managers, and hiring teams.',
        },
        {
          title: 'Subscriptions and app extension',
          copy: 'Start with the right subscription tier, then move into a custom app build when your operating model is ready to extend.',
        },
        {
          title: 'Phased rollout',
          copy: 'Launch one kitchen first, validate execution, then scale location-by-location using the same operating template.',
        },
      ],
      card: {
        eyebrow: 'Need a faster launch?',
        title:
          'Use express rollout when you need one operating model across multiple kitchens with minimal drift.',
        bullets: [
          'Daily implementation checkpoints.',
          'Parallel data mapping and workflow setup.',
          'Team enablement for operations and hiring.',
        ],
        action: {
          label: 'Browse professionals',
          to: '/professionals',
        },
      },
    },
    seo: {
      title: 'Get Started · Misebox',
      description:
        'Set up kitchens, roles, professionals, and supplier workflows in one Misebox operating console.',
    },
  },
  roadmap: {
    title: 'Misebox Road Map',
    summary:
      'Misebox is evolving from kitchen ops + hiring baseline into deeper service intelligence and ecosystem app expansion.',
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
    id: 'misebox',
    name: appMeta.name,
    ecosystem: 'misebox',
  },
  copy: {
    big_personality: appMeta.brand.bigPersonality,
    headline: appMeta.brand.headline,
    highlight_terms: [
      'operating system',
      'kitchens',
      'professionals',
      'ops',
      'team',
      'service',
      'roles',
      'Misebox ecosystem',
      'connected console',
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
      'chef job platform',
      'hospitality recruitment platform',
      'kitchen supplier workflow',
      'menu recipe operations',
    ],
    audience: ['kitchen operators', 'restaurant owners', 'chefs', 'hospitality teams'],
    categories: [
      'kitchen operations software',
      'hospitality platform',
      'restaurant recruitment',
    ],
    primary_topic: 'kitchen operations software',
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
