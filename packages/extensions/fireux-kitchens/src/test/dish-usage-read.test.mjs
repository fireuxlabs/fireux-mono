import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function fixture(allowed, inspectUsage) {
  const reads = []
  const source = readFileSync(
    new URL('../runtime/kitchen/server/dishes/read-usage.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const dependencies = {
    FieldPath: { documentId: () => '__name__' },
    requireFirestoreDocumentId: (value) => {
      if (typeof value !== 'string' || !value || value.includes('/'))
        throw Error('Invalid id')
      return value
    },
    readKitchenMutationActor: async () => ({ uid: 'u' }),
    getRuntimeFirestore: () => ({
      collection: (path) => ({
        doc: (id) => ({
          get: async () => {
            reads.push(`${path}/${id}`)
            return { exists: true, data: () => ({}) }
          },
        }),
        orderBy(field) {
          reads.push(['orderBy', path, field])
          return this
        },
        limit(value) {
          reads.push(['limit', value])
          return this
        },
        startAfter(value) {
          reads.push(['startAfter', value])
          return this
        },
        async get() {
          reads.push(['get', path])
          return { docs: [{ id: 'next', data: () => ({ dish_id: ' d ' }) }] }
        },
      }),
    }),
    requireKitchenRecordMutationAuthority: async (reader, actor, kitchenId) => {
      assert.equal(actor.uid, 'u')
      assert.equal(kitchenId, 'k')
      await reader.read({ collectionPath: 'kitchen_access' }, 'u')
      if (!allowed) throw Error('Denied')
    },
    readDishUsage: async (reader, kitchenId, dishId) => {
      reads.push('usage')
      assert.equal(kitchenId, 'k')
      assert.equal(dishId, 'd')
      assert.equal(typeof reader.readAll, 'function')
      assert.equal(typeof reader.query, 'function')
      if (inspectUsage) await inspectUsage(reader)
      return [{ kind: 'menu', id: 'm', name: 'Food', to: '/menu' }]
    },
  }
  const read = compileFunction(
    stripTypeScriptTypes(source) + '; return readKitchenDishUsage',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return { reads, read: () => read({}, { kitchenId: 'k', dishId: 'd' }) }
}

test('usage read checks current Kitchen authority before exposing catalogue references', async () => {
  const f = fixture(false)
  await assert.rejects(f.read(), /Denied/)
  assert.deepEqual(f.reads, ['kitchen_access/u'])
})

test('usage response carries exact scope and uses observable reads without a transaction or writes', async () => {
  const f = fixture(true)
  const result = await f.read()
  assert.equal(result.kitchenId, 'k')
  assert.equal(result.dishId, 'd')
  assert.equal(result.usages[0].name, 'Food')
  assert.deepEqual(f.reads, ['kitchen_access/u', 'usage'])
})

test('usage preview pages by document id with the same cursor contract as its transaction reader', async () => {
  const path = 'kitchens/k/menus/m/sections/s/items'
  const f = fixture(true, async (reader) => {
    const rows = await reader.readAll({ collectionPath: path }, 100, 'previous')
    assert.deepEqual(rows, [{ id: 'next', data: { dish_id: ' d ' } }])
  })
  await f.read()
  assert.deepEqual(f.reads, [
    'kitchen_access/u',
    'usage',
    ['orderBy', path, '__name__'],
    ['limit', 100],
    ['startAfter', 'previous'],
    ['get', path],
  ])
})
