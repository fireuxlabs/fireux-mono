import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'

function load(path, names, dependencies = {}) {
  const source = readFileSync(
    new URL(`../runtime/${path}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const model = load('menu/models/menu-context.model', 'MenuRouteContexts')
const routes = load(
  'kitchen/utils/kitchen-menu-route',
  'menuRoutePath, menuRouteProjection',
  model
)
const contexts = load(
  'menu/utils/menu-context',
  'menuChoiceContextForOrderType',
  { ...model, ...routes }
)
const labels = load(
  'kitchen/utils/kitchen-order-label',
  'kitchenOrderTypeLabel'
)
const website = load(
  'kitchen/utils/menu-website-snippet',
  'websiteOrderContexts, menuWebsiteOrderUrl, menuWebsiteOrigin',
  routes
)
const { resolveKitchenServiceHours } = load(
  'kitchen/utils/ordering-service-hours',
  'resolveKitchenServiceHours'
)
const { menuServiceSummaries } = load(
  'kitchen/utils/menu-service-summary',
  'menuServiceSummaries',
  { ...routes, ...contexts, ...labels, ...website, resolveKitchenServiceHours }
)

const menu = { id: 'stable-id', slug: 'comida-casera', status: 'published' }
const service = (type, changes = {}) => ({
  type,
  enabled: true,
  menu_ids: [menu.id],
  ...changes,
})
const summarize = (services, changes = {}) =>
  menuServiceSummaries({
    menu,
    services,
    scope: { kind: 'directory', kitchenSlug: 'la-tapberne' },
    origin: 'http://localhost:3001',
    ...changes,
  })

test('membership uses stable identity and retains disabled services', () => {
  const result = summarize([
    service('pre_order', { enabled: false }),
    service('delivery', { menu_ids: [menu.slug] }),
  ])
  assert.equal(result.length, 1)
  assert.equal(result[0].state, 'Off')
  assert.equal(result[0].customerUrl, '')
  assert.equal(
    result[0].configurePath,
    '/workspace/kitchen/orders/ordering/pre_order'
  )
})

test('pause, publication and service enablement independently gate customer links', () => {
  assert.equal(
    summarize([service('pre_order')])[0].customerUrl,
    'http://localhost:3001/kitchens/la-tapberne/menus/comida-casera.pre_order'
  )
  for (const status of ['draft', 'archived']) {
    const [entry] = summarize([service('pre_order')], {
      menu: { ...menu, status },
    })
    assert.equal(entry.state, 'Enabled')
    assert.equal(entry.customerUrl, '')
  }
  const [paused] = summarize([
    service('pre_order', { availability: { paused: true } }),
  ])
  assert.equal(paused.state, 'Paused')
  assert.equal(paused.customerUrl, '')
})

test('kiosk activation and unfinished contexts never expose public ordering links', () => {
  for (const type of ['eat_in', 'takeaway', 'dine_in', 'room_service']) {
    const [entry] = summarize([service(type)])
    assert.equal(entry.customerUrl, '')
    assert.equal(entry.kiosk, ['eat_in', 'takeaway'].includes(type))
    assert.equal(entry.diagnostic, ['dine_in', 'room_service'].includes(type))
  }
})

test('document menus remain browse-only even when published and included in a service', () => {
  const [entry] = summarize([service('pre_order')], {
    menu: { ...menu, doc: { url: 'https://example.com/menu.pdf' } },
  })
  assert.equal(entry.state, 'Enabled')
  assert.equal(entry.customerUrl, '')
})

test('customer links follow current slugs, tenant scope and local customer origin', () => {
  const origin = website.menuWebsiteOrigin(
    'http://workspace.localhost:3001',
    'https://misebox.app'
  )
  assert.equal(origin, 'http://localhost:3001')
  assert.equal(
    summarize([service('collection')], {
      origin,
      scope: { kind: 'tenant' },
      menu: { ...menu, slug: 'renamed-menu' },
    })[0].customerUrl,
    'http://localhost:3001/renamed-menu.collection'
  )
  assert.equal(
    summarize([service('delivery')], {
      scope: { kind: 'directory', kitchenSlug: '' },
    })[0].customerUrl,
    ''
  )
  assert.equal(
    summarize([service('delivery')], { origin: '' })[0].customerUrl,
    ''
  )
})

test('Menu hours show their effective owner and shared service membership', () => {
  const kitchenHours = {
    source: 'place',
    timezone: 'Europe/Zurich',
    windows: [{ days: ['friday'], open: '12:00', close: '23:00' }],
  }
  const [inherited] = summarize(
    [service('pre_order', { menu_ids: [menu.id, 'drinks', menu.id] })],
    { kitchenHours }
  )
  assert.equal(inherited.hoursSource, 'Venue hours via Kitchen')
  assert.deepEqual(inherited.hours, kitchenHours)
  assert.equal(inherited.sharedMenuCount, 2)
  const [kitchen] = summarize([service('collection')], {
    kitchenHours: { ...kitchenHours, source: 'custom' },
  })
  assert.equal(kitchen.hoursSource, 'Kitchen hours')
  const [otherMenu] = summarize(
    [service('pre_order', { menu_ids: [menu.id, 'drinks'] })],
    { kitchenHours, menu: { ...menu, id: 'drinks' } }
  )
  assert.deepEqual(otherMenu.hours, inherited.hours)
})

test('custom service hours remain independent of venue and Kitchen times', () => {
  const kitchenHours = {
    source: 'place',
    timezone: 'Europe/Zurich',
    windows: [{ days: ['friday'], open: '12:00', close: '23:00' }],
  }
  const custom = {
    source: 'custom',
    timezone: 'Europe/Zurich',
    windows: [{ days: ['monday'], open: '00:00', close: '00:00' }],
  }
  const [entry] = summarize(
    [
      service('room_service', {
        availability: { paused: true },
        service_hours: {
          inherit_kitchen_operation_hours: false,
          operation_hours: custom,
        },
      }),
    ],
    { kitchenHours }
  )
  assert.equal(entry.state, 'Paused')
  assert.equal(entry.hoursSource, 'Separate service hours')
  assert.deepEqual(entry.hours, custom)
  assert.equal(entry.diagnostic, true)
  assert.deepEqual(
    summarize([service('delivery', { menu_ids: ['another-menu'] })], {
      kitchenHours,
    }),
    []
  )
  const [missing] = summarize([service('collection', { enabled: false })], {
    kitchenHours: { ...kitchenHours, windows: [] },
  })
  assert.equal(missing.hours, undefined)
  assert.equal(missing.state, 'Off')
})
