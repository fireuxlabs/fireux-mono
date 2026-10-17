import { dishPricingHelpers } from '../helpers/dish-pricing.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
function load(path, dependencies, name) {
  dependencies = { ...dishPricingHelpers, ...dependencies }

  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type \{[\s\S]*?\} from[^\n]*\n/gm, '')
    .replace(/^export type \* from[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (x) => Object.assign(new Error(x.statusMessage), x)
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return value
}
const readMembershipAccessIds = load(
  '../../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
  {},
  'readMembershipAccessIds'
)
const readKitchenAccessIds = load(
  '../../runtime/kitchen/utils/kitchen-access.ts',
  { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 },
  'readKitchenAccessIds'
)
const requireKitchenMutationAuthority = load(
  '../../runtime/kitchen/server/core/mutation-authority.ts',
  {
    serverAppUsersTarget: (app) => `apps/${app}/users`,
    serverKitchenAccessTarget: (app) => 'kitchen_access',
    FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens', places: 'places' },
    readKitchenAccessIds,
    isAppUserSubscription: (value) =>
      ['free', 'premium', 'business'].includes(value),
    createError,
  },
  'requireKitchenMutationAuthority'
)

const target = (k, m, s) =>
  `kitchens/${k}/menus${m ? `/${m}/sections` : ''}${s ? `/${s}/items` : ''}`
const utils = load(
  '../../runtime/kitchen/utils/dish-pricing.ts',
  {},
  '({normalizeDishPriceOptions,normalizeDishAddOns})'
)
const normalizeMenuItemPatch = load(
  '../../runtime/menu/utils/menu-item-patch.ts',
  { ...utils, normalizeSlug: (x) => String(x).toLowerCase() },
  'normalizeMenuItemPatch'
)
function harness() {
  const at = { seconds: 1, nanoseconds: 0 },
    writes = [],
    records = new Map([
      ['kitchens/k', {}],
      ['places/k', {}],
      [
        'apps/app/users/u',
        { role: 'user', subscription: 'free', created: { at } },
      ],
      [
        'kitchen_access/u',
        { apps: { app: { ids: ['k'], membership_created_at: at } } },
      ],
      ['kitchens/k/menus/m', {}],
      ['kitchens/k/menus/m/sections/s', {}],
      ['kitchens/k/dishes/d', {}],
      ['kitchens/k/menus/m/sections/s/items/i', {}],
    ])
  let before = () => {}
  const deps = {
    ...load(
      '../../runtime/menu/server/display-order.ts',
      { createError },
      '({nextMenuDisplayOrder})'
    ),
    createError,
    kitchenPromotionsTarget: (k) => `kitchens/${k}/promotions`,
    ...load(
      '../../runtime/kitchen/utils/promotions/pricing.ts',
      {},
      '({normalizeKitchenPromotion,promotionDishIds})'
    ),
    requireFirestoreDocumentId,
    requireKitchenMutationAuthority,
    normalizeMenuItemPatch,
    randomUUID: () => 'new',
    serverKitchenMenusTarget: (k) => target(k),
    serverKitchenMenuSectionsTarget: (k, m) => target(k, m),
    serverKitchenMenuItemsTarget: target,
    serverKitchenDishesTarget: (k) => `kitchens/${k}/dishes`,
    readKitchenMutationActor: async () => ({ uid: 'u', runtimeAppId: 'app' }),
    serverAuditStamp: (x) => ({ ...x, at: 'server-time' }),
    runGuardedServerTransaction: async (_, run) => {
      before()
      return run({
        query: async (t, options) =>
          [...records]
            .filter(
              ([path, data]) =>
                path.startsWith(t + '/') &&
                !path.slice(t.length + 1).includes('/') &&
                data[options.field] === options.value
            )
            .slice(0, options.limit)
            .map(([path, data]) => ({ id: path.split('/').at(-1), data })),
        readAll: async (t, limit) =>
          [...records]
            .filter(
              ([path]) =>
                path.startsWith(t + '/') &&
                !path.slice(t.length + 1).includes('/')
            )
            .slice(0, limit)
            .map(([path, data]) => ({ id: path.split('/').at(-1), data })),
        read: async (t, id) => ({
          exists: records.has(`${t}/${id}`),
          data: records.get(`${t}/${id}`),
        }),
        create: (...args) => writes.push(['create', ...args]),
        update: (...args) => writes.push(['update', ...args]),
        delete: (...args) => writes.push(['delete', ...args]),
      })
    },
  }
  const sections = load(
    '../../runtime/menu/server/sections/commands.ts',
    deps,
    '({createKitchenMenuSection,updateKitchenMenuSection})'
  )
  const items = load(
    '../../runtime/menu/server/items/write.ts',
    deps,
    '({createKitchenMenuItem,updateKitchenMenuItem})'
  )
  return {
    ...sections,
    ...items,
    ...load(
      '../../runtime/menu/server/items/remove.ts',
      deps,
      '({removeKitchenMenuItem})'
    ),
    writes,
    records,
    before: (fn) => {
      before = fn
    },
  }
}
const section = {
  kitchenId: 'k',
  menuId: 'm',
  label: ' Pizza ',
  description: ' Fresh ',
}
const item = {
  kitchenId: 'k',
  menuId: 'm',
  sectionId: 's',
  dishId: 'd',
}
test('Menu content commands persist scoped sections/items without changing publication', async () => {
  const h = harness()
  assert.deepEqual(await h.createKitchenMenuSection({}, section), {
    id: 'new',
    kitchenId: 'k',
    menuId: 'm',
  })
  assert.equal(h.writes[0][1], 'kitchens/k/menus/m/sections')
  assert.equal(h.writes[0][3].label, 'Pizza')
  await h.createKitchenMenuItem({}, item)
  const itemWrite = h.writes.find(
    (row) => row[0] === 'create' && row[1].endsWith('/items')
  )
  assert.equal(itemWrite[1], 'kitchens/k/menus/m/sections/s/items')
  assert.equal(itemWrite[3].price, undefined)
  assert.equal(itemWrite[3].dish_id, 'd')
  assert.equal(itemWrite[3].sellable_id, undefined)
  await h.updateKitchenMenuSection(
    {},
    { kitchenId: 'k', menuId: 'm', sectionId: 's', changes: { label: 'New' } }
  )
  assert.equal(h.writes.at(-1)[3].label, 'New')
  assert.ok(
    h.writes
      .filter((x) => x[1] === 'kitchens/k/menus')
      .every((x) => Object.keys(x[3]).every((key) => key === 'updated'))
  )
})
test('Every content command rechecks membership and binding inside transaction', async () => {
  for (const run of [
    (h) => h.createKitchenMenuSection({}, section),
    (h) => h.createKitchenMenuItem({}, item),
    (h) =>
      h.updateKitchenMenuSection(
        {},
        {
          kitchenId: 'k',
          menuId: 'm',
          sectionId: 's',
          changes: { label: 'New' },
        }
      ),
    (h) =>
      h.updateKitchenMenuItem(
        {},
        {
          kitchenId: 'k',
          menuId: 'm',
          sectionId: 's',
          itemId: 'i',
          changes: { price: 2 },
        }
      ),
  ])
    for (const change of [
      (h) => h.records.delete('apps/app/users/u'),
      (h) =>
        (h.records.get('apps/app/users/u').created.at = {
          seconds: 2,
          nanoseconds: 0,
        }),
      (h) => (h.records.get('kitchen_access/u').apps.app.ids = ['other']),
    ]) {
      const h = harness()
      h.before(() => change(h))
      await assert.rejects(run(h))
      assert.equal(h.writes.length, 0)
    }
})
test('Content commands reject missing parent/foreign Dish and caller-owned fields', async () => {
  for (const missing of [
    'kitchens/k/menus/m',
    'kitchens/k/menus/m/sections/s',
    'kitchens/k/dishes/d',
  ]) {
    const h = harness()
    h.records.delete(missing)
    await assert.rejects(h.createKitchenMenuItem({}, item), { statusCode: 404 })
    assert.equal(h.writes.length, 0)
  }
  for (const patch of [
    { price: -1 },
    { price: '13' },
    { sort_order: NaN },
    { sellable_id: 'v' },
    { created: {} },
    { status: 'published' },
  ]) {
    const h = harness()
    await assert.rejects(h.createKitchenMenuItem({}, { ...item, ...patch }), {
      statusCode: 400,
    })
    assert.equal(h.writes.length, 0)
  }
  for (const changes of [
    { label: '' },
    { date: '2026-02-30' },
    { date: '2026-99-99' },
    { status: 'published' },
    { menu_id: 'other' },
    { created: {} },
    { updated: {} },
    { sort_order: Infinity },
  ]) {
    const h = harness()
    await assert.rejects(
      h.updateKitchenMenuSection(
        {},
        { kitchenId: 'k', menuId: 'm', sectionId: 's', changes }
      ),
      { statusCode: 400 }
    )
    assert.equal(h.writes.length, 0)
  }
  const h = harness()
  await assert.rejects(
    h.createKitchenMenuSection({}, { ...section, date: '2026-01-01' }),
    { statusCode: 400 }
  )
})
test('Placements reject all pricing fields but retain organisation edits', async () => {
  for (const changes of [
    { price: 1 },
    { price_options: [] },
    { add_ons: [] },
  ]) {
    const h = harness()
    await assert.rejects(
      h.updateKitchenMenuItem(
        {},
        { kitchenId: 'k', menuId: 'm', sectionId: 's', itemId: 'i', changes }
      ),
      { statusCode: 400 }
    )
    assert.equal(h.writes.length, 0)
  }
  const h = harness()
  await h.updateKitchenMenuItem(
    {},
    {
      kitchenId: 'k',
      menuId: 'm',
      sectionId: 's',
      itemId: 'i',
      changes: { status: 'archived', sort_order: 2 },
    }
  )
  assert.equal(h.writes.length, 1)
})

const deal = () => ({
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
      dishes: [{ dishId: 'd', supplement: 0 }],
    },
  ],
})
test('Menu entries reference one meal deal without copying or changing its commercial terms', async () => {
  const h = harness()
  h.records.set('kitchens/k/promotions/deal', deal())
  const before = structuredClone(h.records)
  await h.createKitchenMenuItem(
    {},
    { kitchenId: 'k', menuId: 'm', sectionId: 's', promotionId: 'deal' }
  )
  const [, path, , data] = h.writes[0]
  assert.equal(path, 'kitchens/k/menus/m/sections/s/items')
  assert.equal(data.promotion_id, 'deal')
  assert.equal(Object.hasOwn(data, 'dish_id'), false)
  assert.equal(Object.hasOwn(data, 'price'), false)
  assert.deepEqual(h.records, before)
})
test('Menu entry creation rejects mixed, missing, non-meal and Daily specials references', async () => {
  for (const input of [
    {},
    { dishId: 'd', promotionId: 'deal' },
    { promotionId: 'missing' },
  ]) {
    const h = harness()
    await assert.rejects(
      h.createKitchenMenuItem(
        {},
        { kitchenId: 'k', menuId: 'm', sectionId: 's', ...input }
      )
    )
    assert.equal(h.writes.length, 0)
  }
  for (const daily of [false, true]) {
    const h = harness()
    h.records.set(
      'kitchens/k/promotions/deal',
      daily
        ? deal()
        : {
            name: 'Offer',
            status: 'active',
            currency: 'CHF',
            days: ['friday'],
            dishes: [{ dishId: 'd', price: 11 }],
          }
    )
    if (daily) h.records.set('kitchens/k/menus/m', { schedule: 'daily' })
    await assert.rejects(
      h.createKitchenMenuItem(
        {},
        { kitchenId: 'k', menuId: 'm', sectionId: 's', promotionId: 'deal' }
      )
    )
    assert.equal(h.writes.length, 0)
  }
})

