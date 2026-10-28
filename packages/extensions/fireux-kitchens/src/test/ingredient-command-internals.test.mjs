import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, names, dependencies = {}) {
  const source = stripTypeScriptTypes(
    readFileSync(new URL(path, import.meta.url), 'utf8')
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${source};return {${names.join(',')}}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
const taxonomy = load('../runtime/ingredient/models/ingredient-taxonomy.ts', [
  'INGREDIENT_CATEGORIES',
])
const migration = load(
  '../runtime/ingredient/server/category-migration.ts',
  ['readIngredientCategory'],
  taxonomy
)
const isFirestoreDocumentId = (id) =>
  typeof id === 'string' &&
  Boolean(id) &&
  !id.includes('/') &&
  !['.', '..'].includes(id)
const normalization = load(
  '../runtime/ingredient/server/normalize.ts',
  ['normalizeIngredient', 'normalizeIngredientAliases', 'isActiveIngredient'],
  {
    ...migration,
    isFirestoreDocumentId,
    IngredientDefaults: { created: {}, updated: {} },
  }
)
const input = load(
  '../runtime/ingredient/server/curation-input.ts',
  [
    'normalizeIngredientInput',
    'requiredName',
    'aliases',
    'enumValue',
    'foldIdentity',
    'imageUrl',
    'MAX_LIBRARY_SIZE',
    'text',
    'record',
    'badRequest',
  ],
  {
    ...taxonomy,
    ...normalization,
    createError,
  }
)
const storage = load(
  '../runtime/ingredient/server/curation-storage.ts',
  ['canonicalStoredIngredient', 'assertUniqueActiveIngredientIdentity'],
  {
    ...taxonomy,
    ...input,
    ...normalization,
    createError,
  }
)
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function fixture({ existing = {}, contextWait, retry } = {}) {
  let admin = true,
    actorReads = 0
  const docs = new Map(Object.entries(existing))
  const writes = []
  const target = { collectionPath: 'ingredients' }
  const dependencies = {
    ...input,
    ...storage,
    ...normalization,
    createError,
    isFirestoreDocumentId,
    normalizeSlug: (value) => value.toLowerCase().replace(/\s+/g, '-'),
    curatorContext: async () => {
      actorReads++
      await contextWait?.promise
      return { appId: 'app', uid: 'operator', isDeveloper: false }
    },
    assertCurator: (member) => {
      if (member?.role !== 'admin')
        throw createError({ statusCode: 403, statusMessage: 'Denied' })
    },
    INGREDIENT_MUTATION_TARGETS: { ingredients: target },
    serverAppUsersTarget: () => ({ collectionPath: 'apps/app/users' }),
    serverAuditStamp: (actor) => ({ at: 'now', ...actor }),
    runGuardedServerTransaction: async (_, work) => {
      async function run(commit) {
        const staged = []
        const result = await work({
          read: async (scope, id) =>
            scope === target
              ? { exists: docs.has(id), data: docs.get(id) }
              : { exists: true, data: { role: admin ? 'admin' : 'member' } },
          readAll: async (_, limit) =>
            [...docs].slice(0, limit).map(([id, data]) => ({ id, data })),
          create: (_, id, data) =>
            staged.push(['create', id, structuredClone(data)]),
          update: (_, id, data) =>
            staged.push(['update', id, structuredClone(data)]),
        })
        if (commit)
          for (const [action, id, data] of staged) {
            writes.push([action, id, data])
            docs.set(id, { ...docs.get(id), ...data })
          }
        return result
      }
      if (retry) {
        await run(false)
        retry()
      }
      return run(true)
    },
  }
  return {
    ...load(
      '../runtime/ingredient/server/create.ts',
      ['createIngredient'],
      dependencies
    ),
    ...load(
      '../runtime/ingredient/server/update.ts',
      ['updateIngredient'],
      dependencies
    ),
    docs,
    writes,
    revoke: () => {
      admin = false
    },
    actorReads: () => actorReads,
  }
}
test('explicit identity writes reject coerced primitives, invalid URLs and unsupported fields before credentials', async () => {
  for (const patch of [
    { name: 123 },
    { name: {} },
    { aliases: [1] },
    { aliases: ['Carrot', null] },
    { category: 'produce' },
    { image_url: 0 },
    { image_url: null },
    { image_url: '//external.example/image.jpg' },
    { image_url: 'https://' },
    { image_url: 'javascript:alert(1)' },
    { slug: 'different' },
    { status: 'active' },
  ]) {
    const f = fixture()
    await assert.rejects(
      f.updateIngredient({}, 'carrot', patch),
      (error) => error.statusCode === 400
    )
    assert.equal(f.actorReads(), 0)
    assert.equal(f.writes.length, 0)
  }
  assert.equal(
    input.normalizeIngredientInput({ image_url: ' /img/carrot.jpg ' })
      .image_url,
    '/img/carrot.jpg'
  )
  assert.equal(input.normalizeIngredientInput({ image_url: '' }).image_url, '')
})
test('creation detaches nested submitted aliases before authentication and transaction retries', async () => {
  const wait = deferred()
  const submitted = {
    name: 'Carrot',
    aliases: ['Carrots'],
    category: 'vegetables',
  }
  const f = fixture({
    contextWait: wait,
    retry: () => {
      submitted.aliases.push('Retry injection')
    },
  })
  const result = f.createIngredient({}, submitted)
  submitted.name = 'Onion'
  submitted.category = 'fruit'
  submitted.aliases[0] = 'Changed'
  wait.resolve()
  const ingredient = await result
  assert.equal(ingredient.id, 'carrot')
  assert.equal(ingredient.name, 'Carrot')
  assert.equal(ingredient.category, 'vegetables')
  assert.deepEqual(ingredient.aliases, ['Carrots'])
  assert.equal(f.writes.length, 1)
  assert.equal(f.docs.get('carrot').created.appId, 'app')
})
test('update captures fields while retaining stable slug, creation provenance and historical metadata', async () => {
  const wait = deferred()
  const original = {
    name: 'Carrot',
    category: 'vegetables',
    aliases: [],
    slug: 'original-url',
    created: { at: 'old', by: 'creator' },
    status: 'deprecated',
    replaced_by_ingredient_id: 'other',
  }
  const f = fixture({ existing: { carrot: original }, contextWait: wait })
  const changes = { name: 'Fresh carrot', aliases: ['Carrots'] }
  const result = f.updateIngredient({}, 'carrot', changes)
  changes.name = 'Injected'
  changes.aliases.push('Injected')
  wait.resolve()
  const ingredient = await result
  assert.equal(ingredient.name, 'Fresh carrot')
  assert.deepEqual(ingredient.aliases, ['Carrots'])
  assert.equal(ingredient.slug, 'original-url')
  assert.deepEqual(f.docs.get('carrot').created, original.created)
  assert.equal(f.docs.get('carrot').status, 'deprecated')
  assert.equal(f.docs.get('carrot').replaced_by_ingredient_id, 'other')
})
test('membership revocation during credentials prevents a catalogue write', async () => {
  const wait = deferred()
  const f = fixture({ contextWait: wait })
  const result = f.createIngredient(
    {},
    { name: 'Carrot', category: 'vegetables' }
  )
  f.revoke()
  wait.resolve()
  await assert.rejects(result, /Denied/)
  assert.equal(f.writes.length, 0)
})
test('transaction-time alias uniqueness rejects another active identity', async () => {
  const f = fixture({
    existing: {
      onion: {
        name: 'Onion',
        category: 'vegetables',
        aliases: ['CARROT'],
        status: 'active',
      },
    },
  })
  await assert.rejects(
    f.createIngredient({}, { name: 'Carrot', category: 'vegetables' }),
    /conflicts/
  )
  assert.equal(f.writes.length, 0)
})

test('creation cannot exceed the read bound, while an existing record remains editable at capacity', async () => {
  const existing = Object.fromEntries(
    Array.from({ length: input.MAX_LIBRARY_SIZE }, (_, i) => [
      `ingredient-${i}`,
      {
        name: `Ingredient ${i}`,
        slug: `ingredient-${i}`,
        category: 'vegetables',
        aliases: [],
        created: { at: 'old' },
      },
    ])
  )
  const f = fixture({ existing })
  await assert.rejects(
    f.createIngredient({}, { name: 'Carrot', category: 'vegetables' }),
    /library is full/
  )
  assert.equal(f.writes.length, 0)
  const edited = await f.updateIngredient({}, 'ingredient-0', {
    name: 'Updated ingredient',
  })
  assert.equal(edited.name, 'Updated ingredient')
  assert.equal(f.docs.size, input.MAX_LIBRARY_SIZE)
})
