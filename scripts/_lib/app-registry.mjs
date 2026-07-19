// @fireux-script
// last_used: 2026-07-19
// usage_note: canonical app routes and HTTP smoke contracts.
const SHARED_ROUTES = ['/', '/dashboard', '/dashboard/user-profile']
const appDetailContract = (route, appId) => ({
  route,
  status: 200,
  contentType: 'text/html',
  includes: ['data-app-projection="detail"', `data-app-id="${appId}"`],
  excludes: ['App not found', 'App unavailable', 'Loading app…'],
})
const MENU_INDEX_MARKER = 'data-menu-projection="index"'
const MENU_BROWSE_MARKER = 'data-menu-projection="browse"'
const MENU_ORDER_MARKER = 'data-menu-projection="order"'
const MENU_UNAVAILABLE_MARKER = 'data-menu-state="unavailable"'
const MENU_JSON_MARKER = 'data-menu-projection="diagnostic"'
const MENU_QR_MARKER = 'data-menu-projection="qr"'
const MENU_LAYOUT_MARKER = 'data-menu-layout="package"'

const menuIndexContract = (route, options = {}) => ({
  route,
  status: 200,
  contentType: 'text/html',
  includes: [
    MENU_INDEX_MARKER,
    ...(options.kind ? [`data-menu-index-kind="${options.kind}"`] : []),
    ...(options.featuredPath
      ? [`data-menu-path="${options.featuredPath}"`]
      : []),
  ],
  excludes: [
    MENU_ORDER_MARKER,
    MENU_UNAVAILABLE_MARKER,
    MENU_JSON_MARKER,
    'data-menu-theme-canvas="true"',
    'data-menu-qr-path=',
    'data-menu-action="qr"',
    'View QR code',
    ...(options.featuredPath ? [`href="${options.featuredPath}/qr"`] : []),
  ],
})

const tenantMenuIndexRedirectContract = (route, location) => ({
  route,
  status: 302,
  location,
  excludes: [
    MENU_INDEX_MARKER,
    MENU_BROWSE_MARKER,
    MENU_ORDER_MARKER,
    MENU_UNAVAILABLE_MARKER,
    MENU_JSON_MARKER,
  ],
})

const menuIndexApiContract = (route, scopeKind, options = {}) => ({
  route,
  status: 200,
  contentType: 'application/json',
  includes: [
    '"scope"',
    `"kind": "${scopeKind}"`,
    '"items"',
    '"nextCursor"',
    ...(options.menuId ? [`"id": "${options.menuId}"`] : []),
    ...(options.kitchenName ? ['"kitchen_name"'] : []),
  ],
})

const invalidMenuIndexCursorContract = (route) => ({
  route,
  status: 400,
  contentType: 'application/json',
  includes: ['"statusCode": 400', '"statusMessage": "Menu cursor is invalid."'],
})

const missingMenuIndexContract = (route) => ({
  route,
  status: 404,
  contentType: 'text/html',
  noindex: true,
  includes: [MENU_INDEX_MARKER, MENU_UNAVAILABLE_MARKER, 'Menus unavailable'],
  excludes: [MENU_BROWSE_MARKER, MENU_ORDER_MARKER, MENU_JSON_MARKER],
})

