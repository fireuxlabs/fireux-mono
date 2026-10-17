import assert from 'node:assert/strict'
import { test } from 'node:test'
import { kitchenWorkspaceSwitchPath } from '../../runtime/kitchen/utils/workspace-switch-route.ts'

const routes = [
  '/workspace/kitchen',
  '/workspace/kitchen/menus',
  '/workspace/kitchen/services',
  '/workspace/kitchen/food/recipes',
]

test('Menu and nested content routes return to the shared Menus capability', () => {
  for (const path of [
    '/workspace/kitchen/menus/:menuSlug()',
    '/workspace/kitchen/menus/:menuSlug()/content',
    '/workspace/kitchen/menus/:menuSlug()/:sectionId()',
    '/workspace/kitchen/menus/uploads/:uploadId()',
  ]) assert.equal(kitchenWorkspaceSwitchPath([path], routes), '/workspace/kitchen/menus')
})

test('other Kitchen records return to their nearest registered capability', () => {
  assert.equal(kitchenWorkspaceSwitchPath([
    '/workspace/kitchen/services/:service()',
  ], routes), '/workspace/kitchen/services')
  assert.equal(kitchenWorkspaceSwitchPath([
    '/workspace/kitchen/food/recipes/:recipeId()',
  ], routes), '/workspace/kitchen/food/recipes')
  assert.equal(kitchenWorkspaceSwitchPath([
    '/workspace/kitchen/:kitchenId()',
  ], routes), '/workspace/kitchen')
})

test('static capability and unrelated routes remain in place', () => {
  for (const path of [...routes, '/workspace/kitchen/identity/appearance', '/menus/:menuId()']) {
    assert.equal(kitchenWorkspaceSwitchPath([path], routes), undefined)
  }
})