test('removing a Menu entry deletes only that placement and preserves catalogue prices', async () => {
  const h = harness()
  const before = structuredClone(h.records)
  await h.removeKitchenMenuItem(
    {},
    { kitchenId: 'k', menuId: 'm', sectionId: 's', itemId: 'i' }
  )
  assert.deepEqual(h.writes, [
    ['delete', 'kitchens/k/menus/m/sections/s/items', 'i'],
  ])
  assert.deepEqual(h.records, before)
})

test('Menu entry removal enforces current authority, parent scope and Daily entitlement', async () => {
  for (const change of [
    (h) => h.records.delete('apps/app/users/u'),
    (h) => (h.records.get('kitchen_access/u').apps.app.ids = ['other']),
    (h) => h.records.delete('kitchens/k/menus/m/sections/s'),
    (h) => {
      h.records.get('kitchens/k/menus/m').schedule = 'daily'
      h.records.get('apps/app/users/u').subscription = 'free'
    },
  ]) {
    const h = harness()
    h.before(() => change(h))
    await assert.rejects(
      h.removeKitchenMenuItem(
        {},
        { kitchenId: 'k', menuId: 'm', sectionId: 's', itemId: 'i' }
      )
    )
    assert.deepEqual(h.writes, [])
  }
})

test('manual creation appends after stored gaps and serializes through the parent without price writes', async () => {
  const h = harness()
  h.records.set('kitchens/k/menus/m/sections/s/items/old', {
    dish_id: 'another-dish',
    sort_order: 20,
    status: 'archived',
  })
  await h.createKitchenMenuItem({}, item)
  const created = h.writes.find((row) => row[0] === 'create')
  assert.equal(created[3].sort_order, 21)
  assert.equal(created[3].price, undefined)
  assert.deepEqual(h.writes[1].slice(0, 3), [
    'update',
    'kitchens/k/menus/m/sections',
    's',
  ])
  assert.deepEqual(Object.keys(h.writes[1][3]), ['updated'])
  const sectionCase = harness()
  sectionCase.records.get('kitchens/k/menus/m/sections/s').sort_order = 7
  await sectionCase.createKitchenMenuSection({}, section)
  assert.equal(sectionCase.writes[0][3].sort_order, 8)
  assert.deepEqual(sectionCase.writes[1].slice(0, 3), [
    'update',
    'kitchens/k/menus',
    'm',
  ])
})

test('Section archive and restore write only status/audit and retain Dish and placement terms', async () => {
  const h = harness()
  h.records.set('kitchens/k/dishes/d', { name: 'Pizza', price: 13 })
  h.records.set('kitchens/k/menus/m/sections/s/items/i', {
    dish_id: 'd',
    sort_order: 4,
  })
  const before = structuredClone([...h.records])
  for (const status of ['archived', 'active']) {
    await h.updateKitchenMenuSection(
      {},
      {
        kitchenId: 'k',
        menuId: 'm',
        sectionId: 's',
        changes: { status },
      }
    )
    const write = h.writes.at(-1)
    assert.equal(write[0], 'update')
    assert.equal(write[1], 'kitchens/k/menus/m/sections')
    assert.equal(write[2], 's')
    assert.deepEqual(Object.keys(write[3]).sort(), ['status', 'updated'])
    assert.equal(write[3].status, status)
  }
  assert.equal(h.writes.length, 2)
  assert.deepEqual([...h.records], before)
})