const menuBrowseContract = (route, options = {}) => {
  const indexPath = options.indexPath ?? route.slice(0, route.lastIndexOf('/'))
  const menuId = route.slice(route.lastIndexOf('/') + 1)
  const renderKind = options.renderKind || 'structured'
  const exitKind = options.exitKind || 'back'
  const exitPath = options.exitPath || indexPath

  return {
    route,
    status: 200,
    contentType: 'text/html',
    ...(options.assertNoindex === false ? {} : { noindex: false }),
    includes: [
      MENU_LAYOUT_MARKER,
      MENU_BROWSE_MARKER,
      `data-menu-id="${menuId}"`,
      `data-menu-render-kind="${renderKind}"`,
      `data-menu-index-path="${indexPath}"`,
      `data-menu-path="${route}"`,
      'data-menu-theme-canvas="true"',
      'data-menu-action="exit"',
      `data-menu-exit-kind="${exitKind}"`,
      `href="${exitPath}"`,
      ...(renderKind === 'structured'
        ? [
            'data-menu-identity="kitchen-menu"',
            'data-menu-item="true"',
            'data-menu-item-mode="read-only"',
          ]
        : []),
      ...(options.itemIncludes || []),
    ],
    excludes: [
      MENU_ORDER_MARKER,
      MENU_UNAVAILABLE_MARKER,
      MENU_JSON_MARKER,
      'data-menu-qr-path=',
      'data-menu-action="index"',
      'data-menu-action="qr"',
      `href="${route}/qr"`,
      'menu-browse__back',
      'View QR code',
      'menu-order-funnel',
      'menu-item__add',
      'data-menu-order-catalogue=',
      'data-menu-order-basket=',
      'data-menu-action="review-basket"',
      'data-menu-order-checkout="shared"',
      'data-menu-item-mode="selectable"',
      'data-menu-action="add-item"',
      'data-menu-action="configure-item"',
      'data-menu-action="add-to-basket"',
      ...(renderKind === 'structured'
        ? ['data-menu-document-kind=']
        : ['data-menu-item="true"']),
      ...(options.itemExcludes || []),
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

const missingMenuBrowseContract = (route, excludes = [], options = {}) => {
  const indexPath = route.slice(0, route.lastIndexOf('/'))
  const exitKind = options.exitKind || 'back'
  const exitPath = options.exitPath || indexPath

  return {
    route,
    status: 404,
    contentType: 'text/html',
    noindex: true,
    includes: [
      MENU_LAYOUT_MARKER,
      MENU_BROWSE_MARKER,
      MENU_UNAVAILABLE_MARKER,
      'Menu not found',
      'data-menu-theme-canvas="true"',
      'data-menu-action="exit"',
      `data-menu-exit-kind="${exitKind}"`,
      `href="${exitPath}"`,
    ],
    excludes: [
      MENU_ORDER_MARKER,
      MENU_JSON_MARKER,
      'data-menu-qr-path=',
      'data-menu-action="qr"',
      `href="${route}/qr"`,
      'View QR code',
      ...excludes,
    ],
  }
}

const menuQrContract = (route, targetPath, options = {}) => {
  const indexPath =
    options.indexPath ?? targetPath.slice(0, targetPath.lastIndexOf('/'))
  const contextualId = targetPath.slice(targetPath.lastIndexOf('/') + 1)
  const context = options.context || 'generic'
  const menuId =
    options.menuId ||
    (context !== 'generic' && contextualId.endsWith(`.${context}`)
      ? contextualId.slice(0, -(context.length + 1))
      : contextualId)
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
      `data-menu-context="${context}"`,
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
      MENU_ORDER_MARKER,
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
    MENU_ORDER_MARKER,
    MENU_JSON_MARKER,
    'data-menu-id=',
    'data-menu-render-kind=',
    'data-menu-target-path=',
    'data-menu-qr-image',
    ...excludes,
  ],
})

const menuOrderContract = (route, options = {}) => {
  const indexPath = options.indexPath ?? route.slice(0, route.lastIndexOf('/'))
  const contextualId = route.slice(route.lastIndexOf('/') + 1)
  const context = options.context || 'collection'
  const contextSuffix = `.${context}`
  const menuId = contextualId.endsWith(contextSuffix)
    ? contextualId.slice(0, -contextSuffix.length)
    : contextualId
  const contextLabel =
    context === 'pre_order'
      ? 'Pre-order'
      : `${context[0].toUpperCase()}${context.slice(1)}`
  const exitKind = options.exitKind || 'back'
  const exitPath = options.exitPath || indexPath

  return {
    route,
    status: 200,
    contentType: 'text/html',
    noindex: true,
    includes: [
      MENU_LAYOUT_MARKER,
      MENU_ORDER_MARKER,
      `data-menu-context="${context}"`,
      `data-menu-id="${menuId}"`,
      `data-menu-index-path="${indexPath}"`,
      `data-menu-order-type="${context}"`,
      'data-menu-ordering-enabled="true"',
      `data-menu-path="${route}"`,
      'data-menu-render-kind="structured"',
      'data-menu-state="ready"',
      'data-menu-surface-theme="menu"',
      'data-menu-theme-canvas="true"',
      'data-menu-action="exit"',
      `data-menu-exit-kind="${exitKind}"`,
      `href="${exitPath}"`,
      contextLabel,
      'data-menu-order-catalogue="selectable"',
      'data-menu-item="true"',
      'data-menu-item-mode="selectable"',
      'data-menu-action="add-item"',
      'data-menu-order-basket="local"',
      'data-menu-basket-persistence="none"',
      'data-menu-basket-state="empty"',
      'data-menu-basket-quantity="0"',
      'data-menu-basket-total="0.00"',
      'data-menu-action="review-basket"',
    ],
    excludes: [
      MENU_INDEX_MARKER,
      MENU_BROWSE_MARKER,
      MENU_UNAVAILABLE_MARKER,
      MENU_JSON_MARKER,
      MENU_QR_MARKER,
      'data-menu-document-kind=',
      'menu-order-funnel',
      'menu-item__add',
      'data-menu-action="submit-order"',
      'data-menu-action="checkout"',
    ],
  }
}

const unavailableMenuOrderContract = (route, title, options = {}) => {
  const indexPath = route.slice(0, route.lastIndexOf('/'))
  const exitKind = options.exitKind || 'back'
  const exitPath = options.exitPath || indexPath
  const context = options.context || 'collection'

  return {
    route,
    status: 404,
    contentType: 'text/html',
    noindex: true,
    includes: [
      MENU_LAYOUT_MARKER,
      MENU_ORDER_MARKER,
      MENU_UNAVAILABLE_MARKER,
      `data-menu-context="${context}"`,
      `data-menu-order-type="${context}"`,
      'data-menu-ordering-enabled="false"',
      'data-menu-surface-theme="app"',
      'data-menu-theme-canvas="true"',
      'data-menu-action="exit"',
      `data-menu-exit-kind="${exitKind}"`,
      `href="${exitPath}"`,
      title,
      ...(options.browsePath
        ? [
            'data-menu-action="browse"',
            `href="${options.browsePath}"`,
            'See other options',
          ]
        : []),
      ...(options.kitchenPath
        ? [
            'data-menu-action="kitchen"',
            `href="${options.kitchenPath}"`,
            'Contact the kitchen',
          ]
        : []),
    ],
    excludes: [
      MENU_INDEX_MARKER,
      MENU_BROWSE_MARKER,
      MENU_JSON_MARKER,
      MENU_QR_MARKER,
      'data-menu-state="ready"',
      'data-menu-id=',
      'data-menu-render-kind=',
      'data-menu-document-kind=',
      'data-menu-item="true"',
      'data-menu-order-catalogue=',
      'data-menu-order-basket=',
      'data-menu-action="configure-item"',
      'data-menu-action="add-to-basket"',
      'data-menu-action="review-basket"',
      'menu-order-funnel',
      'menu-item__add',
      'type="submit"',
      '/orders',
      'Error 404',
      ...(options.noRecovery
        ? ['data-menu-action="browse"', 'data-menu-action="kitchen"']
        : []),
    ],
  }
}

const kitchenCollectionRecoveryContract = (
  route,
  kitchenPath,
  kitchenName
) => ({
  route,
  status: 404,
  contentType: 'text/html',
  noindex: true,
  includes: [
    MENU_LAYOUT_MARKER,
    MENU_UNAVAILABLE_MARKER,
    'data-kitchen-projection="collection-unavailable"',
    'data-menu-surface-theme="kitchen"',
    'data-menu-theme-canvas="true"',
    'data-menu-action="exit"',
    'data-menu-exit-kind="back"',
    'data-menu-action="browse"',
    `href="${kitchenPath}"`,
    kitchenName,
    'Collection unavailable',
    'See other options',
  ],
  excludes: [
    MENU_INDEX_MARKER,
    MENU_BROWSE_MARKER,
    MENU_ORDER_MARKER,
    MENU_JSON_MARKER,
    MENU_QR_MARKER,
    'data-menu-action="kitchen"',
    'data-menu-state="ready"',
    'data-menu-order-catalogue=',
    'data-menu-order-basket=',
    'type="submit"',
    '/orders',
    'Error 404',
    'Kitchen not found',
  ],
})

// AppShell currently owns tenant-wide noindex. Valid tenant Menu SEO is
// intentionally left to the later canonical-route/SEO pass.
const tenantMenuBrowseContract = (route) =>
  menuBrowseContract(route, {
    assertNoindex: false,
    indexPath: '/menus',
    exitKind: 'close',
    exitPath: '/',
  })
const tenantMissingMenuBrowseContract = (route, excludes = []) =>
  missingMenuBrowseContract(route, excludes, {
    exitKind: 'close',
    exitPath: '/',
  })
const tenantMenuOrderContract = (route, options = {}) =>
  menuOrderContract(route, {
    ...options,
    indexPath: '/menus',
    exitKind: 'close',
    exitPath: '/',
  })
const tenantUnavailableMenuOrderContract = (route, title, options = {}) =>
  unavailableMenuOrderContract(route, title, {
    ...options,
    exitKind: 'close',
    exitPath: '/',
  })
const tenantMenuQrContract = (route, targetPath, options = {}) =>
  menuQrContract(route, targetPath, { ...options, indexPath: '/menus' })

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
  all: ['fireux', 'misebox', 'cleanbox'],
  'all-extended': ['fireux', 'misebox', 'cleanbox', 'richies', 'tenant'],
  full: [
    'fireux',
    'misebox',
    'cleanbox',
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
