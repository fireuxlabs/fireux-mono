// @fireux-script
// last_used: 2026-07-17
// usage_note: baseline after scripts cleanup; update when run.
const SHARED_ROUTES = ['/', '/dashboard', '/dashboard/user-profile']
const MENU_INDEX_MARKER = 'data-menu-projection="index"'
const MENU_BROWSE_MARKER = 'data-menu-projection="browse"'
const MENU_UNAVAILABLE_MARKER = 'data-menu-state="unavailable"'
const MENU_JSON_MARKER = 'data-menu-projection="diagnostic"'
const MENU_QR_MARKER = 'data-menu-projection="qr"'

const menuIndexContract = (route, options = {}) => ({
  route,
  status: 200,
  contentType: 'text/html',
  includes: [
    MENU_INDEX_MARKER,
    ...(options.kind ? [`data-menu-index-kind="${options.kind}"`] : []),
    ...(options.featuredPath
      ? [
          `data-menu-path="${options.featuredPath}"`,
          `data-menu-qr-path="${options.featuredPath}/qr"`,
          `href="${options.featuredPath}/qr"`,
        ]
      : []),
  ],
  excludes: [MENU_UNAVAILABLE_MARKER, MENU_JSON_MARKER],
})

const missingMenuIndexContract = (route) => ({
  route,
  status: 404,
  contentType: 'text/html',
  noindex: true,
  includes: [MENU_INDEX_MARKER, MENU_UNAVAILABLE_MARKER, 'Menus unavailable'],
  excludes: [MENU_BROWSE_MARKER, MENU_JSON_MARKER],
})

const menuBrowseContract = (route, options = {}) => {
  const indexPath = route.slice(0, route.lastIndexOf('/'))
  const menuId = route.slice(route.lastIndexOf('/') + 1)
  const renderKind = options.renderKind || 'structured'

  return {
    route,
    status: 200,
    contentType: 'text/html',
    ...(options.assertNoindex === false ? {} : { noindex: false }),
    includes: [
      MENU_BROWSE_MARKER,
      `data-menu-id="${menuId}"`,
      `data-menu-render-kind="${renderKind}"`,
      `data-menu-index-path="${indexPath}"`,
      `data-menu-path="${route}"`,
      `data-menu-qr-path="${route}/qr"`,
      'data-menu-action="index"',
      'data-menu-action="qr"',
      `href="${indexPath}"`,
      `href="${route}/qr"`,
      ...(renderKind === 'structured'
        ? ['data-menu-identity="kitchen-menu"']
        : []),
    ],
    excludes: [
      MENU_UNAVAILABLE_MARKER,
      MENU_JSON_MARKER,
      ...(renderKind === 'structured' ? ['data-menu-document-kind='] : []),
    ],
  }
}

const menuDocumentContract = (route, fileKind, fileRoute) => {
  const browse = menuBrowseContract(route, { renderKind: 'document' })

  return {
    ...browse,
    includes: [
      ...browse.includes,
      'data-menu-identity="menu"',
      `data-menu-document-kind="${fileKind}"`,
      fileRoute,
      'Open original',
    ],
    excludes: [
      ...browse.excludes,
      'data-menu-identity="kitchen-menu"',
      'firebasestorage.googleapis.com',
    ],
  }
}

const menuDocumentFileContract = (route, contentType) => ({
  route,
  status: 200,
  contentType,
})

const missingMenuBrowseContract = (route, excludes = []) => ({
  route,
  status: 404,
  contentType: 'text/html',
  noindex: true,
  includes: [MENU_BROWSE_MARKER, MENU_UNAVAILABLE_MARKER, 'Menu not found'],
  excludes: [MENU_JSON_MARKER, ...excludes],
})

const menuQrContract = (route, targetPath, options = {}) => {
  const indexPath = targetPath.slice(0, targetPath.lastIndexOf('/'))
  const menuId = targetPath.slice(targetPath.lastIndexOf('/') + 1)
  const renderKind = options.renderKind || 'structured'

  return {
    route,
    status: 200,
    contentType: 'text/html',
    noindex: true,
    includes: [
      MENU_QR_MARKER,
      'data-menu-state="ready"',
      `data-menu-id="${menuId}"`,
      `data-menu-render-kind="${renderKind}"`,
      `data-menu-target-path="${targetPath}"`,
      'data-menu-action="index"',
      'data-menu-action="menu"',
      'data-menu-action="print"',
      `href="${indexPath}"`,
      `href="${targetPath}"`,
      'Open menu',
      'Print QR',
    ],
    excludes: [
      MENU_UNAVAILABLE_MARKER,
      MENU_BROWSE_MARKER,
      MENU_JSON_MARKER,
    ],
  }
}

