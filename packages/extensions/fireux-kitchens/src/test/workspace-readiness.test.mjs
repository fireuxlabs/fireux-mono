import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, isRef, ref, watchEffect, effectScope, nextTick } from 'vue'

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function result(value) {
  return Object.assign(ref(value), { pending: ref(false), error: ref(null) })
}

test('Kitchen switching never combines the new selection with an old Kitchen or Place response', () => {
  const kitchen = result([{ id: 'a' }])
  const place = result([{ id: 'a', name: 'Kitchen A' }])
  const queries = [kitchen, result([]), place, result([])]
  const useRead = load(
    '../runtime/kitchen/composables/firestore/useKitchenRead.ts',
    'useKitchenRead',
    {
      computed,
      isRef,
      useKitchenInterface: () => ({
        surface: ({ kitchen, place }) => ({ ...place, ...kitchen }),
      }),
      readRuntimeSimulationFirestoreDatabaseId: () => 'unused',
      useFirestoreResolver: () => () => ({}),
      useFirestoreRead: () => ({ firestoreQuery: () => queries.shift() }),
    }
  )
  const id = ref('a')
  const state = useRead(id)
  assert.equal(state.kitchen.value.name, 'Kitchen A')
  id.value = 'b'
  assert.equal(state.kitchen.value, null)
  assert.equal(state.outcome.value, 'pending')
  kitchen.value = [{ id: 'b' }]
  assert.equal(state.kitchen.value.id, 'b')
  assert.equal(state.kitchen.value.name, undefined)
  place.value = [{ id: 'b', name: 'Kitchen B' }]
  assert.equal(state.kitchen.value.name, 'Kitchen B')
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
