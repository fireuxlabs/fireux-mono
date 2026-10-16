import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL('../runtime/menu/utils/menu-discovery.ts', import.meta.url),
  'utf8'
)
  .replace(/^import type .*\n/gm, '')
  .replace(/^export /gm, '')
const { filterPublicMenus, groupPublicMenus } = compileFunction(
  `${stripTypeScriptTypes(source)}; return { filterPublicMenus, groupPublicMenus }`
)()
const menus = [
  {
    id: 'food',
    name: 'Comida Casera',
    status: 'published',
    description: 'Pizza and tapas',
    kitchen: { name: 'Bären' },
    source: { app_id: 'a', kitchen_id: 'k', kitchen_slug: 'baren', menu_id: 'food' },
    contexts: ['delivery'],
  },
  {
    id: 'drinks',
    name: 'Our cellar',
    status: 'published',
    kitchen: { name: 'Bären' },
    source: { app_id: 'a', kitchen_id: 'k', kitchen_slug: 'baren', menu_id: 'drinks' },
  },
  {
    id: 'pdf',
    name: 'Christmas',
    status: 'published',
    description: 'Bären',
    kind: 'doc',
    source: { app_id: 'a', kitchen_id: 'k', kitchen_slug: 'baren', menu_id: 'pdf' },
  },
  {
    id: 'other',
    name: 'Food',
    status: 'published',
    kitchen: { name: 'Bären' },
    source: { app_id: 'b', kitchen_id: 'k', kitchen_slug: 'baren', menu_id: 'food' },
  },
]
const base = { query: '', service: 'all' }
test('all menus appear together, related menus group but names and cross-App ids do not merge', () => {
  const groups = groupPublicMenus(filterPublicMenus(menus, base))
  assert.equal(groups.length, 2)
  assert.deepEqual(
    groups[0].menus.map((x) => x.id),
    ['food', 'drinks', 'pdf']
  )
  assert.equal(groups[1].menus[0].id, 'other')
})
test('search is accent insensitive and intersects service filters', () => {
  assert.deepEqual(
    filterPublicMenus(menus, {
      query: 'baren pizza',
      service: 'delivery',
    }).map((x) => x.id),
    ['food']
  )
  assert.equal(
    filterPublicMenus(menus, { ...base, service: 'collection' }).length,
    0
  )
  assert.equal(
    filterPublicMenus(menus, { ...base, query: 'nonexistent' }).length,
    0
  )
})

const projectionSource = readFileSync(
  new URL('../runtime/menu/server/index/projection.ts', import.meta.url),
  'utf8'
)
  .replace(/^import .*\n/gm, '')
  .replace(/^export /gm, '')
const project = compileFunction(
  `${stripTypeScriptTypes(projectionSource)}; return projectMenuDirectoryEntry`,
  [
    'documentKindFromFile',
    'readRecordString',
    'guestDiscoverableMenuContexts',
    'readKitchenMenuOrdering',
    'menuSourceFromData',
    'readKitchenPublicOfferings',
  ]
)(
  ({ contentType }) => (contentType === 'application/pdf' ? 'pdf' : 'document'),
  (r, k) => (typeof r[k] === 'string' ? r[k] : ''),
  () => [],
  () => null,
  (d) => d.source || {},
  () => []
)
test('discovery projects canonical Kitchen Menus and rejects unowned or unpublished records', () => {
  const scope = { appId: 'a', kitchenId: 'k', kitchenSlug: 'baren' }
  const document = { id: 'food', data: { name: 'Food', slug: 'food', format: 'interactive', status: 'published' } }
  assert.equal(project(document, null), null)
  for (const status of ['draft', 'archived'])
    assert.equal(project({ ...document, data: { ...document.data, status } }, scope), null)
  const entry = project(document, scope)
  assert.equal(entry.id, 'food')
  assert.equal(entry.kind, 'menu')
  assert.equal(entry.source.kitchen_id, 'k')
  assert.equal(entry.source.menu_id, 'food')
  const doc = project({ id: 'wine', data: { name: 'Wine', slug: 'wine', status: 'published', format: 'document', doc: { type: 'application/pdf' } } }, scope)
  assert.equal(doc.kind, 'doc')
  assert.equal(doc.file_kind, 'pdf')
})

