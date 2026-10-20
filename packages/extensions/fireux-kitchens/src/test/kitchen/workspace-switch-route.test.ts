import assert from 'node:assert/strict'
import { test } from 'node:test'
import { kitchenWorkspaceSwitchPath } from '../../runtime/kitchen/utils/workspace-switch-route.ts'

const routes = [
  '/workspace/kitchen',
  '/workspace/kitchen/food-and-drink/menus',
  '/workspace/kitchen/food-and-drink/services',
  '/workspace/kitchen/prep/recipes',
]

test('Menu and nested content routes return to the shared Menus capability', () => {
  for (const path of [
    '/workspace/kitchen/food-and-drink/menus/:menuSlug()',
    '/workspace/kitchen/food-and-drink/menus/:menuSlug()/content',
    '/workspace/kitchen/food-and-drink/menus/:menuSlug()/:sectionId()',
    '/workspace/kitchen/food-and-drink/menus/uploads/:uploadId()',
  ]) assert.equal(kitchenWorkspaceSwitchPath([path], routes), '/workspace/kitchen/food-and-drink/menus')
})

test('other Kitchen records return to their nearest registered capability', () => {
  assert.equal(kitchenWorkspaceSwitchPath([
    '/workspace/kitchen/food-and-drink/services/:service()',
  ], routes), '/workspace/kitchen/food-and-drink/services')
  assert.equal(kitchenWorkspaceSwitchPath([
    '/workspace/kitchen/prep/recipes/:recipeId()',
  ], routes), '/workspace/kitchen/prep/recipes')
  assert.equal(kitchenWorkspaceSwitchPath([
    '/workspace/kitchen/:kitchenId()',
  ], routes), '/workspace/kitchen')
})

test('static capability and unrelated routes remain in place', () => {
  for (const path of [...routes, '/workspace/kitchen/identity/appearance', '/menus/:menuId()']) {
    assert.equal(kitchenWorkspaceSwitchPath([path], routes), undefined)
  }
})
