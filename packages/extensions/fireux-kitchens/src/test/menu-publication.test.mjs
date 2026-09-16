import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(relative, dependencies, name) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const validate = load(
  '../runtime/menu/server/publication/validation.ts',
  {},
  'assertKitchenMenuCanPublish'
)
const stamp = { by: 'operator', app_id: 'misebox', at: 'audit-time' }
const publish = load(
  '../runtime/menu/server/publication/publish.ts',
  {
    assertKitchenMenuCanPublish: validate,
    serverAuditStamp: (input) => {
      assert.deepEqual(input, { by: 'operator', appId: 'misebox' })
      return stamp
    },
    serverKitchenMenusTarget: (kitchenId) => `kitchens/${kitchenId}/menus`,
  },
  'publishKitchenMenu'
)

function harness({
  menu = { name: 'Lunch', status: 'draft' },
  exists = true,
  sections = [{ items: [{ dish_id: 'dish' }] }],
  dishes = ['dish'],
  writeFailure,
  projectionFailure,
} = {}) {
  const calls = []
  const row = (data) => ({ get: (key) => data[key] })
  const menuRef = {
    get: async () => ({ exists, data: () => menu }),
    collection: (name) => {
      assert.equal(name, 'sections')
      calls.push('read-sections')
      return {
        get: async () => ({
          docs: sections.map((section) => ({
            ...row(section),
            ref: {
              collection: (name) => {
                assert.equal(name, 'items')
                return { get: async () => ({ docs: section.items.map(row) }) }
              },
            },
          })),
        }),
      }
    },
  }
  const db = {
    doc: (path) => {
      if (path === 'kitchens/k/menus/m') return menuRef
      assert.match(path, /^kitchens\/k\/dishes\//)
      calls.push(`read-dish:${path.split('/').at(-1)}`)
      return {
        get: async () => ({ exists: dishes.includes(path.split('/').at(-1)) }),
      }
    },
  }
  return {
    menu,
    calls,
    publish: () =>
      publish(
        {
          appId: 'misebox',
          db,
          kitchenId: 'k',
          kitchenPath: 'kitchens/k',
          menuId: 'm',
          uid: 'operator',
        },
        {
          updateMenu: async (target, id, changes) => {
            calls.push('write-menu')
            assert.equal(target, 'kitchens/k/menus')
            assert.equal(id, 'm')
            if (writeFailure) throw writeFailure
            Object.assign(menu, changes)
          },
          ensureRootEntry: async (database, input) => {
            calls.push('write-directory')
            assert.equal(database, db)
            assert.deepEqual(input.menuData, {
              ...menu,
              status: 'published',
              updated: stamp,
            })
            assert.equal(input.kitchenPath, 'kitchens/k')
            assert.equal(input.menuId, 'm')
            if (projectionFailure) throw projectionFailure
            return { id: 'k--m', path: '/menus/k--m' }
          },
        }
      ),
  }
}

test('a document Menu skips structured-content checks and publishes before projecting', async () => {
  const h = harness({
    menu: { name: 'PDF', doc: { url: 'https://example.test/menu.pdf' } },
    sections: [],
  })
  assert.deepEqual(await h.publish(), {
    menuId: 'm',
    root: { id: 'k--m', path: '/menus/k--m' },
  })
  assert.deepEqual(h.calls, ['write-menu', 'write-directory'])
})

test('structured publication validates active children and preserves audit provenance', async () => {
  const h = harness({
    menu: { name: 'Lunch', created: { by: 'creator' } },
    sections: [
      { status: 'archived', items: [] },
      { items: [{ status: 'archived', dish_id: '' }, { dish_id: 'dish' }] },
    ],
  })
  await h.publish()
  assert.deepEqual(h.calls, [
    'read-sections',
    'read-dish:dish',
    'write-menu',
    'write-directory',
  ])
  assert.deepEqual(h.menu.created, { by: 'creator' })
  assert.deepEqual(h.menu.updated, stamp)
})

for (const [name, options, message] of [
  ['missing Menu', { exists: false }, 'Menu not found.'],
  ['no sections', { sections: [] }, 'Menu needs at least one section'],
  [
    'only archived sections',
    { sections: [{ status: 'archived', items: [] }] },
    'Menu needs at least one section',
  ],
  ['no items', { sections: [{ items: [] }] }, 'Menu needs at least one item'],
  [
    'only archived items',
    { sections: [{ items: [{ status: 'archived' }] }] },
    'Menu needs at least one item',
  ],
  [
    'missing dish id',
    { sections: [{ items: [{}] }] },
    'Every menu item needs a dish',
  ],
  [
    'missing dish record',
    { dishes: [] },
    'Menu item references missing dish: dish',
  ],
]) {
  test(`${name} prevents publication writes`, async () => {
    const h = harness(options)
    await assert.rejects(h.publish(), { message })
    assert.equal(
      h.calls.some((call) => call.startsWith('write-')),
      false
    )
  })
}

test('failed Menu write prevents directory writes', async () => {
  const failure = new Error('Menu write failed')
  const h = harness({ writeFailure: failure })
  await assert.rejects(h.publish(), failure)
  assert.equal(h.menu.status, 'draft')
  assert.equal(h.calls.includes('write-directory'), false)
})

test('failed directory update remains a surfaced partial completion; retry reprojects', async () => {
  const failure = new Error('Directory write failed')
  const h = harness({ projectionFailure: failure })
  await assert.rejects(h.publish(), failure)
  assert.equal(h.menu.status, 'published')
  assert.deepEqual(h.calls.slice(-2), ['write-menu', 'write-directory'])
  const retry = harness({ menu: h.menu })
  await retry.publish()
  assert.deepEqual(retry.calls.slice(-2), ['write-menu', 'write-directory'])
})
