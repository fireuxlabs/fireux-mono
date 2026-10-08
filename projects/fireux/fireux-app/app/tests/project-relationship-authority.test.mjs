import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const root = new URL('../../../../../', import.meta.url)
const core = 'packages/core/fireux-core/src/runtime/'
const app = 'projects/fireux/fireux-app/server/project/'
const domain = 'packages/ecosystem/fireux-fireux/src/runtime/project/server/'
function load(path, result, deps = {}) {
  const source = readFileSync(new URL(path, root), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
const readMembershipAccessIds = load(
  core + 'app/utils/membership-access.ts',
  'readMembershipAccessIds'
)
const requireWorkspaceEntityMemberRole = load(
  core + 'server/utils/workspace-entity/onboarding-authority.ts',
  'requireWorkspaceEntityMemberRole',
  { createError }
)
const isAppUserSubscription = load(
  core + 'app/models/app-user.model.ts',
  'isAppUserSubscription'
)
const capacity = load(
  core + 'app/utils/app-subscription-capacity.ts',
  '{ hasAppSubscriptionCapacity }'
)
const target = (collectionPath) => ({
  collectionPath,
  database: { kind: 'named', databaseId: 'fireux' },
})
const apps = target('apps'),
  ecosystems = target('ecosystems'),
  projects = target('projects')
const members = (id) => target(`apps/${id}/users`)
const access = (id) => target(`project_access/${id}/users`)
const team = (id) => target(`projects/${id}/team`)
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw createError({ statusCode: 400 })
  return value
}
const authority = load(
  domain + 'authority.ts',
  'requireProjectOperatorInTransaction',
  {
    readMembershipAccessIds,
    requireWorkspaceEntityMemberRole,
    createError,
    FIRESTORE_MUTATION_TARGETS: { fireuxApps: apps },
    fireuxAppUsersTarget: members,
    fireuxProjectsTarget: projects,
    serverProjectAccessTarget: access,
  }
)
const mechanics = load(
  core + 'server/utils/workspace-team/members.ts',
  '{createTeamMember, updateTeamMembers, deleteTeamMember}',
  {
    createError,
    requireFirestoreDocumentId,
    randomUUID: () => 'new-member',
  }
)
const roles = load(
  core + 'server/utils/workspace-team/roles.ts',
  'teamRolesCommand',
  {
    createError,
    randomUUID: () => 'new-role',
  }
)
function harness() {
  const at = { seconds: 1, nanoseconds: 0 }
  const records = new Map([
    ['apps/fireux-app', {}],
    [
      'apps/fireux-app/users/actor',
      { role: 'user', subscription: 'business', created: { at } },
    ],
    [
      'project_access/fireux-app/users/actor',
      { ids: ['project'], membership_created_at: at },
    ],
    ['projects/project', {}],
    [
      'projects/project/team/member',
      { name: 'Member', user_id: '', role_ids: [] },
    ],
    ['ecosystems/fireux', { project_id: 'project' }],
    [
      'apps/existing-app',
      { ecosystem_id: 'fireux', created: { by: 'another' } },
    ],
  ])
  const writes = [],
    reconciled = []
  let before = () => {}
  const tx = {
    read: async (target, id) => ({
      exists: records.has(`${target.collectionPath}/${id}`),
      data: records.get(`${target.collectionPath}/${id}`),
    }),
    readAll: async (target) =>
      [...records]
        .filter(
          ([path]) =>
            path.startsWith(target.collectionPath + '/') &&
            path.slice(target.collectionPath.length + 1).indexOf('/') < 0
        )
        .map(([path, data]) => ({ id: path.split('/').at(-1), data })),
    readMany: async (target, ids) =>
      Promise.all(
        ids.map(async (id) => ({ id, ...(await tx.read(target, id)) }))
      ),
    create: (target, id, data) =>
      writes.push(['create', target.collectionPath, id, data]),
    update: (target, id, data) =>
      writes.push(['update', target.collectionPath, id, data]),
    delete: (target, id) => writes.push(['delete', target.collectionPath, id]),
  }
  const deps = {
    createError,
    requireFirestoreDocumentId,
    requireProjectOperator: async () => ({
      uid: 'actor',
      appId: 'fireux-app',
      projectId: 'project',
      membership: structuredClone(records.get('apps/fireux-app/users/actor')),
    }),
    requireProjectOperatorInTransaction: authority,
    fireuxProjectTeamMembersTarget: team,
    runGuardedServerTransaction: async (placement, callback) => {
      assert.deepEqual(placement, { kind: 'named', databaseId: 'fireux' })
      before()
      return callback(tx)
    },
    resolveTeamMemberInput: async (input) => ({ name: input.name, userId: '' }),
    useFireUXConfig: () => ({
      ecosystemId: 'fireux',
      subscriptionCapacity: {
        'project.team': { free: 1, premium: 2, business: 10 },
      },
    }),
    ...capacity,
    isAppUserSubscription,
    ...mechanics,
    teamRolesCommand: roles,
    defineFirestoreMutationTarget: target,
  }
  // Role target uses the same full target contract as the real declaration.
  deps.defineFirestoreMutationTarget = (value) => value
  const commands = {
    create: () =>
      load(domain + 'team/create.ts', 'createProjectTeamMember', deps)(
        {},
        'project',
        { name: 'New' }
      ),
    update: () =>
      load(domain + 'team/update.ts', 'updateProjectTeamMember', deps)(
        {},
        'project',
        'member',
        { name: 'Renamed' }
      ),
    delete: () =>
      load(domain + 'team/delete.ts', 'removeProjectTeamMember', deps)(
        {},
        'project',
        'member'
      ),
    roles: () =>
      load(domain + 'team/roles.ts', 'projectRoles', deps)({}, 'project', {
        action: 'assign',
        memberId: 'member',
        roleIds: ['operator'],
      }),
  }
  const createApp = load(domain + 'apps/create.ts', 'createProjectApp', {
    ...deps,
    FIRESTORE_MUTATION_TARGETS: {
      fireuxApps: apps,
      fireuxEcosystems: ecosystems,
    },
    fireuxAppUsersTarget: members,
    stamp: (uid) => ({ by: uid }),
    initialMembership: (uid) => ({
      role: 'admin',
      subscription: 'free',
      created: { by: uid },
    }),
    reconcileAppEcosystemReference: async (value) => reconciled.push(value),
    reconcileUserAppReference: async (value) => reconciled.push(value),
  })
  return {
    records,
    writes,
    reconciled,
    commands,
    createApp,
    before: (fn) => {
      before = fn
    },
  }
}
const revocations = {
  app: (h) => h.records.delete('apps/fireux-app'),
  membership: (h) => h.records.delete('apps/fireux-app/users/actor'),
  role: (h) => {
    h.records.get('apps/fireux-app/users/actor').role = 'guest'
  },
  recreated: (h) => {
    h.records.get('apps/fireux-app/users/actor').created.at = {
      seconds: 2,
      nanoseconds: 0,
    }
  },
  access: (h) => h.records.delete('project_access/fireux-app/users/actor'),
  wrongProject: (h) => {
    h.records.get('project_access/fireux-app/users/actor').ids = ['other']
  },
  project: (h) => h.records.delete('projects/project'),
}
for (const command of ['create', 'update', 'delete', 'roles']) {
  test(`Project Team ${command} succeeds with current authority and writes only Project-owned records`, async () => {
    const h = harness()
    await h.commands[command]()
    assert.equal(h.writes.length, 1)
    assert.ok(
      h.writes.every(([, path]) => path.startsWith('projects/project/'))
    )
  })
  for (const [name, revoke] of Object.entries(revocations))
    test(`Project Team ${command} rejects ${name} changed after preflight`, async () => {
      const h = harness()
      h.before(() => revoke(h))
      await assert.rejects(h.commands[command]())
      assert.equal(h.writes.length, 0)
    })
}
test('Team creation uses the current subscription, including a downgrade during member lookup', async () => {
  const h = harness()
  h.before(() => {
    h.records.get('apps/fireux-app/users/actor').subscription = 'free'
  })
  await assert.rejects(h.commands.create(), { statusCode: 409 })
  assert.equal(h.writes.length, 0)
})
test('Team creation fails closed on malformed current subscription', async () => {
  const h = harness()
  h.before(() => {
    h.records.get('apps/fireux-app/users/actor').subscription = 'unknown'
  })
  await assert.rejects(h.commands.create(), { statusCode: 409 })
  assert.equal(h.writes.length, 0)
})
const newApp = {
  id: 'new-app',
  name: 'New App',
  description: '',
  role: 'tenant',
  ecosystem_id: 'fireux',
}
test('Explicit App creation establishes its Ecosystem and only the creator’s initial membership', async () => {
  const h = harness()
  await h.createApp({}, 'project', newApp)
  assert.deepEqual(
    h.writes.map(([, path, id]) => [path, id]),
    [
      ['apps', 'new-app'],
      ['apps/new-app/users', 'actor'],
    ]
  )
  assert.equal(h.writes[0][3].ecosystem_id, 'fireux')
  assert.equal(h.writes[0][3].status, 'inactive')
  assert.equal(h.writes[0][3].self_join_enabled, false)
  assert.equal(h.writes[1][3].role, 'admin')
  assert.equal(h.reconciled.length, 2)
})
for (const [name, revoke] of Object.entries(revocations))
  test(`App creation rejects Project ${name} changed before commit`, async () => {
    const h = harness()
    h.before(() => revoke(h))
    await assert.rejects(h.createApp({}, 'project', newApp))
    assert.equal(h.writes.length, 0)
    assert.equal(h.reconciled.length, 0)
  })
test('Project access cannot claim an existing App or an Ecosystem belonging elsewhere', async () => {
  for (const variant of ['existing', 'foreign', 'remote']) {
    const h = harness(),
      input = { ...newApp }
    if (variant === 'existing') input.id = 'existing-app'
    if (variant === 'foreign')
      h.records.get('ecosystems/fireux').project_id = 'other'
    if (variant === 'remote') input.ecosystem_id = 'misebox'
    await assert.rejects(h.createApp({}, 'project', input))
    assert.equal(h.writes.length, 0)
    assert.equal(h.reconciled.length, 0)
  }
})

test('Project Ecosystem relationship uses owning records even when the hub copy disagrees', async () => {
  const calls = [],
    ownerRecords = [
      { id: 'mine', project_id: 'project', status: 'inactive' },
      { id: 'foreign', project_id: 'other', status: 'active' },
    ]
  const read = load(app + 'ecosystem/read.ts', 'readProjectEcosystems', {
    requireProjectOperator: async () => ({
      projectId: 'project',
      db: {
        collection: () => {
          throw new Error('Hub copies must not be read')
        },
      },
    }),
    readPlatformEcosystems: async (options) => {
      calls.push(options)
      return ownerRecords
    },
  })
  const result = await read({}, 'project')
  assert.deepEqual(result, {
    project_id: 'project',
    ecosystems: [ownerRecords[0]],
  })
  assert.deepEqual(calls, [{ activeOnly: false }])
})
test('Unauthorized and unavailable owning Ecosystems cannot become a partial or empty relationship', async () => {
  let queried = false
  const denied = load(app + 'ecosystem/read.ts', 'readProjectEcosystems', {
    requireProjectOperator: async () => {
      throw createError({ statusCode: 403 })
    },
    readPlatformEcosystems: async () => {
      queried = true
      return []
    },
  })
  await assert.rejects(denied({}, 'project'), { statusCode: 403 })
  assert.equal(queried, false)
  const failed = load(app + 'ecosystem/read.ts', 'readProjectEcosystems', {
    requireProjectOperator: async () => ({ projectId: 'project' }),
    readPlatformEcosystems: async () => {
      throw new Error('Owning database unavailable')
    },
  })
  await assert.rejects(failed({}, 'project'), /unavailable/)
})
test('Owning Ecosystem reads admit inactive management records without making them public', async () => {
  let value = {
    project_id: 'project',
    name: 'Example',
    status: 'inactive',
    id: 'forged',
  }
  const db = {
    collection: () => ({
      doc: (id) => ({
        get: async () => ({ exists: true, id, data: () => value }),
      }),
    }),
  }
  const read = load(
    core + 'ecosystem/server/identity/read.ts',
    'readEcosystem',
    { createError, requireFirestoreDocumentId }
  )
  await assert.rejects(read('eco', db), { statusCode: 404 })
  assert.equal((await read('eco', db, { activeOnly: false })).id, 'eco')
  value.status = 'unknown'
  await assert.rejects(read('eco', db, { activeOnly: false }), {
    statusCode: 404,
  })
})

test('Project ownership and administration in another App cannot administer an existing App', async () => {
  const targets = { runtimeUsers: target('users'), runtimeApps: apps }
  const contract = load(
    core + 'app/server/app-user/command-contract.ts',
    '{forbidden,initialMembership,isAdminMembership,requireCanonicalMembership,roleFrom,stamp,countTransactionAdmins,requireAdmin}',
    {
      createError,
      FieldValue: { serverTimestamp: () => 1 },
      isAppUserSubscription,
      FIRESTORE_MUTATION_TARGETS: targets,
      serverAppUsersTarget: members,
    }
  )
  const settings = load(
    core + 'app/server/app-user/settings.ts',
    'handleMembershipSettings',
    {
      ...contract,
      serverAppUsersTarget: members,
      requireFirestoreDocumentId,
      isAppUserSubscription,
    }
  )
  for (const ownRole of [undefined, 'user', 'admin']) {
    const writes = [],
      reads = [],
      records = new Map([
        ['apps/existing', {}],
        ['apps/another/users/owner', { role: 'admin' }],
        ['project_access/fireux-app/users/owner', { ids: ['project'] }],
        [
          'apps/existing/users/recipient',
          { role: 'user', subscription: 'free' },
        ],
      ])
    if (ownRole)
      records.set('apps/existing/users/owner', {
        role: ownRole,
        subscription: 'free',
      })
    const mutate = load(
      core + 'app/server/app-user/command.ts',
      'mutateInTransaction',
      {
        ...contract,
        FIRESTORE_MUTATION_TARGETS: targets,
        serverAppUsersTarget: members,
        serverAppJoinRequestsTarget: (id) => target(`apps/${id}/join_requests`),
        serverAppMembershipBlocksTarget: (id) => target(`apps/${id}/blocks`),
        handleMembershipSettings: settings,
        runGuardedServerTransaction: async (placement, work) => {
          assert.deepEqual(placement, { kind: 'runtime' })
          return work({
            read: async (t, id) => {
              const path = `${t.collectionPath}/${id}`
              reads.push(path)
              return { exists: records.has(path), data: records.get(path) }
            },
            update: (...args) => writes.push(args),
          })
        },
      }
    )
    const command = mutate(
      {
        actorUid: 'owner',
        appId: 'existing',
        developerUid: 'someone',
        input: { action: 'set-role', userId: 'recipient', role: 'admin' },
      },
      false
    )
    if (ownRole === 'admin') {
      await command
      assert.equal(writes.length, 1)
    } else {
      await assert.rejects(command, { statusCode: 403 })
      assert.equal(writes.length, 0)
    }
    assert.deepEqual(reads.slice(0, 2), [
      'apps/existing',
      'apps/existing/users/owner',
    ])
    assert.ok(
      reads.every(
        (path) =>
          !path.startsWith('project_access/') &&
          !path.startsWith('apps/another/')
      )
    )
  }
})
