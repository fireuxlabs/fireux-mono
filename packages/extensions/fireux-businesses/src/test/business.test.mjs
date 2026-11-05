import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { planBusinessMigration } from '../../../../../tools/workspace-migrations/business-identity.mjs'

function load(path, names, scope = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return { ${names} }`, Object.keys(scope))(...Object.values(scope))
}
const createError = ({ statusCode, statusMessage }) => Object.assign(new Error(statusMessage), { statusCode })
const validId = (id) => typeof id === 'string' && !!id && id === id.trim() && !id.includes('/')
const requireId = (id) => { if (!validId(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' }); return id }
const management = load('../../../../core/fireux-core/src/runtime/app/utils/entity-management.ts', 'readFireuxEntityManagement').readFireuxEntityManagement
const { businessProfile } = load('../runtime/business/server/profile.ts', 'businessProfile', { createError, isFirestoreDocumentId: validId })
const { normalizeBusiness } = load('../runtime/business/utils/normalize-business.ts', 'normalizeBusiness', { readFireuxEntityManagement: management, isFirestoreDocumentId: validId })
const at = { seconds: 1, nanoseconds: 0 }
const root = { ...businessProfile({ name: 'Interlaken Bike Tours' }), management: { mode: 'app', app_id: 'app' }, created: { at }, updated: { at } }

test('Business identity is valid without a Place or a paid subscription', () => {
  assert.equal(normalizeBusiness('ben', root).name, 'Interlaken Bike Tours')
  assert.deepEqual(normalizeBusiness('ben', root).place_ids, [])
  assert.equal(normalizeBusiness('ben', { created: { at }, updated: { at } }), null)
})
test('profile validation refuses authority fields, coercible values, unsafe URLs and duplicate locations', () => {
  for (const value of [
    { name: {} }, { name: 'Ben', management: { mode: 'root' } },
    { name: 'Ben', website: 'javascript:alert(1)' },
    { name: 'Ben', website: 'https://' },
    { name: 'Ben', place_ids: ['place', 'place'] },
  ]) assert.throws(() => businessProfile(value), (error) => error.statusCode === 400)
})
function authorityHarness({ granted = true, current = true, app = 'app' } = {}) {
  const writes = []
  const scope = {
    readMembershipAccessIds: (access, member) => access?.membership_created_at?.seconds === member?.created?.at?.seconds ? access.ids : [],
    serverBusinessAccessTarget: () => 'access', BUSINESS_MUTATION_TARGETS: { businesses: 'root' },
    createError, useFireUXConfig: () => ({}), readAppUserSubscription: (value) => ['free', 'pro', 'business'].includes(value) ? value : null,
    requireFirebaseBearerUser: async () => ({ uid: 'u' }), requireFirestoreDocumentId: requireId,
    serverAppUsersTarget: () => 'member', readFireuxEntityManagement: management,
    resolveFireuxEntityManagementAppId: (value) => value.app_id,
  }
  const fn = load('../runtime/business/server/team/authority.ts', 'requireBusinessMutationAuthority', scope).requireBusinessMutationAuthority
  const tx = { read: async (target) => ({ exists: true, data: target === 'root' ? root : target === 'member' ? { role: 'user', subscription: 'free', created: { at } } : { ids: granted ? ['ben'] : [], membership_created_at: current ? at : { seconds: 0 } } }) }
  return { run: () => fn(tx, { runtimeAppId: app, uid: 'u', ecosystem: 'slap' }, 'ben'), writes }
}
test('Free App member with an exact current grant can manage the Business', async () => {
  assert.equal((await authorityHarness().run()).subscription, 'free')
})
for (const [name, options] of [['missing grant', { granted: false }], ['superseded membership', { current: false }], ['different App', { app: 'other' }]]) {
  test(`${name} cannot manage the Business`, async () => {
    await assert.rejects(authorityHarness(options).run(), (error) => [403, 409].includes(error.statusCode))
  })
}
test('migration preserves preimages and explicit Place links, without applying writes', () => {
  const input = {
    companies: [{ id: 'ben', data: { created: { at }, updated: { at } } }],
    places: [{ id: 'ben', data: { name: 'Interlaken Bike Tours' } }],
    owners: [{ businessId: 'ben', appId: 'app', uid: 'u', membership_created_at: at }],
    suppliers: [{ id: 'supplier', data: { company_id: 'ben' } }],
  }
  const result = planBusinessMigration(input)
  assert.equal(result.mode, 'plan-only')
  assert.deepEqual(result.creates[0].source.preimage, input.companies[0].data)
  assert.deepEqual(result.creates[0].destination.data.place_ids, ['ben'])
  assert.deepEqual(result.references[0].postimage, { business_id: 'ben' })
  assert.deepEqual(input.suppliers[0].data, { company_id: 'ben' })
  assert.throws(() => planBusinessMigration({ ...input, owners: [] }), /owner required/)
  assert.throws(() => planBusinessMigration({ ...input, businesses: [{ id: 'ben' }] }), /collision/)
})

test('Free creation atomically creates Business, Team and membership grant, and retry reuses the root', async () => {
  const records = new Map([['members/u', { role: 'user', subscription: 'free', created: { at } }]])
  const accessHelpers = load('../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts', 'readMembershipAccessIds, createMembershipAccess')
  const { completeBusinessOnboarding } = load('../runtime/business/server/create.ts', 'completeBusinessOnboarding', {
    normalizeBusiness, resolveFireuxEntityManagementAppId: (value) => value.app_id,
    resolveWorkspaceCanCreate: () => true,
    businessProfile, PLACE_MUTATION_TARGETS: { places: 'places' }, ...accessHelpers,
    serverBusinessAccessTarget: () => 'access', createError,
    useFireUXConfig: () => ({ appId: 'app', role: 'tenant', ecosystem: 'slap', subscriptionCapacity: {} }),
    readAppUserSubscription: (value) => value,
    hasAppSubscriptionCapacity: (_capacity, _family, _tier, count) => count < 1,
    resolveFireuxEntityManagementForApp: () => ({ mode: 'app', app_id: 'app' }),
    requireFirebaseBearerUser: async () => ({ uid: 'u' }), requireFirestoreDocumentId: requireId,
    serverAuditStamp: () => ({ at }), serverAppUsersTarget: () => 'members',
    BUSINESS_MUTATION_TARGETS: { businesses: 'businesses' }, serverBusinessTeamTarget: (id) => `businesses/${id}/team`,
    runGuardedServerTransaction: async (_scope, run) => {
      const writes = []
      const tx = {
        read: async (target, id) => ({ exists: records.has(`${target}/${id}`), data: records.get(`${target}/${id}`) }),
        create: (target, id, data) => writes.push(() => { if (records.has(`${target}/${id}`)) throw new Error('Conflict'); records.set(`${target}/${id}`, data) }),
        update: (target, id, data) => writes.push(() => records.set(`${target}/${id}`, { ...records.get(`${target}/${id}`), ...data })),
      }
      const result = await run(tx)
      writes.forEach((write) => write())
      return result
    },
  })
  assert.equal((await completeBusinessOnboarding({}, { id: 'ben', name: 'Interlaken Bike Tours' })).createdRoot, true)
  assert.equal(records.get('businesses/ben').name, 'Interlaken Bike Tours')
  assert.deepEqual(records.get('access/u').ids, ['ben'])
  assert.equal(records.get('businesses/ben/team/u').user_id, 'u')
  assert.equal((await completeBusinessOnboarding({}, { id: 'ben', name: 'Changed retry' })).createdRoot, false)
  assert.equal(records.get('businesses/ben').name, 'Interlaken Bike Tours')
  const size = records.size
  await assert.rejects(completeBusinessOnboarding({}, { id: 'second', name: 'Second' }), (error) => error.statusCode === 403)
  assert.equal(records.size, size)
})

test('directory contribution creates an independent Business root without Team or operator grants', async () => {
  const writes = []
  const { materializeBusiness } = load('../runtime/business/server/business/materialize.ts', 'materializeBusiness', {
    createError, requireFirebaseBearerUser: async () => ({ uid: 'employee' }),
    useFireUXConfig: () => ({ appId: 'app' }), serverAppUsersTarget: () => 'members',
    requireFirestoreDocumentId: requireId, serverAuditStamp: () => ({ at }),
    PLACE_MUTATION_TARGETS: { places: 'places' }, BUSINESS_MUTATION_TARGETS: { businesses: 'businesses' },
    normalizeBusiness, normalizePlace: (_id, value) => value,
    runGuardedServerTransaction: async (_scope, run) => run({
      read: async (target) => ({ exists: target !== 'businesses', data: target === 'members' ? { role: 'user' } : { name: 'Employer', website: 'https://example.test' } }),
      create: (target, id, data) => writes.push({ target, id, data }),
    }),
  })
  assert.deepEqual(await materializeBusiness({}, { id: 'place' }), { ok: true, id: 'place', created: true })
  assert.equal(writes.length, 1)
  assert.equal(writes[0].target, 'businesses')
  assert.deepEqual(writes[0].data.management, { mode: 'root' })
  assert.deepEqual(writes[0].data.place_ids, ['place'])
  assert.equal(normalizeBusiness('place', writes[0].data).name, 'Employer')
})
