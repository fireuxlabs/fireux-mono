// @fireux-script
// last_used: 2026-07-16
// usage_note: run through pnpm guard; locks the public Menu route grammar.

import assert from 'node:assert/strict'

import { MenuRouteContexts } from '../../packages/extensions/fireux-kitchens/src/runtime/models/kitchen/menu/menu-context.model.ts'
import {
  directoryMenuRouteScope,
  menuContextualMenuId,
  menuRoutePath,
  parseMenuRouteTarget,
  rootMenuRouteScope,
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

const MENU_ID = 'evening.menu'
const KITCHEN_SLUG = 'baeren-ringgenberg'

export async function run() {
  assert.deepEqual(
    [...MenuRouteContexts],
    EXPECTED_CONTEXTS,
    'Menu route contexts changed without updating the public route contract.'
  )

  const rootScope = rootMenuRouteScope()
  const directoryScope = directoryMenuRouteScope(KITCHEN_SLUG)

  assert.deepEqual(parseMenuRouteTarget(MENU_ID), {
    menuId: MENU_ID,
    context: 'generic',
  })
  assert.equal(menuRoutePath({ scope: rootScope, menuId: MENU_ID }),
    `/menus/${MENU_ID}`)
  assert.equal(menuRoutePath({ scope: directoryScope, menuId: MENU_ID }),
    `/kitchens/${KITCHEN_SLUG}/menus/${MENU_ID}`)

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
      menuRoutePath({ scope: directoryScope, menuId: MENU_ID, context }),
      `/kitchens/${KITCHEN_SLUG}/menus/${MENU_ID}.${context}`
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
