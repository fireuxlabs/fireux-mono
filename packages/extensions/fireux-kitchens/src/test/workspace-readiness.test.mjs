import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, isRef, toValue, ref, watchEffect, effectScope, nextTick } from 'vue'

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function harness(id = ref('first'), options = {}) {
  const bindings = []
  let readers = 0
  const dependencies = {
    computed,
    isRef,
    toValue,
    resolveReadOutcome,
    collection: (db, path) => ({ db, path }),
    documentId: () => 'id',
    where: (_key, _operator, value) => value,
    limit: (value) => value,
    fsq: (collection, id) => ({ ...collection, id }),
    useFirestoreResolver: (...args) => {
      assert.equal(args.length, 0)
      return () => 'live'
    },
    useFirestoreRead: (...args) => {
      readers++
      assert.equal(args.length, 0)
      return {
        firestoreFetchDoc(path, id) {
          const rows = Object.assign(ref([]), { pending: ref(false), error: ref(null) })
          const query = computed(() => toValue(path) && toValue(id) ? { db: 'live', path: toValue(path), id: toValue(id) } : null)
          const pending = computed(() => rows.pending.value || Boolean(rows.value[0] && rows.value[0].id !== toValue(id)))
          const value = computed(() => query.value && !pending.value ? rows.value[0] ?? null : null)
          Object.assign(value, { pending, error: rows.error, outcome: computed(() => resolveReadOutcome({ kind: 'document', active: Boolean(query.value), pending: pending.value, error: rows.error.value, present: Boolean(value.value) })) })
          bindings.push({ query, rows })
          return value
        },
      }
    },
    useKitchenInterface: () => ({
      surface: ({ kitchen, place, routeScope }) => ({
        ...kitchen,
        place,
        route_scope: routeScope,
      }),
    }),
  }
  const use = load(
    '../runtime/kitchen/composables/firestore/useKitchenRead.ts',
    'useKitchenRead',
    dependencies
  )
  const state = use(id, options)
  assert.equal(readers, 1)
  assert.equal(bindings.length, 2)
  return { id, state, kitchen: bindings[0], place: bindings[1] }
}

test('Kitchen reads hydrate live records and reflect updates and deletion', () => {
  const h = harness()
  assert.deepEqual(h.kitchen.query.value, {
    db: 'live',
    path: 'kitchens',
    id: 'first',
  })
  h.kitchen.rows.value = [{ id: 'first', name: 'Kitchen' }]
  h.place.rows.value = [{ id: 'first', name: 'Place' }]
  assert.equal(h.state.outcome.value, 'ready')
  assert.equal(h.state.place.value.name, 'Place')
  assert.equal('place' in h.state.kitchen.value, false)
  h.place.rows.value = [{ id: 'first', name: 'Updated place' }]
  assert.equal(h.state.place.value.name, 'Updated place')
  h.kitchen.rows.value = []
  assert.equal(h.state.kitchen.value, null)
  assert.equal(h.state.outcome.value, 'missing')
})

test('Changing Kitchen identity hides old rows and never joins a different Place', () => {
  const h = harness()
  h.kitchen.rows.value = [{ id: 'first' }]
  h.place.rows.value = [{ id: 'first' }]
  h.id.value = 'second'
  assert.equal(h.state.kitchen.value, null)
  assert.equal(h.state.outcome.value, 'pending')
  assert.equal(h.kitchen.query.value.id, 'second')
  h.kitchen.rows.value = [{ id: 'second' }]
  assert.equal(h.state.place.value, null)
  h.place.rows.value = [{ id: 'second' }]
  assert.equal(h.state.place.value.id, 'second')
})

test('Scoped operator reads retain their collection and omit Place hydration', () => {
  const path = ref('apps/current/kitchens')
  const h = harness(ref('first'), { collectionPath: path, hydrate: false })
  h.kitchen.rows.value = [{ id: 'first', operator_ids: ['actor'] }]
  assert.equal(h.kitchen.query.value.path, path.value)
  assert.equal(h.place.query.value, null)
  assert.equal(h.state.place.value, null)
  path.value = 'apps/other/kitchens'
  assert.equal(h.kitchen.query.value.path, path.value)
})

test('Kitchen read states distinguish idle, pending, missing, and failure', () => {
  const h = harness(ref(''))
  assert.equal(h.kitchen.query.value, null)
  assert.equal(h.place.query.value, null)
  assert.equal(h.state.outcome.value, 'idle')
  h.id.value = 'first'
  h.kitchen.rows.pending.value = true
  assert.equal(h.state.outcome.value, 'pending')
  h.kitchen.rows.pending.value = false
  assert.equal(h.state.outcome.value, 'missing')
  h.kitchen.rows.error.value = new Error('Read failed')
  assert.equal(h.state.outcome.value, 'error')
  assert.equal(h.state.error.value.message, 'Read failed')
})

test('Identity excludes a previous Place while the new request settles', () => {
  const kitchenId = ref('a')
  const source = ref({ id: 'a', name: 'A' })
  const usePlace = load(
    '../runtime/kitchen/composables/workspace/identity/useKitchenWorkspacePlace.ts',
    'useKitchenWorkspacePlace',
    {
      computed,
      usePlaceFetch: () => ({ place: source, pending: ref(false) }),
      readPlaceCurrencyCode: () => '',
    }
  )
  const state = usePlace({ kitchenId })
  assert.equal(state.place.value.id, 'a')
  kitchenId.value = 'b'
  assert.equal(state.place.value, null)
  source.value = { id: 'b', name: 'B' }
  assert.equal(state.place.value.id, 'b')
})

test('Team read exposes management availability only after authority succeeds and binds it to the Kitchen', async () => {
  let authorized = true
  const read = load(
    '../runtime/kitchen/server/team/read.ts',
    'readKitchenTeamMembers',
    {
      requireFirestoreDocumentId: (value) => value,
      readKitchenMutationActor: async () => ({ uid: 'operator' }),
      requireKitchenMutationAuthority: async () => {
        if (!authorized) throw new Error('Denied')
      },
      runGuardedServerTransaction: async (_, operation) =>
        operation({ readAll: async () => [] }),
      serverKitchenTeamMembersTarget: (id) => id,
      getRuntimeIdentityFirestore: () => ({}),
      enrichTeamMembers: async (records) => records,
    }
  )
  assert.deepEqual(await read({}, { kitchenId: 'a' }), {
    ok: true,
    kitchenId: 'a',
    canManageTeam: true,
    members: [],
  })
  authorized = false
  await assert.rejects(read({}, { kitchenId: 'b' }), /Denied/)
})
