import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'

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
    useAuth: () => ({ uid }),
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
    new URL('../runtime/user/composables/session/useUserSession.ts', import.meta.url),
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
  assert.equal(calls[0].id, uid)
  assert.equal(calls[1].id, uid)
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
