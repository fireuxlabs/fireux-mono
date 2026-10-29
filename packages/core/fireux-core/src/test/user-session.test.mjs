import { resolveHttpDocumentOutcome } from '../runtime/utils/http-document-outcome.ts'
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

test('User session composes its readers and aggregate state without account, commands or presentation', () => {
  const uid = ref('user-a')
  const identity = {
    user: ref({ id: 'user-a', display_name: 'User' }),
    pending: ref(false),
    error: ref(null),
    outcome: ref('ready'),
  }
  const membership = {
    appUser: ref(undefined),
    pending: ref(true),
    error: ref(null),
    outcome: ref('pending'),
  }
  const calls = []
  const forbidden = () => {
    throw new Error('A session read constructed an unrelated responsibility')
  }
  const dependencies = {
    computed,
    useAuth: () => ({
      uid,
      isAuthenticated: ref(true),
      hasAuthState: ref(true),
    }),
    useFireUXConfig: () => ({ appId: 'app-a' }),
    useUserRead: (id) => {
      calls.push({ kind: 'user', id })
      return identity
    },
    useAppUserRead: (appId, id) => {
      calls.push({ kind: 'membership', appId, id })
      return membership
    },
    useUserSessionState: (source) => {
      const error = computed(
        () => source.coreError.value || source.appError.value
      )
      const outcome = computed(() =>
        error.value ? 'error' : source.appPending.value ? 'loading' : 'ready'
      )
      return {
        pending: computed(() => outcome.value === 'loading'),
        outcome,
        error,
      }
    },
    useUserAccount: forbidden,
    useUserBootstrap: forbidden,
    useUserDelete: forbidden,
    useUserProfileUpdate: forbidden,
    useUserView: forbidden,
  }
  const source = readFileSync(
    new URL(
      '../runtime/user/composables/session/useUserSession.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const useSession = compileFunction(
    `${stripTypeScriptTypes(source)}; return useUserSession`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const state = useSession()
  assert.deepEqual(
    calls.map(({ kind }) => kind),
    ['user', 'membership']
  )
  assert.equal(calls[0].id.value, 'user-a')
  assert.equal(
    calls[1].id,
    calls[0].id,
    'identity and membership share one Auth-gated own-User target'
  )
  assert.equal(calls[1].appId, 'app-a')
  assert.equal(state.corePending.value, false)
  assert.equal(state.pending.value, true)
  assert.equal(state.outcome.value, 'loading')
  membership.pending.value = false
  membership.error.value = new Error('Membership unavailable')
  membership.outcome.value = 'error'
  assert.equal(state.pending.value, false)
  assert.equal(state.outcome.value, 'error')
  assert.equal(state.error.value, membership.error.value)
  membership.error.value = null
  membership.appUser.value = { role: 'member' }
  membership.outcome.value = 'ready'
  assert.equal(state.outcome.value, 'ready')
  assert.equal(state.appUser.value.id, 'user-a')
  for (const key of [
    'account',
    'accountPending',
    'accountError',
    'accountOutcome',
    'create',
    'update',
    'delete',
    'pill',
    'profile',
    'cell',
  ]) {
    assert.equal(key in state, false, `Session still exposes ${key}`)
  }
  uid.value = 'user-b'
  assert.equal(calls[0].id.value, 'user-b')
  assert.equal(calls[1].id.value, 'user-b')
  assert.equal(calls.length, 2)
})

const runtime = new URL('../runtime/', import.meta.url)
function loadRuntime(path, name, dependencies) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.server', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function nativeSession(initial = {}) {
  const scope = effectScope()
  const currentUser = ref(initial.user ?? null)
  const hasAuthState = ref(initial.settled ?? false)
  const auth = {
    currentUser,
    hasAuthState,
    uid: computed(() => currentUser.value?.uid ?? null),
    isAuthenticated: computed(
      () => !!currentUser.value && !currentUser.value.isAnonymous
    ),
  }
  const docCalls = []
  const bindings = []
  const resolveReadOutcome = loadRuntime(
    'utils/read-outcome.ts',
    'resolveReadOutcome',
    {}
  )
  const useFirestoreRead = loadRuntime(
    'composables/fireux/firestore/operations/useFirestoreRead.ts',
    'useFirestoreRead',
    {
      computed,
      ref,
      shallowRef,
      unref,
      watch,
      resolveReadOutcome,
      resolveHttpDocumentOutcome,
      useFirestoreResolver: (databaseId) => () => unref(databaseId) || 'app-db',
      readRuntimeFirestoreDatabaseId: () => 'app-db',
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
  )
  const normalizeUser = loadRuntime(
    'user/utils/normalize-user.ts',
    'normalizeUser',
    {
      resolveUserAvatarSource: (value) => value || '/img/ecosystem/avatar.png',
    }
  )
  const useUserRead = loadRuntime(
    'user/composables/useUserRead.ts',
    'useUserRead',
    {
      computed,
      unref,
      useFirestoreRead,
      normalizeUser,
      readRuntimeIdentityFirestoreDatabaseId: () => 'identity-db',
    }
  )
  const useAppUserRead = loadRuntime(
    'app/composables/membership/useAppUserRead.ts',
    'useAppUserRead',
    {
      computed,
      unref,
      useFirestoreRead,
    }
  )
  const useUserSessionState = loadRuntime(
    'user/composables/session/useUserSessionState.ts',
    'useUserSessionState',
    {
      computed,
      useAuth: () => auth,
      useFireUXConfig: () => ({ appId: 'runtime' }),
      useAppRead: () => ({
        canSelfJoin: ref(true),
        pending: ref(false),
        error: ref(undefined),
      }),
      useAvatarProxy: () => ({ getProxiedAvatarUrl: (value) => value }),
      resolveUserAvatarSource: (value) => value || '/img/ecosystem/avatar.png',
      useAppUserAccess: () => ({}),
    }
  )
  const useUserSession = loadRuntime(
    'user/composables/session/useUserSession.ts',
    'useUserSession',
    {
      computed,
      useAuth: () => auth,
      useFireUXConfig: () => ({ appId: 'runtime' }),
      useUserRead,
      useAppUserRead,
      useUserSessionState,
    }
  )
  let state
  scope.run(() => {
    state = useUserSession()
  })
  const settle = (path, value, error) => {
    const selected = bindings.filter(
      ({ reference }) => reference.value?.path === path
    )
    assert.equal(selected.length, 1)
    for (const { binding } of selected) {
      binding.value = value
      binding.error.value = error
      binding.pending.value = false
    }
  }
  return { scope, auth, state, docCalls, bindings, settle, useUserRead }
}
for (const [name, initial, expected] of [
  [
    'unresolved Auth with a restoring account',
    { user: { uid: 'restoring' }, settled: false },
    'loading',
  ],
  ['settled signed-out Auth', { user: null, settled: true }, 'unauthenticated'],
  [
    'settled anonymous Auth',
    { user: { uid: 'anonymous', isAnonymous: true }, settled: true },
    'unauthenticated',
  ],
  [
    'registered Auth without a UID',
    { user: { isAnonymous: false }, settled: true },
    'unauthenticated',
  ],
]) {
  test(`own-User session stays inactive for ${name}`, async () => {
    const f = nativeSession(initial)
    await nextTick()
    assert.equal(
      f.docCalls.length,
      0,
      'guest sessions do not construct own-User or membership references'
    )
    assert.equal(f.state.coreOutcome.value, 'idle')
    assert.equal(f.state.appOutcome.value, 'idle')
    assert.equal(f.state.coreUser.value, undefined)
    assert.equal(f.state.appUser.value, undefined)
    assert.equal(f.state.currentUser.value, null)
    assert.equal(f.state.coreError.value, undefined)
    assert.equal(f.state.error.value, null)
    assert.equal(f.state.outcome.value, expected)
    f.scope.stop()
  })
}
test('settled registered nonmember resolves own User before membership exists', async () => {
  const f = nativeSession({ user: { uid: 'person' }, settled: false })
  assert.equal(f.docCalls.length, 0)
  f.auth.hasAuthState.value = true
  await nextTick()
  assert.deepEqual(f.docCalls, [
    { database: 'identity-db', path: 'users', id: 'person' },
    { database: 'app-db', path: 'apps/runtime/users', id: 'person' },
  ])
  f.settle('users', { display_name: 'Person', handle: 'person' })
  f.settle('apps/runtime/users', undefined)
  assert.equal(f.state.outcome.value, 'ready')
  assert.equal(f.state.currentUser.value.id, 'person')
  assert.equal(f.state.appOutcome.value, 'empty')
  assert.equal(f.state.appUser.value, null)
  assert.equal(f.state.canSelfJoin.value, true)
  f.scope.stop()
})
test('authorized missing own User remains onboarding and failed own User remains an error', async () => {
  const f = nativeSession({ user: { uid: 'person' }, settled: true })
  await nextTick()
  f.settle('users', undefined)
  f.settle('apps/runtime/users', undefined)
  assert.equal(f.state.coreOutcome.value, 'empty')
  assert.equal(f.state.outcome.value, 'empty')
  assert.equal(f.state.coreUser.value, null)
  const error = new Error('User read denied')
  f.settle('users', { display_name: 'Retained person' }, error)
  assert.equal(f.state.coreOutcome.value, 'error')
  assert.equal(f.state.coreUser.value, undefined)
  assert.equal(f.state.currentUser.value, null)
  assert.equal(f.state.error.value, error)
  assert.equal(f.state.outcome.value, 'error')
  f.scope.stop()
})
test('sign-out immediately masks own User, avatar and membership before anonymous fallback', async () => {
  const f = nativeSession({ user: { uid: 'person' }, settled: true })
  await nextTick()
  f.settle('users', {
    display_name: 'Person',
    avatar: 'https://example.com/person.png',
  })
  f.settle('apps/runtime/users', { role: 'user', subscription: 'free' })
  assert.equal(f.state.currentUser.value.id, 'person')
  assert.equal(f.state.avatarSrc.value, 'https://example.com/person.png')
  assert.equal(f.state.appUser.value.id, 'person')
  f.auth.currentUser.value = null
  assert.equal(f.state.coreOutcome.value, 'idle')
  assert.equal(f.state.appOutcome.value, 'idle')
  assert.equal(f.state.coreUser.value, undefined)
  assert.equal(f.state.appUser.value, undefined)
  assert.equal(f.state.currentUser.value, null)
  assert.equal(f.state.avatarSrc.value, '/img/ecosystem/avatar.png')
  assert.equal(f.state.outcome.value, 'unauthenticated')
  await nextTick()
  f.auth.currentUser.value = { uid: 'anonymous', isAnonymous: true }
  await nextTick()
  assert.equal(f.docCalls.length, 2)
  assert.equal(f.state.coreOutcome.value, 'idle')
  assert.equal(f.state.error.value, null)
  f.scope.stop()
})
test('account switch masks previous identity and membership until exact new reads settle', async () => {
  const f = nativeSession({ user: { uid: 'person-a' }, settled: true })
  await nextTick()
  f.settle('users', { display_name: 'Person A' })
  f.settle('apps/runtime/users', { role: 'admin' })
  f.auth.currentUser.value = { uid: 'person-b' }
  assert.equal(f.state.coreUser.value, undefined)
  assert.equal(f.state.appUser.value, undefined)
  assert.equal(f.state.outcome.value, 'loading')
  await nextTick()
  assert.deepEqual(f.docCalls.slice(2), [
    { database: 'identity-db', path: 'users', id: 'person-b' },
    { database: 'app-db', path: 'apps/runtime/users', id: 'person-b' },
  ])
  f.settle('users', { display_name: 'Person B' })
  f.settle('apps/runtime/users', undefined)
  assert.equal(f.state.currentUser.value.id, 'person-b')
  assert.equal(f.state.currentUser.value.display_name, 'Person B')
  assert.equal(f.state.appUser.value, null)
  assert.equal(f.state.outcome.value, 'ready')
  f.scope.stop()
})
test('anonymous viewer can still bind an explicitly targeted public User identity', async () => {
  const f = nativeSession({
    user: { uid: 'anonymous', isAnonymous: true },
    settled: true,
  })
  let publicUser
  f.scope.run(() => {
    publicUser = f.useUserRead('public-person')
  })
  await nextTick()
  assert.deepEqual(f.docCalls, [
    { database: 'identity-db', path: 'users', id: 'public-person' },
  ])
  f.settle('users', { display_name: 'Public Person', handle: 'public-person' })
  assert.equal(publicUser.outcome.value, 'ready')
  assert.equal(publicUser.user.value.id, 'public-person')
  assert.equal(f.state.currentUser.value, null)
  assert.equal(f.state.outcome.value, 'unauthenticated')
  f.scope.stop()
})
