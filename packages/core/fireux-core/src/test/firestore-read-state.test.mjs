import { resolveReadOutcome } from '../runtime/composables/fireux/firestore/operations/read-outcome.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  ref,
  shallowRef,
  unref,
  watch,
  effectScope,
  nextTick,
} from 'vue'

function load(path, name, dependencies) {
  dependencies = { resolveReadOutcome, ...dependencies }
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.server', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const enhance = load(
  '../runtime/composables/fireux/firestore/operations/useFirestoreRead.ts',
  'enhanceFirestoreRead',
  { resolveReadOutcome, computed, ref, shallowRef, unref, watch }
)

for (const kind of ['document', 'collection']) {
  test(`${kind} exposes live values only with a settled valid read`, () => {
    const active = ref(true)
    const initial = kind === 'document' ? { id: 'a' } : [{ id: 'a' }]
    const binding = Object.assign(ref(initial), {
      pending: ref(false),
      error: ref(undefined),
      promise: ref(undefined),
      stop: () => {
        active.value = false
      },
    })
    const state = enhance(binding, { active, kind })
    assert.equal(state.outcome.value, 'ready')
    assert.deepEqual(state.value, initial)
    assert.equal(state.data, state)
    assert.equal(state.promise, binding.promise)
    binding.pending.value = true
    assert.equal(state.pending.value, true)
    assert.equal(state.value, undefined)
    const error = new Error('Permission withdrawn')
    binding.error.value = error
    assert.equal(state.outcome.value, 'error')
    assert.equal(state.pending.value, false)
    assert.equal(state.error.value, error)
    assert.equal(state.value, undefined)
    assert.deepEqual(binding.value, initial, 'do not mutate VueFire cache')
    active.value = false
    assert.equal(state.outcome.value, 'idle')
    assert.equal(state.error.value, undefined)
    assert.equal(state.value, undefined)
    active.value = true
    binding.pending.value = false
    binding.error.value = undefined
    const changed = kind === 'document' ? { id: 'b' } : [{ id: 'b' }]
    binding.value = changed
    assert.deepEqual(state.value, changed, 'updates flow without another read')
    binding.value = kind === 'document' ? undefined : []
    assert.equal(state.outcome.value, kind === 'document' ? 'missing' : 'empty')
    state.stop()
    assert.equal(state.outcome.value, 'idle')
  })
}

for (const kind of ['document', 'collection']) {
  test(`${kind} hides a previous scope before VueFire's asynchronous rebind`, async () => {
    const scope = effectScope()
    const source = ref({ path: 'first' })
    const binding = Object.assign(
      ref(kind === 'document' ? { id: 'old' } : [{ id: 'old' }]),
      {
        pending: ref(false),
        error: ref(undefined),
        promise: shallowRef(Promise.resolve()),
        stop() {},
      }
    )
    const state = scope.run(() => {
      // Match VueFire: source watcher runs on Vue's default asynchronous flush.
      watch(source, () => {
        binding.pending.value = true
        binding.value = undefined
        binding.promise.value = Promise.resolve()
      })
      return enhance(binding, { active: true, kind, source })
    })
    assert.equal(state.outcome.value, 'ready')
    source.value = { path: 'second' }
    assert.equal(binding.pending.value, false, 'VueFire has not rebound yet')
    assert.equal(
      state.value,
      undefined,
      'old scope must disappear synchronously'
    )
    assert.equal(state.outcome.value, 'pending')
    await nextTick()
    assert.equal(state.outcome.value, 'pending')
    const next = kind === 'document' ? { id: 'new' } : [{ id: 'new' }]
    binding.value = next
    binding.pending.value = false
    assert.deepEqual(state.value, next)
    assert.equal(state.outcome.value, 'ready')
    binding.error.value = new Error('Previous scope denied')
    assert.equal(state.outcome.value, 'error')
    source.value = { path: 'third' }
    assert.equal(state.value, undefined)
    assert.equal(state.error.value, undefined)
    await nextTick()
    assert.equal(
      state.outcome.value,
      'pending',
      'the old error must not poison a new binding'
    )
    binding.value = next
    binding.pending.value = false
    assert.equal(state.outcome.value, 'ready')
    scope.stop()
  })
}

