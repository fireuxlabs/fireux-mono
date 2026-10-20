import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadOfferingSource } from './offering-test-helpers.mjs'

test('Food index children require and reuse one mounted overview', () => {
  const values = new Map()
  let acquisitions = 0
  const shared = { kitchenId: 'baeren', overview: {} }
  const { provideFoodAndDrinkIndex, useFoodAndDrinkIndexContext } = loadOfferingSource(
    'kitchen/composables/workspace/food/useFoodAndDrinkIndexContext',
    'provideFoodAndDrinkIndex,useFoodAndDrinkIndexContext',
    {
      provide: (key, value) => values.set(key, value),
      inject: key => values.get(key),
      useFoodAndDrinkIndex: () => { acquisitions++; return shared },
    }
  )
  assert.throws(() => useFoodAndDrinkIndexContext(), /require their index provider/)
  assert.equal(acquisitions, 0)
  provideFoodAndDrinkIndex()
  for (let child = 0; child < 5; child++) assert.equal(useFoodAndDrinkIndexContext(), shared)
  assert.equal(acquisitions, 1)
})

test('the parent assembles named children without forwarding index props', () => {
  const root = new URL('../runtime/kitchen/components/Workspace/Food/', import.meta.url)
  const parent = readFileSync(new URL('Index.vue', root), 'utf8')
  assert.ok(!parent.includes(':summary='))
  assert.ok(!parent.includes(':overview='))
  for (const name of ['Items', 'Menus', 'Promotions', 'Services', 'AI']) {
    assert.ok(parent.includes(`<WorkspaceKitchenFood${name} />`))
    const child = readFileSync(new URL(`${name}.vue`, root), 'utf8')
    assert.match(child, /useFoodAndDrinkIndexContext\(\)/)
    assert.ok(!child.includes('defineProps'))
  }
})
