import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function fixture() {
  const records = new Map([
    ['kitchens/k/menus/m', { status: 'published' }],
    ['kitchens/k/menus/m/sections/s', { label: 'Food', sort_order: 2 }],
    ['kitchens/k/menus/m/sections/t', { label: 'Drinks', sort_order: 8 }],
    [
      'kitchens/k/menus/m/sections/s/items/a',
      { dish_id: 'a', sort_order: 2, price: 13 },
    ],
    [
      'kitchens/k/menus/m/sections/s/items/b',
      { dish_id: 'b', sort_order: 3, price: 19 },
    ],
    [
      'kitchens/k/menus/m/sections/s/items/c',
      { promotion_id: 'deal', sort_order: 3, price: 15 },
    ],
  ])
  const reads = [],
    writes = []
  let allowed = true,
    fail = false
  const target = (k, m, s) =>
    `kitchens/${k}/menus${m ? `/${m}/sections` : ''}${s ? `/${s}/items` : ''}`
  const reader = {
    readAll: async (path, limit) => {
      reads.push(path)
      return [...records]
        .filter(
          ([p]) =>
            p.startsWith(path + '/') && !p.slice(path.length + 1).includes('/')
        )
        .slice(0, limit)
        .map(([p, data]) => ({ id: p.split('/').at(-1), data }))
    },
  }
  const deps = {
    createError: (value) => Object.assign(Error(value.statusMessage), value),
    requireFirestoreDocumentId: (value) => {
      if (typeof value !== 'string' || !value || value.includes('/'))
        throw Error('Invalid id')
      return value
    },
    serverKitchenMenusTarget: (k) => target(k),
    serverKitchenMenuSectionsTarget: (k, m) => target(k, m),
    serverKitchenMenuItemsTarget: target,
    readKitchenMutationActor: async () => ({ uid: 'u', runtimeAppId: 'app' }),
    requireKitchenMutationAuthority: async () => {
      if (!allowed) throw Error('Denied')
      return { subscription: 'premium' }
    },
    serverAuditStamp: () => ({ by: 'u', at: 'now' }),
    runGuardedServerTransaction: async (_, work) => {
      const staged = []
      let writing = false
      const result = await work({
        read: async (path, id) => {
          assert.equal(writing, false)
          reads.push(`${path}/${id}`)
          return {
            exists: records.has(`${path}/${id}`),
            data: records.get(`${path}/${id}`),
          }
        },
        readAll: async (...args) => {
          assert.equal(writing, false)
          return reader.readAll(...args)
        },
        update: (path, id, patch) => {
          writing = true
          staged.push([`${path}/${id}`, patch])
        },
      })
      if (fail) throw Error('Commit failed')
      for (const [path, patch] of staged)
        records.set(path, { ...records.get(path), ...patch })
      writes.push(...staged)
      return result
    },
  }
  const source = readFileSync(
    new URL('../runtime/menu/server/display-order.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const api = compileFunction(
    stripTypeScriptTypes(source) +
      ';return {moveKitchenMenuEntry,nextMenuDisplayOrder}',
    Object.keys(deps)
  )(...Object.values(deps))
  return {
    records,
    reads,
    writes,
    deny: () => (allowed = false),
    fail: () => (fail = true),
    next: (path) => api.nextMenuDisplayOrder(reader, path),
    move: (input) =>
      api.moveKitchenMenuEntry(
        {},
        { kitchenId: 'k', menuId: 'm', sectionId: 's', ...input }
      ),
  }
}
const items = 'kitchens/k/menus/m/sections/s/items'
test('append follows the maximum saved position, including gaps and archived entries', async () => {
  const f = fixture()
  assert.equal(await f.next(items), 4)
  f.records.set(items + '/old', { sort_order: 20, status: 'archived' })
  assert.equal(await f.next(items), 21)
  assert.equal(await f.next('kitchens/k/menus/empty/sections'), 1)
  assert.deepEqual(f.writes, [])
})
test('item move normalizes ties atomically and never changes prices or publication', async () => {
  const f = fixture(),
    before = structuredClone(f.records)
  await f.move({ itemId: 'b', direction: 'up' })
  assert.equal(f.records.get(items + '/b').sort_order, 0)
  assert.equal(f.records.get(items + '/a').sort_order, 1)
  assert.equal(f.records.get(items + '/c').sort_order, 2)
  for (const [path, data] of before) {
    const after = f.records.get(path)
    assert.equal(after.price, data.price)
    if (data.status) assert.equal(after.status, data.status)
  }
  assert.ok(
    f.writes.every(([, patch]) =>
      Object.keys(patch).every((key) => ['sort_order', 'updated'].includes(key))
    )
  )
  assert.ok(f.reads.every((path) => !path.includes('orders')))
})
test('section move stays within the Menu and supports both directions', async () => {
  const f = fixture()
  await f.move({ direction: 'down' })
  assert.equal(f.records.get('kitchens/k/menus/m/sections/t').sort_order, 0)
  assert.equal(f.records.get('kitchens/k/menus/m/sections/s').sort_order, 1)
  await f.move({ direction: 'up' })
  assert.equal(f.records.get('kitchens/k/menus/m/sections/s').sort_order, 0)
})
test('boundary moves are harmless; missing entries and revoked authority do not write', async () => {
  const f = fixture()
  await f.move({ itemId: 'a', direction: 'up' })
  assert.deepEqual(f.writes, [])
  await assert.rejects(f.move({ itemId: 'foreign', direction: 'down' }), {
    statusCode: 404,
  })
  f.deny()
  await assert.rejects(f.move({ itemId: 'b', direction: 'up' }), /Denied/)
  assert.deepEqual(f.writes, [])
})
test('a failed commit preserves the complete prior order', async () => {
  const f = fixture(),
    before = structuredClone(f.records)
  f.fail()
  await assert.rejects(
    f.move({ itemId: 'b', direction: 'up' }),
    /Commit failed/
  )
  assert.deepEqual(f.records, before)
})
test('dated section moves do not reorder another daily selection', async () => {
  const f = fixture()
  f.records.get('kitchens/k/menus/m').schedule = 'daily'
  f.records.get('kitchens/k/menus/m/sections/s').date = '2026-10-16'
  f.records.get('kitchens/k/menus/m/sections/t').date = '2026-10-17'
  await f.move({ direction: 'down' })
  assert.deepEqual(f.writes, [])
})
