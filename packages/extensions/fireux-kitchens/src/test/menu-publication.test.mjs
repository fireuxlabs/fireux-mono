import assert from 'node:assert/strict'
import test from 'node:test'
import { harness, menuPath, rootPath } from './helpers/menu-publication.mjs'

test('publication updates only the canonical Menu, preserving identity and provenance', async () => {
  const h = harness()
  const result = await h.publish()
  assert.deepEqual(result, {
    menuId: 'm',
  })
  assert.equal(h.records.get(menuPath).status, 'published')
  assert.equal(h.records.has(rootPath), false)
  assert.equal(h.records.get(menuPath).slug, 'lunch')
  assert.equal(h.records.get(menuPath).created.by, 'creator')
  const committed = structuredClone(h.records)
  await h.publish()
  assert.deepEqual(h.records, committed)
})

test('document publication skips structured validation; archived children do not count', async () => {
  const h = harness({ document: true })
  h.records.delete(`${menuPath}/sections/s`)
  await h.publish()
  assert.equal(h.state.reads.includes(`${menuPath}/sections`), false)
  const structured = harness()
  structured.records.set(`${menuPath}/sections/archived`, {
    status: 'archived',
  })
  structured.records.set(`${menuPath}/sections/s/items/archived`, {
    status: 'archived',
  })
  await structured.publish()
})

for (const [name, change, message] of [
  ['Menu', (h) => h.records.delete(menuPath), 'Menu not found.'],
  [
    'sections',
    (h) => h.records.delete(`${menuPath}/sections/s`),
    'Menu needs at least one section',
  ],
  [
    'active sections',
    (h) => h.records.set(`${menuPath}/sections/s`, { status: 'archived' }),
    'Menu needs at least one section',
  ],
  [
    'items',
    (h) => h.records.delete(`${menuPath}/sections/s/items/i`),
    'Menu needs at least one item',
  ],
  [
    'active items',
    (h) =>
      h.records.set(`${menuPath}/sections/s/items/i`, { status: 'archived' }),
    'Menu needs at least one item',
  ],
  [
    'dish id',
    (h) => h.records.set(`${menuPath}/sections/s/items/i`, {}),
    'Every menu item needs a dish',
  ],
  [
    'dish',
    (h) => h.records.delete('kitchens/k/dishes/dish'),
    'Menu item references missing dish: dish',
  ],
])
  test(`missing ${name} rejects publication without writes`, async () => {
    const h = harness()
    change(h)
    const before = structuredClone(h.records)
    await assert.rejects(h.publish(), { message })
    assert.deepEqual(h.records, before)
  })

for (const operation of ['publish', 'unpublish', 'archive']) {
  for (const failure of ['menu', 'commit'])
    test(`${operation}: ${failure} failure rolls back the Menu, then retry succeeds`, async () => {
      const h = harness({
        status: operation === 'publish' ? 'draft' : 'published',
      })
      h.records.set(rootPath, {
        name: 'Lunch',
        status: h.records.get(menuPath).status,
        source: { app_id: 'original-app', kitchen_id: 'k', menu_id: 'm' },
      })
      const before = structuredClone(h.records)
      if (failure === 'commit') h.state.failCommit = true
      else h.state.failPath = menuPath
      await assert.rejects(h[operation](), /failure/)
      assert.deepEqual(h.records, before)
      h.state.failCommit = false
      h.state.failPath = ''
      await h[operation]()
      const expected = {
        publish: 'published',
        unpublish: 'draft',
        archive: 'archived',
      }[operation]
      assert.equal(h.records.get(menuPath).status, expected)
      assert.deepEqual(
        h.records.get(rootPath),
        before.get(rootPath),
        'Unrelated root records are untouched'
      )
      assert.equal(h.records.get(rootPath).source.app_id, 'original-app')
      const committed = structuredClone(h.records)
      await h[operation]()
      assert.deepEqual(
        h.records,
        committed,
        'A repeat neither duplicates the doorway nor changes the audit stamp'
      )
    })
  test(`${operation}: transaction retry rereads revoked access`, async () => {
    const h = harness({ status: 'published' })
    h.state.retry = (records) =>
      records.set('kitchen_access/operator', {
        apps: {
          app: {
            ...records.get('kitchen_access/operator').apps.app,
            ids: [],
          },
        },
      })
    await assert.rejects(h[operation](), /association/)
    assert.equal(h.records.has(rootPath), false)
    assert.equal(h.records.get(menuPath).status, 'published')
  })
  test(`${operation}: missing membership denies even a paid operator`, async () => {
    const h = harness()
    h.records.set('apps/app/users/operator', { subscription: 'business' })
    await assert.rejects(h[operation](), /membership/)
    assert.equal(h.records.has(rootPath), false)
  })
}

