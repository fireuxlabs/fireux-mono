// @fireux-script
// last_used: 2026-08-04
// usage_note: canonical app identity, routes, and smoke-contract assignments.

import {
  appDetailContract,
  invalidMenuIndexCursorContract,
  jobIndexApiContract,
  kitchenDetailApiContract,
  kitchenIndexApiContract,
  kitchenCollectionRecoveryContract,
  menuBrowseContract,
  menuDocumentContract,
  menuDocumentFileContract,
  menuIndexApiContract,
  menuIndexContract,
  menuKioskContract,
  menuOrderContract,
  menuPreOrderContract,
  menuQrContract,
  missingMenuBrowseContract,
  missingKitchenDetailApiContract,
  missingMenuIndexContract,
  missingMenuQrContract,
  profileIndexApiContract,
  privateKitchenIndexAuthContract,
  seoPageContract,
  tenantMenuBrowseContract,
  tenantMenuIndexRedirectContract,
  tenantMenuOrderContract,
  tenantMenuQrContract,
  tenantMissingMenuBrowseContract,
  tenantUnavailableMenuOrderContract,
  unavailableMenuOrderContract,
} from './app-smoke-contracts.mjs'

const SHARED_ROUTES = [
  '/',
  '/operations',
  '/dashboard',
  '/dashboard/user-profile',
]

// Registry workspaces are smoke-test route segments.
// Workspace family keys and route segments are singular:
// `project`, `property`, `kitchen`, `portfolio`, and `supplier`.
function unique(values) {
  return [...new Set(values)]
}

function workspaceRoutes(families = []) {
  if (!families.length) return []

  const routes = ['/workspace']

  for (const family of families) {
    routes.push(`/workspace/${family}`)
  }

  return routes
}

