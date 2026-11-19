import assert from 'node:assert/strict'
import { test } from 'node:test'
import { workspaceSwitchPath } from '../../../../../core/fireux-core/src/runtime/workspace/utils/switch-route.ts'

const kitchenWorkspaceSwitchPath = (
  matched: readonly string[],
  registered: readonly string[]
) => workspaceSwitchPath(matched, registered, '/workspace/kitchen')

const routes = [
  '/workspace/kitchen',
  '/workspace/kitchen/menu',
  '/workspace/kitchen/menu/services',
  '/workspace/kitchen/prep/recipes',
]

test('Menu and nested content routes return to the shared Menus capability', () => {
  for (const path of [
    '/workspace/kitchen/menu/:menuSlug()',
    '/workspace/kitchen/menu/:menuSlug()/content',
    '/workspace/kitchen/menu/:menuSlug()/:sectionId()',
    '/workspace/kitchen/menu/uploads/:uploadId()',
  ])
    assert.equal(
      kitchenWorkspaceSwitchPath([path], routes),
      '/workspace/kitchen/menu'
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

test('a tenant uses its configured Workspace entrance when no static parent is registered', () => {
  assert.equal(
    workspaceSwitchPath(
      ['/workspace/kitchen/prep/recipes/:recipeId()'],
      [],
      '/workspace/kitchen',
      '/'
    ),
    '/'
  )
})
