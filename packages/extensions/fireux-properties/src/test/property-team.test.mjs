import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

function load(file, name, deps) {
  const source = readFileSync(
    new URL(
      file === 'shared'
        ? '../../../../core/fireux-core/src/runtime/server/utils/workspace-team/members.ts'
        : `../runtime/property/server/team/${file}.ts`,
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
      if (target === 'properties') return { exists: true, data: { management } }
      if (target === 'memberships')
        return {
          exists: membership,
          data: {
            role,
            subscription,
            properties: associated ? ['property'] : [],
          },
        }
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
    FIRESTORE_MUTATION_TARGETS: { properties: 'properties' },
    serverAppUsersTarget: () => 'memberships',
    readFireuxEntityManagement: (value) => value,
    resolveFireuxEntityManagementAppId: () => 'other-app',
  }
  const authorize = load('authority', 'requirePropertyMutationAuthority', base)
  const sharedDeps = { ...base, randomUUID: () => 'new-member' }
  const createTeamMember = load('shared', 'createTeamMember', sharedDeps)
  const resolveTeamMemberInput = load(
    'shared',
    'resolveTeamMemberInput',
    sharedDeps
  )
  const create = load('create', 'createPropertyTeamMember', {
    ...base,
    randomUUID: () => 'new-member',
    readPropertyMutationActor: async () => actor,
    requirePropertyMutationAuthority: authorize,
    serverPropertyTeamMembersTarget: () => 'team',
    createTeamMember,
    resolveTeamMemberInput,
    hasAppSubscriptionCapacity: (_config, key, _subscription, count) => {
      assert.equal(key, 'property.team')
      assert.equal(count, 1)
      return capacity
    },
    runGuardedServerTransaction: async (_, callback) => callback(tx),
  })
  return {
    writes,
    reads,
    authorize: () => authorize(tx, actor, 'property'),
    create: () => create({}, { propertyId: 'property', name: '  Alex  ' }),
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
  assert.deepEqual(f.reads, ['properties', 'memberships'])
})
test('missing current membership or Property association rejects before writes', async () => {
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
