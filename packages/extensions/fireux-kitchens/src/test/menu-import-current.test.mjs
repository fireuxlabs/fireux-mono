import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { dishPricingHelpers } from './helpers/dish-pricing.mjs'

function fixture() {
  const records = new Map([
    ['kitchens/k/menus/m', { name: 'Food', status: 'draft' }],
    [
      'kitchens/k/dishes/d',
      {
        name: 'Margherita',
        description: 'Tomato and mozzarella',
        price: 13,
        price_options: [
          { label: 'Large', quantity: 1, unit: 'pizza', price: 18 },
        ],
        add_ons: [{ id: 'cheese', label: 'Cheese', price: 2 }],
      },
    ],
    [
      'kitchens/k/menus/m/sections/s',
      { label: 'Pizza', status: 'active', sort_order: 1 },
    ],
    [
      'kitchens/k/menus/m/sections/s/items/i',
      { dish_id: 'd', status: 'active', sort_order: 1 },
    ],
  ])
  const reads = []
  const snapshot = (path) => ({
    id: path.split('/').at(-1),
    exists: records.has(path),
    data: () => structuredClone(records.get(path)),
    ref: { collection: (name) => collection(`${path}/${name}`) },
  })
  const collection = (path) => ({
    get: async () => {
      reads.push(path)
      return {
        docs: [...records.keys()]
          .filter(
            (key) =>
              key.startsWith(`${path}/`) &&
              !key.slice(path.length + 1).includes('/')
          )
          .map(snapshot),
      }
    },
  })
  const db = {
    doc: (path) => ({
      get: async () => {
        reads.push(path)
        return snapshot(path)
      },
      collection: (name) => collection(`${path}/${name}`),
    }),
    collection,
  }
  const source = readFileSync(
    new URL('../runtime/menu/server/draft/current.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const dependencies = {
    ...dishPricingHelpers,
    getRuntimeFirestore: () => db,
    readString: (value) => (typeof value === 'string' ? value.trim() : ''),
  }
  const read = compileFunction(
    `${stripTypeScriptTypes(source)}; return readKitchenMenuCurrentShape`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return { records, reads, read: () => read('kitchens/k', 'm') }
}

test('import comparison resolves all normal terms from Dish and ignores stale placement prices', async () => {
  const f = fixture()
  Object.assign(f.records.get('kitchens/k/menus/m/sections/s/items/i'), {
    price: 99,
    price_options: [{ label: 'Old', price: 100 }],
    add_ons: [{ id: 'old', label: 'Old', price: 50 }],
  })
  const before = structuredClone(f.records)
  const result = await f.read()
  const item = result.sections[0].items[0]
  assert.equal(item.price, 13)
  assert.equal(item.price_options[0].price, 18)
  assert.equal(item.add_ons[0].price, 2)
  assert.equal(item.name, 'Margherita')
  assert.deepEqual(f.records, before)
  assert.ok(f.reads.every((path) => !path.includes('order')))
})

test('canonical placements need no copied prices, and an explicit zero remains zero', async () => {
  const f = fixture()
  const dish = f.records.get('kitchens/k/dishes/d')
  dish.price = 0
  dish.price_options = []
  dish.add_ons = []
  assert.equal((await f.read()).sections[0].items[0].price, 0)
})

test('archived sections and entries are excluded before Dish pricing validation', async () => {
  const f = fixture()
  f.records.set('kitchens/k/menus/m/sections/old', {
    label: 'Archived',
    status: 'archived',
  })
  f.records.set('kitchens/k/menus/m/sections/old/items/old', {
    dish_id: 'empty',
    status: 'active',
  })
  f.records.set('kitchens/k/menus/m/sections/s/items/old', {
    dish_id: 'unpriced',
    status: 'archived',
  })
  f.records.set('kitchens/k/dishes/unpriced', { name: 'Old dish' })
  const result = await f.read()
  assert.equal(result.sections.length, 1)
  assert.equal(result.sections[0].items.length, 1)
  assert.ok(!f.reads.includes('kitchens/k/menus/m/sections/old/items'))
})

for (const problem of ['missing Dish', 'missing price', 'invalid terms']) {
  test(`import comparison rejects ${problem} instead of inventing a zero price`, async () => {
    const f = fixture()
    if (problem === 'missing Dish') f.records.delete('kitchens/k/dishes/d')
    if (problem === 'missing price')
      delete f.records.get('kitchens/k/dishes/d').price
    if (problem === 'invalid terms')
      f.records.get('kitchens/k/dishes/d').price = -1
    await assert.rejects(f.read())
  })
}

test('meal-deal entries fail explicitly rather than being compared as zero-priced Dishes', async () => {
  const f = fixture()
  f.records.set('kitchens/k/menus/m/sections/s/items/i', {
    promotion_id: 'meal',
    status: 'active',
  })
  await assert.rejects(f.read(), /Import comparison supports Dish entries only/)
})

test('a missing Menu retains its missing outcome without reading children', async () => {
  const f = fixture()
  f.records.delete('kitchens/k/menus/m')
  assert.deepEqual((await f.read()).sections, [])
  assert.deepEqual(f.reads, ['kitchens/k/menus/m'])
})
