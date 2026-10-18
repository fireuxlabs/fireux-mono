import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL('../runtime/menu/server/index/other-offerings.ts', import.meta.url),
  'utf8'
)
  .replace(/^import.*\n/gm, '')
  .replace('export async', 'async')
const read = compileFunction(
  stripTypeScriptTypes(source) + ';return readOtherMenuOfferings'
)()
const offering = (id, name, menus, types = ['browse']) => ({
  id,
  name,
  menu_ids: menus,
  enabled: true,
  interactions: types.map((type) => ({ type, enabled: true })),
})
const db = {
  doc: (path) => ({ path }),
  getAll: async (...refs) =>
    refs.map((ref) => {
      const id = ref.path.split('/').at(-1)
      return {
        id,
        exists: true,
        data: () => ({
          name:
            id === 'breakfast'
              ? 'Breakfast buffet'
              : id === 'lunch'
                ? 'Lunch'
                : id,
          slug: id,
          status: 'published',
          audience: id === 'private' ? 'private_link' : 'public',
          schedule: id === 'daily' ? 'daily' : 'regular',
        }),
      }
    }),
}
test('other offerings come from setup and omit menus covered by either collection or delivery', async () => {
  const result = await read(db, 'venue', [
    offering('online', 'Pizza', ['food', 'drinks'], ['collection', 'delivery']),
    offering('tables', 'At your table', ['food', 'drinks'], ['dine_in']),
    offering('breakfast', 'Breakfast buffet', ['breakfast']),
    offering('lunch', 'Lunch', ['lunch']),
    offering('duplicate', 'Lunch', ['lunch']),
    { ...offering('disabled', 'Afternoon tea', ['tea']), enabled: false },
    offering('private', 'Private party', ['private']),
    offering('daily', 'Daily specials', ['daily']),
  ])
  assert.deepEqual(result, [
    { id: 'breakfast', name: 'Breakfast buffet', menu_slug: 'breakfast' },
    { id: 'lunch', name: 'Lunch', menu_slug: 'lunch' },
  ])
  assert.ok(
    result.every(
      (row) => Object.keys(row).sort().join(',') === 'id,menu_slug,name'
    )
  )
})
test('an offering with no active interactions is not public discovery', async () => {
  assert.deepEqual(
    await read(db, 'venue', [
      {
        ...offering('off', 'Not available', ['lunch']),
        interactions: [{ type: 'browse', enabled: false }],
      },
    ]),
    []
  )
})

test('one service can expose several other menus by menu name, without duplicate links', async () => {
  const rows = [
    offering('collection', 'Collection', ['food'], ['collection']),
    offering(
      'staff',
      'Table service',
      ['food', 'breakfast', 'lunch'],
      ['dine_in']
    ),
    offering(
      'qr',
      'QR table ordering',
      ['food', 'breakfast', 'lunch'],
      ['dine_in']
    ),
  ]
  assert.deepEqual(await read(db, 'venue', rows), [
    { id: 'breakfast', name: 'Breakfast buffet', menu_slug: 'breakfast' },
    { id: 'lunch', name: 'Lunch', menu_slug: 'lunch' },
  ])
})
