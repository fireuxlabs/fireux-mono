export const sourceMeta = {
  name: 'Misebox',
  landing: {
    brand: {
      appName: 'misebox',
      bigPersonality: 'Manage your menu and kitchen<br>in one place.',
      headline: 'Menu and kitchen management',
    },
    heroPrimaryLine:
      'Publish <strong>menus</strong>, organise prep and manage orders with Misebox.',
    primaryCtaLabel: 'Try the interactive demo',
    primaryCtaTo: '/demo',
    secondaryCtaLabel: 'See what works today',
    secondaryCtaTo: '/operations',
    workspaceBridgeLine:
      'Follow one <strong>connected workflow</strong> from guest menu to Kitchen handoff.',
    heroBullets: [
      'No signup required',
      'Sample restaurant data',
      'No live order is created',
    ],
    rightPanelItems: [
      {
        title: 'Publish',
        description: 'Structured public menus and guest ordering surfaces.',
        icon: 'i-lucide-qr-code',
      },
      {
        title: 'Prepare',
        description: 'Dishes, recipes, ingredients, Mise, and stations.',
        icon: 'i-lucide-list-checks',
      },
      {
        title: 'Serve',
        description: 'Order queues, Kitchen tickets, and handoff.',
        icon: 'i-lucide-bell-ring',
      },
    ],
    seo: {
      title: 'Misebox — Free restaurant menu and Kitchen workspace',
      description:
        'Start one Kitchen and publish one restaurant Menu without signing up. Use free restaurant tools, choose Premium for multiple Menus, or Business for multiple Kitchens.',
    },
  },
  about: {
    hero: {
      label: 'About Misebox',
      supportingCopy:
        'Misebox connects menus, recipes, dishes, prep tasks, orders, and service handoff so restaurant teams can work from the same Kitchen information.',
      primaryAction: {
        label: 'Open kitchens',
        to: '/kitchens',
      },
      secondaryAction: {
        label: 'Explore Misebox Jobs',
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
        'Quick links to public and workspace routes',
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
        description: 'A family of focused hospitality products that can share trusted identity without sharing one acquisition promise.',
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
        description: 'Misebox Jobs uses a shared Professional profile for hospitality work discovery.',
      },
      {
        title: 'Jobs',
        description: 'A focused hospitality work doorway built on Company, Place, Agent, and Professional authority—not Kitchen identity.',
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
        description: 'Supplier records support Kitchen sourcing workflows without becoming a second main-product audience.',
      },
      {
        title: 'Apps',
        description: 'Specialised apps extend the Misebox ecosystem over time.',
      },
    ],
    appSpec: {
      name: 'Misebox',
      tagline: 'Restaurant Menu and Kitchen Workflow',
      description:
        'Misebox connects published menus with the dishes, recipes, preparation, orders, and service handoff behind them.',
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
          summary: 'Adjacent Jobs doorway for published roles and professional profiles.',
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
          linksTo: ['Company', 'Place', 'Agent'],
        },
        {
          name: 'Chef',
          purpose: 'Chef profile overlay used in Misebox workflow.',
          keyFields: ['id', 'title', 'summary', 'positions', 'user.id'],
          linksTo: ['User', 'Kitchen'],
        },
        {
          name: 'Professional',
          purpose: 'Cross-role profile with experience and contact surfaces.',
          keyFields: ['id', 'title', 'summary', 'positions', 'user.id'],
          linksTo: ['User', 'Company', 'Place'],
        },
        {
          name: 'Agent',
          purpose: 'Recruiting/operator profile for staffing and outreach.',
          keyFields: ['id', 'title', 'summary', 'user.id', 'coverage'],
          linksTo: ['User', 'Job'],
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
          linksTo: ['Place', 'Supplier', 'Job'],
        },
      ],
      routes: [
        { label: 'Home', path: '/', kind: 'public' },
        { label: 'Get Started', path: '/get-started', kind: 'public' },
        { label: 'Kitchens', path: '/kitchens', kind: 'public' },
        { label: 'Jobs', path: '/jobs', kind: 'public' },
        { label: 'Professionals', path: '/professionals', kind: 'public' },
        { label: 'Workspace Entry', path: '/workspace', kind: 'workspace' },
        { label: 'Kitchen Workspace', path: '/', kind: 'workspace' },
      ],
    },
    relationshipMap: `
Place
  -> Kitchen
       -> Menu -> Dish -> Ingredient
       -> KitchenRecipe
       -> KitchenMiseTask -> KitchenTeamMember
       -> Order
Company
  -> Place
  -> Supplier -> Ingredient
  -> Job
User
  -> Chef -> Kitchen
  -> Professional -> Company + Place experience
  -> Agent -> Job ownership
`,
    seo: {
      title: 'About Misebox',
      description:
        'Misebox connects menus, dishes, recipes, prep work, orders, and service handoff for restaurant teams.',
    },
  },
  getStarted: {
    hero: {
      eyebrow: 'Start with one Kitchen',
      title: 'Start your Kitchen without signing up',
      description:
        'Create one Kitchen, publish one Menu, and use its open Workspace tools. Sign in to keep the Kitchen with your account, choose Premium for more Menus, or Business for more Kitchens.',
      primaryAction: {
        label: 'Start one Kitchen',
        to: '/',
      },
      secondaryAction: {
        label: 'Try the interactive demo',
        to: '/demo',
      },
    },
    snapshotTitle: 'What the setup connects',
    snapshotTicks: [
      'Kitchen identity and operator access',
      'Menus, dishes, recipes, ingredients, and allergens',
      'Prep work organised around stations and service',
      'Guest orders carried into a clear Kitchen handoff',
    ],
    stepsHeading: {
      eyebrow: 'Three steps',
      title: 'A practical rollout in three steps',
      description:
        'Start with Kitchen truth, connect the work behind the menu, then run a service flow your team can inspect and improve.',
    },
    steps: [
      {
        badge: 'Step 1',
        title: 'Establish the Kitchen',
        copy: 'Create the Kitchen identity, attach the right operators, and decide which existing information is worth carrying forward.',
        items: ['Kitchen identity', 'Operator access', 'Current menu and source inventory'],
      },
      {
        badge: 'Step 2',
        title: 'Connect the menu to prep',
        copy: 'Structure menus, dishes, recipes, ingredients, and station work so one change does not have to be copied between tools.',
        items: [
          'Menu and dish structure',
          'Recipes and ingredient relationships',
          'Prep and station workflow',
        ],
      },
      {
        badge: 'Step 3',
        title: 'Run and review service',
        copy: 'Carry guest choices into the Kitchen queue, move tickets toward handoff, and keep the underlying menu information current.',
        items: ['Order flow check', 'Kitchen handoff review', 'Next-service improvement list'],
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
          copy: 'Use explicit Kitchen access with clear responsibility boundaries for owners, operators, and team members.',
        },
        {
          title: 'Subscriptions and app extension',
          copy: 'Start with the right subscription tier, then move into a custom app build when your operating model is ready to extend.',
        },
        {
          title: 'Phased rollout',
          copy: 'Launch one Kitchen first, validate the menu-to-service workflow, then scale location by location using the same operating template.',
        },
      ],
      card: {
        eyebrow: 'Need a faster launch?',
        title:
          'Use express rollout when you need one operating model across multiple kitchens with minimal drift.',
        bullets: [
          'Daily implementation checkpoints.',
          'Menu and workflow mapping in parallel.',
          'Team enablement for prep and service.',
        ],
        action: {
          label: 'See what works today',
          to: '/operations',
        },
      },
    },
    seo: {
      title: 'Get Started · Misebox',
      description:
        'Create a Kitchen workspace and connect menus, dishes, recipes, prep work, orders, and service handoff.',
    },
  },
  roadmap: {
    title: 'Misebox Road Map',
    summary:
      'Misebox is evolving from public Kitchen tools into deeper menu, prep, order, service, and multi-location coordination.',
  },
} as const
