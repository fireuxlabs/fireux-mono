import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const accessHelpers = compileFunction(
  `${stripTypeScriptTypes(
    readFileSync(
      new URL(
        '../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
        import.meta.url
      ),
      'utf8'
    )
      .replace(/^import .*\n/gm, '')
      .replace(/^export /gm, '')
  )}; return { readMembershipAccessIds, membershipCreatedAt }`
)()
const createdAt = { seconds: 100, nanoseconds: 0 }

function load(file, name, deps) {
  const source = readFileSync(
    new URL(
      file === 'shared'
        ? '../../../../core/fireux-core/src/runtime/workspace/server/team/members.ts'
        : `../runtime/portfolio/server/team/${file}.ts`,
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(deps)
  )(...Object.values(deps))
}

function fixture({
  membership = true,
  associated = true,
  legacyAssociated = false,
  accessRecord = {
    ids: associated ? ['portfolio'] : [],
    membership_created_at: createdAt,
  },
  capacity = true,
  role = 'user',
  subscription = 'free',
  management = { mode: 'root' },
} = {}) {
  const writes = []
  const reads = []
  const actor = {
    uid: 'user',
    runtimeAppId: 'app',
    ecosystem: 'misebox',
    subscriptionCapacity: {},
  }
  const tx = {
    read: async (target) => {
      reads.push(target)
      if (target === 'portfolios') return { exists: true, data: { management } }
      if (target === 'memberships')
        return {
          exists: membership,
          data: {
            role,
            subscription,
            created: { at: createdAt },
            portfolios: legacyAssociated ? ['portfolio'] : [],
          },
        }
      if (target === 'access')
        return { exists: Boolean(accessRecord), data: accessRecord }
      throw Error(`Unexpected authority read: ${target}`)
    },
    readAll: async () => [
      {
        id: 'legacy',
        data: {
          name: 'Old member',
          role: 'owner',
          status: 'inactive',
          role_ids: ['dev'],
        },
      },
    ],
    create: (target, id, value) => writes.push({ target, id, value }),
  }
  const base = {
    ...accessHelpers,
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    useFireUXConfig: () => ({
      appId: 'app',
      ecosystem: 'misebox',
      subscriptionCapacity: {},
    }),
    requireFirebaseBearerUser: async () => ({ uid: 'user' }),
    requireFirestoreDocumentId: (value) => value,
    isAppUserSubscription: (value) =>
      ['free', 'pro', 'business'].includes(value),
    FIRESTORE_MUTATION_TARGETS: { portfolios: 'portfolios' },
    serverAppUsersTarget: () => 'memberships',
    serverPortfolioAccessTarget: (appId) => {
      assert.equal(appId, 'app')
      return 'access'
    },
    readFireuxEntityManagement: (value) => value,
    resolveFireuxEntityManagementAppId: () => 'other-app',
  }
  const authorize = load('authority', 'requirePortfolioMutationAuthority', base)
  const sharedDeps = { ...base, randomUUID: () => 'new-member' }
  const createTeamMember = load('shared', 'createTeamMember', sharedDeps)
  const resolveTeamMemberInput = load(
    'shared',
    'resolveTeamMemberInput',
    sharedDeps
  )
  const create = load('create', 'createPortfolioTeamMember', {
    ...base,
    randomUUID: () => 'new-member',
    readPortfolioMutationActor: async () => actor,
    requirePortfolioMutationAuthority: authorize,
    serverPortfolioTeamMembersTarget: () => 'team',
    createTeamMember,
    resolveTeamMemberInput,
    hasAppSubscriptionCapacity: (_config, key, _subscription, count) => {
      assert.equal(key, 'portfolio.team')
      assert.equal(count, 1)
      return capacity
    },
    runGuardedServerTransaction: async (_, callback) => callback(tx),
  })
  return {
    writes,
    reads,
    authorize: () => authorize(tx, actor, 'portfolio'),
    create: () => create({}, { portfolioId: 'portfolio', name: '  Alex  ' }),
  }
}

test('associated ordinary App member creates a simple Team member independent of stored role/status labels', async () => {
  const f = fixture()
  assert.equal((await f.create()).memberId, 'new-member')
  assert.deepEqual(f.writes, [
    {
      target: 'team',
      id: 'new-member',
      value: { name: 'Alex', user_id: '', role_ids: [] },
    },
  ])
  assert.deepEqual(f.reads, ['portfolios', 'memberships', 'access'])
})
test('missing current membership or Portfolio association rejects before writes', async () => {
  for (const options of [
    { membership: false },
    { associated: false },
    { role: 'guest' },
  ]) {
    const f = fixture(options)
    await assert.rejects(f.create(), (error) => error.statusCode === 403)
    assert.equal(f.writes.length, 0)
  }
})
test('subscription capacity counts every existing member and rejects without writes', async () => {
  const f = fixture({ capacity: false })
  await assert.rejects(f.create(), /Team member limit/)
  assert.equal(f.writes.length, 0)
})
test('invalid subscription and foreign management scope are rejected', async () => {
  for (const options of [
    { subscription: 'unknown' },
    { management: { mode: 'app' } },
  ]) {
    const f = fixture(options)
    await assert.rejects(f.authorize(), (error) => error.statusCode === 409)
  }
})

test('old AppUser arrays, missing grants and a previous membership lifetime grant no access', async () => {
  for (const options of [
    { associated: false, legacyAssociated: true },
    { accessRecord: null },
    {
      accessRecord: {
        ids: ['portfolio'],
        membership_created_at: { seconds: 99, nanoseconds: 0 },
      },
    },
  ]) {
    const f = fixture(options)
    await assert.rejects(f.create(), (error) => error.statusCode === 403)
    assert.equal(f.writes.length, 0)
  }
})
test('malformed domain access rejects without writes', async () => {
  const f = fixture({
    accessRecord: { ids: ['bad/id'], membership_created_at: createdAt },
  })
  await assert.rejects(f.create(), (error) => error.statusCode === 409)
  assert.equal(f.writes.length, 0)
})