const missingMenuQrContract = (route, excludes = []) => ({
  route,
  status: 404,
  contentType: 'text/html',
  noindex: true,
  includes: [
    MENU_QR_MARKER,
    MENU_UNAVAILABLE_MARKER,
    'Menu not found',
    'Back to menus',
  ],
  excludes: [
    MENU_BROWSE_MARKER,
    MENU_JSON_MARKER,
    'data-menu-id=',
    'data-menu-render-kind=',
    'data-menu-target-path=',
    'data-menu-qr-image',
    ...excludes,
  ],
})

const menuJsonContract = (route, context, options = {}) => ({
  route,
  status: 200,
  contentType: 'text/html',
  ...(options.assertNoindex === false ? {} : { noindex: false }),
  includes: [
    MENU_JSON_MARKER,
    `data-menu-context="${context}"`,
    ...(options.kitchenSlug
      ? [`data-kitchen-slug="${options.kitchenSlug}"`]
      : []),
  ],
  excludes: [MENU_BROWSE_MARKER, MENU_UNAVAILABLE_MARKER],
})

// AppShell currently owns tenant-wide noindex. Valid tenant Menu SEO is
// intentionally left to the later canonical-route/SEO pass.
const tenantMenuBrowseContract = (route) =>
  menuBrowseContract(route, { assertNoindex: false })
const tenantMenuJsonContract = (route, context) =>
  menuJsonContract(route, context, { assertNoindex: false })

