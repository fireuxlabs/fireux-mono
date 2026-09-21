import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL('../runtime/kitchen/server/ingredients/commands.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
function fixture({ authorized = true, extras = {} } = {}) {
  const docs = new Map(
    Object.entries({
      'ingredients/carrot': { name: 'Carrot', image_url: 'shared.jpg' },
      'kitchens/other/ingredients/carrot': { ingredient_id: 'carrot' },
      ...extras,
    })
  )
  const writes = []
  const deps = {
    createError: ({ statusMessage, statusCode }) =>
      Object.assign(new Error(statusMessage), { statusCode }),
    requireFirestoreDocumentId: (id) => {
      if (typeof id !== 'string' || !id || id.includes('/'))
        throw Error('Invalid id')
      return id
    },
    defineFirestoreMutationTarget: (x) => {
      assert.ok(x.verbs.length)
      return x
    },
    FIRESTORE_MUTATION_TARGETS: {
      ingredients: { collectionPath: 'ingredients' },
    },
    readKitchenMutationActor: async () => ({
      uid: 'operator',
      runtimeAppId: 'app',
    }),
    requireKitchenRecordMutationAuthority: async (_, actor, id) => {
      assert.equal(actor.uid, 'operator')
      if (!authorized || id !== 'mine') throw Error('Denied')
    },
    serverAuditStamp: (x) => ({ ...x, at: 'now' }),
    runGuardedServerTransaction: async (_, work) =>
      work({
        read: async (target, id) => ({
          exists: docs.has(`${target.collectionPath}/${id}`),
          data: docs.get(`${target.collectionPath}/${id}`),
        }),
        readAll: async (target, limit, afterId) =>
          [...docs]
            .filter(
              ([p]) =>
                p.startsWith(target.collectionPath + '/') &&
                p.split('/').length ===
                  target.collectionPath.split('/').length + 1
            )
            .map(([p, data]) => ({ id: p.split('/').at(-1), data }))
            .sort((a, b) => a.id.localeCompare(b.id))
            .filter((x) => !afterId || x.id > afterId)
            .slice(0, limit),
        create: (target, id, data) => {
          const path = `${target.collectionPath}/${id}`
          writes.push(['create', path])
          docs.set(path, data)
        },
        delete: (target, id) => {
          const path = `${target.collectionPath}/${id}`
          writes.push(['delete', path])
          docs.delete(path)
        },
      }),
  }
  const api = compileFunction(
    `${stripTypeScriptTypes(source)};return {createKitchenIngredient,deleteKitchenIngredient}`,
    Object.keys(deps)
  )(...Object.values(deps))
  return { ...api, docs, writes }
}
const input = { kitchenId: 'mine', ingredientId: 'carrot' }
test('create is scoped, idempotent, stamped and never changes shared or other Kitchen data', async () => {
  const f = fixture()
  await f.createKitchenIngredient({}, input)
  await f.createKitchenIngredient({}, input)
  assert.deepEqual(f.writes, [['create', 'kitchens/mine/ingredients/carrot']])
  assert.equal(
    f.docs.get('kitchens/mine/ingredients/carrot').created.by,
    'operator'
  )
  assert.equal(
    f.docs.get('kitchens/mine/ingredients/carrot').created.appId,
    'app'
  )
  assert.equal(
    f.docs.get('kitchens/mine/ingredients/carrot').updated.appId,
    'app'
  )
  assert.deepEqual(f.docs.get('ingredients/carrot'), {
    name: 'Carrot',
    image_url: 'shared.jpg',
  })
  assert.deepEqual(f.docs.get('kitchens/other/ingredients/carrot'), {
    ingredient_id: 'carrot',
  })
})
test('denied authority, forged scopes, extra identity fields and unknown catalogue ids cannot write', async () => {
  for (const action of ['createKitchenIngredient', 'deleteKitchenIngredient']) {
    const denied = fixture({ authorized: false })
    await assert.rejects(denied[action]({}, input), /Denied/)
    assert.equal(denied.writes.length, 0)
    for (const bad of [
      { ...input, kitchenId: 'other' },
      { ...input, kitchenId: 'mine/ingredients' },
      { ...input, name: 'Override' },
      { ...input, databaseId: 'elsewhere' },
    ]) {
      const f = fixture()
      await assert.rejects(f[action]({}, bad))
      assert.equal(f.writes.length, 0)
    }
  }
  const f = fixture()
  await assert.rejects(
    f.createKitchenIngredient({}, { ...input, ingredientId: 'missing' }),
    /not found/
  )
})
test('remove deletes only this Kitchen association', async () => {
  const f = fixture({
    extras: { 'kitchens/mine/ingredients/carrot': { ingredient_id: 'carrot' } },
  })
  await f.deleteKitchenIngredient({}, input)
  assert.deepEqual(f.writes, [['delete', 'kitchens/mine/ingredients/carrot']])
  assert.ok(f.docs.has('ingredients/carrot'))
  assert.ok(f.docs.has('kitchens/other/ingredients/carrot'))
})
test('every supported dependency blocks removal, including dependencies after the first page', async () => {
  for (const [collection, data] of [
    [
      'recipes',
      { preparation: { ingredients: [{ ingredient_id: 'carrot' }] } },
    ],
    ['dishes', { spec: { ingredients: [{ ingredient_id: 'carrot' }] } }],
    ['prep-items', { inputs: [{ ingredient_id: 'carrot' }] }],
    ['supplier-ingredients', { ingredient_id: 'carrot' }],
  ]) {
    const extras = {
      'kitchens/mine/ingredients/carrot': { ingredient_id: 'carrot' },
    }
    for (let i = 0; i < 100; i++)
      extras[`kitchens/mine/${collection}/${String(i).padStart(3, '0')}`] = {}
    extras[`kitchens/mine/${collection}/zzz`] = data
    const f = fixture({ extras })
    await assert.rejects(f.deleteKitchenIngredient({}, input), /still used/)
    assert.equal(f.writes.length, 0)
  }
})
test('missing and conflicting links fail without destructive repair', async () => {
  const f = fixture()
  await assert.rejects(f.deleteKitchenIngredient({}, input), /not found/)
  for (const action of ['createKitchenIngredient', 'deleteKitchenIngredient']) {
    const conflict = fixture({
      extras: {
        'kitchens/mine/ingredients/carrot': { ingredient_id: 'onion' },
      },
    })
    await assert.rejects(conflict[action]({}, input), /conflicting/)
    assert.equal(conflict.writes.length, 0)
  }
})
