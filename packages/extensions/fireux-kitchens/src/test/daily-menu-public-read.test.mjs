import { dishPricingHelpers } from './helpers/dish-pricing.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction as compileNative } from 'node:vm'
const compileFunction = (source, args = []) =>
  args.includes('setResponseHeader')
    ? compileNative(source, args)
    : compileNative(source, ['setResponseHeader', ...args]).bind(null, () => {})

function load(path, names, deps) {
  deps = { ...dishPricingHelpers, ...deps }

  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /gm, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    Object.keys(deps)
  )(...Object.values(deps))
}

test('the public section reader never acquires items from another calendar date', async () => {
  const base = 'kitchens/k',
    path = `${base}/menus/m/sections`,
    reads = []
  const sections = [
    { id: 'past', date: '2026-10-14', label: 'Yesterday', sort_order: 0 },
    { id: 'dinner', date: '2026-10-15', label: 'Dinner', sort_order: 2 },
    { id: 'lunch', date: '2026-10-15', label: 'Lunch', sort_order: 1 },
    { id: 'future', date: '2026-10-16', label: 'Secret tomorrow' },
    { id: 'archived', date: '2026-10-15', status: 'archived' },
  ]
  const db = {
    collection: (name) => ({
      get: async () => {
        reads.push(name)
        const rows =
          name === path
            ? sections
            : name === `${base}/dishes`
              ? [
                  {
                    id: 'dish',
                    name: 'Meal',
                    price: 12,
                    price_options: [],
                    add_ons: [],
                  },
                ]
              : [{ id: 'item', dish_id: 'dish', price: 12 }]
        return {
          docs: rows.map(({ id, ...data }) => ({ id, data: () => data })),
        }
      },
    }),
  }
  const { readKitchenMenuSections } = load(
    '../runtime/menu/server/manifest/sections.ts',
    'readKitchenMenuSections',
    {
      readRecord: (value) => value,
      readRecordString: (value, key) => String(value?.[key] || ''),
      readDishItemKind: () => 'food',
      normalizeDishPriceOptions: () => [],
      normalizeDishAddOns: () => [],
    }
  )
  const result = await readKitchenMenuSections(db, {
    appId: 'app',
    kitchenId: 'k',
    menuId: 'm',
    date: '2026-10-15',
  })
  assert.deepEqual(
    result.map((section) => section.label),
    ['Lunch', 'Dinner']
  )
  assert.deepEqual(reads.filter((name) => name.endsWith('/items')).sort(), [
    `${path}/dinner/items`,
    `${path}/lunch/items`,
  ])
  assert.equal(JSON.stringify(result).includes('Secret tomorrow'), false)
})

test('canonical Menu uses its published-date gate and expose no private sections', async () => {
  for (const published of [false, true]) {
    const reads = [],
      payloads = []
    const daily = {
      date: '2026-10-15',
      timezone: 'Europe/Zurich',
      nextChangeAt: 123,
      refreshAfterMs: 100,
      published,
    }
    const deps = {
      defineEventHandler: (fn) => fn,
      getRuntimeFirestore: () => ({}),
      dailyMenuToday: () => daily,
      readKitchenMenuSections: async (_db, input) => {
        reads.push(input)
        return [{ id: 'today' }]
      },
      readKitchenMenuChoices: async () => [],
      readRecordString: (value, key) => String(value?.[key] || ''),
      menuSourceFromData: () => ({
        app_id: 'app',
        kitchen_id: 'k',
        menu_id: 'm',
        kitchen_slug: 'hotel',
      }),
      buildMenuPayload: async (_id, _data, scope) => {
        payloads.push(scope)
        return scope
      },
    }
    const api = load(
      '../runtime/server/api/menus/[menuId].get.ts',
      'readKitchenMenu',
      deps
    )
    const menu = { schedule: 'daily' },
      scope = { kitchenTimezone: 'Europe/Zurich' }
    await api.readKitchenMenu(
      {
        kind: 'directory-menu',
        appId: 'app',
        kitchenId: 'k',
        sourceMenuId: 'm',
        routeMenuId: 'specials',
        menuData: menu,
        scope,
      },
      'generic',
      '',
      ''
    )
    assert.equal(reads.length, published ? 1 : 0)
    assert.ok(reads.every((input) => input.date === '2026-10-15'))
    for (const payload of payloads) {
      assert.equal(payload.daily, daily)
      assert.deepEqual(payload.sections, published ? [{ id: 'today' }] : [])
    }
  }
})

test('manually constructed order contexts reject daily Menus before content is acquired', async () => {
  for (const kind of ['directory-menu', 'tenant-menu'])
    for (const context of ['collection', 'delivery', 'table']) {
      let acquired = false
      const { handler } = load(
        '../runtime/server/api/menus/[menuId].get.ts',
        'handler',
        {
          defineEventHandler: (fn) => fn,
          setCorsHeaders: () => {},
          getRouterParam: () => 'specials',
          getQuery: () => ({ context }),
          parseMenuRouteTarget: () => ({
            menuId: 'specials',
            context: 'generic',
          }),
          normalizeMenuRouteContext: (value) => value,
          normalizeSproochliLanguage: () => '',
          resolveMenuTarget: async () => ({
            kind,
            menuData: { schedule: 'daily' },
            sourceMenuData: { schedule: 'daily' },
          }),
          getRuntimeFirestore: () => {
            acquired = true
            throw new Error('Must not read content')
          },
          createError: (value) =>
            Object.assign(new Error(value.statusMessage), value),
        }
      )
      await assert.rejects(handler({}), { statusCode: 409 })
      assert.equal(acquired, false)
    }
})
