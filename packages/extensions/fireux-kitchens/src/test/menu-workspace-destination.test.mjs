import assert from 'node:assert/strict'
import test from 'node:test'
import { menuWorkspaceDestination } from '../runtime/kitchen/utils/menu-workspace-destination.ts'

test('regular Menus enter their existing record page', () => {
  assert.equal(
    menuWorkspaceDestination({ slug: 'food' }),
    '/workspace/kitchen/food-and-drink/menus/food'
  )
})
test('daily Menus use the same canonical record destination', () => {
  assert.equal(
    menuWorkspaceDestination({ slug: 'american-group', schedule: 'daily' }),
    '/workspace/kitchen/food-and-drink/menus/american-group'
  )
})
test('Menu slugs remain a single encoded route segment', () => {
  assert.equal(
    menuWorkspaceDestination({ slug: 'food / drinks' }),
    '/workspace/kitchen/food-and-drink/menus/food%20%2F%20drinks'
  )
})