test('User directory cannot turn a failed collection into a self-only result', () => {
  const self = { id: 'self', handle: 'me' }
  const source = { users: ref([]), pending: ref(false), error: ref(null), outcome: ref('ready') }
  const useUserDirectory = load('../runtime/user/composables/directory/useUserDirectory.ts', 'useUserDirectory', {
    computed,
    useFireUXConfig: () => ({ appId: 'app', isTenant: false }),
    useUserCollection: () => source,
    isUserDirectoryEligible: () => true,
    useUserSession: () => ({
      user: ref(self),
      appUser: ref(null),
      appOutcome: ref('missing'),
    }),
  })
  const state = useUserDirectory()
  assert.deepEqual(state.users.value, [self])
  source.error.value = new Error('Denied')
  assert.deepEqual(state.users.value, [])
  assert.equal(state.outcome.value, 'error')
  source.error.value = null
  source.pending.value = true
  assert.deepEqual(state.users.value, [])
  source.pending.value = false
  assert.deepEqual(state.users.value, [self])
})

test('live collection pages stay bounded and reconcile changes across the loaded boundary', () => {
  const scope = effectScope()
  const records = ref(
    Array.from({ length: 60 }, (_, index) => ({
      id: String(index).padStart(3, '0'),
    }))
  )
  const queries = []
  const factory = load(
    '../runtime/composables/fireux/firestore/operations/useFirestoreRead.ts',
    'useFirestoreRead',
    {
      computed,
      ref,
      shallowRef,
      unref,
      watch,
      resolveReadOutcome,
      useFirestoreResolver: () => () => 'db',
      collection: (db, path) => ({ db, path }),
      fsq: (source, ...constraints) => ({
        ...source,
        limit: constraints.find((item) => item.limit)?.limit,
      }),
      fslimit: (limit) => ({ limit }),
      guardFirestorePromise() {},
      useCollection(query) {
        const binding = Object.assign(ref([]), {
          pending: ref(false),
          error: ref(undefined),
          promise: shallowRef(Promise.resolve()),
          stop() {},
        })
        watch(
          [query, records],
          ([value]) => {
            queries.push(value)
            binding.value = value
              ? [...records.value]
                  .sort((a, b) => a.id.localeCompare(b.id))
                  .slice(0, value.limit)
              : undefined
            binding.promise.value = Promise.resolve()
          },
          { immediate: true, flush: 'sync', deep: true }
        )
        return binding
      },
    }
  )
  const path = ref('users')
  const actor = ref('a')
  const state = scope.run(() =>
    factory().firestoreCollectionPage(path, { scope: actor })
  )
  assert.equal(
    queries.at(-1).limit,
    26,
    '25 visible records plus one lookahead'
  )
  assert.equal(state.data.value.length, 25)
  assert.equal(state.hasMore.value, true)
  const firstQuery = queries.at(-1)
  actor.value = 'first-page-switch'
  assert.notEqual(
    queries.at(-1),
    firstQuery,
    'account switch rebinds even before Load more'
  )
  assert.equal(queries.at(-1).limit, 26)
  state.loadMore()
  assert.equal(queries.at(-1).limit, 51)
  assert.equal(state.data.value.length, 50)
  records.value = records.value.filter((record) => record.id !== '024')
  assert.equal(state.data.value.length, 50)
  assert.equal(
    state.data.value.some((record) => record.id === '024'),
    false
  )
  assert.equal(
    state.data.value.at(-1).id,
    '050',
    'a deletion pulls the next record into the live window'
  )
  records.value.unshift({ id: '-new' })
  assert.equal(state.data.value[0].id, '-new')
  assert.equal(new Set(state.data.value.map((record) => record.id)).size, 50)
  state.loadMore()
  assert.equal(state.data.value.length, 60)
  assert.equal(state.hasMore.value, false)
  const queryCount = queries.length
  state.loadMore()
  assert.equal(
    queries.length,
    queryCount,
    'no redundant query after the last page'
  )
  actor.value = 'b'
  assert.equal(
    queries.at(-1).limit,
    26,
    'account switch resets requested depth'
  )
  path.value = ''
  assert.equal(state.outcome.value, 'idle')
  assert.equal(state.data.value, undefined)
  path.value = 'different-users'
  assert.equal(queries.at(-1).path, 'different-users')
  assert.equal(queries.at(-1).limit, 26)
  scope.stop()
})
