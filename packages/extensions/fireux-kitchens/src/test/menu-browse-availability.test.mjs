import test from 'node:test'
import {
  dailyMenuSelection,
  menuLocalDate,
} from '../runtime/menu/utils/calendar/daily.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL(
    '../runtime/menu/server/index/browse-availability.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import.*\n/gm, '')
  .replace('export async', 'async')
let previewItems = [
  {
    id: 'entry',
    name: 'Octopus Roll',
    description: 'With fries',
    price: 25,
    image_url: '/octopus.jpg',
    context: 'private',
  },
]
const previewReads = []
const readSummary = compileFunction(
  stripTypeScriptTypes(source) + ';return readPublishedPublicMenuSummary',
  [
    'FieldPath',
    'dailyMenuSelection',
    'menuLocalDate',
    'readKitchenMenuSections',
  ]
)(
  { documentId: () => '__name__' },
  dailyMenuSelection,
  menuLocalDate,
  async (_db, input) => {
    previewReads.push(input)
    return [{ items: previewItems }]
  }
)
const readPublishedPublicMenuSummary = (db, id, timezone, options = {}) =>
  readSummary(db, id, timezone, {
    appId: 'app',
    currencyCode: 'CHF',
    showItemImages: false,
    ...options,
  })
const hasPublishedPublicMenu = async (db, id) =>
  (await readPublishedPublicMenuSummary(db, id, 'Europe/Zurich'))
    .hasPublishedMenu
function database(rows, fail = false) {
  const calls = []
  const query = (after = '') => ({
    where: (field, operator, value) => {
      assert.deepEqual([field, operator, value], ['status', '==', 'published'])
      return query(after)
    },
    orderBy: () => query(after),
    limit: (value) => {
      assert.equal(value, 50)
      return query(after)
    },
    startAfter: (cursor) => query(cursor),
    get: async () => {
      calls.push(after)
      if (fail) throw new Error('Unavailable')
      return {
        docs: rows
          .filter((row) => row.id > after && row.status === 'published')
          .slice(0, 50)
          .map((row) => ({ id: row.id, data: () => row })),
      }
    },
  })
  return {
    calls,
    collection: (path) => {
      assert.equal(path, 'kitchens/venue/menus')
      return query()
    },
  }
}
test('Browse availability comes from public published interactive or document Menus without service settings', async () => {
  for (const format of ['interactive', 'document']) {
    const db = database([
      { id: 'menu', status: 'published', audience: 'public', format },
    ])
    assert.equal(await hasPublishedPublicMenu(db, 'venue'), true)
  }
  assert.equal(
    await hasPublishedPublicMenu(
      database([{ id: 'default', status: 'published' }]),
      'venue'
    ),
    true
  )
})
test('draft, archived, private-link and protected-group menus do not grant public Browse', async () => {
  for (const row of [
    { status: 'draft' },
    { status: 'archived' },
    { status: 'published', audience: 'private_link' },
    { status: 'published', audience: 'protected_group' },
  ])
    assert.equal(
      await hasPublishedPublicMenu(database([{ id: 'menu', ...row }]), 'venue'),
      false
    )
  assert.equal(await hasPublishedPublicMenu(database([]), 'venue'), false)
})
test('private records before the public menu cannot hide Browse, and failed reads remain failures', async () => {
  const rows = Array.from({ length: 50 }, (_, i) => ({
    id: `a${String(i).padStart(2, '0')}`,
    status: 'published',
    audience: 'private_link',
  }))
  const db = database([
    ...rows,
    { id: 'z', status: 'published', audience: 'public' },
  ])
  assert.equal(await hasPublishedPublicMenu(db, 'venue'), true)
  assert.deepEqual(db.calls, ['', 'a49'])
  await assert.rejects(
    hasPublishedPublicMenu(database([], true), 'venue'),
    /Unavailable/
  )
})

