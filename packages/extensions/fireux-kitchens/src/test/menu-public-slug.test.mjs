import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { menuCanonicalPath } from '../runtime/menu/utils/navigation/route.ts'

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
test('public directory and tenant Menu links follow the owning Kitchen identity', async () => {
  const kitchens = [
    {
      id: 'a',
      data: {
        identity: { slug: 'new-name' },
        slug: 'old-name',
        management: { mode: 'app', app_id: 'tenant' },
      },
    },
    { id: 'b', data: { identity: { slug: 'old-name' } } },
  ]
  const query = (rows) => ({
    where: (key, operator, value) => {
      assert.equal(operator, '==')
      return query(
        rows.filter(
          ({ data }) =>
            key.split('.').reduce((current, part) => current?.[part], data) ===
            value
        )
      )
    },
    limit: (count) => query(rows.slice(0, count)),
    get: async () => ({
      size: rows.length,
      docs: rows.map(({ id, data }) => ({ id, data: () => data })),
    }),
  })
  const getRuntimeFirestore = () => ({
    collection: (name) => {
      assert.equal(name, 'kitchens')
      return query(kitchens)
    },
  })
  const readKitchenByRouteSlug = load(
    '../runtime/kitchen/server/identity/route-identity.ts',
    'readKitchenByRouteSlug',
    {}
  )
  const readMenuKitchenBySlug = load(
    '../runtime/menu/server/ownership/kitchen-scope.ts',
    'readMenuKitchenBySlug',
    { getRuntimeFirestore, readKitchenByRouteSlug }
  )
  const { resolveDirectoryMenuScope, resolveTenantMenuScope } = load(
    '../runtime/menu/server/ownership/app-scope.ts',
    '({ resolveDirectoryMenuScope, resolveTenantMenuScope })',
    {
      getRuntimeFirestore,
      readMenuKitchenBySlug,
      readRecordString: text,
      useRuntimeConfig: () => ({
        public: { fireux: { id: 'tenant', role: 'tenant' } },
      }),
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
    }
  )
  const directory = await resolveDirectoryMenuScope('NEW-NAME')
  const canonical = (scope, source) =>
    menuCanonicalPath({
      scope,
      menuId: 'lunch',
      sourceMenuSlug: 'lunch',
      sourceKitchenSlug: source.kitchenSlug,
    })
  assert.equal(directory.kitchenId, 'a')
  assert.equal(
    canonical({ kind: 'directory', kitchenSlug: 'new-name' }, directory),
    '/kitchens/new-name/menus/lunch'
  )
  assert.equal((await resolveDirectoryMenuScope('old-name')).kitchenId, 'b')

  delete kitchens[0].data.slug
  const tenant = await resolveTenantMenuScope()
  assert.equal(tenant.kitchenId, 'a')
  assert.equal(tenant.kitchenSlug, 'new-name')
  assert.equal(canonical({ kind: 'tenant' }, tenant), '/lunch')

  kitchens[1].data.management = kitchens[0].data.management
  await assert.rejects(resolveTenantMenuScope(), { statusCode: 500 })
})

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
      readKitchenPresentation: () => ({}),
      readMenuKitchenFulfilment: async () => {
        throw new Error('Catalogue resolution must not read fulfilment policy')
      },
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
  assert.equal(target.scope.kitchenSlug, 'venue')
  assert.equal('fulfilment' in target.scope, false)
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
    '../runtime/menu/utils/navigation/route.ts',
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

test('venue Menu entrance is singular while existing Menu and QR destinations stay stable', () => {
  const routes = load(
    '../runtime/menu/utils/navigation/route.ts',
    '{ menuRouteIndexPath, menuRoutePath, menuRouteQrPath }',
    { MenuRouteContexts: ['generic'] }
  )
  const scope = { kind: 'directory', kitchenSlug: 'baeren-ringgenberg' }
  assert.equal(
    routes.menuRouteIndexPath(scope),
    '/kitchens/baeren-ringgenberg/menu'
  )
  assert.equal(
    routes.menuRoutePath({ scope, menuId: 'food' }),
    '/kitchens/baeren-ringgenberg/menus/food'
  )
  assert.equal(
    routes.menuRouteQrPath({ scope, menuId: 'food' }),
    '/kitchens/baeren-ringgenberg/menus/food/qr'
  )
  assert.equal(routes.menuRouteIndexPath({ kind: 'root' }), '/menus')
})

test('protected group fails closed before detail or document content is assembled', async () => {
  const scopedTarget = load(
    '../runtime/menu/server/ownership/scoped-target.ts',
    'scopedTarget',
    {
      getRuntimeFirestore: () => ({
        collection: () => ({
          where: () => ({
            limit: () => ({
              get: async () => ({
                docs: [
                  {
                    id: 'm',
                    data: () => ({
                      status: 'published',
                      audience: 'protected_group',
                    }),
                  },
                ],
              }),
            }),
          }),
        }),
      }),
      readMenuKitchenPlaceData: async () => ({}),
      readRecordString: (record, key) => String(record[key] || ''),
      createError: (value) =>
        Object.assign(new Error(value.statusMessage), value),
      readKitchenPresentation: () => {
        throw new Error('Must not assemble content')
      },
    }
  )
  await assert.rejects(
    scopedTarget('directory-menu', 'wedding', {
      appId: 'a',
      kitchenId: 'k',
      kitchenSlug: 'venue',
      rootKitchenData: {},
    }),
    (error) => error.statusCode === 403
  )
})

test('collection entrance preserves its purpose while Browse remains the venue Menu', () => {
  const path = load(
    '../runtime/menu/utils/navigation/route.ts',
    'menuRouteIndexPath',
    { MenuRouteContexts: ['generic', 'collection'] }
  )
  const scope = { kind: 'directory', kitchenSlug: 'venue' }
  assert.equal(path(scope, 'collection'), '/kitchens/venue/menu.collection')
  assert.equal(path(scope), '/kitchens/venue/menu')
})

test('delivery entrance keeps its service without changing individual Menu and QR paths', () => {
  const path = load(
    '../runtime/menu/utils/navigation/route.ts',
    'menuRouteIndexPath',
    { MenuRouteContexts: ['generic', 'collection', 'delivery'] }
  )
  const scope = { kind: 'directory', kitchenSlug: 'venue' }
  assert.equal(path(scope, 'delivery'), '/kitchens/venue/menu.delivery')
  assert.equal(path(scope), '/kitchens/venue/menu')
})
