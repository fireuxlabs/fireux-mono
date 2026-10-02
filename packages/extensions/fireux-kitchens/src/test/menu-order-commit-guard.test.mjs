import assert from 'node:assert/strict'
import test from 'node:test'
import { isDeepStrictEqual } from 'node:util'
import { load } from './kitchen/kiosk-test-helpers.mjs'
const target = (collectionPath) => ({ collectionPath })
const deps = {
  isDeepStrictEqual,
  menuSourceFromData: (data) => data.source || {},
  createError: (x) => Object.assign(new Error(x.statusMessage), x),
  FIRESTORE_MUTATION_TARGETS: {
    kitchens: target('kitchens'),
    places: target('places'),
    menus: target('menus'),
  },
  serverKitchenMenusTarget: (id) => target(`kitchens/${id}/menus`),
  serverKitchenFulfilmentTarget: (id) => target(`kitchens/${id}/fulfilment`),
  menuKitchenIdentity: (k, p) => ({
    currencyCode: k.currency,
    name: p.name || '',
  }),
  readKitchenFulfilmentConfig: (x) => x,
}
const { menuOrderReadSet, prepareMenuOrderContextGuard } = load(
  '../../runtime/menu/server/ordering/commit-guard.ts',
  'menuOrderReadSet,prepareMenuOrderContextGuard',
  deps
)

test('pricing collection guard detects additions/removals and pages beyond 1000 records', async () => {
  const rows = Array.from({ length: 1001 }, (_, i) => ({
    id: String(i).padStart(4, '0'),
    data: { price: i },
  }))
  const set = menuOrderReadSet()
  set.observer.collection(target('items'), rows)
  let current = structuredClone(rows)
  const tx = {
    readAll: async (_t, limit, after) =>
      current.filter((r) => !after || r.id > after).slice(0, limit),
  }
  await set.validate(tx)
  current.pop()
  await assert.rejects(set.validate(tx), /ordering changed/)
  current = [...rows, { id: 'zzzz', data: {} }]
  await assert.rejects(set.validate(tx), /ordering changed/)
  current = structuredClone(rows)
  current[0].data.price = 900
  await assert.rejects(set.validate(tx), /ordering changed/)
})
test('document guard rejects changed and deleted Sellable revisions', async () => {
  const set = menuOrderReadSet()
  set.observer.document(target('sellables'), 'coke', { revision: 1, price: 4 })
  await set.validate({
    read: async () => ({ exists: true, data: { revision: 1, price: 4 } }),
  })
  for (const result of [
    { exists: false },
    { exists: true, data: { revision: 2, price: 5 } },
  ]) {
    await assert.rejects(
      set.validate({ read: async () => result }),
      /ordering changed/
    )
  }
})
function contextFixture(kind = 'directory-menu') {
  const menu = { status: 'published', slug: 'food' }
  const kitchen = {
    currency: 'CHF',
    services: [{ id: 'pickup', enabled: true }],
    slug: 'baren',
  }
  const data = new Map([
    ['kitchens/k', kitchen],
    ['places/k', { name: 'Bären' }],
    ['kitchens/k/menus/m', menu],
    [
      'kitchens/k/fulfilment/policy',
      { delivery_zones: [], payment_methods: ['cash'] },
    ],
    [
      'menus/root',
      { status: 'published', source: { kitchen_id: 'k', menu_id: 'm' } },
    ],
  ])
  const context = {
    appId: 'app',
    kitchenId: 'k',
    kitchenPlaceId: 'k',
    menuId: 'm',
    menuData: menu,
    kitchenServices: kitchen.services,
    currencyCode: 'CHF',
    kitchenName: 'Bären',
    fulfilment: data.get('kitchens/k/fulfilment/policy'),
  }
  const source = {
    orderingSource: {
      kitchen: structuredClone(kitchen),
      place: { name: 'Bären' },
    },
    kind,
    routeMenuId: kind === 'root-doorway' ? 'root' : 'food',
    kitchenSlug: 'baren',
    rootKitchenData: kitchen,
    rootMenuData: data.get('menus/root'),
  }
  const db = {
    doc: (path) => path,
    getAll: async (...paths) =>
      paths.map((path) => ({
        exists: data.has(path),
        data: () => structuredClone(data.get(path)),
      })),
  }
  let duplicate = false
  const tx = {
    read: async (t, id) => ({
      exists: data.has(`${t.collectionPath}/${id}`),
      data: data.get(`${t.collectionPath}/${id}`),
    }),
    query: async (t) =>
      t.collectionPath === 'kitchens'
        ? [
            { id: 'k', data: { management: { mode: 'app' } } },
            ...(duplicate
              ? [{ id: 'other', data: { management: { mode: 'app' } } }]
              : []),
          ]
        : [
            { id: 'm', data: menu },
            ...(duplicate ? [{ id: 'other', data: menu }] : []),
          ],
  }
  return {
    data,
    context,
    source,
    db,
    tx,
    duplicate: () => {
      duplicate = true
    },
  }
}
test('context guard rejects changed service, currency, publication and fulfilment policy', async () => {
  for (const [path, next] of [
    ['kitchens/k', { currency: 'EUR', services: [] }],
    ['kitchens/k/menus/m', { status: 'draft', slug: 'food' }],
    [
      'kitchens/k/fulfilment/policy',
      { delivery_zones: [], payment_methods: [] },
    ],
  ]) {
    const f = contextFixture()
    const validate = await prepareMenuOrderContextGuard(f.context, f.source)
    await validate(f.tx)
    f.data.set(path, next)
    await assert.rejects(validate(f.tx), /ordering changed/)
  }
})
test('scope queries detect new ambiguity for tenant and directory routes', async () => {
  for (const kind of ['tenant-menu', 'directory-menu']) {
    const f = contextFixture(kind)
    const validate = await prepareMenuOrderContextGuard(f.context, f.source)
    await validate(f.tx)
    f.duplicate()
    await assert.rejects(validate(f.tx), /ordering changed/)
  }
})
test('root doorway source retargeting is rejected and mixed preflight policy is never blessed', async () => {
  const f = contextFixture('root-doorway')
  const validate = await prepareMenuOrderContextGuard(f.context, f.source)
  f.data.set('menus/root', {
    status: 'published',
    source: { kitchen_id: 'other' },
  })
  await assert.rejects(validate(f.tx), /ordering changed/)
  const g = contextFixture()
  g.data.set('kitchens/k', { currency: 'EUR', services: [] })
  const originalGuard = await prepareMenuOrderContextGuard(g.context, g.source)
  await assert.rejects(originalGuard(g.tx), /ordering changed/)
})

