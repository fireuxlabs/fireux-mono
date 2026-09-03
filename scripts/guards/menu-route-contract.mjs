// @fireux-script
// last_used: 2026-07-19
// usage_note: run through pnpm guard; locks Menu route grammar and projections.

// Concurrent edit — 2026-07-19 17:33 CEST — Kiosk pass: lock the canonical Kiosk order projection.

import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { MenuRouteContexts } from '../../packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-context.model.ts'
import {
  directoryMenuRouteScope,
  menuCanonicalPath,
  menuContextualMenuId,
  menuRouteIndexPath,
  menuRoutePath,
  menuRouteProjection,
  menuRouteQrPath,
  parseMenuRouteTarget,
  publicKitchenMenuId,
  rootMenuRouteScope,
  tenantMenuRouteScope,
} from '../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-menu-route.ts'

const EXPECTED_CONTEXTS = [
  'generic',
  'delivery',
  'collection',
  'table',
  'kiosk',
  'staff_pos',
  'dine_in',
  'pre_order',
  'room_service',
]

const EXPECTED_PROJECTIONS = {
  generic: 'browse',
  delivery: 'order',
  collection: 'order',
  table: 'diagnostic',
  kiosk: 'order',
  staff_pos: 'diagnostic',
  dine_in: 'diagnostic',
  pre_order: 'order',
  room_service: 'diagnostic',
}

const MENU_ID = 'evening.menu'
const KITCHEN_SLUG = 'baeren-ringgenberg'

const appMenuLayouts = () => {
  const projectsRoot = path.join(process.cwd(), 'projects')
  if (!existsSync(projectsRoot)) return []

  const layouts = []
  for (const ecosystem of readdirSync(projectsRoot, { withFileTypes: true })) {
    if (!ecosystem.isDirectory()) continue
    const ecosystemRoot = path.join(projectsRoot, ecosystem.name)

    for (const app of readdirSync(ecosystemRoot, { withFileTypes: true })) {
      if (!app.isDirectory()) continue
      const layout = path.join(ecosystemRoot, app.name, 'app/layouts/menu.vue')
      if (existsSync(layout)) layouts.push(path.relative(process.cwd(), layout))
    }
  }

  return layouts
}