test('transaction retry validates changed content before committing publication', async () => {
  const h = harness()
  h.state.retry = (records) => records.delete('kitchens/k/dishes/dish')
  await assert.rejects(h.publish(), /missing dish/)
  assert.equal(h.records.get(menuPath).status, 'draft')
  assert.equal(h.records.has(rootPath), false)
})

test('unpublish still rejects archived and missing Menus; archive is repeatable', async () => {
  const h = harness({ status: 'archived' })
  await assert.rejects(h.unpublish(), /archived/)
  await h.archive()
  h.records.delete(menuPath)
  await assert.rejects(h.archive(), /Menu was not found/)
})

for (const action of ['publish', 'unpublish', 'archive'])
  test(`${action} route rejects unsigned requests before any transaction`, async () => {
    const h = harness()
    h.state.signedIn = false
    const before = structuredClone(h.records)
    await assert.rejects(h.routes[action]({}), { statusCode: 401 })
    assert.equal(h.state.attempts, 0)
    assert.deepEqual(h.records, before)
  })

test('publication routes keep their response shape and expose actionable validation errors', async () => {
  const h = harness()
  assert.deepEqual(await h.routes.publish({}), {
    ok: true,
    menu_id: 'm',
  })
  assert.deepEqual(await h.routes.unpublish({}), { ok: true })
  assert.deepEqual(await h.routes.archive({}), { ok: true })
  h.records.delete(`${menuPath}/sections/s`)
  await assert.rejects(h.routes.publish({}), {
    statusCode: 400,
    statusMessage: 'Menu needs at least one section',
  })
  assert.equal(h.records.get(menuPath).status, 'archived')
})

for (const action of ['publish', 'unpublish', 'archive'])
  test(`${action} rejects an association from an older membership`, async () => {
    const h = harness()
    const membership = h.records.get('apps/app/users/operator')
    h.records.set('apps/app/users/operator', {
      ...membership,
      created: { at: { seconds: 2, nanoseconds: 0 } },
    })
    await assert.rejects(h[action](), /association/)
    assert.equal(h.records.get(menuPath).status, 'draft')
    assert.equal(h.records.has(rootPath), false)
  })

test('daily planning cannot publish all dated selections through regular menu publication', async () => {
  const h = harness()
  h.records.get(menuPath).schedule = 'daily'
  const before = structuredClone(h.records)
  await assert.rejects(h.publish(), /Publish a specific date/)
  assert.deepEqual(h.records, before)
})

test('a document-format draft cannot publish without its document', async () => {
  const h = harness()
  h.records.get(menuPath).format = 'document'
  await assert.rejects(h.publish(), /Upload a Menu document/)
  assert.notEqual(h.records.get(menuPath).status, 'published')
})

test('publishing a private-link Menu keeps the audience on the canonical Menu', async () => {
  const h = harness()
  h.records.get(menuPath).audience = 'private_link'
  await h.publish()
  assert.equal(h.records.get(menuPath).status, 'published')
  assert.equal(h.records.get(menuPath).audience, 'private_link')
  assert.equal(h.records.has(rootPath), false)
})

const meal = () => ({
  name: 'Pizza meal',
  status: 'active',
  currency: 'CHF',
  days: ['friday'],
  price: 15,
  groups: [
    {
      id: 'pizza',
      name: 'Pizza',
      choose: 1,
      dishes: [{ dishId: 'dish', supplement: 0 }],
    },
  ],
})
test('publication validates meal-deal placements and every choice without changing Dish prices', async () => {
  const h = harness()
  h.records.set(`${menuPath}/sections/s/items/i`, {
    status: 'active',
    promotion_id: 'meal',
  })
  h.records.set('kitchens/k/promotions/meal', meal())
  const dish = structuredClone(h.records.get('kitchens/k/dishes/dish'))
  await h.publish()
  assert.deepEqual(h.records.get('kitchens/k/dishes/dish'), dish)
  assert.equal(h.records.get('kitchens/k/promotions/meal').price, 15)
})
test('publication refuses dangling meal deals and unavailable choices', async () => {
  for (const cause of [
    'missing-deal',
    'missing-dish',
    'archived-dish',
    'mixed',
  ]) {
    const h = harness()
    h.records.set(`${menuPath}/sections/s/items/i`, {
      status: 'active',
      promotion_id: 'meal',
      ...(cause === 'mixed' ? { dish_id: 'dish' } : {}),
    })
    if (cause !== 'missing-deal')
      h.records.set('kitchens/k/promotions/meal', meal())
    if (cause === 'missing-dish') h.records.delete('kitchens/k/dishes/dish')
    if (cause === 'archived-dish')
      h.records.get('kitchens/k/dishes/dish').status = 'archived'
    await assert.rejects(h.publish())
    assert.equal(h.records.get(menuPath).status, 'draft')
  }
})
