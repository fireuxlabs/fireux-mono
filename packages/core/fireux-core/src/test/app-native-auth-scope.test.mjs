import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  effectScope,
  nextTick,
  ref,
  shallowRef,
  unref,
  watch,
} from 'vue'

const runtime = new URL('../runtime/', import.meta.url)
function load(path, names, deps = {}) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.server', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const outcome = load('utils/read-outcome.ts', 'resolveReadOutcome')
const normalization = load('app/utils/readApp.ts', 'readAppDocument')
const appData = (patch = {}) => ({
  id: 'runtime',
  ecosystem_id: 'ecosystem',
  role: 'global',
  status: 'active',
  name: 'App',
  self_join_enabled: true,
  created: { at: { seconds: 1, nanoseconds: 0 } },
  updated: { at: { seconds: 1, nanoseconds: 0 } },
  ...patch,
})
function fixture(initial = {}) {
  const scope = effectScope(),
    currentUser = ref(initial.user ?? null),
    hasAuthState = ref(initial.settled ?? false)
  const auth = {
    currentUser,
    hasAuthState,
    uid: computed(() => currentUser.value?.uid ?? ''),
    isAuthenticated: computed(
      () => !!currentUser.value && !currentUser.value.isAnonymous
    ),
  }
  const appId = ref('runtime'),
    docCalls = [],
    bindings = []
  const useFirestoreRead = load(
    'composables/fireux/firestore/operations/useFirestoreRead.ts',
    'useFirestoreRead',
    {
      ...outcome,
      computed,
      ref,
      shallowRef,
      unref,
      watch,
      useFirestoreResolver: () => () => 'owning-app-database',
      readRuntimeFirestoreDatabaseId: () => 'owning-app-database',
      guardFirestorePromise() {},
      attachDevCollectionMeta: (value) => value,
      doc: (database, path, id) => {
        const target = { database, path, id }
        docCalls.push(target)
        return target
      },
      useDocument: (reference) => {
        const binding = Object.assign(ref(undefined), {
          pending: ref(false),
          error: ref(undefined),
          promise: shallowRef(undefined),
          stop() {},
        })
        bindings.push({ reference, binding })
        watch(
          reference,
          (value) => {
            binding.value = undefined
            binding.pending.value = Boolean(value)
            binding.promise.value = Promise.resolve()
          },
          { immediate: true }
        )
        return binding
      },
    }
  ).useFirestoreRead
  const deps = {
    computed,
    unref,
    useAuth: () => auth,
    useFirestoreRead,
    ...normalization,
  }
  let app, policy
  scope.run(() => {
    app = load('app/composables/useAppRead.ts', 'useAppRead', deps).useAppRead(
      appId
    )
    policy = load(
      'app/composables/membership/useAppJoinPolicy.ts',
      'useAppJoinPolicy',
      deps
    ).useAppJoinPolicy(appId)
  })
  const settle = (value, error) => {
    for (const { binding } of bindings) {
      binding.value = value
      binding.error.value = error
      binding.pending.value = false
    }
  }
  return {
    scope,
    auth,
    appId,
    app,
    policy,
    docCalls,
    bindings,
    settle,
    useFirestoreRead,
  }
}
for (const [name, initial] of [
  ['unresolved Auth', { user: { uid: 'restoring' }, settled: false }],
  ['null guest', { user: null, settled: true }],
  [
    'anonymous guest',
    { user: { uid: 'guest', isAnonymous: true }, settled: true },
  ],
  [
    'registered object without a UID',
    { user: { isAnonymous: false }, settled: true },
  ],
])
  test(`private App and join-policy bindings stay inactive for ${name}`, async () => {
    const f = fixture(initial)
    await nextTick()
    assert.equal(
      f.docCalls.length,
      0,
      'inactive App owners cannot construct a Firestore App reference'
    )
    assert.equal(f.app.outcome.value, 'idle')
    assert.equal(f.app.pending.value, false)
    assert.equal(f.app.app.value, undefined)
    assert.equal(
      f.app.exists.value,
      undefined,
      'inactive is never uninitialized'
    )
    assert.equal(f.policy.canSelfJoin.value, false)
    assert.equal(f.policy.pending.value, false)
    assert.equal(f.policy.error.value, undefined)
    f.scope.stop()
  })
