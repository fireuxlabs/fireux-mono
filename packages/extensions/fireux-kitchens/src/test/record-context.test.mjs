import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, effectScope, ref, toValue, watch } from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'

function load(path, result, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const readRecordString = (source, key) =>
  typeof source[key] === 'string' ? source[key].trim() : ''
const note =
  'Breakfast hours are provisional. Owner to confirm days, 06:30 vs 08:00, hotel guests, Sunday and inherited service windows.'
function fixture() {
  const roots = new Map([
    ['kitchens/baren/recipes/soup', { context: '', name: 'Soup' }],
    ['kitchens/baren/dishes/plate', { context: '', price: 15 }],
    ['kitchens/baren', { context: '', prices: [13, 15] }],
    [
      'places/baren',
      { context: '', name: 'Bären', business_hours: { unchanged: true } },
    ],
    ['kitchens/baren/menus/breakfast', { context: '', status: 'published' }],
  ])
  const writes = []
  let authorized = true
  const target = (collectionPath) => ({ collectionPath })
  const command = load(
    '../runtime/kitchen/server/context/command.ts',
    'kitchenRecordContext',
    {
      createError: (value) =>
        Object.assign(new Error(value.statusMessage), value),
      readRecordString,
      runGuardedServerTransaction: async (_database, fn) =>
        fn({
          read: async (target, id) => ({
            exists: roots.has(`${target.collectionPath}/${id}`),
            data: roots.get(`${target.collectionPath}/${id}`),
          }),
          update: (target, id, patch) => {
            const path = `${target.collectionPath}/${id}`
            writes.push({ path, patch })
            roots.set(path, { ...roots.get(path), ...patch })
          },
        }),
      requireFirestoreDocumentId: (id) => {
        if (typeof id !== 'string' || !id || id.includes('/'))
          throw new Error('Invalid id')
        return id
      },
      serverAuditStamp: () => ({ by: 'actor' }),
      FIRESTORE_MUTATION_TARGETS: {
        kitchens: target('kitchens'),
        places: target('places'),
      },
      recipeTarget: (k) => target(`kitchens/${k}/recipes`),
      serverKitchenDishesTarget: (k) => target(`kitchens/${k}/dishes`),
      serverKitchenMenusTarget: (k) => target(`kitchens/${k}/menus`),
      readKitchenMutationActor: async () => ({
        uid: 'actor',
        runtimeAppId: 'app',
      }),
      requireKitchenRecordMutationAuthority: async () => {
        if (!authorized) throw new Error('Access denied')
        return { rootData: roots.get('kitchens/baren') }
      },
    }
  )
  return {
    command,
    roots,
    writes,
    deny: () => {
      authorized = false
    },
  }
}
for (const subject of ['kitchen', 'venue', 'menu', 'recipe', 'dish']) {
  test(`${subject}: context is a string on its document, preserves other fields and rejects stale edits`, async () => {
    const f = fixture()
    const scope = {
      kitchenId: 'baren',
      subject,
      ...(subject === 'menu' ? { menuId: 'breakfast' } : {}),
      ...(subject === 'recipe' ? { recordId: 'soup' } : {}),
      ...(subject === 'dish' ? { recordId: 'plate' } : {}),
    }
    assert.equal((await f.command({}, scope)).context, '')
    assert.deepEqual(
      await f.command({}, { ...scope, context: note, previous: '' }, true),
      { context: note }
    )
    const path =
      subject === 'venue'
        ? 'places/baren'
        : subject === 'menu'
          ? 'kitchens/baren/menus/breakfast'
          : subject === 'recipe' ? 'kitchens/baren/recipes/soup'
          : subject === 'dish' ? 'kitchens/baren/dishes/plate'
          : 'kitchens/baren'
    assert.deepEqual(f.writes[0], {
      path,
      patch: { context: note, updated: { by: 'actor' } },
    })
    assert.deepEqual(f.roots.get('kitchens/baren').prices, [13, 15])
    assert.deepEqual(f.roots.get('places/baren').business_hours, {
      unchanged: true,
    })
    assert.equal(
      f.roots.get('kitchens/baren/menus/breakfast').status,
      'published'
    )
    await assert.rejects(
      f.command({}, { ...scope, context: 'Overwrite', previous: '' }, true),
      /changed elsewhere/
    )
    assert.equal(f.writes.length, 1)
    f.deny()
    await assert.rejects(f.command({}, scope), /Access denied/)
    await assert.rejects(
      f.command({}, { ...scope, context: '', previous: note }, true),
      /Access denied/
    )
  })
}
test('rejects structured context, arbitrary fields, paths and missing owners', async () => {
  const f = fixture(),
    scope = { kitchenId: 'baren', subject: 'kitchen' }
  for (const context of [{ notes: note }, ['question'], 'x'.repeat(32001)])
    await assert.rejects(
      f.command({}, { ...scope, context, previous: '' }, true),
      /must be text/
    )
  await assert.rejects(
    f.command({}, { ...scope, path: 'orders' }),
    /Unsupported/
  )
  await assert.rejects(
    f.command({}, { ...scope, kitchenId: 'baren/other' }),
    /Invalid id/
  )
  await assert.rejects(
    f.command({}, { ...scope, subject: 'menu', menuId: 'missing' }),
    /not found/
  )
  assert.equal(f.writes.length, 0)
})
const deferred = () => {
  let resolve
  const promise = new Promise((yes) => {
    resolve = yes
  })
  return { promise, resolve }
}
const settle = async () => {
  for (let n = 0; n < 20; n++) await Promise.resolve()
}
test('empty context loads, failed text is retained, and old credentials cannot dispatch after a switch', async () => {
  const owner = effectScope(),
    selected = ref({ kitchenId: 'baren', subject: 'venue' })
  const account = ref({ uid: 'operator', getIdToken: async () => 'token' })
  const calls = []
  let fail = false
  const useContext = load(
    '../../../../core/fireux-core/src/runtime/composables/shared/useRecordContext.ts',
    'useRecordContext',
    {
      computed,
      ref,
      toValue,
      watch,
      useCommandScope,
      useRoute: () => ({ path: '/identity' }),
      useAuth: () => ({ currentUser: account }),
      useAppSession: () => ({ appUser: ref({ created: { at: 'one' } }) }),
      useFireUXConfig: () => ({ appId: 'app' }),
      $fetch: async (_url, options) => {
        calls.push(options)
        if (fail) throw new Error('Offline')
        return { context: options.method === 'GET' ? '' : options.body.context }
      },
    }
  )
  const state = owner.run(() => useContext('/api/workspace/kitchen/context', selected))
  await settle()
  assert.equal(state.ready.value, true)
  assert.equal(state.context.value, '')
  fail = true
  await state.update(note)
  assert.equal(state.context.value, note)
  assert.equal(state.error.value, 'Offline')
  assert.equal(calls.at(-1).body.previous, '')
  const token = deferred()
  account.value = { uid: 'operator', getIdToken: () => token.promise }
  await settle()
  const before = calls.length
  selected.value = { kitchenId: 'another', subject: 'venue' }
  owner.stop()
  token.resolve('late-token')
  await settle()
  assert.equal(calls.length, before)
  assert.equal(state.context.value, '')
})
test('KitchenAI reads Kitchen and venue strings, reuses Menu root data, and never reads Orders', async () => {
  const queried = []
  const db = {
    collection(path) {
      queried.push(path)
      return {
        doc: () => ({ get: async () => ({ data: () => ({ context: note }) }) }),
        limit: () => ({
          get: async () => ({
            docs: [
              {
                id: 'breakfast',
                data: () => ({
                  name: 'Breakfast',
                  status: 'published',
                  context: 'Breakfast Menu question',
                }),
              },
            ],
          }),
        }),
      }
    },
  }
  const readers = load(
    '../runtime/kitchen/server/context/read.ts',
    '({readKitchenOperatorContext, readMenuOperatorContext})',
    { readRecordString }
  )
  const read = load(
    '../../../../ecosystem/fireux-misebox/src/runtime/server/agent/kitchen/context.ts',
    'readKitchenAgentContext',
    {
      ...readers,
      UserContextStorage: { collection: 'context', document: 'operator' },
      getRuntimeIdentityFirestore: () => ({
        collection: () => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({ get: async () => ({ exists: false }) }),
            }),
          }),
        }),
      }),
      readRecordString,
      readKitchenMenuSections: async () => [],
      KitchenIngredientStorage: {},
    }
  )
  const result = await read(
    { db, uid: 'operator', rootKitchen: { context: 'Kitchen background' } },
    { kitchenId: 'baren', operation: 'menus', appId: 'app' }
  )
  assert.equal(result.kitchenContext, 'Kitchen background')
  assert.equal(result.venueContext, note)
  assert.equal(result.menuManifest[0].context, 'Breakfast Menu question')
  assert.deepEqual(queried.sort(), ['kitchens/baren/menus', 'places'])
})
test('authorized reader checks current access before reading scoped strings and bounds Menu reads', async () => {
  let allowed = false
  const reads = []
  const read = load(
    '../runtime/kitchen/server/context/authorized.ts',
    'readAuthorizedOperatorContext',
    {
      useFireUXConfig: () => ({ appId: 'current-app' }),
      requireFirestoreDocumentId: (id) => {
        if (!id || id.includes('/')) throw new Error('Invalid id')
        return id
      },
      requireKitchenWriter: async (_event, input) => {
        assert.equal(input.appId, 'current-app')
        if (!allowed) throw new Error('Access denied')
        return { db: 'db', rootKitchen: { context: 'Kitchen text' } }
      },
      readKitchenOperatorContext: async (db, id, root) => {
        reads.push([db, id])
        return { kitchen: root.context, venue: note }
      },
      readMenuOperatorContext: async (db, id, menu) => {
        reads.push([db, id, menu])
        return 'Menu text'
      },
    }
  )
  await assert.rejects(read({}, 'baren'), /Access denied/)
  assert.equal(reads.length, 0)
  allowed = true
  await assert.rejects(read({}, 'baren', ['other/menu']), /Invalid id/)
  assert.equal(
    (await read({}, 'baren', ['breakfast'])).menus[0].context,
    'Menu text'
  )
  reads.length = 0
  await read({}, 'baren', [
    'breakfast',
    'breakfast',
    ...Array.from({ length: 20 }, (_, i) => `menu-${i}`),
  ])
  assert.equal(reads.length, 13)
})
