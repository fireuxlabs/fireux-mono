import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

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
} = {}) {
  const writes = []
  const membership = {
    role,
    subscription: 'free',
    suppliers: associated ? ['supplier'] : [],
  }
  const deps = {
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
    serverSupplierTeamMembersTarget: () => 'team',
    normalizeSlug: () => 'supplier',
    canonicalCompanyRole: () => true,
    normalizePlace: () => true,
    runGuardedServerTransaction: async (_, callback) =>
      callback({
        read: async (target) =>
          target === 'memberships'
            ? { exists: true, data: membership }
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
test('ordinary App member creates Supplier, simple Team profile and AppUser association atomically', async () => {
  const f = fixture()
  await f.run()
  assert.deepEqual(f.writes.find((x) => x.target === 'team').value, {
    user_id: 'person',
    name: 'Person',
    role_ids: [],
  })
  assert.deepEqual(f.writes.find((x) => x.target === 'memberships').value, {
    suppliers: ['supplier'],
    primary_supplier: 'supplier',
  })
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
