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

test('Dashboard sections keep their reads and outcomes separate without another App-status read', () => {
  const uid = ref('person')
  const identity = {
    user: ref({ id: 'person' }),
    outcome: ref('ready'),
    error: ref(null),
  }
  const account = { outcome: ref('ready') }
  const membership = {
    appUser: ref({ role: 'admin', subscription: 'free' }),
    outcome: ref('ready'),
  }
  const calls = []
  const forbidden = () => assert.fail('Overview acquired an unrelated reader')
  const dependencies = {
    computed,
    useAuth: () => ({ uid }),
    useFireUXConfig: () => ({ appId: 'app' }),
    useUserRead: (target) => {
      calls.push(['user', target])
      return identity
    },
    useUserAccount: () => {
      calls.push(['account'])
      return account
    },
    useUserView: () => ({ profile: (value) => value }),
    useAppUserRead: (appId, target) => {
      calls.push(['membership', appId, target])
      return membership
    },
    useAppRead: forbidden,
    useUserSession: forbidden,
    useDashboardNav: forbidden,
    useWorkspaceEntryCta: () => ({
      hasWorkspaceEntry: ref(true),
      workspaceEntryHref: ref('/workspace'),
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
  const user = section('User.vue', '{card,hasError,accountOutcome}')
  assert.deepEqual(
    calls.map(([owner]) => owner),
    ['user', 'account']
  )
  const app = section('App.vue', '{outcome,canManageApp,hasWorkspaceEntry}')
  assert.deepEqual(
    calls.map(([owner]) => owner),
    ['user', 'account', 'membership']
  )
  assert.equal(calls[0][1], uid)
  assert.equal(calls[2][1], 'app')
  assert.equal(calls[2][2], uid)
  assert.equal(app.canManageApp.value, true)
  membership.outcome.value = 'error'
  assert.equal(app.canManageApp.value, false)
  assert.equal(user.card.value.id, 'person')
  assert.equal(app.hasWorkspaceEntry.value, true)
  membership.outcome.value = 'ready'
  identity.outcome.value = 'error'
  assert.equal(user.hasError.value, true)
  assert.equal(app.canManageApp.value, true)
  account.outcome.value = 'error'
  assert.equal(user.accountOutcome.value, 'error')
  assert.equal(app.outcome.value, 'ready')
})
