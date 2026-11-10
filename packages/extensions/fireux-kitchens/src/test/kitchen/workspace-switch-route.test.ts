import assert from 'node:assert/strict'
import { test } from 'node:test'
import { kitchenWorkspaceSwitchPath } from '../../runtime/kitchen/utils/workspace-switch-route.ts'

const routes = [
  '/workspace/kitchen',
  '/workspace/kitchen/menu/menus',
  '/workspace/kitchen/menu/services',
  '/workspace/kitchen/prep/recipes',
]

test('Menu and nested content routes return to the shared Menus capability', () => {
  for (const path of [
    '/workspace/kitchen/menu/menus/:menuSlug()',
    '/workspace/kitchen/menu/menus/:menuSlug()/content',
    '/workspace/kitchen/menu/menus/:menuSlug()/:sectionId()',
    '/workspace/kitchen/menu/menus/uploads/:uploadId()',
  ])
    assert.equal(
      kitchenWorkspaceSwitchPath([path], routes),
      '/workspace/kitchen/menu/menus'
    )
})

test('other Kitchen records return to their nearest registered capability', () => {
  assert.equal(
    kitchenWorkspaceSwitchPath(
      ['/workspace/kitchen/menu/services/:service()'],
      routes
    ),
    '/workspace/kitchen/menu/services'
  )
  assert.equal(
    kitchenWorkspaceSwitchPath(
      ['/workspace/kitchen/prep/recipes/:recipeId()'],
      routes
    ),
    '/workspace/kitchen/prep/recipes'
  )
  assert.equal(
    kitchenWorkspaceSwitchPath(['/workspace/kitchen/:kitchenId()'], routes),
    '/workspace/kitchen'
  )
})

test('static capability and unrelated routes remain in place', () => {
  for (const path of [
    ...routes,
    '/workspace/kitchen/identity/appearance',
    '/menus/:menuId()',
  ]) {
    assert.equal(kitchenWorkspaceSwitchPath([path], routes), undefined)
  }
})