export async function run({ repoRoot = process.cwd() } = {}) {
  const menuRuntime = path.join(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu'
  )
  const readSource = (relativePath) =>
    readFileSync(path.join(menuRuntime, relativePath), 'utf8')
  const directoryModel = readSource('models/menu-collection.model.ts')
  const collection = readSource('composables/useMenuCollection.ts')
  const manager = readSource('components/Collection/Manager.vue')
  const directoryReader = readSource('server/index/read.ts')
  const directoryContext = readSource('server/index/context.ts')
  const directoryProjection = readSource('server/index/projection.ts')
  const directoryHttp = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/server/api/menus/index.get.ts'
    ),
    'utf8'
  )

  for (const retiredPath of [
    'models/menu-index.model.ts',
    'composables/usePublicMenuIndex.ts',
    'composables/useMenuDirectory.ts',
    'composables/firestore/fetch/useMenuCollection.ts',
  ]) {
    assert.equal(
      existsSync(path.join(menuRuntime, retiredPath)),
      false,
      `Retired Menu Directory path must not return: ${retiredPath}`
    )
  }
  assert.match(directoryModel, /type MenuDirectoryEntry/)
  assert.match(directoryModel, /type MenuDirectoryPage/)
  assert.doesNotMatch(directoryModel, /PublicMenuIndex|PUBLIC_MENU_INDEX/)
  assert.match(collection, /function useMenuCollection/)
  assert.match(collection, /collection:\s*ComputedRef<MenuDirectoryEntry\[\]>/)
  assert.match(collection, /MenuDirectoryOutcome/)
  assert.doesNotMatch(collection, /PublicMenuIndex|usePublicMenuIndex/)
  assert.match(manager, /MenuCollectionController/)
  assert.match(manager, /props\.index\.collection\.value/)
  assert.match(directoryHttp, /getQuery\(event\)/)
  assert.match(directoryHttp, /readMenuDirectoryPage/)
  assert.doesNotMatch(directoryHttp, /getRuntimeFirestore|\.collection\(/)
  for (const handler of [
    'index.get.ts',
    'availability.get.ts',
    'create.post.ts',
    '[menuId].get.ts',
    '[menuId]/file.get.ts',
    '[menuId]/delivery-address.post.ts',
  ]) {
    assert.equal(
      existsSync(path.join(menuRuntime, '../server/api/menus', handler)),
      true
    )
  }
  assert.match(directoryReader, /ReadMenuDirectoryPageInput/)
  assert.match(directoryReader, /projectMenuDirectoryEntry/)
  assert.match(directoryReader, /readMenuDirectoryContext/)
  assert.doesNotMatch(directoryReader, /H3Event|getQuery\(/)
  assert.match(directoryContext, /MenuDirectoryContext/)
  assert.match(directoryProjection, /MenuDirectoryDocument/)
  assert.match(directoryProjection, /MenuDirectoryEntry/)

  assert.deepEqual(
    appMenuLayouts(),
    [],
    'Menu layout is package-owned; remove app-local app/layouts/menu.vue overrides.'
  )
  assert.deepEqual(
    [...MenuRouteContexts],
    EXPECTED_CONTEXTS,
    'Menu route contexts changed without updating the public route contract.'
  )
  assert.deepEqual(
    Object.keys(EXPECTED_PROJECTIONS),
    EXPECTED_CONTEXTS,
    'Menu projection contexts changed without updating the route contract.'
  )

  for (const [context, projection] of Object.entries(EXPECTED_PROJECTIONS)) {
    assert.equal(
      menuRouteProjection(context),
      projection,
      `Unexpected public Menu projection for ${context}.`
    )
  }

  const rootScope = rootMenuRouteScope()
  const tenantScope = tenantMenuRouteScope()
  const directoryScope = directoryMenuRouteScope(KITCHEN_SLUG)

  assert.equal(
    publicKitchenMenuId(KITCHEN_SLUG, MENU_ID),
    `${KITCHEN_SLUG}--${MENU_ID}`
  )
  assert.equal(publicKitchenMenuId('', MENU_ID), '')

  assert.equal(menuRouteIndexPath(rootScope), '/menus')
  assert.equal(menuRouteIndexPath(tenantScope), '/menus')
  assert.equal(
    menuRouteIndexPath(directoryScope),
    `/kitchens/${KITCHEN_SLUG}/menus`
  )
  assert.equal(menuRouteIndexPath(directoryMenuRouteScope('')), '')
  assert.equal(
    menuRouteIndexPath(directoryMenuRouteScope('café & bar')),
    '/kitchens/caf%C3%A9%20%26%20bar/menus'
  )
  assert.deepEqual(parseMenuRouteTarget(MENU_ID), {
    menuId: MENU_ID,
    context: 'generic',
  })
  assert.equal(
    menuRoutePath({ scope: rootScope, menuId: MENU_ID }),
    `/menus/${MENU_ID}`
  )
  assert.equal(
    menuRoutePath({ scope: tenantScope, menuId: MENU_ID }),
    `/${MENU_ID}`
  )
  assert.equal(
    menuRoutePath({ scope: directoryScope, menuId: MENU_ID }),
    `/kitchens/${KITCHEN_SLUG}/menus/${MENU_ID}`
  )
  assert.equal(
    menuCanonicalPath({
      scope: rootScope,
      menuId: 'global-evening-menu',
      sourceKitchenSlug: KITCHEN_SLUG,
      sourceMenuId: MENU_ID,
    }),
    `/kitchens/${KITCHEN_SLUG}/menus/${MENU_ID}`
  )
  assert.equal(
    menuCanonicalPath({
      scope: directoryScope,
      menuId: MENU_ID,
      sourceKitchenSlug: KITCHEN_SLUG,
      sourceMenuId: MENU_ID,
    }),
    `/kitchens/${KITCHEN_SLUG}/menus/${MENU_ID}`
  )
  assert.equal(
    menuCanonicalPath({
      scope: rootScope,
      menuId: 'document-menu',
    }),
    '/menus/document-menu'
  )
  assert.equal(
    menuCanonicalPath({
      scope: tenantScope,
      menuId: MENU_ID,
      sourceKitchenSlug: KITCHEN_SLUG,
      sourceMenuId: MENU_ID,
    }),
    `/${MENU_ID}`
  )
  assert.equal(
    menuRouteQrPath({ scope: rootScope, menuId: MENU_ID }),
    `/menus/${MENU_ID}/qr`
  )
  assert.equal(
    menuRouteQrPath({ scope: tenantScope, menuId: MENU_ID }),
    `/${MENU_ID}/qr`
  )
  assert.equal(
    menuRouteQrPath({ scope: directoryScope, menuId: MENU_ID }),
    `/kitchens/${KITCHEN_SLUG}/menus/${MENU_ID}/qr`
  )
  assert.equal(menuRouteQrPath({ scope: rootScope, menuId: '' }), '')
  assert.equal(menuRoutePath({ scope: rootScope, menuId: '' }), '')
  assert.equal(
    menuRoutePath({ scope: rootScope, menuId: 'lunch & dinner' }),
    '/menus/lunch%20%26%20dinner'
  )

  for (const context of MenuRouteContexts.filter(
    (value) => value !== 'generic'
  )) {
    const contextualId = menuContextualMenuId(MENU_ID, context)

    assert.equal(contextualId, `${MENU_ID}.${context}`)
    assert.deepEqual(parseMenuRouteTarget(contextualId), {
      menuId: MENU_ID,
      context,
    })
    assert.equal(
      menuRoutePath({ scope: rootScope, menuId: MENU_ID, context }),
      `/menus/${MENU_ID}.${context}`
    )
    assert.equal(
      menuRoutePath({ scope: tenantScope, menuId: MENU_ID, context }),
      `/${MENU_ID}.${context}`
    )
    assert.equal(
      menuRoutePath({ scope: directoryScope, menuId: MENU_ID, context }),
      `/kitchens/${KITCHEN_SLUG}/menus/${MENU_ID}.${context}`
    )
    assert.equal(
      menuRouteQrPath({ scope: rootScope, menuId: MENU_ID, context }),
      `/menus/${MENU_ID}.${context}/qr`
    )
    assert.equal(
      menuRouteQrPath({ scope: tenantScope, menuId: MENU_ID, context }),
      `/${MENU_ID}.${context}/qr`
    )
    assert.equal(
      menuRouteQrPath({ scope: directoryScope, menuId: MENU_ID, context }),
      `/kitchens/${KITCHEN_SLUG}/menus/${MENU_ID}.${context}/qr`
    )
  }

  for (const unknownSuffix of ['eat_in', 'takeaway', 'unknown']) {
    const menuId = `${MENU_ID}.${unknownSuffix}`
    assert.deepEqual(parseMenuRouteTarget(menuId), {
      menuId,
      context: 'generic',
    })
  }

  console.log('[guard] ✅ menu route contract valid')
}
