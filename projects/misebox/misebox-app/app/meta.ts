// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: remove stale entity samples from product metadata.
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
          purpose: 'Kitchen-owned menu identity. Sections and items live in child collections.',
          keyFields: ['id', 'kitchen_id', 'name', 'description', 'status'],
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
  solutions: [
    {
      slug: 'digital-restaurant-menu',
      title: 'Digital restaurant menu',
      description: 'Publish an online restaurant menu from kitchen-owned menu data.',
      icon: 'i-lucide-utensils',
      status: 'live',
      keywords: ['digital restaurant menu', 'online restaurant menu'],
      cta: {
        label: 'Open kitchens',
        to: '/kitchens',
      },
    },
    {
      slug: 'qr-menu-url',
      title: 'Menu URL QR',
      description: 'Paste an existing menu URL and get a printable QR menu.',
      icon: 'i-lucide-link',
      status: 'live',
      keywords: ['menu url qr', 'restaurant menu qr code'],
      cta: {
        label: 'Create QR',
        to: '/solutions/qr-menu-url',
      },
    },
    {
      slug: 'qr-menu',
      title: 'QR menu',
      description: 'Upload a menu, choose a short path, and get a QR menu.',
      icon: 'i-lucide-qr-code',
      status: 'live',
      keywords: ['qr menu', 'pdf menu qr code'],
      cta: {
        label: 'Upload menu',
        to: '/solutions/qr-menu',
      },
    },
    {
      slug: 'restaurant-menu-management',
      title: 'Restaurant menu management',
      description: 'Manage sections, dishes, prices, status, and public menu presentation in one workflow.',
      icon: 'i-lucide-list-tree',
      status: 'live',
      keywords: ['restaurant menu management software', 'menu management software'],
      cta: {
        label: 'Open kitchen console',
        to: '/console/kitchen/menus',
      },
    },
    {
      slug: 'restaurant-menu-builder',
      title: 'Restaurant menu builder',
      description: 'Build a menu from dishes, sections, prices, and public presentation settings.',
      icon: 'i-lucide-panels-top-left',
      status: 'live',
      keywords: ['restaurant menu builder', 'online menu builder for restaurants'],
      cta: {
        label: 'Create menu',
        to: '/console/kitchen/menus',
      },
    },
    {
      slug: 'allergen-menu-software',
      title: 'Allergen menu software',
      description: 'Connect allergen and dietary information to dishes and public menu display.',
      icon: 'i-lucide-shield-check',
      status: 'planned',
      keywords: ['allergen menu software', 'restaurant allergen menu'],
    },
    {
      slug: 'multilingual-restaurant-menu',
      title: 'Multilingual restaurant menu',
      description: 'Publish restaurant menus in more than one language with translation support.',
      icon: 'i-lucide-languages',
      status: 'bridge',
      keywords: ['multilingual restaurant menu', 'restaurant menu translation'],
      relatedApp: {
        name: 'Sproochli',
        to: 'https://sproochli.web.app',
        external: true,
        description: 'Sproochli owns translation-ready public pages and language workflows.',
      },
      cta: {
        label: 'Prepare translation',
        to: '/solutions/multilingual-restaurant-menu',
      },
    },
    {
      slug: 'recipe-management-software',
      title: 'Recipe management software',
      description: 'Store kitchen recipes with yields, ingredient lines, steps, and dish links.',
      icon: 'i-lucide-notebook-tabs',
      status: 'live',
      keywords: ['recipe management software', 'restaurant recipe management'],
      cta: {
        label: 'Open recipes',
        to: '/console/kitchen/recipes',
      },
    },
    {
      slug: 'kitchen-prep-planner',
      title: 'Kitchen prep planner',
      description: 'Plan prep work by station, recipe, menu, assignment, and service readiness.',
      icon: 'i-lucide-clipboard-list',
      status: 'live',
      keywords: ['kitchen prep planner', 'restaurant prep planner'],
      cta: {
        label: 'Open mise',
        to: '/console/kitchen/mise',
      },
    },
    {
      slug: 'restaurant-prep-list',
      title: 'Restaurant prep list',
      description: 'Give the team a daily prep list tied to tasks, status, stations, and service.',
      icon: 'i-lucide-list-checks',
      status: 'live',
      keywords: ['restaurant prep list', 'kitchen prep list'],
      cta: {
        label: 'Open mise',
        to: '/console/kitchen/mise',
      },
    },
    {
      slug: 'kitchen-team-management',
      title: 'Kitchen team management',
      description: 'Manage kitchen roles, stations, access, and team responsibilities.',
      icon: 'i-lucide-users',
      status: 'planned',
      keywords: ['kitchen team management', 'restaurant team management'],
      cta: {
        label: 'Open team',
        to: '/console/kitchen/team',
      },
    },
    {
      slug: 'restaurant-supplier-management',
      title: 'Restaurant supplier management',
      description: 'Connect suppliers, ingredients, products, sourcing, and kitchen needs.',
      icon: 'i-lucide-truck',
      status: 'planned',
      keywords: ['restaurant supplier management', 'restaurant supplier software'],
      cta: {
        label: 'Open suppliers',
        to: '/console/kitchen/suppliers',
      },
    },
    {
      slug: 'restaurant-hiring-software',
      title: 'Restaurant hiring software',
      description: 'Publish hospitality roles and connect kitchens with chefs and professionals.',
      icon: 'i-lucide-briefcase-business',
      status: 'live',
      keywords: ['restaurant hiring software', 'hospitality hiring software'],
      cta: {
        label: 'Open jobs',
        to: '/jobs',
      },
    },
    {
      slug: 'chef-profile-page',
      title: 'Chef profile page',
      description: 'Create a public chef profile that shows experience, roles, and kitchen fit.',
      icon: 'i-lucide-chef-hat',
      status: 'live',
      keywords: ['chef profile page', 'chef portfolio profile'],
      cta: {
        label: 'Browse chefs',
        to: '/chefs',
      },
    },
    {
      slug: 'restaurant-profile-page',
      title: 'Restaurant profile page',
      description: 'Show a kitchen, menu, location, team identity, and hiring context.',
      icon: 'i-lucide-store',
      status: 'live',
      keywords: ['restaurant profile page', 'kitchen profile page'],
      cta: {
        label: 'Open kitchens',
        to: '/kitchens',
      },
    },
    {
      slug: 'restaurant-operations-software',
      title: 'Restaurant operations software',
      description: 'Run menus, dishes, recipes, prep, team, suppliers, orders, and hiring from one kitchen console.',
      icon: 'i-lucide-layout-dashboard',
      status: 'planned',
      keywords: ['restaurant operations software', 'kitchen operations software'],
      cta: {
        label: 'Open console',
        to: '/console/kitchen',
      },
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