export const APP_REGISTRY = {
  fireux: {
    key: 'fireux',
    name: 'FireUX',
    appId: 'fireux-app',
    ecosystem: 'fireux',
    databaseId: 'fireux',
    role: 'global',
    workspace: './projects/fireux/fireux-app',
    port: 3000,
    workspaces: ['project'],
    smokeRoutes: [
      ...SHARED_ROUTES,
      '/get-started',
      '/pricing/apps',
      '/solutions',
      '/solutions/app-for-small-business',
      '/apps',
      '/apps/misebox-app',
      '/ecosystems/misebox',
      '/ecosystems/werkbox',
      '/operations/identity',
      ...workspaceRoutes(['project']),
      '/workspace/project/identity',
      '/workspace/project/overview',
      '/workspace/project/apps',
      '/workspace/project/ecosystem',
      '/workspace/project/ignitions',
    ],
    httpContracts: [
      seoPageContract('/', {
        title: 'FireUX — Projects, Apps, and Ecosystems',
        description:
          'Design, build and launch your SaaS App. Develop your business tools. Manage your team and users. Monitor your Project from the Workspace.',
        canonical: 'http://localhost:3000/',
        robots: 'index, follow',
        image: 'http://localhost:3000/img/app/cover.png',
        jsonLdTypes: ['Organization', 'WebSite', 'WebPage'],
      }),
      seoPageContract('/operations', {
        title: 'Operations - FireUX',
        description: 'Operations across FireUX workspaces.',
        canonical: 'http://localhost:3000/operations',
        robots: 'index, follow',
        image: 'http://localhost:3000/img/app/cover.png',
        jsonLdTypes: ['CollectionPage', 'ItemList'],
      }),
      seoPageContract('/operations/identity', {
        title: 'Identity - FireUX',
        description: 'Manage the selected Project identity.',
        canonical: 'http://localhost:3000/operations/identity',
        robots: 'index, follow',
        image: 'http://localhost:3000/img/app/cover.png',
        jsonLdTypes: ['WebPage'],
      }),
      seoPageContract('/solutions', {
        title: 'FireUX Solutions',
        description:
          'Find a specific job for a FireUX App, then use it to brief an Ignition request.',
        canonical: 'http://localhost:3000/solutions',
        robots: 'index, follow',
        image: 'http://localhost:3000/img/app/cover.png',
        jsonLdTypes: ['CollectionPage', 'ItemList'],
      }),
      seoPageContract('/solutions/app-for-small-business', {
        title: 'App for small business - FireUX',
        description:
          'A branded website and installable app for a small business, with hosting and maintenance included.',
        canonical: 'http://localhost:3000/solutions/app-for-small-business',
        robots: 'index, follow',
        image: 'http://localhost:3000/img/app/cover.png',
        jsonLdTypes: ['WebPage'],
      }),
      seoPageContract('/ecosystems/misebox', {
        title: 'Misebox · FireUX Ecosystem',
        description:
          'See how FireUX provides the shared App foundation while Misebox owns hospitality products for menus, kitchens, preparation, hiring, and service.',
        canonical: 'http://localhost:3000/ecosystems/misebox',
        robots: 'index, follow',
        jsonLdTypes: ['CollectionPage', 'ItemList'],
      }),
      seoPageContract('/apps', {
        title: 'FireUX Apps',
        description:
          'Browse published apps across the FireUX platform, including direct Project Apps and Ecosystem Apps.',
        canonical: 'http://localhost:3000/apps',
        robots: 'index, follow',
        image: 'http://localhost:3000/img/app/cover.png',
        jsonLdTypes: ['CollectionPage', 'ItemList'],
      }),
      seoPageContract('/apps/misebox-app', {
        canonical: 'http://localhost:3000/apps/misebox-app',
        robots: 'index, follow',
        jsonLdTypes: ['WebPage', 'ItemList'],
        jsonLdIncludes: ['"name":"Misebox"'],
      }),
      seoPageContract('/ecosystems/werkbox', {
        title: 'Werkbox · FireUX Ecosystem',
        description:
          'Explore Werkbox cleaning services and the active Apps connected to the FireUX practical-work Ecosystem.',
        canonical: 'http://localhost:3000/ecosystems/werkbox',
        robots: 'index, follow',
        image: 'http://localhost:3000/img/app/cover.png',
        jsonLdTypes: ['CollectionPage', 'ItemList'],
      }),
      {
        route: '/sitemaps/static.xml',
        status: 200,
        contentType: 'application/xml',
        includes: [
          '<loc>http://localhost:3000/operations</loc>',
          '<loc>http://localhost:3000/operations/identity</loc>',
          '<loc>http://localhost:3000/solutions</loc>',
          '<loc>http://localhost:3000/solutions/app-for-small-business</loc>',
          '<loc>http://localhost:3000/apps</loc>',
          '<loc>http://localhost:3000/ecosystems</loc>',
          '<loc>http://localhost:3000/ecosystems/werkbox</loc>',
        ],
        excludes: [
          '<loc>http://localhost:3000/misebox</loc>',
          '<loc>http://localhost:3000/apps/misebox-app</loc>',
          '<loc>http://localhost:3000/ecosystems/misebox</loc>',
          '/solutions/cleaning',
          '/solutions/restaurant-menu-management',
        ],
      },
      {
        route: '/sitemaps/directory.xml',
        status: 200,
        contentType: 'application/xml',
        includes: [
          '<loc>http://localhost:3000/apps/misebox-app</loc>',
          '<loc>http://localhost:3000/apps/la-tap-berne</loc>',
          '<loc>http://localhost:3000/ecosystems/misebox</loc>',
        ],
        excludes: [
          '<loc>http://localhost:3000/apps/fireux-blank</loc>',
          '<loc>http://localhost:3000/ecosystems/cleanbox</loc>',
        ],
      },
      {
        route: '/sitemaps/index.xml',
        status: 200,
        contentType: 'application/xml',
        includes: [
          '<loc>http://localhost:3000/sitemaps/static.xml</loc>',
          '<loc>http://localhost:3000/sitemaps/directory.xml</loc>',
        ],
      },
      {
        route: '/apps/fireux-blank',
        status: 200,
        contentType: 'text/html',
        noindex: true,
      },
      {
        route: '/solutions/cleaning',
        status: 200,
        contentType: 'text/html',
        noindex: true,
      },
      {
        route: '/solutions/restaurant-menu-management',
        status: 301,
        location: 'https://misebox.app/solutions/restaurant-menu-management',
        contentType: 'text/html',
      },
      {
        route: '/misebox',
        status: 301,
        location: '/ecosystems/misebox',
        contentType: 'text/html',
      },
      {
        route: '/ecosystems/cleanbox',
        status: 301,
        location: '/ecosystems/werkbox',
        contentType: 'text/html',
      },
    ],
    launchOrder: 1,
  },
  misebox: {
    key: 'misebox',
    name: 'Misebox',
    appId: 'misebox-app',
    ecosystem: 'misebox',
    databaseId: 'misebox',
    role: 'global',
    workspace: './projects/misebox/misebox-app',
    port: 3001,
    workspaces: ['kitchen'],
    toolProviders: ['go-qr'],
    componentSmokeRoutes: [
      '/workspace/kitchen',
      '/workspace/kitchen/identity',
      '/workspace/kitchen/mise',
      '/workspace/kitchen/ingredients',
      '/workspace/kitchen/suppliers',
      '/workspace/kitchen/menus',
      '/workspace/kitchen/dishes',
      '/workspace/kitchen/recipes',
    ],
    smokeRoutes: [...SHARED_ROUTES, ...workspaceRoutes(['kitchen']), '/jobs'],
    httpContracts: [
      seoPageContract('/', {
        title: 'Misebox — Menu and kitchen management',
        description:
          'Publish menus, organise kitchen prep and manage restaurant orders with Misebox.',
        canonical: 'http://localhost:3001/',
        robots: 'index, follow',
        image:
          'http://localhost:3001/img/landing/kitchen-operations-hero-v2.png',
        jsonLdTypes: ['Organization', 'WebSite', 'WebPage'],
      }),
      jobIndexApiContract('/api/jobs?limit=1'),
      kitchenIndexApiContract('/api/kitchens?limit=48&visibility=published'),
      kitchenDetailApiContract('/api/kitchens/la-tapberne', 'la-tapberne'),
      missingKitchenDetailApiContract(
        '/api/kitchens/fireux-route-contract-missing'
      ),
      privateKitchenIndexAuthContract('/api/kitchens?limit=48&visibility=all'),
      profileIndexApiContract('/api/public/chefs'),
      profileIndexApiContract('/api/public/drivers'),
      profileIndexApiContract('/api/public/agents'),
      profileIndexApiContract('/api/public/professionals'),
      appDetailContract('/apps/la-tap-berne', 'la-tap-berne'),
      menuIndexContract('/menus', { kind: 'collection' }),
      menuIndexApiContract('/api/menus?limit=2', 'root', {
        kitchenName: true,
      }),
      menuIndexApiContract(
        '/api/menus?kitchenSlug=baeren-ringgenberg&limit=1',
        'directory',
        { menuId: 'pizza-snacks-drinks' }
      ),
      invalidMenuIndexCursorContract(
        '/api/menus?cursor=not-a-valid-menu-cursor%21'
      ),
      menuDocumentContract(
        '/menus/bergwelt-grindelwald-pdf',
        'pdf',
        '/api/menus/bergwelt-grindelwald-pdf/file'
      ),
      unavailableMenuOrderContract(
        '/menus/bergwelt-grindelwald-pdf.collection',
        'Collection unavailable'
      ),
      menuDocumentFileContract(
        '/api/menus/bergwelt-grindelwald-pdf/file',
        'application/pdf'
      ),
      menuQrContract(
        '/menus/bergwelt-grindelwald-pdf/qr',
        '/menus/bergwelt-grindelwald-pdf',
        { renderKind: 'document' }
      ),
      menuBrowseContract('/menus/bergwelt-grindelwald-main'),
      menuBrowseContract('/menus/la-tapberne-main', {
        itemIncludes: [
          'data-menu-item-price-kind="base"',
          'data-menu-item-price-kind="add-on"',
          'Optional extras',
          'Manchego',
          '+ 2.50',
        ],
      }),
      unavailableMenuOrderContract(
        '/menus/la-tapberne-main.collection',
        'Collection unavailable'
      ),
      menuBrowseContract('/menus/indian-gourmet-restaurant-pizzeria-main', {
        itemIncludes: [
          'data-menu-item-price-kind="starting"',
          'data-menu-item-price-kind="variant"',
          'Chicken breast',
          'Boneless chicken thigh',
          '27.-',
        ],
        itemExcludes: ['+ 27.-'],
      }),
      menuKioskContract('/menus/indian-gourmet-restaurant-pizzeria-main.kiosk'),
      unavailableMenuOrderContract(
        '/menus/indian-gourmet-restaurant-pizzeria-main.collection',
        'Collection unavailable',
        {
          browsePath: '/menus/indian-gourmet-restaurant-pizzeria-main',
          kitchenPath: '/kitchens/indian-gourmet-restaurant-pizzeria',
        }
      ),
      kitchenCollectionRecoveryContract(
        '/kitchens/indian-gourmet-restaurant-pizzeria.collection',
        '/kitchens/indian-gourmet-restaurant-pizzeria',
        'Indian Gourmet Restaurant &amp; Pizzeria'
      ),
      menuBrowseContract('/menus/luna-piccante-main-menu', {
        canonicalPath: '/kitchens/luna-piccante/menus/main-menu',
      }),
      menuBrowseContract('/kitchens/luna-piccante/menus/main-menu', {
        canonicalPath: '/kitchens/luna-piccante/menus/main-menu',
      }),
      menuBrowseContract('/menus/pizza-menu'),
      menuBrowseContract('/menus/pizza-snacks-drinks', {
        itemIncludes: [
          'data-menu-item-price-kind="base"',
          'data-menu-item-price-kind="starting"',
          'data-menu-item-price-kind="variant"',
          '1.5 Liter',
          '5.5 Liter',
        ],
      }),
      menuOrderContract('/menus/pizza-snacks-drinks.collection'),
      menuQrContract(
        '/menus/pizza-snacks-drinks/qr',
        '/menus/pizza-snacks-drinks'
      ),
      menuQrContract(
        '/menus/pizza-snacks-drinks.collection/qr',
        '/menus/pizza-snacks-drinks.collection',
        { context: 'collection' }
      ),
      missingMenuBrowseContract('/menus/fireux-route-contract-missing'),
      unavailableMenuOrderContract(
        '/menus/fireux-route-contract-missing.collection',
        'Menu not found',
        { noRecovery: true }
      ),
      missingMenuBrowseContract('/menus/__fireux_route_contract_invalid__', [
        'INVALID_ARGUMENT',
        'Resource id',
        '@grpc',
      ]),
      missingMenuBrowseContract('/menus/__fireux%0Aroute_contract_invalid__', [
        'INVALID_ARGUMENT',
        'Resource id',
        '@grpc',
      ]),
      missingMenuQrContract('/menus/fireux-route-contract-missing/qr'),
      missingMenuQrContract('/menus/__fireux_route_contract_invalid__/qr', [
        'INVALID_ARGUMENT',
        'Resource id',
        '@grpc',
      ]),
      menuQrContract(
        '/menus/pizza-snacks-drinks.delivery/qr',
        '/menus/pizza-snacks-drinks.delivery',
        { context: 'delivery' }
      ),
      menuIndexContract('/kitchens/baeren-ringgenberg/menus', {
        kind: 'list',
      }),
      menuBrowseContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks'
      ),
      menuOrderContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks.collection'
      ),
      menuQrContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks/qr',
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks'
      ),
      menuQrContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks.collection/qr',
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks.collection',
        { context: 'collection' }
      ),
      missingMenuBrowseContract(
        '/kitchens/baeren-ringgenberg/menus/fireux-route-contract-missing'
      ),
      unavailableMenuOrderContract(
        '/kitchens/baeren-ringgenberg/menus/fireux-route-contract-missing.collection',
        'Menu not found',
        { noRecovery: true }
      ),
      missingMenuQrContract(
        '/kitchens/baeren-ringgenberg/menus/fireux-route-contract-missing/qr'
      ),
      missingMenuBrowseContract(
        '/kitchens/bergwelt-grindelwald/menus/pizza-snacks-drinks'
      ),
      missingMenuQrContract(
        '/kitchens/bergwelt-grindelwald/menus/pizza-snacks-drinks/qr'
      ),
      menuQrContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks.delivery/qr',
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks.delivery',
        { context: 'delivery' }
      ),
      menuOrderContract('/menus/pizza-snacks-drinks.delivery', {
        context: 'delivery',
      }),
      unavailableMenuOrderContract(
        '/menus/fireux-route-contract-missing.delivery',
        'Menu not found',
        { context: 'delivery', noRecovery: true }
      ),
      menuOrderContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks.delivery',
        { context: 'delivery' }
      ),
      unavailableMenuOrderContract(
        '/kitchens/baeren-ringgenberg/menus/fireux-route-contract-missing.delivery',
        'Menu not found',
        { context: 'delivery', noRecovery: true }
      ),
    ],
    launchOrder: 2,
  },
  werkbox: {
    key: 'werkbox',
    name: 'Werkbox',
    appId: 'cleanbox-app',
    ecosystem: 'werkbox',
    databaseId: 'cleanbox',
    role: 'global',
    workspace: './projects/werkbox/werkbox-app',
    port: 3002,
    workspaces: [],
    smokeRoutes: [...SHARED_ROUTES, '/jobs'],
    httpContracts: [jobIndexApiContract('/api/jobs?limit=1')],
    launchOrder: 3,
  },
  richies: {
    key: 'richies',
    name: 'Richies Reinigung',
    appId: 'richies-reinigung',
    ecosystem: 'werkbox',
    databaseId: 'cleanbox',
    role: 'tenant',
    workspace: './projects/werkbox/richies-reinigung',
    port: 3004,
    workspaces: [],
    launchOrder: 4,
  },
  tenant: {
    key: 'tenant',
    name: 'FireUX Tenant',
    appId: 'fireux-tenant',
    ecosystem: 'fireux',
    databaseId: 'fireux',
    role: 'tenant',
    workspace: './projects/fireux/tenant',
    port: 3005,
    workspaces: [],
    launchOrder: 5,
  },
  bringli: {
    key: 'bringli',
    name: 'Bringli',
    appId: 'bringli-app',
    ecosystem: 'bringli',
    databaseId: 'bringli',
    role: 'global',
    workspace: './projects/bringli/bringli-app',
    port: 3006,
    workspaces: ['supplier'],
    launchOrder: 6,
  },
  'find-my-seo': {
    key: 'find-my-seo',
    name: 'Find My SEO',
    appId: 'find-my-seo-app',
    ecosystem: 'fireux',
    databaseId: 'find-my-seo',
    role: 'standalone',
    workspace: './projects/fireux/find-my-seo-app',
    port: 3010,
    workspaces: [],
    smokeRoutes: [
      '/',
      '/chat',
      '/professionals',
      '/professionals/alex-mercer-technical-seo',
      '/categories/technical-seo',
      '/seo-for-saas',
      '/seo-for-ecommerce',
      '/case-studies',
      '/dashboard',
      '/dashboard/professional/profile',
    ],
    launchOrder: 7,
  },
  sproochli: {
    key: 'sproochli',
    name: 'Sproochli',
    appId: 'sproochli',
    ecosystem: 'fireux',
    databaseId: 'sproochli',
    role: 'standalone',
    workspace: './projects/fireux/sproochli',
    port: 3011,
    workspaces: [],
    smokeRoutes: [
      '/',
      '/chat',
      '/info',
      '/menus',
      '/info/bern-bike-rental/rental-instructions',
    ],
    launchOrder: 8,
  },
  buenohost: {
    key: 'buenohost',
    name: 'BuenoHost',
    appId: 'buenohost',
    ecosystem: 'buenohost',
    databaseId: 'buenohost',
    role: 'global',
    workspace: './projects/buenohost/buenohost-app',
    port: 3012,
    workspaces: ['property'],
    smokeRoutes: [
      '/',
      '/chat',
      '/properties/preview-stay',
      '/properties/preview-stay/info',
      '/properties/preview-stay/info/check-in',
      '/workspace/property',
    ],
    launchOrder: 9,
  },
  'book-with-nats': {
    key: 'book-with-nats',
    name: 'Book with Nats',
    appId: 'book-with-nats',
    ecosystem: 'buenohost',
    databaseId: 'buenohost',
    role: 'tenant',
    workspace: './projects/buenohost/book-with-nats',
    port: 3028,
    workspaces: ['property'],
    smokeRoutes: ['/', '/stay', '/book', '/contact'],
    launchOrder: 19,
  },
  'ausfinn-apartments': {
    key: 'ausfinn-apartments',
    name: 'AUSFinn Apartments',
    appId: 'ausfinn-apartments',
    ecosystem: 'buenohost',
    databaseId: 'buenohost',
    role: 'tenant',
    workspace: './projects/buenohost/ausfinn-apartments',
    port: 3029,
    workspaces: ['property'],
    smokeRoutes: ['/', '/stays', '/book', '/contact'],
    launchOrder: 20,
  },
  'go-qr': {
    key: 'go-qr',
    name: 'Go QR',
    appId: 'go-qr',
    ecosystem: 'fireux',
    databaseId: 'go-qr',
    role: 'standalone',
    workspace: './projects/fireux/go-qr',
    port: 3013,
    workspaces: [],
    toolProviders: ['go-qr'],
    smokeRoutes: ['/', '/choufe', '/verchoufe'],
    launchOrder: 10,
  },
  'fireux-blank': {
    key: 'fireux-blank',
    name: 'FireUX Blank',
    appId: 'fireux-blank',
    ecosystem: 'fireux',
    databaseId: 'fireux',
    role: 'standalone',
    provisioning: 'harness',
    workspace: './projects/fireux/fireux-blank',
    port: 3015,
    workspaces: ['blank'],
    smokeRoutes: ['/', '/workspace', '/workspace/blank'],
    launchOrder: 15,
  },
  'yellow-velo': {
    key: 'yellow-velo',
    name: 'Yellow Velo',
    appId: 'yellow-velo',
    ecosystem: 'slap',
    databaseId: 'slap',
    role: 'tenant',
    workspace: './projects/slap/yellow-velo',
    port: 3014,
    workspaces: [],
    smokeRoutes: [
      '/',
      '/products',
      '/products/raleigh-stratos-retro-mtb',
      '/blog',
    ],
    launchOrder: 12,
  },
  holzworm: {
    key: 'holzworm',
    name: 'Holzworm',
    appId: 'holzworm',
    ecosystem: 'fireux',
    databaseId: 'holzworm',
    role: 'standalone',
    workspace: './projects/fireux/holzworm',
    port: 3030,
    workspaces: [],
    smokeRoutes: ['/'],
    launchOrder: 13,
  },
  'lifeguard-community': {
    key: 'lifeguard-community',
    name: 'Lifeguard Community',
    appId: 'lifeguard-community',
    ecosystem: 'fireux',
    databaseId: 'lifeguard-community',
    role: 'standalone',
    workspace: './projects/fireux/lifeguard-community',
    port: 3031,
    workspaces: [],
    smokeRoutes: [
      '/',
      '/forum',
      '/forum/handover-notes',
      '/training',
      '/training/peer-practice',
      '/merchandise',
    ],
    launchOrder: 14,
  },
  granite: {
    key: 'granite',
    name: 'Granite',
    appId: 'granite-app',
    ecosystem: 'granite',
    databaseId: 'granite',
    role: 'global',
    workspace: './projects/granite/granite-app',
    port: 3007,
    workspaces: ['portfolio'],
    launchOrder: 13,
  },
  slap: {
    key: 'slap',
    name: 'Slap',
    appId: 'slap-app',
    ecosystem: 'slap',
    databaseId: 'slap',
    role: 'global',
    workspace: './projects/slap/slap-app',
    port: 3009,
    workspaces: [],
    smokeRoutes: [
      '/',
      '/about',
      '/get-started',
      '/products',
      '/blog',
      '/workspace',
    ],
    launchOrder: 11,
  },
  'la-tap-berne': {
    key: 'la-tap-berne',
    name: 'La Tap Berne',
    appId: 'la-tap-berne',
    ecosystem: 'misebox',
    databaseId: 'misebox',
    role: 'tenant',
    workspace: './projects/misebox/la-tap-berne',
    port: 3008,
    workspaces: ['kitchen'],
    httpContracts: [
      tenantMenuIndexRedirectContract('/menus', '/main'),
      tenantMenuBrowseContract('/main'),
      tenantUnavailableMenuOrderContract(
        '/main.collection',
        'Collection unavailable'
      ),
      tenantMenuQrContract('/main/qr', '/main'),
      tenantMenuQrContract('/main.pre_order/qr', '/main.pre_order', {
        context: 'pre_order',
      }),
      missingMenuQrContract('/main.collection/qr'),
      tenantMenuIndexRedirectContract('/menus/main', '/main'),
      tenantMenuIndexRedirectContract(
        '/menus/main.collection',
        '/main.collection'
      ),
      tenantMenuIndexRedirectContract('/menus/main/qr', '/main/qr'),
      tenantMissingMenuBrowseContract('/pizza-snacks-drinks'),
      tenantUnavailableMenuOrderContract(
        '/pizza-snacks-drinks.collection',
        'Menu not found'
      ),
      missingMenuQrContract('/pizza-snacks-drinks/qr'),
      missingMenuIndexContract('/kitchens/la-tapberne/menus'),
      tenantMissingMenuBrowseContract('/kitchens/la-tapberne/menus/main'),
      missingMenuQrContract('/kitchens/la-tapberne/menus/main/qr'),
      menuPreOrderContract('/main.pre_order', {
        indexPath: '/menus',
        exitKind: 'close',
        exitPath: '/',
      }),
    ],
    launchOrder: 14,
  },
  'baeren-ringgenberg': {
    key: 'baeren-ringgenberg',
    name: 'Bären Ringgenberg',
    appId: 'baeren-ringgenberg',
    ecosystem: 'misebox',
    databaseId: 'misebox',
    role: 'tenant',
    workspace: './projects/misebox/baeren-ringgenberg',
    port: 3017,
    workspaces: ['kitchen'],
    smokeRoutes: [
      '/',
      '/hotel',
      '/menu',
      '/events',
      '/about',
      '/jobs',
      '/location',
    ],
    httpContracts: [
      tenantMenuIndexRedirectContract('/menus', '/pizza-snacks-drinks'),
      menuIndexApiContract('/api/menus?limit=24', 'tenant', {
        menuId: 'pizza-snacks-drinks',
      }),
      tenantMenuBrowseContract('/pizza-snacks-drinks'),
      tenantMenuOrderContract('/pizza-snacks-drinks.collection'),
      tenantMenuQrContract('/pizza-snacks-drinks/qr', '/pizza-snacks-drinks'),
      tenantMenuQrContract(
        '/pizza-snacks-drinks.collection/qr',
        '/pizza-snacks-drinks.collection',
        { context: 'collection' }
      ),
      kitchenCollectionRecoveryContract(
        '/kitchens/baeren-ringgenberg.collection',
        '/kitchens/baeren-ringgenberg',
        'Bären'
      ),
      tenantMenuIndexRedirectContract(
        '/menus/pizza-snacks-drinks',
        '/pizza-snacks-drinks'
      ),
      tenantMenuIndexRedirectContract(
        '/menus/pizza-snacks-drinks.collection',
        '/pizza-snacks-drinks.collection'
      ),
      tenantMenuIndexRedirectContract(
        '/menus/pizza-snacks-drinks/qr',
        '/pizza-snacks-drinks/qr'
      ),
      tenantMenuIndexRedirectContract(
        '/menus/pizza-snacks-drinks.collection/qr',
        '/pizza-snacks-drinks.collection/qr'
      ),
      tenantMenuQrContract(
        '/pizza-snacks-drinks.delivery/qr',
        '/pizza-snacks-drinks.delivery',
        { context: 'delivery' }
      ),
      tenantMissingMenuBrowseContract('/main'),
      tenantUnavailableMenuOrderContract('/main.collection', 'Menu not found'),
      missingMenuQrContract('/main/qr'),
      missingMenuIndexContract('/kitchens/baeren-ringgenberg/menus'),
      tenantMissingMenuBrowseContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks'
      ),
      tenantMenuOrderContract('/pizza-snacks-drinks.delivery', {
        context: 'delivery',
      }),
    ],
    launchOrder: 17,
  },
  'bangin-coffee': {
    key: 'bangin-coffee',
    name: 'Bangin Coffee',
    appId: 'bangin-coffee',
    ecosystem: 'misebox',
    databaseId: 'misebox',
    role: 'tenant',
    workspace: './projects/misebox/bangin-coffee',
    port: 3016,
    workspaces: [],
    toolProviders: ['go-qr'],
    smokeRoutes: ['/', '/contact'],
    launchOrder: 16,
  },
  friiites: {
    key: 'friiites',
    name: 'Friiites',
    appId: 'friiites',
    ecosystem: 'misebox',
    databaseId: 'misebox',
    role: 'tenant',
    workspace: './projects/misebox/friiites',
    port: 3033,
    workspaces: ['kitchen'],
    toolProviders: ['go-qr'],
    smokeRoutes: ['/', '/kitchens', '/menus'],
    launchOrder: 19,
  },
  'interlaken-essen': {
    key: 'interlaken-essen',
    name: 'Interlaken Essen',
    appId: 'interlaken-essen',
    ecosystem: 'misebox',
    databaseId: 'misebox',
    role: 'tenant',
    workspace: './projects/misebox/interlaken-essen',
    port: 3026,
    workspaces: [],
    smokeRoutes: ['/', '/mis', '/users'],
    httpContracts: [
      seoPageContract('/', {
        title: 'Interlaken Essen',
        description:
          'Lokals Futter choufe und verchoufe oder Gastro-Jobs rund um Interlake finde.',
        canonical: 'https://interlaken-essen.misebox.app/',
        robots: 'index, follow',
        image: 'https://interlaken-essen.misebox.app/img/app/cover.png',
        jsonLdTypes: ['Organization', 'WebSite', 'WebPage'],
        jsonLdIncludes: ['"inLanguage":"gsw-CH"'],
      }),
    ],
    launchOrder: 18,
  },
}

