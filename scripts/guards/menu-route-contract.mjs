// @fireux-script
// last_used: 2026-07-17
// usage_note: run through pnpm guard; locks Menu route grammar and projections.

import assert from 'node:assert/strict'

import { MenuRouteContexts } from '../../packages/extensions/fireux-kitchens/src/runtime/models/kitchen/menu/menu-context.model.ts'
import {
  directoryMenuRouteScope,
  menuContextualMenuId,
  menuRouteIndexPath,
  menuRoutePath,
  menuRouteProjection,
  menuRouteQrPath,
  parseMenuRouteTarget,
  rootMenuRouteScope,
  tenantMenuRouteScope,
} from '../../packages/extensions/fireux-kitchens/src/runtime/utils/kitchen-menu-route.ts'

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
  delivery: 'diagnostic',
  collection: 'order',
  table: 'diagnostic',
  kiosk: 'diagnostic',
  staff_pos: 'diagnostic',
  dine_in: 'diagnostic',
  pre_order: 'diagnostic',
  room_service: 'diagnostic',
}

const MENU_ID = 'evening.menu'
const KITCHEN_SLUG = 'baeren-ringgenberg'

export async function run() {
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
  assert.equal(menuRoutePath({ scope: rootScope, menuId: MENU_ID }),
    `/menus/${MENU_ID}`)
  assert.equal(menuRoutePath({ scope: tenantScope, menuId: MENU_ID }),
    `/${MENU_ID}`)
  assert.equal(menuRoutePath({ scope: directoryScope, menuId: MENU_ID }),
    `/kitchens/${KITCHEN_SLUG}/menus/${MENU_ID}`)
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

  for (const context of MenuRouteContexts.filter((value) => value !== 'generic')) {
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
