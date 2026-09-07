import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

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
    role = 'admin',
    capacity = true,
    teamExists = false,
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
      [`server${title}TeamMembersTarget`]: () => 'team',
      canonicalPropertyRoot: (value) => value,
      assertManagement: (root) => root.management,
      requireMemberRole: (_exists, role) => role,
      runtimePolicy: () => current,
      request: (input) => input,
      text,
      fail,
      runGuardedServerTransaction: async (_, callback) =>
        callback({
          read: async (target) =>
            target === 'membership'
              ? {
                  exists: true,
                  data: {
                    role,
                    subscription: 'free',
                    [plural]: associated ? ['selected'] : [],
                  },
                }
              : target === 'team'
                ? {
                    exists: teamExists,
                    data: {
                      user_id: 'person',
                      status: 'inactive',
                      role: 'reader',
                    },
                  }
                : { exists: true, data: { management: { mode: 'root' } } },
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
            ? { property_id: 'selected' }
            : { existing_root_id: 'selected' }
        ),
    }
  }
  test(`${title} onboarding atomically records association and simple Team record`, async () => {
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
        action: 'update',
        target: 'membership',
        id: 'person',
        data: { [plural]: ['selected'], [`primary_${domain}`]: 'selected' },
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
    assert.equal(f.writes[0].target, 'membership')
  })
}