export const APP_GROUPS = {
  all: ['fireux', 'misebox', 'werkbox'],
  'all-extended': ['fireux', 'misebox', 'werkbox', 'richies', 'tenant'],
  full: [
    'fireux',
    'misebox',
    'werkbox',
    'richies',
    'tenant',
    'bringli',
    'find-my-seo',
    'sproochli',
    'buenohost',
    'book-with-nats',
    'ausfinn-apartments',
    'go-qr',
    'fireux-blank',
    'slap',
    'yellow-velo',
    'holzworm',
    'granite',
    'la-tap-berne',
    'bangin-coffee',
    'friiites',
    'baeren-ringgenberg',
    'interlaken-essen',
  ],
}

export const APP_KEYS = Object.keys(APP_REGISTRY)

export function getAppRegistryEntry(key) {
  const app = APP_REGISTRY[key]

  if (!app) {
    throw new Error(
      `[app-registry] Unknown app "${key}". Expected one of: ${APP_KEYS.join(', ')}`
    )
  }

  const smokeRoutes = app.smokeRoutes?.length
    ? unique(app.smokeRoutes)
    : unique([...SHARED_ROUTES, ...workspaceRoutes(app.workspaces)])

  return {
    ...app,
    filter: app.workspace,
    baseUrl: `http://localhost:${app.port}`,
    smokeRoutes,
    componentSmokeRoutes: unique(app.componentSmokeRoutes ?? smokeRoutes),
  }
}

export function getAppRegistryEntries(keys) {
  if (!keys?.length) return APP_KEYS.map((key) => getAppRegistryEntry(key))
  return keys.map((key) => getAppRegistryEntry(key))
}

export function getAppGroupKeys(group) {
  const keys = APP_GROUPS[group]

  if (!keys) {
    throw new Error(
      `[app-registry] Unknown app group "${group}". Expected one of: ${Object.keys(APP_GROUPS).join(', ')}`
    )
  }

  return [...keys]
}

export function getAppGroupEntries(group) {
  return getAppRegistryEntries(getAppGroupKeys(group))
}
