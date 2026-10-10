import { isAppUserRole } from '../runtime/app/models/app-user.model.ts'
import { userDisplayNameSeed } from '../runtime/user/utils/display-name-seed.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'

function load(path, name, dependencies = {}) {
  dependencies = {
    userDisplayNameSeed, isAppUserRole,
    getCurrentScope: () => null,
    captureCommandScope: () => ({ isCurrent: () => true, stop() {} }),
    useCurrentUser: () => ({ get value() { return dependencies.getAuth?.().currentUser ?? null } }),
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
const joins = (appId) => `apps/${appId}/join-requests`
const blocks = (appId) => `apps/${appId}/membership-blocks`
const contract = load(
  '../runtime/app/server/app-user/command-contract.ts',
  '{ appGovernancePatch, forbidden, initialMembership, requireAdmin, roleFrom }',
  {
    createError: ({ statusCode, statusMessage }) =>
      Object.assign(new Error(statusMessage), { statusCode }),
    FieldValue: { serverTimestamp: () => ({ seconds: 123, nanoseconds: 0 }) },
    FIRESTORE_MUTATION_TARGETS: { runtimeUsers: 'users' },
  }
)
const review = load(
  '../runtime/app/server/app-user/review-join.ts',
  'handleReviewJoin',
  {
    ...contract,
    FIRESTORE_MUTATION_TARGETS: { runtimeApps: 'apps', runtimeUsers: 'users' },
    serverAppUsersTarget: memberships,
    serverAppJoinRequestsTarget: joins,
    serverAppMembershipBlocksTarget: blocks,
    requireFirestoreDocumentId: (id) => id,
  }
)

function reviewTransaction({
  member,
  publicUser = {},
  request = {},
  block = {},
} = {}) {
  const stored = new Map([
    ['users/person', publicUser],
    [`${memberships('app')}/person`, member],
    [`${joins('app')}/person`, request],
    [`${blocks('app')}/person`, block],
  ])
  const writes = []
  const reads = []
  const mutations = {
    read: async (target, id) => {
      assert.equal(
        writes.length,
        0,
        'Firestore transactions require all reads before writes'
      )
      const path = `${target}/${id}`
      reads.push(path)
      const data = stored.get(path)
      return { exists: data != null, data }
    },
    create: (target, id, data) => writes.push(['create', target, id, data]),
    update: (target, id, data) => writes.push(['update', target, id, data]),
    delete: (target, id) => writes.push(['delete', target, id]),
  }
  const run = (
    approve,
    { role = 'admin', crossDatabaseUserVerified = false } = {}
  ) =>
    review(
      {
        context: {
          actorUid: 'administrator',
          appId: 'app',
          input: { action: 'review-join', userId: 'person', approve },
        },
        actorMembership: { role },
        mutations,
      },
      crossDatabaseUserVerified
    )
  return { run, writes, reads }
}

for (const member of [undefined, { role: 'dev', subscription: 'premium' }]) {
  test(`join approval ${member ? 'preserves existing membership' : 'creates unprivileged membership'} before clearing request and block`, async () => {
    const transaction = reviewTransaction({ member })
    const result = await transaction.run(true)
    assert.equal(result.created, !member)
    assert.equal(result.role, member?.role ?? 'user')
    assert.deepEqual(
      transaction.writes.map(([verb, target]) => [verb, target]),
      [
        ...(!member ? [['create', memberships('app')]] : []),
        ['delete', blocks('app')],
        ['update', 'apps'],
        ['delete', joins('app')],
      ]
    )
    if (!member) {
      assert.equal(transaction.writes[0][3].role, 'user')
      assert.equal(transaction.writes[0][3].subscription, 'free')
    }
  })
}

test('rejecting a request never creates membership or clears a membership block', async () => {
  const transaction = reviewTransaction({ publicUser: null })
  const result = await transaction.run(false)
  assert.equal(result.created, false)
  assert.deepEqual(
    transaction.writes.map(([verb, target]) => [verb, target]),
    [
      ['update', 'apps'],
      ['delete', joins('app')],
    ]
  )
  assert.ok(!transaction.reads.includes('users/person'))
})

test('approval rejects missing identity and non-admin actors before any write', async () => {
  const missing = reviewTransaction({ publicUser: null })
  await assert.rejects(missing.run(true), { statusCode: 409 })
  assert.deepEqual(missing.writes, [])
  const unauthorized = reviewTransaction()
  await assert.rejects(unauthorized.run(true, { role: 'user' }), {
    statusCode: 403,
  })
  assert.deepEqual(unauthorized.writes, [])
})

test('cross-database approval trusts the preverified identity and tolerates an already cleared request', async () => {
  const transaction = reviewTransaction({
    publicUser: null,
    request: null,
    block: null,
  })
  const result = await transaction.run(true, {
    crossDatabaseUserVerified: true,
  })
  assert.equal(result.created, true)
  assert.ok(!transaction.reads.includes('users/person'))
  assert.deepEqual(
    transaction.writes.map(([verb, target]) => [verb, target]),
    [
      ['create', memberships('app')],
      ['update', 'apps'],
    ]
  )
})

function provisioner() {
  const currentUser = ref({ uid: 'A', isAnonymous: false })
  const state = ref({ uid: null, status: 'idle', generation: 0 })
  const lastError = ref(null)
  const accounts = []
  const bootstrapped = []
  const cleared = []
  const make = load(
    '../runtime/composables/fireux/firebase/auth-account-provisioning.ts',
    'createAuthAccountProvisioner',
    {
      computed,
      readPendingAccountConsent: () => 'current-terms',
      clearPendingAccountConsent: () => cleared.push(currentUser.value.uid),
      provisionSignedInUserAccount: (user) => {
        const gate = deferred()
        accounts.push({ uid: user.uid, ...gate })
        return gate.promise
      },
    }
  )
  const actions = make({
    currentUser,
    state,
    lastError,
    isReady: ref(true),
    userCreate: {
      bootstrapUser: async (user) => bootstrapped.push(user.uid),
    },
  })
  return {
    ...actions,
    currentUser,
    state,
    lastError,
    accounts,
    bootstrapped,
    cleared,
  }
}

test('successful provisioning shares its in-flight request and bootstraps the captured account once', async () => {
  const subject = provisioner()
  const first = subject.createOnce('A')
  const duplicate = subject.createOnce('A')
  assert.equal(subject.accounts.length, 1)
  subject.accounts[0].resolve()
  await Promise.all([first, duplicate])
  assert.deepEqual(subject.bootstrapped, ['A'])
  assert.deepEqual(subject.cleared, ['A'])
  assert.equal(subject.state.value.status, 'success')
})

for (const fail of [false, true]) {
  test(`a stale account ${fail ? 'failure' : 'success'} cannot affect the next signed-in account`, async () => {
    const subject = provisioner()
    const old = subject.createOnce('A')
    subject.reset('A')
    subject.currentUser.value = { uid: 'B', isAnonymous: false }
    const current = subject.createOnce('B')
    const expectedState = { ...subject.state.value }
    if (fail)
      subject.accounts[0].reject(new Error('Old account request failed'))
    else subject.accounts[0].resolve()
    await old
    assert.deepEqual(subject.state.value, expectedState)
    assert.equal(subject.lastError.value, null)
    assert.deepEqual(subject.bootstrapped, [])
    assert.deepEqual(subject.cleared, [])
    subject.accounts[1].resolve()
    await current
    assert.deepEqual(subject.bootstrapped, ['B'])
    assert.deepEqual(subject.cleared, ['B'])
  })
}

test('reset invalidates an older provisioning generation even when the same account signs back in', async () => {
  const subject = provisioner()
  const old = subject.createOnce('A')
  subject.reset('A')
  const current = subject.createOnce('A')
  subject.accounts[0].resolve()
  await old
  assert.deepEqual(subject.bootstrapped, [])
  assert.deepEqual(subject.cleared, [])
  subject.accounts[1].resolve()
  await current
  assert.deepEqual(subject.bootstrapped, ['A'])
})

test('current provisioning errors remain visible and an explicit retry can succeed', async () => {
  const subject = provisioner()
  const first = subject.createOnce('A')
  const failure = new Error('Account unavailable')
  subject.accounts[0].reject(failure)
  await assert.rejects(first, failure)
  assert.equal(subject.state.value.status, 'failed')
  assert.equal(subject.lastError.value, failure)
  const retry = subject.retry()
  subject.accounts[1].resolve()
  assert.equal(await retry, true)
  assert.deepEqual(subject.bootstrapped, ['A'])
})

for (const boundary of [
  'identity',
  'membership-read',
  'policy',
  'membership-command',
  'event-token',
]) {
  test(`account switching during bootstrap ${boundary} cannot start its next stage`, async () => {
    const gate = deferred()
    const reached = deferred()
    const calls = []
    const pause = async (stage) => {
      calls.push(stage)
      if (boundary === stage) {
        reached.resolve()
        await gate.promise
      }
    }
    const user = {
      uid: 'A',
      displayName: 'Account A',
      getIdToken: async () => {
        await pause('event-token')
        return 'token-A'
      },
    }
    const auth = { currentUser: user }
    const make = load(
      '../runtime/user/composables/identity/useUserBootstrap.ts',
      'useUserBootstrap',
      {
        doc: () => ({}),
        getDoc: async () => {
          await pause('membership-read')
          return { exists: () => false }
        },
        getAuth: () => auth,
        useFireUXConfig: () => ({ appId: 'app' }),
        useFirestore: () => ({}),
        requireUid: async () => {
          throw new Error('Bootstrap must retain its supplied Auth identity')
        },
        provisionUserIdentity: async (uid) => {
          assert.equal(uid, 'A')
          await pause('identity')
          return { created: true }
        },
        runAppUserCommand: async (_input, actor) => {
          const uid = actor.uid
          assert.equal(uid, 'A')
          await pause('membership-command')
          return { created: true }
        },
        fetch: async (url) => {
          assert.equal(
            url,
            '/api/app/status',
            'A must not emit a joined event after switching accounts'
          )
          await pause('policy')
          return {
            ok: true,
            json: async () => ({
              appId: 'app',
              initialized: true,
              selfJoinEnabled: true,
            }),
          }
        },
      }
    )
    const flight = make().bootstrapUser(user)
    await reached.promise
    const before = [...calls]
    auth.currentUser = { uid: 'B' }
    gate.resolve()
    await assert.rejects(flight, /signed-in account changed/)
    assert.deepEqual(calls, before)
  })
}

test('bootstrap rejects an intended account that is no longer signed in before creating identity', async () => {
  const make = load(
    '../runtime/user/composables/identity/useUserBootstrap.ts',
    'useUserBootstrap',
    {
      useFirestore: () => ({}),
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
      '../runtime/app/utils/runAppUserCommand.ts',
      'runAppUserCommand',
      {
        useAuth: () => ({ currentUser: { get value() { return currentUser } } }),
        useFireUXConfig: () => ({ appId: 'app' }),
        captureCommandScope: () => ({ isCurrent: () => true, stop() {} }),
        fetch: async (url, options) => {
          requests.push({ url, options })
          return { ok: true, json: async () => ({ created: true, removed: true }) }
        },
      }
    )
    const flight = run({ action, ...(action === 'remove-member' ? { userId: 'A' } : {}) }, actor)
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
    '../runtime/app/utils/membership-access.ts',
    'readMembershipAccessIds'
  )
  const useAccess = load(
    '../runtime/app/composables/membership/useMembershipAccess.ts',
    'useMembershipAccess',
    {
      computed,
      toValue,
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
    '../runtime/app/server/app-user/remove.ts',
    'handleRemoveMember',
    {
      ...contract,
      stamp: (by) => ({ by }),
      isAdminMembership: (value) => value?.role === 'admin',
      countTransactionAdmins: async () => 1,
      requireFirestoreDocumentId: (id) => id,
      serverAppUsersTarget: memberships,
      serverAppJoinRequestsTarget: joins,
      serverAppMembershipBlocksTarget: blocks,
      FIRESTORE_MUTATION_TARGETS: { runtimeApps: 'apps' },
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
  assert.equal(stored.get(`${blocks('app')}/${uid}`).user_id, uid)
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
