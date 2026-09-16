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
    source: { app_id: 'a', kitchen_id: 'k', menu_id: 'food' },
    contexts: ['delivery'],
  },
  {
    id: 'drinks',
    name: 'Our cellar',
    status: 'published',
    kitchen: { name: 'Bären' },
    source: { app_id: 'a', kitchen_id: 'k', menu_id: 'drinks' },
  },
  {
    id: 'pdf',
    name: 'Christmas',
    status: 'published',
    description: 'Bären',
    kind: 'doc',
  },
  {
    id: 'other',
    name: 'Food',
    status: 'published',
    kitchen: { name: 'Bären' },
    source: { app_id: 'b', kitchen_id: 'k', menu_id: 'food' },
  },
]
const base = { query: '', service: 'all' }
test('all menus appear together, related menus group but names and cross-App ids do not merge', () => {
  const groups = groupPublicMenus(filterPublicMenus(menus, base))
  assert.equal(groups.length, 3)
  assert.deepEqual(
    groups[0].menus.map((x) => x.id),
    ['food', 'drinks']
  )
  assert.equal(groups[1].menus[0].id, 'pdf')
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
    'readMenuOrderingConfig',
    'menuSourceFromData',
  ]
)(
  ({ contentType }) => contentType === 'application/pdf' ? 'pdf' : 'document',
  (r, k) => (typeof r[k] === 'string' ? r[k] : ''),
  () => [],
  () => null,
  (d) => d.source || {}
)
test('public doorway is omitted when its KitchenMenu is missing, draft or archived', () => {
  const root = {
    id: 'root',
    data: {
      kind: 'menu',
      name: 'Food',
      status: 'published',
      source: { app_id: 'a', kitchen_id: 'k', menu_id: 'food' },
    },
  }
  for (const status of [undefined, 'draft', 'archived'])
    assert.equal(
      project(root, null, { menuData: status ? { status } : undefined }),
      null
    )
  assert.equal(
    project(root, null, {
      menuData: { status: 'published' },
    }).id,
    'root'
  )
  assert.equal(
    project(
      { id: 'pdf', data: { kind: 'doc', name: 'Menu', status: 'published' } },
      null,
      {}
    ).id,
    'pdf'
  )
})

test('offering action uses the canonical venue slug and documents open directly', () => {
  const venue = {...menus[0], source: {...menus[0].source, kitchen_slug: 'baren'}}
  const groups = groupPublicMenus([venue, menus[2]])
  assert.equal(groups[0].to, '/kitchens/baren/menus')
  assert.equal(groups[1].to, '/menus/pdf')
})

test('Menus inside a Kitchen group follow sort_order with stable ties', () => {
  const source = { app_id: 'app', kitchen_id: 'k', menu_id: 'm' }
  const entries = [
    { id: 'later', name: 'Later', source, sort_order: 20 },
    { id: 'first', name: 'First', source, sort_order: 10 },
    { id: 'tie', name: 'Tie', source, sort_order: 20 },
    { id: 'standalone', name: 'Document' },
  ]
  const groups = groupPublicMenus(entries)
  assert.deepEqual(groups[0].menus.map(menu => menu.id), ['first', 'later', 'tie'])
  assert.equal(groups[1].menus[0].id, 'standalone')
})

test('linked public Menu projects sort_order from its owned Menu', () => {
  const entry = project({ id: 'doorway', data: { status: 'published', sort_order: 99, source: { app_id: 'a', kitchen_id: 'k', menu_id: 'food' } } }, null, { menuData: { status: 'published', sort_order: 10 } })
  assert.equal(entry.sort_order, 10)
  assert.equal(project({ id: 'doc', data: { status: 'published' } }, null, {}).sort_order, undefined)
})

test('Kitchen attachments project document kind and root documents preserve their kind', () => {
  const menuData = { status: 'published', name: 'PDF Menu', doc: { url: 'https://example.com/menu.pdf', name: 'menu.pdf', type: 'application/pdf' } }
  const scoped = project({ id: 'food', data: menuData }, { appId: 'a', kitchenId: 'k', kitchenSlug: 'k' })
  assert.equal(scoped.kind, 'doc')
  assert.equal(scoped.file_kind, 'pdf')
  const root = project({ id: 'root', data: { status: 'published', kind: 'menu', source: { app_id: 'a', kitchen_id: 'k', menu_id: 'food' } } }, null, { menuData })
  assert.equal(root.kind, 'doc')
  assert.equal(project({ id: 'single', data: { status: 'published', kind: 'doc', file_kind: 'photo' } }).file_kind, 'photo')
})