const missingMenuJsonContract = (route) => ({
  route,
  status: 200,
  contentType: 'text/html',
  noindex: false,
  includes: [MENU_JSON_MARKER, '&quot;error&quot;: true', 'Menu not found'],
  excludes: [MENU_BROWSE_MARKER, MENU_UNAVAILABLE_MARKER],
})

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
      '/console/project/team',
      '/console/project/apps',
      '/console/project/ecosystem',
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
    httpContracts: [
      menuIndexContract('/menus', { kind: 'collection' }),
      menuDocumentContract(
        '/menus/bergwelt-grindelwald-pdf',
        'pdf',
        '/api/menus/bergwelt-grindelwald-pdf/file'
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
      menuBrowseContract('/menus/la-tapberne-main'),
      menuBrowseContract('/menus/indian-gourmet-restaurant-pizzeria-main'),
      menuBrowseContract('/menus/luna-piccante-main-menu'),
      menuBrowseContract('/menus/pizza-menu'),
      menuBrowseContract('/menus/pizza-snacks-drinks'),
      menuQrContract(
        '/menus/pizza-snacks-drinks/qr',
        '/menus/pizza-snacks-drinks'
      ),
      missingMenuBrowseContract('/menus/fireux-route-contract-missing'),
      missingMenuBrowseContract('/menus/__fireux_route_contract_invalid__', [
        'INVALID_ARGUMENT',
        'Resource id',
        '@grpc',
      ]),
      missingMenuBrowseContract(
        '/menus/__fireux%0Aroute_contract_invalid__',
        ['INVALID_ARGUMENT', 'Resource id', '@grpc']
      ),
      missingMenuQrContract('/menus/fireux-route-contract-missing/qr'),
      missingMenuQrContract('/menus/__fireux_route_contract_invalid__/qr', [
        'INVALID_ARGUMENT',
        'Resource id',
        '@grpc',
      ]),
      missingMenuQrContract('/menus/pizza-snacks-drinks.delivery/qr'),
      menuIndexContract('/kitchens/baeren-ringgenberg/menus', {
        kind: 'featured',
        featuredPath:
          '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks',
      }),
      menuBrowseContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks'
      ),
      menuQrContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks/qr',
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks'
      ),
      missingMenuBrowseContract(
        '/kitchens/baeren-ringgenberg/menus/fireux-route-contract-missing'
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
      missingMenuQrContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks.delivery/qr'
      ),
      menuJsonContract('/menus/pizza-snacks-drinks.delivery', 'delivery'),
      missingMenuJsonContract(
        '/menus/fireux-route-contract-missing.delivery'
      ),
      menuJsonContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks.delivery',
        'delivery',
        { kitchenSlug: 'baeren-ringgenberg' }
      ),
      missingMenuJsonContract(
        '/kitchens/baeren-ringgenberg/menus/fireux-route-contract-missing.delivery'
      ),
    ],
    launchOrder: 2,
  },
  cleanbox: {
    key: 'cleanbox',
    name: 'Cleanbox',
    appId: 'cleanbox-app',
    ecosystem: 'cleanbox',
    databaseId: 'cleanbox',
    role: 'global',
    workspace: './projects/cleanbox/cleanbox-app',
    port: 3002,
    consoles: [],
    launchOrder: 3,
  },
  richies: {
    key: 'richies',
    name: 'Richies Reinigung',
    appId: 'richies-reinigung',
    ecosystem: 'cleanbox',
    databaseId: 'cleanbox',
    role: 'tenant',
    workspace: './projects/cleanbox/richies-reinigung',
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
      '/bnb',
      '/info',
      '/menus',
      '/info/bern-bike-rental/rental-instructions',
      '/bnb/holiday-with-nats',
      '/bnb/holiday-with-nats/wifi',
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
      '/properties/holiday-with-nats',
      '/properties/holiday-with-nats/companion',
      '/properties/holiday-with-nats/companion/check-in',
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
    smokeRoutes: ['/', '/about', '/get-started', '/products', '/blog', '/console'],
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
      menuIndexContract('/menus', {
        kind: 'featured',
        featuredPath: '/menus/main',
      }),
      tenantMenuBrowseContract('/menus/main'),
      menuQrContract('/menus/main/qr', '/menus/main'),
      missingMenuQrContract('/menus/main.pre_order/qr'),
      missingMenuBrowseContract('/menus/pizza-snacks-drinks'),
      missingMenuQrContract('/menus/pizza-snacks-drinks/qr'),
      missingMenuIndexContract('/kitchens/la-tapberne/menus'),
      missingMenuBrowseContract('/kitchens/la-tapberne/menus/main'),
      missingMenuQrContract('/kitchens/la-tapberne/menus/main/qr'),
      tenantMenuJsonContract('/menus/main.pre_order', 'pre_order'),
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
    smokeRoutes: ['/', '/hotel', '/menu', '/events', '/about', '/jobs', '/location'],
    httpContracts: [
      menuIndexContract('/menus', {
        kind: 'featured',
        featuredPath: '/menus/pizza-snacks-drinks',
      }),
      tenantMenuBrowseContract('/menus/pizza-snacks-drinks'),
      menuQrContract(
        '/menus/pizza-snacks-drinks/qr',
        '/menus/pizza-snacks-drinks'
      ),
      missingMenuQrContract('/menus/pizza-snacks-drinks.delivery/qr'),
      missingMenuBrowseContract('/menus/main'),
      missingMenuQrContract('/menus/main/qr'),
      missingMenuIndexContract('/kitchens/baeren-ringgenberg/menus'),
      missingMenuBrowseContract(
        '/kitchens/baeren-ringgenberg/menus/pizza-snacks-drinks'
      ),
      tenantMenuJsonContract(
        '/menus/pizza-snacks-drinks.delivery',
        'delivery'
      ),
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
  all: ['fireux', 'misebox', 'cleanbox'],
  'all-extended': ['fireux', 'misebox', 'cleanbox', 'richies', 'tenant'],
  full: ['fireux', 'misebox', 'cleanbox', 'richies', 'tenant', 'bringli', 'find-my-seo', 'sproochli', 'buenohost', 'go-qr', 'fireux-blank', 'slap', 'yellow-velo', 'granite', 'la-tap-berne', 'bangin-coffee', 'baeren-ringgenberg'],
}

export const APP_KEYS = Object.keys(APP_REGISTRY)

export function getAppRegistryEntry(key) {
  const app = APP_REGISTRY[key]

  if (!app) {
    throw new Error(`[app-registry] Unknown app "${key}". Expected one of: ${APP_KEYS.join(', ')}`)
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
    throw new Error(`[app-registry] Unknown app group "${group}". Expected one of: ${Object.keys(APP_GROUPS).join(', ')}`)
  }

  return [...keys]
}

export function getAppGroupEntries(group) {
  return getAppRegistryEntries(getAppGroupKeys(group))
}
