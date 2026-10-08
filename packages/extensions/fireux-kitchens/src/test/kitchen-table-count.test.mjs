import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(file, names, dependencies = {}) {
  const source = readFileSync(
    new URL(`../runtime/kitchen/server/identity/${file}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
const { parseKitchenUpdate } = load('update-input', 'parseKitchenUpdate', {
  createError,
})

test('shared Kitchen table count accepts only bounded whole numbers', () => {
  for (const count of [0, 1, 20, 500])
    assert.deepEqual(parseKitchenUpdate({ 'tables.count': count }), {
      'tables.count': count,
    })
  for (const count of [-1, 501, 1.5, NaN, Infinity, '', '20', null, true])
    assert.throws(
      () => parseKitchenUpdate({ 'tables.count': count }),
      /whole number/
    )
  assert.throws(
    () => parseKitchenUpdate({ tables: { count: 20, extra: true } }),
    /unsupported field/
  )
})

test('table count uses the existing exact Kitchen authority and root update', async () => {
  for (const authorized of [true, false]) {
    const writes = []
    const { updateKitchen } = load('update', 'updateKitchen', {
      createError,
      parseKitchenUpdate,
      requireFirestoreDocumentId: (value) => value,
      readKitchenMutationActor: async () => ({ uid: 'operator' }),
      requireKitchenRecordMutationAuthority: async (_, actor, id) => {
        assert.equal(actor.uid, 'operator')
        assert.equal(id, 'venue')
        if (!authorized) throw new Error('Denied')
      },
      FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens' },
      runGuardedServerTransaction: async (_, command) =>
        command({ update: (...args) => writes.push(args) }),
    })
    const operation = updateKitchen(
      {},
      { kitchen_id: 'venue', patch: { 'tables.count': 20 } }
    )
    if (authorized) {
      assert.deepEqual(await operation, { ok: true, kitchen_id: 'venue' })
      assert.deepEqual(writes, [['kitchens', 'venue', { 'tables.count': 20 }]])
    } else {
      await assert.rejects(operation, /Denied/)
      assert.deepEqual(writes, [])
    }
  }
})
