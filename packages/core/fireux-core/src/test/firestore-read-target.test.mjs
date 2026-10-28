import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(file, result, dependencies = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const definitions = load(
  '../runtime/utils/firestore-mutations/target-definition.ts',
  '({defineFirestoreReadTarget,defineFirestoreMutationTarget,assertFirestoreMutationVerb,assertFirestoreMutationSegment})'
)
function transaction() {
  const writes = []
  const db = {
    collection: (collection) => ({ doc: (id) => ({ collection, id }) }),
    runTransaction: (work) =>
      work({
        get: async (ref) => ({ exists: true, data: () => ref }),
        update: (...args) => writes.push(args),
      }),
  }
  const run = load(
    '../runtime/server/utils/firestore-mutations/server-transaction.ts',
    'runGuardedServerTransaction',
    {
      ...definitions,
      getRuntimeFirestore: () => db,
      getRuntimeIdentityFirestore: () => db,
      FieldPath: {},
    }
  )
  return { run, writes }
}
const reference = definitions.defineFirestoreReadTarget({
  key: 'reference',
  database: { kind: 'runtime' },
  collectionPath: 'kitchens',
})
test('a scoped reference can be read but carries no write authority', async () => {
  const { run, writes } = transaction()
  await run({ kind: 'runtime' }, async (tx) => {
    assert.deepEqual((await tx.read(reference, 'k')).data, {
      collection: 'kitchens',
      id: 'k',
    })
    assert.throws(
      () => tx.update(reference, 'k', { name: 'Invalid' }),
      /does not authorize mutations/
    )
  })
  assert.equal(writes.length, 0)
})
test('read-only references retain exact database placement and path validation', async () => {
  const { run } = transaction()
  await assert.rejects(
    run({ kind: 'identity' }, (tx) => tx.read(reference, 'k')),
    /placement does not own/
  )
  assert.throws(
    () =>
      definitions.defineFirestoreReadTarget({
        ...reference,
        collectionPath: 'kitchens//team',
      }),
    /one Firestore path segment/
  )
})
test('ordinary mutation targets retain their lane and verb restrictions', async () => {
  const { run, writes } = transaction()
  const target = definitions.defineFirestoreMutationTarget({
    ...reference,
    lane: 'server',
    verbs: ['update'],
  })
  await run({ kind: 'runtime' }, async (tx) =>
    tx.update(target, 'k', { name: 'Allowed' })
  )
  assert.equal(writes.length, 1)
  assert.throws(
    () => definitions.assertFirestoreMutationVerb(target, 'server', 'delete'),
    /does not authorize/
  )
})
