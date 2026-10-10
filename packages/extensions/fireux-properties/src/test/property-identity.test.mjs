import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
function load(file, name, deps = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replace(/import\.meta\.dev/g, 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${name}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const createError = (value) => Object.assign(Error(value.statusMessage), value)
const isFirestoreDocumentId = (id) =>
  typeof id === 'string' && Boolean(id) && !id.includes('/')
const requireFirestoreDocumentId = (id) => {
  if (!isFirestoreDocumentId(id)) throw createError({ statusCode: 400 })
  return id
}
const readMembershipAccessIds = load(
  '../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
  'readMembershipAccessIds'
)
const managementDeps = {
  readMembershipAccessIds,
  createError,
  isAppUserSubscription: (x) => ['free', 'premium', 'business'].includes(x),
  readFireuxEntityManagement: (x) => x,
  resolveFireuxEntityManagementAppId: (x) => x.app_id,
}
const storage = load(
  '../../../../core/fireux-core/src/runtime/server/utils/uploads/storage.ts',
  'requireFirebaseStorageDownloadUrl',
  { createError }
)
const mediaUrl = (path) =>
  `https://firebasestorage.googleapis.com/v0/b/bucket/o/${encodeURIComponent(path)}?alt=media&token=test`

const canonicalPropertyRoot = load(
  '../runtime/property/utils/normalize-property.ts',
  'canonicalPropertyRoot',
  {
    isFirestoreDocumentId,
    readFireuxEntityManagement: load(
      '../../../../core/fireux-core/src/runtime/utils/entity-management.ts',
      'readFireuxEntityManagement'
    ),
  }
)
const targets = { properties: 'properties' }
const authority = load(
  '../runtime/property/server/team/authority.ts',
  'requirePropertyMutationAuthority',
  {
    ...managementDeps,
    FIRESTORE_MUTATION_TARGETS: targets,
    serverPropertyAccessTarget: (app) => `property_access/${app}/users`,
    serverAppUsersTarget: (app) => `apps/${app}/users`,
  }
)
function harness() {
  const at = { seconds: 1, nanoseconds: 0 },
    writes = []
  const records = new Map([
    [
      'properties/p',
      {
        management: { mode: 'root' },
        portfolio_id: '',
        created: { at, by: 'u' },
        updated: { at, by: 'u' },
        identity: {
          name: 'Before',
          image_url: '',
          property_type: 'residential',
          unit_count: 1,
          slug: 'property',
          status: 'active',
          publication_state: 'draft',
        },
        valuation: { estimated_value: 100, currency_code: 'CHF' },
        place_id: 'venue',
      },
    ],
    [
      'apps/app/users/u',
      { role: 'user', subscription: 'free', created: { at } },
    ],
    ['property_access/app/users/u', { ids: ['p'], membership_created_at: at }],
  ])
  let before = () => {}
  const update = load(
    '../runtime/property/server/identity/update.ts',
    'updatePropertyIdentity',
    {
      createError,
      requireFirestoreDocumentId,
      requirePropertyMutationAuthority: authority,
      canonicalPropertyRoot,
      FIRESTORE_MUTATION_TARGETS: targets,
      serverAuditStamp: (x) => ({ ...x, at: 'server' }),
      requireFirebaseStorageDownloadUrl: storage,
      runtimeStorageBucketName: () => 'bucket',
      readPropertyMutationActor: async () => ({
        uid: 'u',
        runtimeAppId: 'app',
      }),
      runGuardedServerTransaction: async (_, run) => {
        before()
        return run({
          read: async (t, id) => ({
            exists: records.has(`${t}/${id}`),
            data: records.get(`${t}/${id}`),
          }),
          update: (...args) => writes.push(args),
        })
      },
    }
  )
  return { update, records, writes, before: (fn) => (before = fn) }
}
test('Property Identity writes sparse nested paths and preserves financial/relationship/publication fields', async () => {
  const h = harness()
  await h.update(
    {},
    {
      propertyId: 'p',
      changes: {
        name: ' New ',
        property_type: 'mixed',
        unit_count: 3,
        image_url: mediaUrl('properties/p/images/revision'),
      },
    }
  )
  assert.deepEqual(h.writes[0], [
    'properties',
    'p',
    {
      'identity.name': 'New',
      'identity.property_type': 'mixed',
      'identity.unit_count': 3,
      'identity.image_url': mediaUrl('properties/p/images/revision'),
      updated: { by: 'u', at: 'server' },
    },
  ])
  assert.equal(h.records.get('properties/p').valuation.estimated_value, 100)
})
test('Property command rejects malformed input, financial edits, and foreign images before writing', async () => {
  for (const changes of [
    {},
    { name: '' },
    { name: 5 },
    { name: 'a'.repeat(121) },
    { unit_count: 1.5 },
    { unit_count: -1 },
    { unit_count: '3' },
    { unit_count: Infinity },
    { property_type: 'hotel' },
    { image_url: mediaUrl('properties/q/images/revision') },
    { image_url: 'https://example.test/image' },
    { estimated_value: 10 },
    { place_id: 'other' },
    { publication_state: 'published' },
    { management: {} },
    { 'identity.name': 'x' },
    { constructor: 'x' },
  ]) {
    const h = harness()
    await assert.rejects(h.update({}, { propertyId: 'p', changes }), {
      statusCode: 400,
    })
    assert.equal(h.writes.length, 0)
  }
  const h = harness()
  await assert.rejects(
    h.update({}, { propertyId: 'p', changes: { name: 'ok' }, extra: true }),
    { statusCode: 400 }
  )
})
test('Property command rechecks membership lifetime, exact association, management and root inside the transaction', async () => {
  for (const invalidate of [
    (h) => h.records.delete('apps/app/users/u'),
    (h) => (h.records.get('apps/app/users/u').created.at = { seconds: 2 }),
    (h) => (h.records.get('property_access/app/users/u').ids = ['q']),
    (h) =>
      (h.records.get('properties/p').management = {
        mode: 'app',
        app_id: 'foreign',
      }),
    (h) => h.records.delete('properties/p'),
    (h) => (h.records.get('properties/p').identity = null),
  ]) {
    const h = harness()
    h.before(() => invalidate(h))
    await assert.rejects(
      h.update({}, { propertyId: 'p', changes: { name: 'New' } })
    )
    assert.equal(h.writes.length, 0)
  }
})

test('Property public projection mirrors only supported profile fields and excludes the valuation', async () => {
  const h = harness()
  await h.update(
    {},
    { propertyId: 'p', changes: { name: 'New', unit_count: 4 } }
  )
  const data = {
    ...h.records.get('properties/p'),
    identity: {
      ...h.records.get('properties/p').identity,
      name: 'Before',
      image_url: '',
      unit_count: 1,
      property_type: 'residential',
      slug: 'property',
      status: 'active',
      publication_state: 'published',
    },
  }
  for (const [key, value] of Object.entries(h.writes[0][2])) {
    if (key.startsWith('identity.')) data.identity[key.slice(9)] = value
  }
  const project = load(
    '../runtime/property/server/index/read.ts',
    'propertyDirectoryEntry',
    { createError, isFirestoreDocumentId }
  )
  assert.deepEqual(project({ id: 'p', data }), {
    id: 'p',
    slug: 'property',
    name: 'New',
    unit_count: 4,
    property_type: 'residential',
  })
  assert.equal(data.valuation.estimated_value, 100)
})

test('Property Identity rejects canonical root changes inside the writing transaction', async () => {
  for (const invalidate of [
    (root) => {
      root.slug = root.identity.slug
    },
    (root) => {
      root.identity.estimated_value = 10
    },
    (root) => {
      root.identity = {}
    },
    (root) => {
      root.identity.unit_count = -1
    },
    (root) => {
      delete root.portfolio_id
    },
    (root) => {
      root.place_id = 'invalid/path'
    },
    (root) => {
      delete root.created
    },
    (root) => {
      root.updated.at = null
    },
  ]) {
    const h = harness()
    h.before(() => invalidate(h.records.get('properties/p')))
    await assert.rejects(
      h.update({}, { propertyId: 'p', changes: { name: 'After' } }),
      { statusCode: 409 }
    )
    assert.equal(h.writes.length, 0)
  }
})

test('Property Identity preserves valid independent relationships, publication and optional valuation', async () => {
  for (const valuation of [
    undefined,
    { estimated_value: null, currency_code: '' },
    { estimated_value: 0, currency_code: 'CHF' },
    { estimated_value: 100, currency_code: 'CHF' },
  ]) {
    const h = harness()
    const root = h.records.get('properties/p')
    root.portfolio_id = 'portfolio'
    root.identity.status = 'inactive'
    root.identity.publication_state = 'retired'
    if (valuation === undefined) delete root.valuation
    else root.valuation = valuation
    const before = structuredClone(root)
    await h.update({}, { propertyId: 'p', changes: { name: 'After' } })
    assert.deepEqual(h.writes[0][2], {
      'identity.name': 'After',
      updated: { by: 'u', at: 'server' },
    })
    assert.deepEqual(root, before)
    const after = {
      ...root,
      id: 'p',
      identity: { ...root.identity, name: 'After' },
      updated: root.updated,
    }
    assert.ok(canonicalPropertyRoot(after))
  }
})
