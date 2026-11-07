import { useDashboardProfiles } from '../runtime/composables/navigation/useDashboardProfiles.ts'
import { readAppUserSubscription } from '../runtime/app/models/app-user.model.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, unref } from 'vue'

// App uses the server projection covered by app-native-auth-scope.test.mjs.
// Ecosystem no longer has a separate Core reader.
for (const [name, owner, database, collection] of [
  ['AppUser', 'app', undefined, 'apps/app-a/users'],
  ['User', 'user', 'identity', 'users'],
]) {
  test(`${name}: reactive identity, database authority and read states`, () => {
    let calls = 0
    let path
    let target
    const source = Object.assign(ref(undefined), {
      pending: ref(false),
      error: ref(undefined),
      outcome: ref('idle'),
    })
    const dependencies = {
      computed,
      unref,
      readAppUserSubscription,
      readRuntimeIdentityFirestoreDatabaseId: () => 'identity',
      useAuth: () => ({
        uid: ref('viewer'),
        isAuthenticated: ref(true),
        hasAuthState: ref(true),
      }),
      normalizeUser: (id, data) => ({ ...data, id }),
      readAppDocument: (data, id) => {
        assert.equal('id' in data, false)
        return data.name ? { ...data, id } : null
      },
      useFirestoreRead: (options = {}) => {
        assert.equal(options.databaseId, database)
        return {
          firestoreFetchDoc: (p, id) => {
            calls++
            path = p
            target = id
            return source
          },
        }
      },
    }
    const code = readFileSync(
      new URL(
        `../runtime/${owner}/composables/${name === 'AppUser' ? 'membership/' : ''}use${name}Read.ts`,
        import.meta.url
      ),
      'utf8'
    )
      .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
      .replace(/^export /gm, '')
    const factory = compileFunction(
      `${stripTypeScriptTypes(code)}; return use${name}Read`,
      Object.keys(dependencies)
    )(...Object.values(dependencies))
    const id = ref('')
    const app = ref('app-a')
    const result = name === 'AppUser' ? factory(app, id) : factory(id)
    const data = result[name[0].toLowerCase() + name.slice(1)]
    assert.equal(data.value, undefined)
    id.value = ' first '
    assert.equal(target.value, 'first')
    assert.equal(unref(path), collection)
    source.pending.value = true
    source.outcome.value = 'pending'
    assert.equal(data.value, undefined)
    assert.equal(result.outcome.value, 'pending')
    source.pending.value = false
    source.outcome.value = 'empty'
    assert.equal(data.value, null)
    source.value = { id: 'first', name: 'Example', subscription: 'free' }
    source.outcome.value = 'ready'
    assert.equal(data.value.id, 'first')
    const failure = new Error('denied')
    source.error.value = failure
    source.outcome.value = 'error'
    assert.equal(result.error.value, failure)
    assert.equal(result.outcome.value, 'error')
    id.value = 'second'
    assert.equal(target.value, 'second')
    if (name === 'AppUser') {
      app.value = 'app-b'
      assert.equal(path.value, 'apps/app-b/users')
      app.value = ''
      assert.equal(path.value, '')
      assert.equal(data.value, undefined)
    }
    assert.equal(calls, 1)
  })
}

test('Dashboard keeps App, membership and account outcomes independent', () => {
  const uid = ref('person')
  const identity = {
    user: ref({ id: 'person' }),
    error: ref(null),
    outcome: ref('ready'),
  }
  const app = { app: ref({ id: 'app' }), outcome: ref('ready') }
  const membership = { appUser: ref({ role: 'admin' }), outcome: ref('ready') }
  const account = { outcome: ref('ready') }
  const calls = []
  const forbidden = () => {
    throw new Error('Dashboard constructed an aggregate session')
  }
  const dependencies = {
    computed,
    useFireUXConfig: () => ({ appId: 'app' }),
    useAuth: () => ({ uid }),
    useUserRead: (target) => {
      calls.push(['user', target])
      return identity
    },
    useAppRead: (target) => {
      calls.push(['app', target])
      return app
    },
    useAppUserRead: (target, user) => {
      calls.push(['membership', target, user])
      return membership
    },
    useUserAccount: () => {
      calls.push(['account'])
      return account
    },
    useAppSession: forbidden,
    useUserSession: forbidden,
    useAppView: () => ({ toCard: (value) => value }),
    useUserView: () => ({ profile: (value) => value }),
    useNav: () => ({ desktop: ref([]) }),
    useDashboardProfiles,
    useWorkspaceEntryCta: () => ({
      workspaceActions: ref([]),
      hasWorkspaceEntry: ref(true),
      workspaceEntryHref: ref('/'),
    }),
  }
  function section(file, names) {
    const source = readFileSync(
      new URL(
        '../runtime/components/Dashboard/Overview/' + file,
        import.meta.url
      ),
      'utf8'
    )
      .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
      .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    return compileFunction(
      stripTypeScriptTypes(source) + '; return ' + names,
      Object.keys(dependencies)
    )(...Object.values(dependencies))
  }
  const userState = section('User.vue', '{ accountOutcome, card, coreIsError }')
  assert.deepEqual(
    calls.map(([owner]) => owner),
    ['user', 'account']
  )
  const state = section(
    'App.vue',
    '{ appOutcome, membershipOutcome, canManageApp, canOpenWorkspace }'
  )
  assert.deepEqual(
    calls.map(([owner]) => owner),
    ['user', 'account', 'app', 'membership']
  )
  assert.equal(calls[0][1], uid)
  assert.equal(calls[3][2], uid)
  assert.equal(state.appOutcome, app.outcome)
  assert.equal(state.membershipOutcome, membership.outcome)
  assert.equal(userState.accountOutcome, account.outcome)
  assert.equal(state.canManageApp.value, true)
  membership.outcome.value = 'error'
  assert.equal(state.appOutcome.value, 'ready')
  assert.equal(state.canManageApp.value, false)
  assert.equal(state.canOpenWorkspace.value, true)
  membership.outcome.value = 'ready'
  app.outcome.value = 'error'
  assert.equal(state.membershipOutcome.value, 'ready')
  assert.equal(state.canManageApp.value, false)
  assert.equal(userState.card.value.id, 'person')
  identity.outcome.value = 'error'
  assert.equal(state.membershipOutcome.value, 'ready')
  assert.equal(userState.coreIsError.value, true)
  app.outcome.value = 'ready'
  account.outcome.value = 'error'
  assert.equal(state.appOutcome.value, 'ready')
  assert.equal(state.membershipOutcome.value, 'ready')
  assert.equal(state.canManageApp.value, true)
})