test('Menu service choices never advertise another Menu on a basic Menu page', async () => {
  const { MenuRouteContexts } = await import(
    '../runtime/menu/models/menu-context.model.ts'
  )
  const load = (file, dependencies, result) => {
    const code = readFileSync(new URL(file, import.meta.url), 'utf8')
      .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
      .replace(/^export /gm, '')
    return compileFunction(
      stripTypeScriptTypes(code) + `;return ${result}`,
      Object.keys(dependencies)
    )(...Object.values(dependencies))
  }
  const menuRoutePath = load(
    '../runtime/menu/utils/navigation/route.ts',
    { MenuRouteContexts },
    'menuRoutePath'
  )
  const guestMenuSurfaceOptions = load(
    '../runtime/menu/utils/navigation/context.ts',
    { MenuRouteContexts, menuRoutePath },
    'guestMenuSurfaceOptions'
  )
  const choices = [
    {
      menu_id: 'other-menu',
      value: 'other',
      label: 'Other menu',
      to: '/other',
      kitchen_offering_id: 'collection',
    },
    {
      menu_id: 'current-menu',
      value: 'current',
      label: 'Current menu',
      to: '/current',
      kitchen_offering_id: 'collection',
    },
  ]
  const options = guestMenuSurfaceOptions({
    behaviour: { choices },
    menuId: 'current-menu',
    menuSlug: 'menu-route-slug',
    routeScope: { kind: 'directory', kitchenSlug: 'venue' },
    activeContext: 'generic',
  })
  assert.equal(options[0].to, '/kitchens/venue/menus/menu-route-slug')
  assert.deepEqual(
    options.map((option) => option.value),
    ['generic', 'current']
  )
  const basic = guestMenuSurfaceOptions({
    behaviour: { choices },
    menuId: 'unlinked-menu',
    menuSlug: 'menu-route-slug',
    routeScope: { kind: 'directory', kitchenSlug: 'venue' },
    activeContext: 'generic',
  })
  assert.deepEqual(
    basic.map((option) => option.value),
    ['generic']
  )
})

test('Kitchen card discovers the next special across all Menu pages without private, expired or generic daily entries', async () => {
  const special = {
    status: 'published',
    schedule: 'daily',
    purpose: 'specials',
    slug: 'specials',
    published_dates: ['2099-11-23'],
  }
  const rows = Array.from({ length: 50 }, (_, i) => ({
    id: `a${String(i).padStart(2, '0')}`,
    status: 'published',
  }))
  const db = database([...rows, { id: 'z', ...special }])
  const summary = await readPublishedPublicMenuSummary(
    db,
    'venue',
    'Europe/Zurich'
  )
  assert.equal(summary.hasPublishedMenu, true)
  assert.equal(summary.special.date, '2099-11-23')
  assert.equal(summary.special.today, false)
  assert.deepEqual(db.calls, ['', 'a49'])
  for (const changes of [
    { audience: 'private_link' },
    { audience: 'protected_group' },
    { status: 'draft' },
    { purpose: undefined },
    { published_dates: ['2000-01-01'] },
    { published_dates: [] },
  ])
    assert.equal(
      (
        await readPublishedPublicMenuSummary(
          database([{ id: 's', ...special, ...changes }]),
          'venue',
          'Europe/Zurich'
        )
      ).special,
      undefined
    )
  assert.equal(
    (
      await readPublishedPublicMenuSummary(
        database([{ id: 's', ...special }]),
        'venue',
        'invalid'
      )
    ).special,
    undefined
  )
})

test('special preview reads only its published date and returns bounded dish truth with optional images', async () => {
  const menu = {
    id: 'special',
    status: 'published',
    schedule: 'daily',
    purpose: 'specials',
    slug: 'specials',
    published_dates: ['2099-11-23'],
  }
  const original = previewItems
  try {
    previewItems = Array.from({ length: 5 }, (_, i) => ({
      ...original[0],
      id: String(i),
    }))
    const plain = await readPublishedPublicMenuSummary(
      database([menu]),
      'venue',
      'Europe/Zurich'
    )
    assert.equal(plain.special.items.length, 3)
    assert.equal(plain.special.items[0].name, 'Octopus Roll')
    assert.equal(plain.special.currencyCode, 'CHF')
    assert.equal('imageUrl' in plain.special.items[0], false)
    assert.equal('context' in plain.special.items[0], false)
    assert.equal(previewReads.at(-1).date, '2099-11-23')
    assert.equal(previewReads.at(-1).menuId, 'special')
    const pictured = await readPublishedPublicMenuSummary(
      database([menu]),
      'venue',
      'Europe/Zurich',
      { showItemImages: true }
    )
    assert.equal(pictured.special.items[0].imageUrl, '/octopus.jpg')
    previewItems = []
    assert.equal(
      (
        await readPublishedPublicMenuSummary(
          database([menu]),
          'venue',
          'Europe/Zurich'
        )
      ).special,
      undefined
    )
  } finally {
    previewItems = original
  }
})
