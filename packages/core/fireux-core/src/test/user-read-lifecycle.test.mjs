import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction as compileNative } from 'node:vm'
let currentReadFetch
const compileFunction = (source, args = []) => {
  const mocks = {
    $fetch: { create: () => currentReadFetch },
    setResponseHeader: () => {},
  }
  const names = Object.keys(mocks).filter((name) => !args.includes(name))
  return compileNative(source, [...names, ...args]).bind(
    null,
    ...names.map((name) => mocks[name])
  )
}
import { computed, ref, isRef, watch } from 'vue'
function load(path, name, dependencies) {
  const source = stripTypeScriptTypes(
    readFileSync(new URL(path, import.meta.url), 'utf8')
      .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
      .replace(/^export /gm, '')
  )
  return compileFunction(
    `${source}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
test('Notifications hide previous owner data immediately on account change or logout', async () => {
  const currentUser = ref({ uid: 'a', getIdToken: async () => 'token' }),
    data = ref(),
    error = ref(null)
  let execute
  const use = load(
    '../runtime/user/composables/notifications/useUserNotifications.ts',
    'useUserNotifications',
    {
      computed,
      watch,
      useState: (_key, initial) => ref(initial()),
      useAuth: () => ({ currentUser, hasAuthState: ref(true) }),
      useAsyncData: (_key, handler) => {
        execute = async () => {
          data.value = await ((currentReadFetch = async () => ({
            ok: true,
            notifications: [{ id: 'notice', read: false }],
            unreadCount: 1,
          })),
          handler({}, { signal: new AbortController().signal }))
        }
        return { data, error, pending: ref(false), refresh: () => execute() }
      },
    }
  )
  const state = use()
  await execute()
  assert.equal(state.unreadCount.value, 1)
  currentUser.value = { uid: 'b', getIdToken: async () => 'token' }
  assert.deepEqual(state.notifications.value, [])
  currentUser.value = null
  assert.deepEqual(state.notifications.value, [])
  assert.equal(state.outcome.value, 'idle')
})

test('AppUser authority is withdrawn whenever the membership read is not ready', () => {
  const use = load(
    '../runtime/app/composables/membership/useAppUserAccess.ts',
    'useAppUserAccess',
    {
      computed,
      resolveAppUserAccess: (membership) => ({
        hasAdminAuthority: Boolean(membership),
        hasDeveloperAuthority: Boolean(membership),
        subscription: membership?.subscription ?? 'free',
        hasPremiumSubscription: Boolean(membership),
        hasBusinessSubscription: Boolean(membership),
      }),
    }
  )
  const appUser = ref({ role: 'admin', subscription: 'business' })
  const appOutcome = ref('ready')
  const state = use({ appUser, appOutcome })
  assert.equal(state.isAdmin.value, true)
  for (const outcome of ['pending', 'error', 'empty', 'idle']) {
    appOutcome.value = outcome
    assert.equal(state.isAdmin.value, false)
    assert.equal(state.canOwnMultipleWorkspaces.value, false)
  }
  appOutcome.value = 'ready'
  assert.equal(state.isAdmin.value, true)
  appUser.value = null
  assert.equal(state.isAdmin.value, false)
})

test('Public profiles require both matching snapshots before reading their data', () => {
  const mapEntry = load(
    '../runtime/user/server/directory/profile-directory.ts',
    'mapEntry',
    {
      readUserIdentitySummary: (snapshot) =>
        snapshot.exists ? { id: snapshot.id } : null,
    }
  )
  const config = { kind: 'chef', mapProfile: (data) => data }
  const user = { id: 'person', exists: true }
  const profile = {
    id: 'chef',
    exists: true,
    ref: { path: 'users/person/profiles/chef' },
    data: () => ({ title: 'Chef' }),
  }
  assert.equal(mapEntry(config, undefined, user, 'index'), null)
  assert.equal(
    mapEntry(
      config,
      {
        get ref() {
          throw new Error('Premature access')
        },
      },
      undefined,
      'detail'
    ),
    null
  )
  assert.equal(
    mapEntry(config, profile, { id: 'other', exists: true }, 'index'),
    null
  )
  assert.deepEqual(mapEntry(config, profile, user, 'detail'), {
    id: 'person',
    kind: 'chef',
    profile: { title: 'Chef' },
    user: { id: 'person' },
  })
})
