import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
function load(path, names, dependencies = {}) {
  const source = readFileSync(
    new URL(`../runtime/${path}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return {${names}}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const routes = load('kitchen/utils/kitchen-menu-route', 'menuRoutePath', {
  MenuRouteContexts: [
    'generic',
    'collection',
    'delivery',
    'pre_order',
    'kiosk',
  ],
})
const { kitchenOrderingChoices } = load(
  'kitchen/utils/kitchen-ordering-choices',
  'kitchenOrderingChoices',
  routes
)
const { kitchenWebsiteOrderUrl, menuWebsiteSnippet } = load(
  'kitchen/utils/menu-website-snippet',
  'kitchenWebsiteOrderUrl,menuWebsiteSnippet',
  routes
)
const scope = { kind: 'directory', kitchenSlug: 'venue' }
const food = {
  id: 'food-id',
  slug: 'food',
  name: 'Food',
  kind: 'menu',
  status: 'published',
  offering_options: [
    {
      kitchen_offering_id: 'dinner',
      kitchen_offering_name: 'Dinner',
      type: 'collection',
    },
    {
      kitchen_offering_id: 'dinner',
      kitchen_offering_name: 'Dinner',
      type: 'delivery',
    },
  ],
}
test('Kitchen chooser groups eligible menus by mode and offering, preserving service identity in checkout links', () => {
  const result = kitchenOrderingChoices(
    [food, { ...food, id: 'drinks-id', slug: 'drinks', name: 'Drinks' }],
    scope
  )
  assert.deepEqual(
    result.map((row) => row.type),
    ['collection', 'delivery']
  )
  assert.deepEqual(
    result[0].offerings[0].menus.map((row) => row.name),
    ['Food', 'Drinks']
  )
  assert.equal(
    result[0].offerings[0].menus[0].to,
    '/kitchens/venue/menus/food.collection?offering=dinner'
  )
})
test('paused, unpublished, document, diagnostic and kiosk options are not online choices', () => {
  for (const menu of [
    { ...food, status: 'draft' },
    { ...food, kind: 'doc' },
    {
      ...food,
      offering_options: food.offering_options.map((row) => ({
        ...row,
        paused: true,
      })),
    },
    {
      ...food,
      offering_options: [{ kitchen_offering_id: 'counter', type: 'eat_in' }],
    },
    { ...food, offering_options: [] },
  ])
    assert.deepEqual(kitchenOrderingChoices([menu], scope), [])
})
test('same-named offerings retain distinct identities and tenant routes', () => {
  const menu = {
    ...food,
    offering_options: [
      {
        kitchen_offering_id: 'early',
        kitchen_offering_name: 'Dinner',
        type: 'collection',
      },
      {
        kitchen_offering_id: 'late',
        kitchen_offering_name: 'Dinner',
        type: 'collection',
      },
    ],
  }
  const [choice] = kitchenOrderingChoices([menu], { kind: 'tenant' })
  assert.deepEqual(
    choice.offerings.map((row) => row.id),
    ['early', 'late']
  )
  assert.equal(choice.offerings[1].menus[0].to, '/food.collection?offering=late')
})
test('stable website button targets Kitchen rather than a current Menu or service', () => {
  const url = kitchenWebsiteOrderUrl({ origin: 'https://misebox.app', scope })
  assert.equal(url, 'https://misebox.app/kitchens/venue/order')
  assert.equal(
    kitchenWebsiteOrderUrl({
      origin: 'https://tenant.example',
      scope: { kind: 'tenant' },
    }),
    'https://tenant.example/order'
  )
  assert.ok(
    menuWebsiteSnippet(url).includes(
      'href="https://misebox.app/kitchens/venue/order"'
    )
  )
  assert.equal(
    kitchenWebsiteOrderUrl({
      origin: 'https://misebox.app',
      scope: { kind: 'directory', kitchenSlug: '' },
    }),
    ''
  )
  for (const origin of [
    'javascript:alert(1)',
    'http://untrusted.example',
    'https://user:password@misebox.app',
  ])
    assert.equal(kitchenWebsiteOrderUrl({ origin, scope }), '')
})

test('public menu projection exposes per-option pause without private operational settings', () => {
  const project = load(
    'menu/server/index/projection',
    'projectMenuDirectoryEntry',
    {
      documentKindFromFile: () => 'pdf',
      readRecordString: (data, key) =>
        typeof data[key] === 'string' ? data[key] : '',
      guestDiscoverableMenuContexts: () => [],
      readKitchenPublicOfferings: () => [],
      menuSourceFromData: () => ({
        app_id: 'app',
        kitchen_id: 'venue',
        menu_id: 'food',
      }),
      readKitchenMenuOrdering: () => ({
        enabled: true,
        order_types: [
          {
            type: 'delivery',
            kitchen_offering_id: 'dinner',
            kitchen_offering_name: 'Dinner',
            availability: { paused: true, message: 'internal' },
            notifications: { whatsapp: { recipient_phone: 'private' } },
          },
        ],
      }),
    }
  ).projectMenuDirectoryEntry
  const result = project(
    { id: 'food', data: { status: 'published', slug: 'food', name: 'Food' } },
    { appId: 'app', kitchenId: 'venue', kitchenSlug: 'venue' },
    { kitchenOfferings: [] }
  )
  assert.deepEqual(result.offering_options, [
    {
      type: 'delivery',
      kitchen_offering_id: 'dinner',
      kitchen_offering_name: 'Dinner',
      paused: true,
    },
  ])
})
