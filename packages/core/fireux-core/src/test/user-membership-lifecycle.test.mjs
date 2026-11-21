import {
  isAppUserRole,
  isAppUserSubscription,
  readAppUserSubscription,
} from '../runtime/app/utils/membership/validation.ts'
import { userDisplayNameSeed } from '../runtime/user/utils/display-name-seed.ts'
import { resolveAppUserAccess } from '../runtime/app/utils/membership/access.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'

function load(path, name, dependencies = {}) {
  dependencies = {
    userDisplayNameSeed,
    isAppUserRole,
    getCurrentScope: () => null,
    captureCommandScope: () => ({ isCurrent: () => true, stop() {} }),
    useCurrentUser: () => ({
      get value() {
        return dependencies.getAuth?.().currentUser ?? null
      },
    }),
    ...dependencies,
  }
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function deferred() {
  let resolve, reject
  const promise = new Promise((done, fail) => {
    resolve = done
    reject = fail
  })
  return { promise, resolve, reject }
}

const memberships = (appId) => `apps/${appId}/users`
const contract = load(
  '../runtime/app/server/membership/command-contract.ts',
  '{ appGovernancePatch, countTransactionAdmins, forbidden, initialMembership, isAdminMembership, requireAdmin, requireCanonicalMembership, requiredIdentityUserId, roleFrom, stamp }',
  {
    createError: ({ statusCode, statusMessage }) =>
      Object.assign(new Error(statusMessage), { statusCode }),
    FieldValue: { serverTimestamp: () => ({ seconds: 123, nanoseconds: 0 }) },
    isAppUserRole,
    isAppUserSubscription,
    readAppUserSubscription,
    USER_MUTATION_TARGETS: { runtimeUsers: 'users' },
    serverAppUsersTarget: memberships,
  }
)

test('explicit Join creates one membership and locator and repeat Join preserves both', async () => {
  const stamp = { at: { seconds: 123, nanoseconds: 0 } }
  const original = new Map([
    ['apps/second', { status: 'active' }],
    ['users/person', { handle: 'person' }],
    ['users/person/private/account', { email: 'person@example.test' }],
    ['apps/first/users/person', { role: 'admin', subscription: 'pro' }],
  ])
  const stored = new Map(original)
  const writes = []
  const read = (path) => ({ exists: stored.has(path), data: stored.get(path) })
  const write = (path, data) => {
    stored.set(path, data)
    writes.push(path)
  }
  const ref = (path = '') => ({
    collection: (name) => ref(path ? path + '/' + name : name),
    doc: (id) => ref(path + '/' + id),
    get: async () => ({
      exists: read(path).exists,
      data: () => read(path).data,
    }),
    set: async (data) => write(path, data),
  })
  const reconcileUserAppReference = load(
    '../runtime/app/server/membership/user-reference.ts',
    'reconcileUserAppReference',
    {
      getRuntimeFirestore: () => ref(),
      getRuntimeIdentityFirestore: () => ref(),
      FieldValue: { serverTimestamp: () => stamp.at },
    }
  )
  const join = load(
    '../runtime/app/server/membership/command.ts',
    'mutateRuntimeAppMembership',
    {
      ...contract,
      APP_MUTATION_TARGETS: { runtimeApps: 'apps' },
      USER_MUTATION_TARGETS: { runtimeUsers: 'users' },
      serverAppUsersTarget: memberships,
      reconcileUserAppReference,
      runGuardedServerTransaction: async (_database, run) =>
        run({
          read: async (collection, id) => read(collection + '/' + id),
          create: (collection, id, data) => write(collection + '/' + id, data),
          update: (collection, id, data) =>
            write(collection + '/' + id, {
              ...read(collection + '/' + id).data,
              ...data,
            }),
        }),
    }
  )
  const input = {
    actorUid: 'person',
    appId: 'second',
    appDatabaseId: 'fireux',
    identityDatabaseId: 'fireux',
    input: { action: 'ensure-self' },
  }
  assert.equal((await join(input)).created, true)
  assert.equal(stored.get('apps/second/users/person').role, 'user')
  assert.equal(stored.get('apps/second/users/person').subscription, 'free')
  assert.equal(stored.get('users/person/apps/second').app_id, 'second')
  assert.deepEqual(writes, [
    'apps/second/users/person',
    'apps/second',
    'users/person/apps/second',
  ])
  assert.equal((await join(input)).created, false)
  assert.equal(writes.length, 3)
  for (const path of [
    'users/person',
    'users/person/private/account',
    'apps/first/users/person',
  ])
    assert.deepEqual(stored.get(path), original.get(path))
})

test('App membership retains only its role, subscription and timestamps', () => {
  const membership = contract.initialMembership('person', 'user')
  assert.deepEqual(membership, {
    role: 'user',
    subscription: 'free',
    created: { at: { seconds: 123, nanoseconds: 0 }, by: 'person' },
    updated: { at: { seconds: 123, nanoseconds: 0 }, by: 'person' },
  })
  assert.doesNotThrow(() => contract.requireCanonicalMembership(membership))
  assert.doesNotThrow(() =>
    contract.requireCanonicalMembership({
      ...membership,
      subscription: 'premium',
    })
  )
  assert.throws(
    () =>
      contract.requireCanonicalMembership({
        ...membership,
        subscription: 'invalid',
      }),
    { statusCode: 409 }
  )
  assert.throws(
    () =>
      contract.requireCanonicalMembership({
        ...membership,
        role: 'invalid',
      }),
    { statusCode: 409 }
  )
})

for (const change of ['account', 'setup']) {
  test(`${change} changes during identity provisioning stop bootstrap`, async () => {
    let ownerCurrent = true
    const gate = deferred()
    const reached = deferred()
    const user = { uid: 'A', displayName: 'Account A' }
    const auth = { currentUser: user }
    const make = load(
      '../runtime/user/composables/identity/useUserBootstrap.ts',
      'useUserBootstrap',
      {
        getAuth: () => auth,
        useFireUXConfig: () => ({ appId: 'app' }),
        requireUid: async () => {
          assert.fail('Bootstrap must retain its supplied Auth identity')
        },
        provisionUserIdentity: async (uid) => {
          assert.equal(uid, 'A')
          reached.resolve()
          await gate.promise
        },
      }
    )
    const flight = make().bootstrapUser(user, () => ownerCurrent)
    await reached.promise
    if (change === 'account') auth.currentUser = { uid: 'B' }
    else ownerCurrent = false
    gate.resolve()
    await assert.rejects(flight, /signed-in account changed/)
  })
}

test('bootstrap rejects an intended account that is no longer signed in before creating identity', async () => {
  const make = load(
    '../runtime/user/composables/identity/useUserBootstrap.ts',
    'useUserBootstrap',
    {
      useFireUXConfig: () => ({ appId: 'app' }),
      getAuth: () => ({ currentUser: { uid: 'B' } }),
    }
  )
  await assert.rejects(
    make().bootstrapUser({ uid: 'A' }),
    /signed-in account changed/
  )
})

for (const action of ['ensure-self', 'bootstrap-admin', 'remove-member']) {
  test(`App ${action} rejects an obsolete account during token acquisition`, async () => {
    const token = deferred()
    const reached = deferred()
    const requests = []
    let currentUser = {
      uid: 'A',
      getIdToken: () => {
        reached.resolve()
        return token.promise
      },
    }
    const actor = currentUser
    const run = load(
      '../runtime/app/composables/membership/run-app-user-command.ts',
      'runAppUserCommand',
      {
        useAuth: () => ({
          currentUser: {
            get value() {
              return currentUser
            },
          },
        }),
        useFireUXConfig: () => ({ appId: 'app' }),
        captureCommandScope: () => ({ isCurrent: () => true, stop() {} }),
        fetch: async (url, options) => {
          requests.push({ url, options })
          return {
            ok: true,
            json: async () => ({ created: true, removed: true }),
          }
        },
      }
    )
    const flight = run(
      { action, ...(action === 'remove-member' ? { userId: 'A' } : {}) },
      actor
    )
    await reached.promise
    currentUser = { uid: 'B', getIdToken: async () => 'token-B' }
    token.resolve('token-A')
    await assert.rejects(flight, /context changed/)
    assert.equal(requests.length, 0)
  })
}

test('removing a disposable member revokes live domain access and a new membership cannot reuse old grants', async () => {
  const uid = 'disposable-member'
  const created = { seconds: 100, nanoseconds: 0 }
  const membership = ref({
    role: 'user',
    subscription: 'free',
    created: { at: created },
  })
  const admin = { role: 'admin', created: { at: created } }
  const stored = new Map([
    [`${memberships('app')}/${uid}`, membership.value],
    [`${memberships('app')}/administrator`, admin],
  ])
  const accessContract = load(
    '../runtime/app/utils/membership/membership-access.ts',
    'readMembershipAccessIds'
  )
  const useAccess = load(
    '../runtime/app/composables/membership/useMembershipAccess.ts',
    'useMembershipAccess',
    {
      computed,
      toValue,
      resolveAppUserAccess,
      readMembershipAccessIds: accessContract,
      useFirestoreRead: () => ({
        firestoreFetchDoc: () =>
          Object.assign(
            ref({ ids: ['workspace'], membership_created_at: created }),
            { pending: ref(false), error: ref(), outcome: ref('ready') }
          ),
      }),
    }
  )
  const kitchen = useAccess('apps/app/kitchen-access', ref(uid), membership)
  const project = useAccess('apps/app/project-access', ref(uid), membership)
  assert.deepEqual(kitchen.ids.value, ['workspace'])
  assert.deepEqual(project.ids.value, ['workspace'])
  const handler = load(
    '../runtime/app/server/membership/remove.ts',
    'handleRemoveMember',
    {
      ...contract,
      stamp: (by) => ({ by }),
      isAdminMembership: (value) => value?.role === 'admin',
      countTransactionAdmins: async () => 1,
      requireFirestoreDocumentId: (id) => id,
      serverAppUsersTarget: memberships,
      APP_MUTATION_TARGETS: { runtimeApps: 'apps' },
    }
  )
  const writes = []
  const mutations = {
    read: async (target, id) => {
      assert.equal(writes.length, 0)
      const data = stored.get(`${target}/${id}`)
      return { exists: data != null, data }
    },
    delete: (target, id) => writes.push(() => stored.delete(`${target}/${id}`)),
    create: (target, id, data) =>
      writes.push(() => stored.set(`${target}/${id}`, data)),
    update: (target, id, data) =>
      writes.push(() =>
        stored.set(`${target}/${id}`, {
          ...stored.get(`${target}/${id}`),
          ...data,
        })
      ),
  }
  const result = await handler({
    context: {
      actorUid: 'administrator',
      appId: 'app',
      input: { action: 'remove-member', userId: uid },
    },
    actorMembershipExists: true,
    actorMembership: admin,
    mutations,
  })
  assert.equal(result.removed, true)
  writes.forEach((commit) => commit())
  membership.value = stored.get(`${memberships('app')}/${uid}`) ?? null
  for (const access of [kitchen, project]) {
    assert.deepEqual(access.ids.value, [])
    assert.equal(access.outcome.value, 'idle')
  }
  assert.equal(stored.get(`${memberships('app')}/administrator`), admin)
  membership.value = {
    role: 'user',
    subscription: 'free',
    created: { at: { seconds: 200, nanoseconds: 0 } },
  }
  for (const access of [kitchen, project]) {
    assert.deepEqual(access.ids.value, [])
    assert.equal(access.outcome.value, 'empty')
  }
})
