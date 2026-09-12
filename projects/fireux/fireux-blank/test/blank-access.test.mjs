import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, ref, unref } from 'vue'

function load(path, names, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names.join(', ')} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const accessHelpers = load(
  '../../../../packages/core/fireux-core/src/runtime/app/utils/membership-access.ts',
  ['readMembershipAccessIds', 'membershipCreatedAt']
)
const createdAt = { seconds: 100, nanoseconds: 0 }
const actor = { runtimeAppId: 'app', uid: 'person', ecosystem: 'fireux' }

function fixture({
  membership = true,
  role = 'user',
  subscription = 'free',
  capacity = true,
  accessRecord = null,
  management = { mode: 'root' },
} = {}) {
  const writes = []
  const counts = []
  const member = {
    exists: membership,
    data: {
      role,
      subscription,
      created: { at: createdAt },
      blanks: ['legacy'],
    },
  }
  const tx = {
    read: async (target) => {
      assert.equal(writes.length, 0, 'all transaction reads precede writes')
      if (target === 'membership') return member
      if (target === 'access')
        return { exists: Boolean(accessRecord), data: accessRecord }
      if (target === 'root') return { exists: true, data: { management } }
      throw new Error(`Unexpected target: ${target}`)
    },
    create: (target, id, data) =>
      writes.push({ action: 'create', target, id, data }),
    update: (target, id, data) =>
      writes.push({ action: 'update', target, id, data }),
  }
  const deps = {
    ...accessHelpers,
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    useFireUXConfig: () => ({
      appId: 'app',
      ecosystem: 'fireux',
      role: 'global',
      subscriptionCapacity: {},
    }),
    requireFirebaseBearerUser: async () => ({ uid: 'person' }),
    requireFirestoreDocumentId: (value) => value,
    serverAppUsersTarget: (appId) => {
      assert.equal(appId, 'app')
      return 'membership'
    },
    serverBlankAccessTarget: (appId) => {
      assert.equal(appId, 'app')
      return 'access'
    },
    isAppUserSubscription: (value) =>
      ['free', 'premium', 'business'].includes(value),
    hasAppSubscriptionCapacity: (_config, family, _subscription, count) => {
      assert.equal(family, 'blank')
      counts.push(count)
      return capacity
    },
    randomUUID: () => 'new-blank',
    normalizeSlug: (value) => value,
    resolveFireuxEntityManagementForApp: () => ({ mode: 'app' }),
    serverAuditStamp: () => ({}),
    blankRootTarget: 'root',
    serverBlankTeamMembersTarget: () => 'team',
    runGuardedServerTransaction: async (_database, callback) => callback(tx),
    readFireuxEntityManagement: (value) => value,
    resolveFireuxEntityManagementAppId: () => 'foreign-app',
  }
  const { completeBlankOnboarding } = load(
    '../server/utils/blank/onboarding.ts',
    ['completeBlankOnboarding'],
    deps
  )
  const { requireBlankMutationAuthority } = load(
    '../server/utils/blank/team/authority.ts',
    ['requireBlankMutationAuthority'],
    deps
  )
  return {
    writes,
    counts,
    create: () => completeBlankOnboarding({}, { name: 'New Blank' }),
    authorize: (id = 'old-blank') =>
      requireBlankMutationAuthority(tx, actor, id),
  }
}

test('Blank root, Team and domain access are created in one transaction without writing AppUser', async () => {
  const f = fixture()
  await f.create()
  assert.deepEqual(
    f.writes.map(({ action, target }) => [action, target]),
    [
      ['create', 'root'],
      ['create', 'team'],
      ['create', 'access'],
    ]
  )
  assert.deepEqual(f.writes[2], {
    action: 'create',
    target: 'access',
    id: 'person',
    data: { ids: ['new-blank'], membership_created_at: createdAt },
  })
  assert.deepEqual(f.counts, [0])
})

test('Blank counts current grants and replaces grants from an earlier membership', async () => {
  const current = fixture({
    accessRecord: { ids: ['old-blank'], membership_created_at: createdAt },
  })
  await current.authorize()
  await current.create()
  assert.deepEqual(current.counts, [1])
  assert.deepEqual(current.writes[2].data.ids, ['old-blank', 'new-blank'])
  const stale = fixture({
    accessRecord: {
      ids: ['old-blank'],
      membership_created_at: { seconds: 99, nanoseconds: 0 },
    },
  })
  await assert.rejects(stale.authorize(), (error) => error.statusCode === 403)
  await stale.create()
  assert.deepEqual(stale.counts, [0])
  assert.deepEqual(stale.writes[2].data, {
    ids: ['new-blank'],
    membership_created_at: createdAt,
  })
})

test('Blank rejects absent grants, removed membership, invalid role and foreign management', async () => {
  for (const options of [
    {},
    { membership: false },
    { role: 'guest' },
    {
      accessRecord: { ids: ['old-blank'], membership_created_at: createdAt },
      management: { mode: 'app' },
    },
  ]) {
    const f = fixture(options)
    await assert.rejects(f.authorize(), (error) =>
      [403, 409].includes(error.statusCode)
    )
    assert.equal(f.writes.length, 0)
  }
})

test('Blank cannot create when capacity, membership or stored access are invalid', async () => {
  for (const options of [
    { capacity: false },
    { membership: false },
    { subscription: 'invalid' },
    { accessRecord: { ids: ['bad/id'], membership_created_at: createdAt } },
  ]) {
    const f = fixture(options)
    await assert.rejects(f.create())
    assert.equal(f.writes.length, 0)
  }
})

test('Blank collection immediately drops revoked ids while a root binding still holds its last value', () => {
  const session = {
    uid: ref('person'),
    appUser: ref({ created: { at: createdAt }, blanks: ['legacy'] }),
    pending: ref(false),
    error: ref(undefined),
  }
  const ids = ref(['visible'])
  const source = {
    docs: ref([{ id: 'visible' }]),
    pending: ref(false),
    error: ref(undefined),
  }
  const { useBlankCollection } = load(
    '../app/composables/fireux/firestore/blank/useBlank.ts',
    ['useBlankCollection'],
    {
      computed,
      unref,
      useAppSession: () => session,
      useFireUXConfig: () => ({ appId: 'app' }),
      blankAccessCollection: (appId) => `blank_access/${appId}/users`,
      useMembershipAccess: (path, uid, membership) => {
        assert.equal(path(), 'blank_access/app/users')
        assert.equal(uid, session.uid)
        assert.equal(membership, session.appUser)
        return { ids, pending: ref(false), error: ref(undefined) }
      },
      useFirestoreRead: () => ({ firestoreLoadDocsByIds: () => source }),
      BlankStorage: { rootCollection: 'blanks' },
    }
  )
  const collection = useBlankCollection()
  assert.deepEqual(
    collection.blanks.value.map(({ id }) => id),
    ['visible']
  )
  ids.value = []
  assert.deepEqual(collection.blanks.value, [])
  assert.equal(collection.outcome.value, 'empty')
  ids.value = ['visible']
  session.error.value = new Error('Membership unavailable')
  assert.deepEqual(collection.blanks.value, [])
  assert.equal(collection.outcome.value, 'error')
})
