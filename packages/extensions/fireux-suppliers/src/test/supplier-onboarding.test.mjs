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
  )}; return { readMembershipAccessIds, membershipCreatedAt, createMembershipAccess }`
)()
const createdAt = { seconds: 100, nanoseconds: 0 }

const source = readFileSync(
  new URL('../runtime/supplier/server/index/onboarding.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  .replace(/^export /gm, '')
function fixture({
  existing = false,
  associated = false,
  capacity = true,
  role = 'user',
  accessRecord = associated
    ? { ids: ['supplier'], membership_created_at: createdAt }
    : null,
} = {}) {
  const writes = []
  const membership = {
    role,
    subscription: 'free',
    created: { at: createdAt },
  }
  const deps = {
    ...accessHelpers,
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    useFireUXConfig: () => ({ subscriptionCapacity: {} }),
    resolveAppUserAccess: () => ({ subscription: 'free', hasMembership: true }),
    hasAppSubscriptionCapacity: () => capacity,
    readFireuxEntityManagement: (value) => value,
    resolveFireuxEntityManagementAppId: () => 'app',
    requireFirebaseBearerUser: async () => ({
      uid: 'person',
      decoded: { name: 'Person' },
    }),
    requireFirestoreDocumentId: (value) => value,
    requireWorkspaceEntityMemberRole: ({ exists, role }) => {
      if (!exists) throw Error('membership')
      return role
    },
    resolveWorkspaceEntityOnboardingPolicy: () => ({
      appId: 'app',
      ecosystem: 'misebox',
      management: { mode: 'app' },
      canCreate: true,
    }),
    serverAuditStamp: () => ({}),
    buildSupplierTeamMemberRecord: ({ name, userId }) => ({
      name,
      user_id: userId,
      role_ids: [],
    }),
    FIRESTORE_MUTATION_TARGETS: {
      suppliers: { database: 'db' },
      companies: 'companies',
      places: 'places',
    },
    serverAppUsersTarget: () => 'memberships',
    serverSupplierAccessTarget: (appId) => {
      assert.equal(appId, 'app')
      return 'access'
    },
    serverSupplierTeamMembersTarget: () => 'team',
    normalizeSlug: () => 'supplier',
    canonicalCompanyRole: () => true,
    normalizePlace: () => true,
    runGuardedServerTransaction: async (_, callback) =>
      callback({
        read: async (target) => {
          assert.equal(writes.length, 0, 'all transaction reads precede writes')
          return target === 'memberships'
            ? { exists: true, data: membership }
            : target === 'access'
              ? { exists: Boolean(accessRecord), data: accessRecord }
              : target === 'team'
                ? { exists: false }
                : target === 'companies' || target === 'places'
                  ? { exists: true, data: {} }
                  : {
                      exists: existing,
                      data: {
                        company_id: 'company',
                        management: { mode: 'app' },
                      },
                    }
        },
        create: (target, id, value) => writes.push({ target, id, value }),
        update: (target, id, value) => writes.push({ target, id, value }),
      }),
  }
  const complete = compileFunction(
    `${stripTypeScriptTypes(source)}; return completeSupplierOnboarding`,
    Object.keys(deps)
  )(...Object.values(deps))
  return {
    writes,
    run: () =>
      complete(
        {},
        existing
          ? { supplier_id: 'supplier' }
          : { organization_name: 'Supplier', company_id: 'company' }
      ),
  }
}
test('ordinary App member creates Supplier, simple Team profile and Supplier access atomically', async () => {
  const f = fixture()
  await f.run()
  assert.deepEqual(f.writes.find((x) => x.target === 'team').value, {
    user_id: 'person',
    name: 'Person',
    role_ids: [],
  })
  assert.deepEqual(f.writes.find((x) => x.target === 'access').value, {
    ids: ['supplier'],
    membership_created_at: createdAt,
  })
  assert.equal(
    f.writes.some((x) => x.target === 'memberships'),
    false
  )
})
test('subscription capacity prevents onboarding without writes', async () => {
  const f = fixture({ capacity: false })
  await assert.rejects(f.run(), /subscription/)
  assert.equal(f.writes.length, 0)
})
test('association opens Supplier without legacy Team authority, but initial connection needs App admin', async () => {
  const associated = fixture({ existing: true, associated: true })
  assert.equal((await associated.run()).action, 'open')
  const unrelated = fixture({ existing: true })
  await assert.rejects(unrelated.run(), /App admin/)
  assert.equal(unrelated.writes.length, 0)
})

test('old lifetime cannot open Supplier and malformed access blocks creation', async () => {
  const stale = fixture({
    existing: true,
    accessRecord: {
      ids: ['supplier'],
      membership_created_at: { seconds: 99, nanoseconds: 0 },
    },
  })
  await assert.rejects(stale.run(), /App admin/)
  assert.equal(stale.writes.length, 0)
  const malformed = fixture({
    accessRecord: { ids: ['bad/id'], membership_created_at: createdAt },
  })
  await assert.rejects(malformed.run(), (error) => error.statusCode === 409)
  assert.equal(malformed.writes.length, 0)
})
test('new Supplier replaces retained access from a previous membership', async () => {
  const f = fixture({
    accessRecord: {
      ids: ['old'],
      membership_created_at: { seconds: 99, nanoseconds: 0 },
    },
  })
  await f.run()
  assert.deepEqual(f.writes.find((x) => x.target === 'access').value, {
    ids: ['supplier'],
    membership_created_at: createdAt,
  })
})
