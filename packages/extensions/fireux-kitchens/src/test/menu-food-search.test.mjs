import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL('../runtime/menu/server/index/food-search.ts', import.meta.url),
  'utf8'
)
  .replace(/^import.*\n/gm, '')
  .replace(/^export /gm, '')
const { readMatchingMenuItems, matchesFoodSearch } = compileFunction(
  stripTypeScriptTypes(source) +
    ';return {readMatchingMenuItems,matchesFoodSearch}'
)()
const entry = {
  id: 'menus/food',
  source: { kitchen_id: 'venue', menu_id: 'food' },
}
function database() {
  const reads = []
  const data = {
    'kitchens/venue/menus/food/sections': [
      { id: 'pizza' },
      { id: 'hidden', status: 'archived' },
    ],
    'kitchens/venue/menus/food/sections/pizza/items': [
      { id: 'one', item_id: 'margherita' },
      { id: 'duplicate', item_id: 'margherita' },
      { id: 'removed', item_id: 'removed', status: 'archived' },
      { id: 'unavailable', item_id: 'unavailable' },
      { id: 'missing', item_id: 'missing' },
    ],
  }
  return {
    reads,
    collection: (path) => {
      const read = async (rows) => {
        reads.push(path)
        return {
          docs: rows.map((row) => ({
            id: row.id,
            data: () => row,
          })),
        }
      }
      const rows = data[path] || []
      return {
        get: () => read(rows),
        where: (field, op, value) => {
          assert.equal(op, '==')
          return { get: () => read(rows.filter((row) => row[field] === value)) }
        },
      }
    },
    doc: (path) => ({ path }),
    getAll: async (...refs) =>
      refs.map((ref) => {
        reads.push(ref.path)
        const id = ref.path.split('/').at(-1)
        const dish =
          id === 'margherita'
            ? { name: 'Pizza Margherita' }
            : id === 'unavailable'
              ? { name: 'Pizza Margherita', status: 'archived' }
              : undefined
        return { id, exists: !!dish, data: () => dish }
      }),
  }
}
test('search matches dish names case/accent independently and ignores archived sections, placements and dishes', async () => {
  const db = database()
  assert.deepEqual(await readMatchingMenuItems(db, entry, 'MARGHÉRITA'), [
    { id: 'margherita', name: 'Pizza Margherita' },
  ])
  assert.equal(
    db.reads.filter((path) => path.endsWith('/items/margherita')).length,
    1
  )
  assert.ok(
    !db.reads.some(
      (path) => path.includes('/hidden/') || path.endsWith('/items/removed')
    )
  )
  assert.ok(matchesFoodSearch('Pizza Margherita', 'margherita pizza'))
  assert.ok(!matchesFoodSearch('Pizza Margherita', 'salad'))
})
test('document menus and missing ownership do not search catalogue dishes', async () => {
  const db = database()
  assert.deepEqual(
    await readMatchingMenuItems(db, { ...entry, kind: 'doc' }, 'pizza'),
    []
  )
  assert.deepEqual(
    await readMatchingMenuItems(db, { id: 'unknown' }, 'pizza'),
    []
  )
  assert.deepEqual(db.reads, [])
})
test('Item lookup matches the exact active dish ID and reads no other dishes', async () => {
  const db = database()
  assert.deepEqual(
    await readMatchingMenuItems(db, entry, '', undefined, 'margherita'),
    [{ id: 'margherita', name: 'Pizza Margherita' }]
  )
  assert.deepEqual(
    db.reads.filter((path) => path.includes('/items/')),
    ['kitchens/venue/items/margherita']
  )
  assert.deepEqual(
    await readMatchingMenuItems(db, entry, '', undefined, 'removed'),
    []
  )
})
test('failed content reads remain errors rather than false empty results', async () => {
  await assert.rejects(
    readMatchingMenuItems(
      {
        collection: () => ({
          get: async () => {
            throw new Error('Unavailable')
          },
        }),
      },
      entry,
      'pizza'
    ),
    /Unavailable/
  )
})