test('offering action uses the canonical venue slug and documents open directly', () => {
  const venue = {
    ...menus[0],
    source: { ...menus[0].source, kitchen_slug: 'baren' },
  }
  const groups = groupPublicMenus([venue, menus[2]])
  assert.equal(groups[0].to, '/kitchens/baren/menu')
  assert.equal(groups.length, 1)
})

test('Menus inside a Kitchen group follow sort_order with stable ties', () => {
  const source = { app_id: 'app', kitchen_id: 'k', kitchen_slug: 'baren', menu_id: 'm' }
  const entries = [
    { id: 'later', name: 'Later', source, sort_order: 20 },
    { id: 'first', name: 'First', source, sort_order: 10 },
    { id: 'tie', name: 'Tie', source, sort_order: 20 },
    { id: 'standalone', name: 'Document' },
  ]
  const groups = groupPublicMenus(entries)
  assert.deepEqual(
    groups[0].menus.map((menu) => menu.id),
    ['first', 'later', 'tie']
  )
  assert.equal(groups.length, 1)
})

test('canonical Menus provide their own sort order and document format', () => {
  const scope = { appId: 'a', kitchenId: 'k', kitchenSlug: 'baren' }
  assert.equal(project({ id: 'food', data: { status: 'published', format: 'interactive', sort_order: 10 } }, scope).sort_order, 10)
  const doc = project({ id: 'wine', data: { status: 'published', format: 'document', doc: { type: 'application/pdf' } } }, scope)
  assert.equal(doc.kind, 'doc')
  assert.equal(doc.file_kind, 'pdf')
})

test('private and protected Menus never enter scoped or global discovery, including stale public doorways', () => {
  const scoped = { appId: 'a', kitchenId: 'k', kitchenSlug: 'venue' }
  for (const audience of ['private_link', 'protected_group', 'unknown']) {
    const document = {
      id: 'm',
      data: { status: 'published', name: 'Wedding', audience },
    }
    assert.equal(project(document, scoped), null)
    const root = {
      id: 'root',
      data: {
        status: 'published',
        name: 'Wedding',
        source: { app_id: 'a', kitchen_id: 'k', kitchen_slug: 'baren', menu_id: 'm' },
      },
    }
    assert.equal(
      project(root, null, { menuData: { status: 'published', audience } }),
      null
    )
  }
})

test('directory exposes enabled room-service schedules without changing public order types', () => {
  const projectRoomMenu = compileFunction(
    stripTypeScriptTypes(projectionSource) + '; return projectMenuDirectoryEntry',
    ['documentKindFromFile', 'readRecordString', 'guestDiscoverableMenuContexts', 'readKitchenMenuOrdering', 'menuSourceFromData', 'readKitchenPublicOfferings', 'publicMenuOrderTypes']
  )(
    () => 'document',
    (record, key) => typeof record[key] === 'string' ? record[key] : '',
    () => [],
    () => ({ order_types: [
      { type: 'room_service', kitchen_offering_id: 'rooms', kitchen_offering_name: 'Evening' },
      { type: 'room_service', kitchen_offering_id: 'paused', availability: { paused: true } },
      { type: 'pre_order', kitchen_offering_id: 'preorder' },
    ] }),
    () => ({}),
    () => [{ id: 'rooms', paused: false, hours: { windows: [{}] } }],
    () => [],
  )
  const result = projectRoomMenu({ id: 'main', data: { status: 'published', slug: 'main', name: 'Main' } }, { kitchenId: 'k', appId: 'a' }, {})
  assert.deepEqual(result.offering_options.map((option) => option.kitchen_offering_id), ['rooms'])
  assert.equal(result.offerings[0].id, 'rooms')
})
