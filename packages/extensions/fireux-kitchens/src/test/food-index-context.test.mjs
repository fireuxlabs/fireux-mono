import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadOfferingSource } from './offering-test-helpers.mjs'

test('Food index children require and reuse one mounted overview', () => {
  const values = new Map()
  let acquisitions = 0
  const shared = { kitchenId: 'baeren', overview: {} }
  const { provideMenuGroupIndex, useMenuGroupIndexContext } =
    loadOfferingSource(
      'kitchen/composables/workspace/menu-group/useMenuGroupIndexContext',
      'provideMenuGroupIndex,useMenuGroupIndexContext',
      {
        provide: (key, value) => values.set(key, value),
        inject: (key) => values.get(key),
        useMenuGroupIndex: () => {
          acquisitions++
          return shared
        },
      }
    )
  assert.throws(
    () => useMenuGroupIndexContext(),
    /require their index provider/
  )
  assert.equal(acquisitions, 0)
  provideMenuGroupIndex()
  for (let child = 0; child < 5; child++)
    assert.equal(useMenuGroupIndexContext(), shared)
  assert.equal(acquisitions, 1)
})

test('the parent assembles named children without forwarding index props', () => {
  const root = new URL('../runtime/kitchen/components/Menu/', import.meta.url)
  const parent = readFileSync(new URL('Index.vue', root), 'utf8')
  assert.match(parent, /:summary="catalogue.menus"/)
  assert.ok(!parent.includes(':overview='))
  for (const name of ['Items', 'Promotions', 'Services', 'AI']) {
    assert.ok(
      parent.includes(
        `<KitchenMenu${name}${name === 'AI' ? '' : 'Overview'} />`
      )
    )
    const child = readFileSync(
      new URL(name === 'AI' ? 'AI.vue' : `${name}/Overview.vue`, root),
      'utf8'
    )
    assert.match(child, /useMenuGroupIndexContext\(\)/)
    assert.ok(!child.includes('defineProps'))
  }
})
