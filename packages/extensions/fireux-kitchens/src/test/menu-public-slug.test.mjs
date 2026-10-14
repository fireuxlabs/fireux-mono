import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const load = (path, name, dependencies) => {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

const text = (data, key) => String(data[key] || '')
test('public scoped Menu resolves slug to stable ID without an ID alias', async () => {
  let lookup
  let docs = [
    { id: 'stable-123', data: () => ({ slug: 'food', status: 'published' }) },
  ]
  const scopedTarget = load(
    '../runtime/menu/server/ownership/scoped-target.ts',
    'scopedTarget',
    {
      getRuntimeFirestore: () => ({
        collection: (path) => ({
          where: (field, operator, value) => {
            lookup = { path, field, operator, value }
            return { limit: () => ({ get: async () => ({ docs }) }) }
          },
        }),
      }),
      readMenuKitchenPlaceData: async () => ({}),
      menuKitchenIdentity: () => ({}),
      readMenuKitchenFulfilment: async () => ({
        delivery_zones: [],
        payment_methods: [],
      }),
      menuKitchenOperationHours: () => ({ windows: [] }),
      readKitchenOfferings: async () => [],
      readKitchenSproochliAttachment: async () => ({ enabled: false }),
      readRecordString: text,
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
    }
  )
  const scope = {
    appId: 'a',
    kitchenId: 'k',
    kitchenSlug: 'venue',
    rootKitchenData: {},
  }
  const target = await scopedTarget('directory-menu', 'food', scope)
  assert.deepEqual(lookup, {
    path: 'kitchens/k/menus',
    field: 'slug',
    operator: '==',
    value: 'food',
  })
  assert.equal(target.routeMenuId, 'food')
  assert.equal(target.sourceMenuId, 'stable-123')
  assert.equal(target.scope.kitchenMenuId, 'stable-123')
  assert.equal(target.scope.kitchenMenuSlug, 'food')
  docs = []
  await assert.rejects(scopedTarget('directory-menu', 'stable-123', scope), {
    statusCode: 404,
  })
  docs = [{ id: 'stable-123', data: () => ({ slug: 'food', status: 'draft' }) }]
  await assert.rejects(scopedTarget('directory-menu', 'food', scope), {
    statusCode: 404,
  })
})

test('order choices use slug paths but preserve stable IDs for ordering', () => {
  const menuChoices = load(
    '../runtime/menu/server/manifest/choices.ts',
    'menuChoices',
    {
      readRecordString: text,
      normalizeKitchenOfferings: () => [],
      readKitchenMenuOrdering: () => ({
        order_types: [
          {
            type: 'collection',
            kitchen_offering_id: 'lunch',
            kitchen_offering_name: 'Lunch',
          },
        ],
      }),
      isMenuOrderingEnabled: () => true,
      kitchenOrderTypeLabel: (type) => type,
      menuChoiceContextForOrderType: (type) => type,
      directoryMenuRouteScope: (kitchenSlug) => ({ kitchenSlug }),
      tenantMenuRouteScope: () => ({ kind: 'tenant' }),
      menuRoutePath: ({ scope, menuId, context, offeringId }) =>
        `/kitchens/${scope.kitchenSlug}/menus/${menuId}.${context}?offering=${offeringId}`,
    }
  )
  const [choice] = menuChoices({
    data: {
      slug: 'drinks',
      ordering: { order_types: [{ type: 'collection' }] },
    },
    menuId: 'stable-456',
    currentMenuId: 'stable-123',
    kitchenSlug: 'venue',
  })
  assert.equal(choice.menu_id, 'stable-456')
  assert.equal(
    choice.to,
    '/kitchens/venue/menus/drinks.collection?offering=lunch'
  )
  assert.equal(choice.kitchen_offering_id, 'lunch')
})

test('service identity survives Menu, canonical and QR links without changing the Menu slug', () => {
  const routes = load(
    '../runtime/menu/utils/menu-route.ts',
    '{ menuRoutePath, menuCanonicalPath, menuRouteQrPath }',
    {
      MenuRouteContexts: ['generic', 'collection'],
    }
  )
  const options = {
    scope: { kind: 'directory', kitchenSlug: 'venue' },
    menuId: 'food',
    context: 'collection',
    offeringId: 'lunch',
  }
  assert.equal(
    routes.menuRoutePath(options),
    '/kitchens/venue/menus/food.collection?offering=lunch'
  )
  assert.equal(
    routes.menuCanonicalPath(options),
    '/kitchens/venue/menus/food.collection?offering=lunch'
  )
  assert.equal(
    routes.menuRouteQrPath(options),
    '/kitchens/venue/menus/food.collection/qr?offering=lunch'
  )
  assert.equal(
    routes.menuRoutePath({
      ...options,
      offeringId: undefined,
      context: 'generic',
    }),
    '/kitchens/venue/menus/food'
  )
})
