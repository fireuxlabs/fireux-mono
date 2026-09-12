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

for (const domain of ['property', 'portfolio']) {
  const title = domain[0].toUpperCase() + domain.slice(1)
  const plural = domain === 'property' ? 'properties' : 'portfolios'
  const file =
    domain === 'property' ? 'onboarding.ts' : 'onboarding/onboarding.ts'
  const source = readFileSync(
    new URL(`../runtime/${domain}/server/index/${file}`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export type \{[^}]+\} from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  function fixture({
    associated = false,
    existing = true,
    role = 'admin',
    capacity = true,
    teamExists = false,
    accessRecord = associated
      ? { ids: ['selected'], membership_created_at: createdAt }
      : null,
  } = {}) {
    const writes = []
    const text = (value) => String(value ?? '').trim()
    const fail = (statusCode, statusMessage) => {
      throw Object.assign(new Error(statusMessage), { statusCode })
    }
    const current = {
      appId: 'app',
      ecosystem: 'test',
      management: { mode: 'root' },
      canCreate: true,
    }
    const deps = {
      ...accessHelpers,
      createError: (value) =>
        Object.assign(new Error(value.statusMessage), value),
      useFireUXConfig: () => ({ subscriptionCapacity: {} }),
      resolveAppUserAccess: () => ({
        hasMembership: true,
        subscription: 'free',
      }),
      hasAppSubscriptionCapacity: () => capacity,
      readFireuxEntityManagement: (value) => value,
      resolveFireuxEntityManagementAppId: () => 'app',
      requireFirebaseBearerUser: async () => ({
        uid: 'person',
        decoded: { name: 'Person' },
      }),
      requireFirestoreDocumentId: (value) => value,
      requireWorkspaceEntityMemberRole: ({ role }) => role,
      resolveWorkspaceEntityOnboardingPolicy: () => current,
      serverAuditStamp: () => ({}),
      FIRESTORE_MUTATION_TARGETS: { [plural]: { database: 'db' } },
      serverAppUsersTarget: () => 'membership',
      [`server${title}AccessTarget`]: (appId) => {
        assert.equal(appId, 'app')
        return 'access'
      },
      [`server${title}TeamMembersTarget`]: () => 'team',
      canonicalPropertyRoot: (value) => value,
      buildPropertyCreateRoot: () => ({
        id: 'selected',
        payload: { management: current.management, name: 'New' },
      }),
      portfolioDraft: () => ({
        slug: 'selected',
        name: 'New',
        tagline: '',
        imageUrl: '',
        ownerLabel: '',
        status: 'active',
        strategyLabel: '',
        regionLabel: '',
        notes: '',
      }),
      assertManagement: (root) => root.management,
      requireMemberRole: (_exists, role) => role,
      runtimePolicy: () => current,
      request: (input) => input,
      text,
      fail,
      runGuardedServerTransaction: async (_, callback) =>
        callback({
          read: async (target) => {
            assert.equal(
              writes.length,
              0,
              'all transaction reads precede writes'
            )
            return target === 'membership'
              ? {
                  exists: true,
                  data: {
                    role,
                    subscription: 'free',
                    created: { at: createdAt },
                  },
                }
              : target === 'access'
                ? { exists: Boolean(accessRecord), data: accessRecord }
                : target === 'team'
                  ? {
                      exists: teamExists,
                      data: {
                        user_id: 'person',
                        status: 'inactive',
                        role: 'reader',
                      },
                    }
                  : { exists: existing, data: { management: { mode: 'root' } } }
          },
          create: (target, id, data) =>
            writes.push({ action: 'create', target, id, data }),
          update: (target, id, data) =>
            writes.push({ action: 'update', target, id, data }),
        }),
    }
    if (domain === 'property') delete deps.text
    const run = compileFunction(
      `${stripTypeScriptTypes(source)}; return complete${title}Onboarding`,
      Object.keys(deps)
    )(...Object.values(deps))
    return {
      writes,
      run: () =>
        run(
          {},
          domain === 'property'
            ? existing
              ? { property_id: 'selected' }
              : { id: 'selected', place_id: 'place', identity: {} }
            : existing
              ? { existing_root_id: 'selected' }
              : { input: { name: 'New' } }
        ),
    }
  }
  test(`${title} onboarding atomically records domain access and simple Team record`, async () => {
    const f = fixture()
    await f.run()
    assert.deepEqual(f.writes, [
      {
        action: 'create',
        target: 'team',
        id: 'person',
        data: { name: 'Person', user_id: 'person', role_ids: [] },
      },
      {
        action: 'create',
        target: 'access',
        id: 'person',
        data: { ids: ['selected'], membership_created_at: createdAt },
      },
    ])
  })
  test(`${title} cannot use an old Team record to introduce an association`, async () => {
    const f = fixture({ role: 'user', teamExists: true })
    await assert.rejects(f.run(), (error) => error.statusCode === 403)
    assert.equal(f.writes.length, 0)
  })
  test(`${title} existing association ignores retired Team permissions and does not consume another place`, async () => {
    const f = fixture({
      role: 'user',
      associated: true,
      teamExists: true,
      capacity: false,
    })
    await f.run()
    assert.equal(f.writes.length, 1)
    assert.equal(f.writes[0].target, 'access')
  })
  test(`${title} stale lifetime cannot reopen an existing root and malformed access cannot be overwritten`, async () => {
    for (const accessRecord of [
      {
        ids: ['selected'],
        membership_created_at: { seconds: 99, nanoseconds: 0 },
      },
      { ids: ['bad/id'], membership_created_at: createdAt },
    ]) {
      const f = fixture({ role: 'user', accessRecord, teamExists: true })
      await assert.rejects(
        f.run(),
        (error) =>
          error.statusCode === (accessRecord.ids[0] === 'selected' ? 403 : 409)
      )
      assert.equal(f.writes.length, 0)
    }
  })
  test(`${title} admin reconnect replaces stale access instead of retaining old grants`, async () => {
    const f = fixture({
      teamExists: true,
      accessRecord: {
        ids: ['old'],
        membership_created_at: { seconds: 99, nanoseconds: 0 },
      },
    })
    await f.run()
    assert.deepEqual(f.writes, [
      {
        action: 'update',
        target: 'access',
        id: 'person',
        data: { ids: ['selected'], membership_created_at: createdAt },
      },
    ])
  })

  test(`${title} creation writes the root, Team and access in one transaction`, async () => {
    const f = fixture({ existing: false, role: 'user' })
    await f.run()
    assert.equal(f.writes.length, 3)
    assert.equal(f.writes[0].action, 'create')
    assert.deepEqual(
      f.writes.slice(1).map(({ action, target }) => [action, target]),
      [
        ['create', 'team'],
        ['create', 'access'],
      ]
    )
    assert.deepEqual(f.writes[2].data, {
      ids: ['selected'],
      membership_created_at: createdAt,
    })
  })
}