test('restored registered nonmember may resolve canonical App and raw join policy without an AppUser prerequisite', async () => {
  const f = fixture({
    user: { uid: 'new-user', isAnonymous: false },
    settled: false,
  })
  assert.equal(f.docCalls.length, 0)
  f.auth.hasAuthState.value = true
  await nextTick()
  assert.equal(f.docCalls.length, 2)
  for (const call of f.docCalls)
    assert.deepEqual(call, {
      database: 'owning-app-database',
      path: 'apps',
      id: 'runtime',
    })
  assert.equal(f.app.outcome.value, 'pending')
  assert.equal(f.app.exists.value, undefined)
  f.settle(appData())
  assert.equal(f.app.app.value.id, 'runtime')
  assert.equal(f.app.exists.value, true)
  assert.equal(f.policy.canSelfJoin.value, true)
  f.scope.stop()
})
test('authorized missing and failed reads remain distinct and only real missing enables Shell initialization', async () => {
  const f = fixture({ user: { uid: 'user' }, settled: true })
  await nextTick()
  f.settle(undefined)
  assert.equal(f.app.outcome.value, 'empty')
  assert.equal(f.app.exists.value, false)
  assert.equal(f.policy.canSelfJoin.value, false)
  assert.equal(f.policy.pending.value, false)
  const error = new Error('Permission denied')
  f.settle(appData(), error)
  assert.equal(f.app.outcome.value, 'error')
  assert.equal(f.app.error.value, error)
  assert.equal(f.app.app.value, undefined)
  assert.equal(f.app.exists.value, undefined)
  assert.equal(f.policy.error.value, error)
  assert.equal(f.policy.canSelfJoin.value, false)
  f.scope.stop()
})
test('raw stored join policy survives invalid App presentation and does not fabricate canonical identity', async () => {
  const f = fixture({ user: { uid: 'new-user' }, settled: true })
  await nextTick()
  f.settle(appData({ name: null, media: { logo_url: null } }))
  assert.equal(f.app.app.value, null)
  assert.equal(f.app.outcome.value, 'empty')
  assert.equal(
    f.app.exists.value,
    true,
    'invalid existing metadata is not absent storage'
  )
  assert.equal(f.policy.canSelfJoin.value, true)
  f.settle({ id: 'runtime', self_join_enabled: false })
  assert.equal(f.policy.canSelfJoin.value, false)
  f.scope.stop()
})
test('sign-out immediately masks retained App data, policy and failure before the shared binding rebinds', async () => {
  const f = fixture({ user: { uid: 'user' }, settled: true })
  await nextTick()
  f.settle(appData())
  assert.equal(f.app.app.value.name, 'App')
  assert.equal(f.policy.canSelfJoin.value, true)
  f.auth.currentUser.value = null
  assert.equal(f.app.app.value, undefined)
  assert.equal(f.app.exists.value, undefined)
  assert.equal(f.app.outcome.value, 'idle')
  assert.equal(f.policy.canSelfJoin.value, false)
  assert.equal(f.policy.pending.value, false)
  await nextTick()
  assert.equal(
    f.bindings.every(({ reference }) => reference.value === null),
    true
  )
  f.auth.currentUser.value = { uid: 'anonymous', isAnonymous: true }
  await nextTick()
  assert.equal(
    f.docCalls.length,
    2,
    'anonymous fallback cannot reinstall private listeners'
  )
  f.auth.currentUser.value = { uid: 'user' }
  await nextTick()
  f.settle(appData(), new Error('Old App failed'))
  f.auth.currentUser.value = null
  assert.equal(f.app.error.value, undefined)
  assert.equal(f.policy.error.value, undefined)
  f.scope.stop()
})
test('reactive App changes hide old App and policy synchronously, then resume exact new target', async () => {
  const f = fixture({ user: { uid: 'user' }, settled: true })
  await nextTick()
  f.settle(appData())
  f.appId.value = 'next-app'
  assert.equal(f.app.app.value, undefined)
  assert.equal(f.app.exists.value, undefined)
  assert.equal(f.policy.canSelfJoin.value, false)
  await nextTick()
  assert.deepEqual(
    f.docCalls.slice(-2).map(({ id }) => id),
    ['next-app', 'next-app']
  )
  f.settle(appData({ id: 'next-app', name: 'Next', self_join_enabled: false }))
  assert.equal(f.app.app.value.id, 'next-app')
  assert.equal(f.policy.canSelfJoin.value, false)
  f.appId.value = ''
  assert.equal(f.app.outcome.value, 'idle')
  assert.equal(f.app.exists.value, undefined)
  assert.equal(f.policy.pending.value, false)
  f.scope.stop()
})
test('generic public settings reader remains active for anonymous guests', async () => {
  const f = fixture({
    user: { uid: 'guest', isAnonymous: true },
    settled: true,
  })
  const settings = f.scope.run(() =>
    f.useFirestoreRead().firestoreFetchDoc('apps/runtime/settings', 'public')
  )
  await nextTick()
  assert.deepEqual(f.docCalls, [
    {
      database: 'owning-app-database',
      path: 'apps/runtime/settings',
      id: 'public',
    },
  ])
  f.bindings.at(-1).binding.value = {
    id: 'public',
    featured_kitchen_slugs: ['venue'],
  }
  f.bindings.at(-1).binding.pending.value = false
  assert.equal(settings.outcome.value, 'ready')
  assert.deepEqual(settings.value.featured_kitchen_slugs, ['venue'])
  assert.equal(f.app.outcome.value, 'idle')
  f.scope.stop()
})
