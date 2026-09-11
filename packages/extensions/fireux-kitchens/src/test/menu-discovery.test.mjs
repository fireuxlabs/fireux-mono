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
    content_kind: 'food',
    description: 'Pizza and tapas',
    kitchen: { name: 'Bären' },
    source: { app_id: 'a', kitchen_id: 'k', menu_id: 'food' },
    contexts: ['delivery'],
  },
  {
    id: 'drinks',
    name: 'Our cellar',
    status: 'published',
    content_kind: 'drinks',
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
const base = { query: '', content: 'all', service: 'all' }
test('all menus appear together, related menus group but names and cross-App ids do not merge', () => {
  const groups = groupPublicMenus(filterPublicMenus(menus, base))
  assert.equal(groups.length, 3)
  assert.deepEqual(
    groups[0].menus.map((x) => x.id),
    ['food', 'drinks']
  )
  assert.equal(groups[1].menus[0].id, 'pdf')
})
test('classification survives renaming and does not guess from a custom label', () => {
  assert.deepEqual(
    filterPublicMenus(menus, { ...base, content: 'food' }).map((x) => x.id),
    ['food']
  )
  assert.deepEqual(
    filterPublicMenus(menus, { ...base, content: 'drinks' }).map((x) => x.id),
    ['drinks']
  )
})
test('search is accent insensitive and intersects service and content filters', () => {
  assert.deepEqual(
    filterPublicMenus(menus, {
      query: 'baren pizza',
      content: 'food',
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
    'readRecordString',
    'guestDiscoverableMenuContexts',
    'readMenuOrderingConfig',
    'menuSourceFromData',
  ]
)(
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
      menuData: { status: 'published', system_kind: 'food' },
    }).content_kind,
    'food'
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
