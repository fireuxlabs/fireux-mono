import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
function load(path, result, deps) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function harness() {
  const records = new Map([
    ['k/menus/m', { status: 'published' }],
    ['k/menus/m/sections/s', {}],
    ['k/menus/m/sections/other', {}],
    ['k/dishes/d', { name: 'Pizza', price: 13 }],
    [
      'k/promotions/p',
      {
        name: 'Meal',
        status: 'active',
        currency: 'CHF',
        days: ['sunday'],
        price: 15,
        groups: [
          {
            id: 'main',
            name: 'Main',
            choose: 1,
            dishes: [{ dishId: 'd', supplement: 0 }],
          },
        ],
      },
    ],
  ])
  let version = 0,
    ids = 0,
    retries = 0,
    denied = false
  const writes = []
  const error = (x) => Object.assign(Error(x.statusMessage), x)
  const deps = {
    createError: error,
    requireFirestoreDocumentId: (x) => x,
    readKitchenMutationActor: async () => ({ uid: 'u', runtimeAppId: 'app' }),
    requireKitchenMutationAuthority: async () => {
      if (denied) throw Error('Denied')
      return { subscription: 'premium' }
    },
    randomUUID: () => `placement-${++ids}`,
    serverAuditStamp: () => ({ by: 'u', at: 'server' }),
    serverKitchenMenusTarget: (k) => `${k}/menus`,
    serverKitchenMenuSectionsTarget: (k, m) => `${k}/menus/${m}/sections`,
    serverKitchenMenuItemsTarget: (k, m, s) =>
      `${k}/menus/${m}/sections/${s}/items`,
    serverKitchenDishesTarget: (k) => `${k}/dishes`,
    kitchenPromotionsTarget: (k) => `${k}/promotions`,
    normalizeMenuItemPatch: (x) => x,
    // Optimistic transaction simulation: overlapping commits retry against fresh data.
    runGuardedServerTransaction: async (_, run) => {
      for (let attempt = 0; attempt < 10; attempt++) {
        const revision = version,
          snapshot = structuredClone(records),
          staged = []
        const rows = (t) =>
          [...snapshot]
            .filter(
              ([path]) =>
                path.startsWith(t + '/') &&
                !path.slice(t.length + 1).includes('/')
            )
            .map(([path, data]) => ({ id: path.split('/').at(-1), data }))
        const result = await run({
          read: async (t, id) => ({
            exists: snapshot.has(t + '/' + id),
            data: snapshot.get(t + '/' + id),
          }),
          readAll: async (t, limit) => rows(t).slice(0, limit),
          query: async (t, q) => {
            assert.ok(
              q.limit >= 1 && q.limit <= 100,
              'native guarded query limit'
            )
            return rows(t)
              .filter(
                (row) =>
                  row.data[q.field] === q.value &&
                  (!q.afterId || row.id > q.afterId)
              )
              .sort((a, b) => a.id.localeCompare(b.id))
              .slice(0, q.limit)
          },
          create: (...args) => staged.push(['create', ...args]),
          update: (...args) => staged.push(['update', ...args]),
        })
        if (revision !== version) {
          retries++
          continue
        }
        for (const [kind, t, id, data] of staged) {
          const path = t + '/' + id
          if (kind === 'create') {
            assert.ok(!records.has(path))
            records.set(path, structuredClone(data))
          } else
            records.set(path, {
              ...records.get(path),
              ...structuredClone(data),
            })
        }
        if (staged.length) version++
        writes.push(...staged)
        return result
      }
      throw Error('Too many retries')
    },
  }
  deps.normalizeKitchenPromotion = load(
    '../runtime/kitchen/utils/promotions/pricing.ts',
    'normalizeKitchenPromotion',
    {}
  )
  deps.nextMenuDisplayOrder = load(
    '../runtime/menu/server/display-order.ts',
    'nextMenuDisplayOrder',
    { createError: error }
  )
  const create = load(
    '../runtime/menu/server/items/write.ts',
    'createKitchenMenuItem',
    deps
  )
  return {
    records,
    writes,
    create,
    retries: () => retries,
    deny: () => {
      denied = true
    },
  }
}
for (const reference of [{ dishId: 'd' }, { promotionId: 'p' }]) {
  const kind = reference.dishId ? 'Dish' : 'meal deal'
  const body = { kitchenId: 'k', menuId: 'm', sectionId: 's', ...reference }
  test(`${kind}: repeat Add returns the saved placement with no further writes`, async () => {
    const h = harness(),
      beforeDish = structuredClone(h.records.get('k/dishes/d'))
    const first = await h.create({}, body),
      count = h.writes.length
    const saved = structuredClone(h.records)
    assert.deepEqual(await h.create({}, body), first)
    assert.equal(h.writes.length, count)
    assert.deepEqual(h.records, saved)
    assert.deepEqual(h.records.get('k/dishes/d'), beforeDish)
    h.deny()
    await assert.rejects(h.create({}, body), /Denied/)
  })
  test(`${kind}: simultaneous Add requests converge after transaction retry`, async () => {
    const h = harness()
    const result = await Promise.all([h.create({}, body), h.create({}, body)])
    assert.equal(result[0].id, result[1].id)
    assert.ok(h.retries() > 0, 'must exercise a conflicting commit and retry')
    assert.equal(h.writes.filter((row) => row[0] === 'create').length, 1)
    assert.equal(h.records.get('k/dishes/d').price, 13)
    assert.equal(h.records.get('k/promotions/p').price, 15)
    const other = await h.create({}, { ...body, sectionId: 'other' })
    assert.notEqual(
      other.id,
      result[0].id,
      'another section may use the same reference'
    )
  })
  test(`${kind}: Add restores an archived match and preserves its position`, async () => {
    const h = harness(),
      field = reference.dishId ? 'dish_id' : 'promotion_id'
    h.records.set('k/menus/m/sections/s/items/saved', {
      [field]: reference.dishId || reference.promotionId,
      status: 'archived',
      sort_order: 7,
      created: { by: 'original' },
    })
    const result = await h.create({}, body)
    assert.equal(result.id, 'saved')
    assert.equal(
      h.records.get('k/menus/m/sections/s/items/saved').status,
      'active'
    )
    assert.equal(
      h.records.get('k/menus/m/sections/s/items/saved').sort_order,
      7
    )
    assert.deepEqual(
      h.records.get('k/menus/m/sections/s/items/saved').created,
      { by: 'original' }
    )
    assert.equal(h.writes.filter((row) => row[0] === 'create').length, 0)
  })
}

test('duplicate detection pages within the native query bound and still refuses over 400 matches', async () => {
  const h = harness()
  for (let index = 0; index < 401; index++) {
    h.records.set(
      `k/menus/m/sections/s/items/old-${String(index).padStart(3, '0')}`,
      { dish_id: 'd', status: 'archived' }
    )
  }
  await assert.rejects(
    h.create({}, { kitchenId: 'k', menuId: 'm', sectionId: 's', dishId: 'd' }),
    /duplicate cleanup/
  )
  assert.equal(h.writes.length, 0)
})
