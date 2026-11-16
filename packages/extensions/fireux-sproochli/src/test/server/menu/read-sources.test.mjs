import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import {
  makeSproochliMenuMemoryKey,
  makeSproochliSourceHash,
} from '../../../runtime/server/menu/key.ts'
import { TranslationMemoryStorage } from '../../../runtime/models/translation.model.ts'

const forbidden = () =>
  assert.fail('A read must not resolve runtime storage or write.')
function load(name, bindings, exports) {
  const source = readFileSync(
    new URL(`../../../runtime/server/menu/${name}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from\s+['"][^'"]+['"]\s*\n/gm, '')
    .replace(/^export\s+/gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return {${exports.join(',')}}`,
    Object.keys(bindings)
  )(...Object.values(bindings))
}
const storageHelpers = load(
  'storage',
  {
    SPROOCHLI_HOST_DATABASE_ID: 'sproochli',
    useRuntimeConfig: forbidden,
    getRuntimeFirestore: forbidden,
  },
  ['matchesSproochliStorageMetadata', 'sproochliStorageMetadata']
)
const bindings = {
  ...storageHelpers,
  createHash,
  makeSproochliSourceHash,
  makeSproochliMenuMemoryKey,
  TranslationMemoryStorage,
  FieldValue: { serverTimestamp: forbidden },
  runGuardedServerTransaction: forbidden,
  SPROOCHLI_MUTATION_TARGETS: {},
}
const cache = load('translation-cache', bindings, [
  'readSproochliMenuTranslationCache',
  'readSproochliMenuTranslationCacheLanguages',
  'sproochliMenuTranslationCacheIdentity',
])
const memory = load('translation-memory', bindings, [
  'readSproochliTranslationMemory',
  'sproochliTranslationMemoryId',
])

function fixture() {
  const records = new Map(),
    reads = [],
    watched = []
  const snapshot = (path) => ({
    id: path.split('/').at(-1),
    exists: records.has(path),
    data: () => records.get(path),
  })
  const db = {
    collection: (collection) => ({
      doc: (id) => {
        const path = `${collection}/${id}`
        return {
          path,
          get: async () => {
            reads.push([path])
            return snapshot(path)
          },
        }
      },
      where: (field, operator, value) => {
        assert.equal(operator, '==')
        return {
          collection,
          filter: [field, operator, value],
          get: async () => {
            reads.push([collection, field, value])
            return {
              docs: [...records]
                .filter(
                  ([path, data]) =>
                    path.startsWith(`${collection}/`) && data[field] === value
                )
                .map(([path]) => snapshot(path)),
            }
          },
        }
      },
    }),
    getAll: async (...references) => {
      reads.push(references.map((reference) => reference.path))
      return references.map((reference) => snapshot(reference.path))
    },
  }
  const target = {
    appId: 'host',
    firebaseProjectId: 'project',
    databaseId: 'sproochli',
  }
  return {
    records,
    reads,
    watched,
    storage: { db, target },
    sources: {
      watch: (source) => {
        watched.push(source)
        return source
      },
    },
  }
}

test('cache reads declare only the selected cache and current fingerprint query, retaining provenance checks', async () => {
  const f = fixture()
  const input = {
    storage: f.storage,
    source: { appId: 'host', kitchenId: 'kitchen', menuId: 'menu' },
    fields: [{ id: 'dish.name', sourceText: 'Soup' }],
    targetLanguage: 'de',
    sources: f.sources,
  }
  const identity = cache.sproochliMenuTranslationCacheIdentity(input)
  const path = `menu_translation_caches/${identity.id}`
  const record = {
    complete: true,
    fingerprint: identity.fingerprint,
    target_language: 'de',
    storage: storageHelpers.sproochliStorageMetadata(f.storage.target),
    fields: identity.fields.map((field) => ({
      ...field,
      translated_text: 'Suppe',
    })),
  }
  f.records.set(path, record)
  assert.deepEqual(
    [...(await cache.readSproochliMenuTranslationCache(input))],
    [['dish.name', 'Suppe']]
  )
  assert.deepEqual(
    await cache.readSproochliMenuTranslationCacheLanguages(input),
    ['de']
  )
  assert.equal(f.watched[0].path, path)
  assert.deepEqual(f.watched[1].filter, [
    'fingerprint',
    '==',
    identity.fingerprint,
  ])
  assert.equal(f.reads.length, 2)

  record.storage = { ...record.storage, firebase_project_id: 'another-project' }
  assert.equal(await cache.readSproochliMenuTranslationCache(input), null)
  assert.deepEqual(
    await cache.readSproochliMenuTranslationCacheLanguages(input),
    []
  )
  f.records.delete(path)
  assert.equal(await cache.readSproochliMenuTranslationCache(input), null)
  assert.equal(
    f.watched.at(-1).path,
    path,
    'an absent cache remains an observable dependency'
  )
})

test('memory declarations follow the existing deduplicated batches without returning private records', async () => {
  const f = fixture()
  const candidates = Array.from({ length: 101 }, (_, index) => ({
    cacheVersion: '1',
    domain: 'menu',
    fieldKind: 'name',
    fieldId: `item-${index}`,
    sourceLanguage: 'auto',
    sourceText: `Dish ${index}`,
    sourceHash: makeSproochliSourceHash(`Dish ${index}`),
    targetLanguage: 'de',
    glossaryVersion: '1',
  }))
  const id = memory.sproochliTranslationMemoryId(candidates[0])
  f.records.set(`translation_memory/${id}`, {
    cache_version: '1',
    domain: 'menu',
    field_kind: 'name',
    source_language: 'auto',
    source_text: candidates[0].sourceText,
    source_hash: candidates[0].sourceHash,
    target_language: 'de',
    glossary_version: '1',
    review_status: 'unreviewed',
    translated_text: 'Gericht',
    provider: 'fixture',
    private_context: 'PRIVATE_CANARY',
    storage: storageHelpers.sproochliStorageMetadata(f.storage.target),
  })
  const hits = await memory.readSproochliTranslationMemory(
    f.storage,
    [...candidates, candidates[0]],
    f.sources
  )
  assert.deepEqual([...hits], [[id, { provider: 'fixture', text: 'Gericht' }]])
  assert.deepEqual(
    f.reads.map((batch) => batch.length),
    [100, 1]
  )
  assert.equal(f.watched.length, 101)
  assert.deepEqual(
    f.watched.map((ref) => ref.path),
    f.reads.flat()
  )
  assert.equal(JSON.stringify([...hits]).includes('PRIVATE_CANARY'), false)
})

test('ordinary reads remain available and declaration failures are not swallowed by storage helpers', async () => {
  const f = fixture()
  const input = {
    storage: f.storage,
    source: { appId: 'host', kitchenId: 'kitchen', menuId: 'menu' },
    fields: [{ id: 'name', sourceText: 'Soup' }],
    targetLanguage: 'de',
  }
  assert.equal(await cache.readSproochliMenuTranslationCache(input), null)
  assert.equal(f.reads.length, 1)
  const sources = {
    watch: () => {
      throw new Error('Source budget exceeded')
    },
  }
  await assert.rejects(
    cache.readSproochliMenuTranslationCache({ ...input, sources }),
    /Source budget/
  )
  await assert.rejects(
    cache.readSproochliMenuTranslationCacheLanguages({ ...input, sources }),
    /Source budget/
  )
  assert.equal(f.reads.length, 1)
})
