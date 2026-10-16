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
        read: async (t, id) => ({
          exists: records.has(`${t}/${id}`),
          data: records.get(`${t}/${id}`),
        }),
        create: (...args) => writes.push(['create', ...args]),
        update: (...args) => writes.push(['update', ...args]),
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
  sort_order: 1,
}
const item = {
  kitchenId: 'k',
  menuId: 'm',
  sectionId: 's',
  dishId: 'd',
  sort_order: 1,
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
  assert.equal(h.writes[1][1], 'kitchens/k/menus/m/sections/s/items')
  assert.equal(h.writes[1][3].price, undefined)
  assert.equal(h.writes[1][3].dish_id, 'd')
  assert.equal(h.writes[1][3].sellable_id, undefined)
  await h.updateKitchenMenuSection(
    {},
    { kitchenId: 'k', menuId: 'm', sectionId: 's', changes: { label: 'New' } }
  )
  assert.equal(h.writes[2][3].label, 'New')
  assert.ok(h.writes.every((x) => x[1] !== 'kitchens/k/menus'))
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
