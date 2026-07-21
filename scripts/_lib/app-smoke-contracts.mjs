// @fireux-script
// last_used: 2026-07-21
// usage_note: pure HTTP smoke-contract builders used by the canonical app registry.
// Concurrent edit — 2026-07-20 11:50 CEST — Root Efficiency Pass 3 of 4: separate smoke-contract mechanics from app registry data.
// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: assert bounded DTO shape and private-field exclusion.
// Concurrent edit — 2026-07-21 15:35 CEST — Misebox startup verification: scope unavailable-order checks to package-owned surface markers.

const MENU_INDEX_MARKER = 'data-menu-projection="index"'
const MENU_BROWSE_MARKER = 'data-menu-projection="browse"'
const MENU_ORDER_MARKER = 'data-menu-projection="order"'
const MENU_UNAVAILABLE_MARKER = 'data-menu-state="unavailable"'
const MENU_JSON_MARKER = 'data-menu-projection="diagnostic"'
const MENU_QR_MARKER = 'data-menu-projection="qr"'
const MENU_LAYOUT_MARKER = 'data-menu-layout="package"'

const appDetailContract = (route, appId) => ({
  route,
  status: 200,
  contentType: 'text/html',
  includes: ['data-app-projection="detail"', `data-app-id="${appId}"`],
  excludes: ['App not found', 'App unavailable', 'Loading app…'],
})

const profileIndexApiContract = (route) => ({
  route,
  status: 200,
  contentType: 'application/json',
  includes: ['"ok"', '"items"'],
  excludes: [
    '"email"',
    '"preferences"',
    '"terms"',
    '"role"',
    '"is_premium"',
    '"app_ids"',
    '"driver_phone"',
    '"active_kitchen_ids"',
    '"kitchen_links"',
  ],
})

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

export {
  appDetailContract,
  invalidMenuIndexCursorContract,
  kitchenCollectionRecoveryContract,
  menuBrowseContract,
  menuDocumentContract,
  menuDocumentFileContract,
  menuIndexApiContract,
  menuIndexContract,
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
}
