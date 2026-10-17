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
  'menu/utils/menu-route',
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
const table = load('kitchen/utils/table-service', 'tableChannelEnabled')
const website = load(
  'kitchen/utils/menu-website-snippet',
  'websiteOrderContexts, menuWebsiteOrderUrl, menuWebsiteOrigin',
  { ...routes, ...table }
)
const { menuOfferingSummaries } = load(
  'kitchen/utils/menu-offering-summary',
  'menuOfferingSummaries',
  { ...routes, ...contexts, ...labels, ...website, ...table }
)

const hours = {
  source: 'custom',
  timezone: 'Europe/Zurich',
  windows: [{ days: ['monday'], open: '07:00', close: '10:00' }],
}
const menu = { id: 'menu-id', slug: 'breakfast', status: 'published' }
const service = (id = 'breakfast', changes = {}) => ({
  id,
  name: id,
  enabled: true,
  menu_ids: [menu.id],
  hours,
  interactions: [
    { type: 'browse', enabled: true },
    { type: 'pre_order', enabled: true },
  ],
  ...changes,
})
const summarize = (offerings, changes = {}) =>
  menuOfferingSummaries({
    menu,
    offerings,
    scope: { kind: 'directory', kitchenSlug: 'hotel' },
    origin: 'http://localhost:3001',
    ...changes,
  })

test('named offerings sharing a Menu and interaction keep distinct identities and links', () => {
  const rows = summarize([service('breakfast'), service('dinner')])
  assert.deepEqual(
    rows.map((row) => row.id),
    ['breakfast', 'dinner']
  )
  assert.equal(
    rows[0].configurePath,
    '/workspace/kitchen/services/breakfast'
  )
  assert.equal(
    rows[0].interactions[1].customerUrl,
    'http://localhost:3001/kitchens/hotel/menus/breakfast.pre_order?offering=breakfast'
  )
  assert.equal(
    rows[1].interactions[1].customerUrl,
    'http://localhost:3001/kitchens/hotel/menus/breakfast.pre_order?offering=dinner'
  )
})
test('membership uses stable Menu identity and retains service and interaction Off states', () => {
  const rows = summarize([
    service('off', { enabled: false }),
    service('wrong', { menu_ids: [menu.slug] }),
  ])
  assert.equal(rows.length, 1)
  assert.equal(rows[0].state, 'Off')
  assert.equal(rows[0].interactions[1].state, 'Enabled')
  assert.equal(rows[0].interactions[1].customerUrl, '')
  const [row] = summarize([
    service('disabled', {
      interactions: [{ type: 'delivery', enabled: false }],
    }),
  ])
  assert.equal(row.interactions[0].state, 'Off')
})
test('paused interactions stay configured but have no customer link', () => {
  const [row] = summarize([
    service('breakfast', {
      interactions: [
        { type: 'pre_order', enabled: true, availability: { paused: true } },
      ],
    }),
  ])
  assert.equal(row.state, 'Enabled')
  assert.equal(row.interactions[0].state, 'Paused')
  assert.equal(row.interactions[0].customerUrl, '')
})
test('explicit service hours never inherit venue or Kitchen times', () => {
  const [row] = summarize([service('breakfast', { hours: undefined })], {
    kitchenHours: hours,
  })
  assert.equal(row.hours, undefined)
  assert.equal(row.interactions[1].customerUrl, '')
  assert.ok(row.interactions[0].customerUrl)
  assert.deepEqual(summarize([service()])[0].hours, hours)
})
test('publication and document mode gate interactions independently from service configuration', () => {
  for (const status of ['draft', 'archived']) {
    const [row] = summarize([service()], { menu: { ...menu, status } })
    assert.equal(row.state, 'Enabled')
    assert.ok(row.interactions.every((item) => !item.customerUrl))
  }
  const [doc] = summarize([service()], {
    menu: { ...menu, doc: { url: 'https://example.test/menu.pdf' } },
  })
  assert.ok(doc.interactions[0].customerUrl)
  assert.equal(doc.interactions[1].customerUrl, '')
})
test('kiosk and diagnostic interactions do not advertise a public ordering link', () => {
  const [row] = summarize([
    service('breakfast', {
      interactions: ['eat_in', 'takeaway', 'room_service'].map(
        (type) => ({ type, enabled: true })
      ),
    }),
  ])
  for (const item of row.interactions) {
    assert.equal(item.customerUrl, '')
    assert.equal(item.kiosk, ['eat_in', 'takeaway'].includes(item.type))
    assert.equal(
      item.diagnostic,
      item.type === 'room_service'
    )
  }
})
test('service links preserve tenant routing and local customer origin', () => {
  const origin = website.menuWebsiteOrigin(
    'http://workspace.localhost:3001',
    'https://misebox.app'
  )
  assert.equal(origin, 'http://localhost:3001')
  const [row] = summarize([service('morning special')], {
    origin,
    scope: { kind: 'tenant' },
  })
  assert.equal(
    row.interactions[1].customerUrl,
    'http://localhost:3001/breakfast.pre_order?offering=morning%20special'
  )
  assert.ok(
    summarize([service()], { origin: '' })[0].interactions.every(
      (item) => !item.customerUrl
    )
  )
})

test('table links preserve Menu and offering identity and respect every eligibility gate', () => {
  const interaction = { type: 'dine_in', enabled: true }
  const link = (changes = {}, menuChanges = {}, serviceChanges = {}, scope = { kind: 'directory', kitchenSlug: 'hotel' }) => summarize([
    service('table service', { interactions: [{ ...interaction, ...changes }], ...serviceChanges }),
  ], { menu: { ...menu, ...menuChanges }, scope })[0]?.interactions[0]
  assert.equal(link().customerUrl, 'http://localhost:3001/kitchens/hotel/menus/breakfast.table?offering=table%20service')
  assert.equal(link().diagnostic, false)
  assert.equal(link({}, {}, {}, { kind: 'tenant' }).customerUrl, 'http://localhost:3001/breakfast.table?offering=table%20service')
  for (const changes of [
    { enabled: false },
    { availability: { paused: true } },
    { table_channels: { staff_pos: true, table_qr: false } },
  ]) assert.equal(link(changes).customerUrl, '')
  assert.ok(link({ table_channels: { staff_pos: false, table_qr: true } }).customerUrl)
  for (const changes of [{ status: 'draft' }, { status: 'archived' }, { doc: { url: 'https://example.test/menu.pdf' } }])
    assert.equal(link({}, changes).customerUrl, '')
  for (const changes of [{ enabled: false }, { hours: undefined }, { hours: { timezone: '', windows: [] } }])
    assert.equal(link({}, {}, changes).customerUrl, '')
  assert.equal(link({}, {}, { menu_ids: ['another-menu'] }), undefined)
})