test('Staff POS authority is re-read in the transaction and revoked/recreated membership grants nothing', async () => {
  const { readMembershipAccessIds } = load(
    '../../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
    'readMembershipAccessIds'
  )
  const stamp = { seconds: 1, nanoseconds: 0 }
  let member = { role: 'user', created: { at: stamp } }
  const access = { ids: ['k'], membership_created_at: stamp }
  const { requireKitchenWriterAccount } = load(
    '../../runtime/kitchen/server/core/operator-access.ts',
    'requireKitchenWriterAccount',
    {
      createError: deps.createError,
      getRuntimeFirestore: () => ({}),
      FIRESTORE_MUTATION_TARGETS: deps.FIRESTORE_MUTATION_TARGETS,
      serverAppUsersTarget: () => target('members'),
      serverKitchenAccessTarget: () => target('access'),
      readKitchenAccessIds: readMembershipAccessIds,
    }
  )
  const tx = {
    read: async (t) => ({
      exists: t.collectionPath !== 'members' || !!member,
      data:
        t.collectionPath === 'members'
          ? member
          : t.collectionPath === 'access'
            ? access
            : {},
    }),
  }
  await requireKitchenWriterAccount(
    { appId: 'app', kitchenId: 'k' },
    'actor',
    tx
  )
  member = null
  await assert.rejects(
    requireKitchenWriterAccount({ appId: 'app', kitchenId: 'k' }, 'actor', tx),
    /membership/
  )
  member = { role: 'user', created: { at: { seconds: 2, nanoseconds: 0 } } }
  await assert.rejects(
    requireKitchenWriterAccount({ appId: 'app', kitchenId: 'k' }, 'actor', tx),
    /association/
  )
})

test('root doorway keeps the original Kitchen and Place snapshots through later asynchronous work', async () => {
  for (const [path, replacement] of [
    ['kitchens/k', { currency: 'CHF', services: [], slug: 'new' }],
    ['places/k', { name: 'Changed venue' }],
  ]) {
    const f = contextFixture('root-doorway')
    f.data.set(path, replacement)
    const validate = await prepareMenuOrderContextGuard(f.context, f.source)
    await assert.rejects(validate(f.tx), /ordering changed/)
  }
})

test('slug-only root doorway rechecks the original Kitchen lookup membership', async () => {
  const f = contextFixture('root-doorway')
  const root = {
    status: 'published',
    source: { kitchen_slug: ' BAREN ', menu_id: 'm' },
  }
  f.source.rootMenuData = root
  f.data.set('menus/root', root)
  const query = f.tx.query
  let queries = 0
  f.tx.query = async (target, input) => {
    queries++
    assert.equal(target.collectionPath, 'kitchens')
    assert.deepEqual(input, {
      field: 'slug',
      op: '==',
      value: 'baren',
      limit: 2,
    })
    return query(target, input)
  }
  const validate = await prepareMenuOrderContextGuard(f.context, f.source)
  await validate(f.tx)
  f.duplicate()
  await assert.rejects(validate(f.tx), /ordering changed/)
  assert.equal(queries, 2)
})

test('root doorway with an explicit Kitchen id does not invent a slug uniqueness requirement', async () => {
  const f = contextFixture('root-doorway')
  f.source.rootMenuData.source.kitchen_slug = 'baren'
  f.tx.query = async () => {
    throw new Error('explicit id does not resolve by slug')
  }
  const validate = await prepareMenuOrderContextGuard(f.context, f.source)
  await validate(f.tx)
})
