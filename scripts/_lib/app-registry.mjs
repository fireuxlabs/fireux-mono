// @fireux-script
// last_used: 2026-07-22
// usage_note: canonical app identity, routes, and smoke-contract assignments.
// Concurrent edit — 2026-07-21 12:29 CEST — Cleanbox-to-Werkbox registration cutover: point local launch authority at the additive Werkbox apps.
// Concurrent edit — 2026-07-21 13:08 CEST — Operations catalogue: require the shared route across registered apps.
// Concurrent edit — 2026-07-20 11:50 CEST — Root Efficiency Pass 3 of 4: keep registry data separate from smoke-contract mechanics.
// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: require four Misebox directory APIs.
// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: retire personal BNB routes and smoke only sanitized simulations.
// Concurrent edit — 2026-07-22 10:47 CEST — Kiosk presentation pass: register the Indian Gourmet terminal entry contract.
// Concurrent edit — 2026-07-22 12:47 CEST — Jobs smoke alignment: cover the shared public Jobs route and projection in both global apps.
// Concurrent edit — 2026-07-22 12:49 CEST — Ignition delivery pass: smoke the new FireUX request queue route.

import {
  appDetailContract,
  invalidMenuIndexCursorContract,
  jobIndexApiContract,
  kitchenCollectionRecoveryContract,
  menuBrowseContract,
  menuDocumentContract,
  menuDocumentFileContract,
  menuIndexApiContract,
  menuIndexContract,
  menuKioskContract,
  menuOrderContract,
  menuQrContract,
  missingMenuBrowseContract,
  missingMenuIndexContract,
  missingMenuQrContract,
  profileIndexApiContract,
  tenantMenuBrowseContract,
  tenantMenuIndexRedirectContract,
  tenantMenuOrderContract,
  tenantMenuQrContract,
  tenantMissingMenuBrowseContract,
  tenantUnavailableMenuOrderContract,
  unavailableMenuOrderContract,
} from './app-smoke-contracts.mjs'

const SHARED_ROUTES = ['/', '/operations', '/dashboard', '/dashboard/user-profile']

// Registry consoles are smoke-test route segments.
// Console family keys and route segments are singular:
// `project`, `property`, `kitchen`, `portfolio`, and `supplier`.
function unique(values) {
  return [...new Set(values)]
}

function consoleRoutes(families = []) {
  if (!families.length) return []

  const routes = ['/console']

  for (const family of families) {
    routes.push(`/console/${family}`)
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
    consoles: ['project'],
    smokeRoutes: [
      ...SHARED_ROUTES,
      ...consoleRoutes(['project']),
      '/console/project/identity',
      '/console/project/overview',
      '/console/project/apps',
      '/console/project/ecosystem',
      '/console/project/ignitions',
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
    consoles: ['kitchen', 'supplier'],
    toolProviders: ['go-qr'],
    componentSmokeRoutes: [
      '/console/kitchen',
      '/console/kitchen/identity',
      '/console/kitchen/mise',
      '/console/kitchen/ingredients',
      '/console/kitchen/suppliers',
      '/console/kitchen/menus',
      '/console/kitchen/dishes',
      '/console/kitchen/recipes',
      '/console/supplier',
    ],
    smokeRoutes: [
      ...SHARED_ROUTES,
      ...consoleRoutes(['kitchen', 'supplier']),
      '/jobs',
    ],
    httpContracts: [
      jobIndexApiContract('/api/public/jobs?limit=1'),
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
      menuKioskContract(
        '/menus/indian-gourmet-restaurant-pizzeria-main.kiosk'
      ),
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
      menuBrowseContract('/menus/luna-piccante-main-menu'),
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
    consoles: [],
    smokeRoutes: [...SHARED_ROUTES, '/jobs'],
    httpContracts: [jobIndexApiContract('/api/public/jobs?limit=1')],
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
    consoles: [],
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
    consoles: [],
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
    consoles: ['supplier'],
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
    consoles: [],
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
    consoles: [],
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
    ecosystem: 'fireux',
    databaseId: 'buenohost',
    role: 'standalone',
    workspace: './projects/fireux/buenohost',
    port: 3012,
    consoles: ['property'],
    smokeRoutes: [
      '/',
      '/chat',
      '/properties/preview-stay',
      '/properties/preview-stay/info',
      '/properties/preview-stay/info/check-in',
      '/console/property',
    ],
    launchOrder: 9,
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
    consoles: [],
    toolProviders: ['go-qr'],
    smokeRoutes: ['/'],
    launchOrder: 10,
  },
  'fireux-blank': {
    key: 'fireux-blank',
    name: 'FireUX Blank',
    appId: 'fireux-blank',
    ecosystem: 'fireux',
    databaseId: 'fireux',
    role: 'standalone',
    workspace: './projects/fireux/fireux-blank',
    port: 3015,
    consoles: ['blank'],
    smokeRoutes: ['/', '/console', '/console/blank'],
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
    consoles: [],
    smokeRoutes: ['/', '/bikes', '/merch', '/products', '/blog'],
    launchOrder: 12,
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
    consoles: ['portfolio'],
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
    consoles: [],
    smokeRoutes: [
      '/',
      '/about',
      '/get-started',
      '/products',
      '/blog',
      '/console',
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
    consoles: ['kitchen'],
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
      tenantMenuOrderContract('/main.pre_order', {
        context: 'pre_order',
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
    consoles: ['kitchen'],
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
    consoles: [],
    toolProviders: ['go-qr'],
    smokeRoutes: ['/', '/contact'],
    launchOrder: 16,
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
    'go-qr',
    'fireux-blank',
    'slap',
    'yellow-velo',
    'granite',
    'la-tap-berne',
    'bangin-coffee',
    'baeren-ringgenberg',
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
    : unique([...SHARED_ROUTES, ...consoleRoutes(app.consoles)])

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
