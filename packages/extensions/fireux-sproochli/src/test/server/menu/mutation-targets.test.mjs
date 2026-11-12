import assert from 'node:assert/strict'
import test from 'node:test'
import { SPROOCHLI_MUTATION_TARGETS } from '../../../runtime/server/menu/mutation-targets.ts'
import { resolveFirestoreMutationDatabaseId } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

test('host translation caches and memory retain their fixed server-only named database', () => {
  for (const [key, collectionPath] of [
    ['sproochliMenuTranslationCaches', 'menu_translation_caches'],
    ['sproochliTranslationMemory', 'translation_memory'],
  ]) {
    const target = SPROOCHLI_MUTATION_TARGETS[key]
    assert.deepEqual(target.database, {
      kind: 'named',
      databaseId: 'sproochli',
    })
    assert.equal(resolveFirestoreMutationDatabaseId(target), 'sproochli')
    assert.equal(target.collectionPath, collectionPath)
    assert.equal(target.lane, 'server')
    assert.deepEqual(target.verbs, ['create', 'update', 'delete'])
  }
})
