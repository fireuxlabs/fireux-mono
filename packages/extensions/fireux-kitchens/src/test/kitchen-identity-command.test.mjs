import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { readAppUserSubscription } from '../../../../core/fireux-core/src/runtime/app/utils/membership/validation.ts'
import {
  KitchenStatuses,
  KitchenVisibilities,
} from '../runtime/kitchen/models/kitchen.model.ts'
import { isFirestoreDocumentId } from '../../../../core/fireux-core/src/runtime/utils/firestore-document-id.ts'
import { readMembershipAccessIds } from '../../../../core/fireux-core/src/runtime/app/utils/membership/membership-access.ts'

const runtime = new URL('../runtime/', import.meta.url)
const core = '../../../../core/fireux-core/src/runtime/'
function load(path, result, dependencies) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
const kitchens = { collectionPath: 'kitchens' }
const removed = Symbol('delete field')
const places = { collectionPath: 'places' }
const access = { collectionPath: 'kitchen_access' }
const { KITCHEN_USER_LIMIT } = load(
  'kitchen/utils/kitchen-capacity.ts',
  '({ KITCHEN_USER_LIMIT })',
  {}
)
const readKitchenAccessIds = load(
  'kitchen/utils/kitchen-access.ts',
  'readKitchenAccessIds',
  { readMembershipAccessIds, KITCHEN_USER_LIMIT }
)
const requireKitchenRecordMutationAuthority = load(
  'kitchen/server/core/mutation-authority.ts',
  'requireKitchenRecordMutationAuthority',
  {
    createError,
    readAppUserSubscription,
    readKitchenAccessIds,
    KITCHEN_MUTATION_TARGETS: { kitchens },
    serverAppUsersTarget: (appId) => ({
      collectionPath: `apps/${appId}/users`,
    }),
    serverKitchenAccessTarget: () => access,
  }
)
const parseKitchenUpdate = load(
  'kitchen/server/identity/update-input.ts',
  'parseKitchenUpdate',
  {
    createError,
    KitchenStatuses,
    KitchenVisibilities,
    isFirestoreDocumentId,
    validatePublicSlug: (slug) => ({
      isValid: typeof slug === 'string' && /^[a-z0-9-]+$/.test(slug),
      slug,
    }),
  }
)
const serverAuditStamp = load(
  `${core}server/utils/records/stamps.ts`,
  'serverAuditStamp',
  { FieldValue: { serverTimestamp: () => 'server-now' } }
)
const readKitchenByRouteSlug = load(
  'kitchen/server/identity/route-identity.ts',
  'readKitchenByRouteSlug',
  { createError }
)

function harness(kitchensWorkspaceOnly = false) {
  const at = { seconds: 1, nanoseconds: 0 }
  const records = new Map([
    ...['first', 'second', 'foreign'].map((id) => [
      `kitchens/${id}`,
      {
        identity: { slug: id, status: 'active', visibility: true },
        created: { at, by: 'creator' },
        updated: { at, by: 'previous-editor' },
      },
    ]),
    [
      'apps/owner-app/users/operator',
      { role: 'user', subscription: 'free', created: { at } },
    ],
    [
      'kitchen_access/operator',
      {
        apps: {
          'owner-app': { ids: ['first', 'second'], membership_created_at: at },
          'other-app': { ids: ['foreign'], membership_created_at: at },
        },
      },
    ],
  ])
  const writes = [],
    queries = []
  let beforeTransaction = () => {},
    queue = Promise.resolve(),
    preflights = 0
  const matching = (slug, field = 'identity.slug') =>
    [...records.entries()]
      .filter(
        ([path, value]) =>
          path.startsWith('kitchens/') &&
          (field === 'slug' ? value.slug : value.identity?.slug) === slug
      )
      .slice(0, 2)
      .map(([path, data]) => ({ id: path.slice('kitchens/'.length), data }))
  const db = {
    collection: () => ({
      where: (_field, _op, slug) => ({
        limit: () => ({
          get: async () => {
            preflights++
            const docs = matching(slug).map(({ id, data }) => ({
              id,
              data: () => data,
            }))
            return { size: docs.length, docs }
          },
        }),
      }),
    }),
  }
  const update = load('kitchen/server/identity/update.ts', 'updateKitchen', {
    useRuntimeConfig: () => ({ public: {}, kitchensWorkspaceOnly }),
    createError,
    parseKitchenUpdate,
    serverAuditStamp,
    FieldValue: { delete: () => removed },
    PLACE_MUTATION_TARGETS: { places },
    requireKitchenRecordMutationAuthority,
    requireFirestoreDocumentId: (value) => value,
    readKitchenMutationActor: async () => ({
      uid: 'operator',
      runtimeAppId: 'owner-app',
    }),
    KITCHEN_MUTATION_TARGETS: { kitchens },
    getRuntimeFirestore: () => db,
    readKitchenByRouteSlug,
    runGuardedServerTransaction: (placement, action) => {
      assert.deepEqual(placement, { kind: 'runtime' })
      // Each callback observes a committed snapshot, including competing slug writes.
      const pending = queue.then(async () => {
        beforeTransaction()
        const staged = []
        const result = await action({
          read: async (target, id) => {
            assert.equal(staged.length, 0, 'authority reads precede writes')
            const path = `${target.collectionPath}/${id}`
            return {
              exists: records.has(path),
              data: structuredClone(records.get(path)),
            }
          },
          query: async (target, input) => {
            assert.equal(staged.length, 0, 'slug query precedes writes')
            assert.equal(target, kitchens)
            assert.ok(['slug', 'identity.slug'].includes(input.field))
            assert.equal(input.op, '==')
            assert.equal(input.limit, 2)
            queries.push(input.value)
            return matching(input.value, input.field)
          },
          update: (target, id, patch) => staged.push({ target, id, patch }),
        })
        for (const write of staged) {
          const record = records.get(
            `${write.target.collectionPath}/${write.id}`
          )
          for (const [key, value] of Object.entries(write.patch)) {
            if (key.startsWith('identity.'))
              record.identity[key.slice('identity.'.length)] = value
            else if (value === removed) delete record[key]
            else record[key] = value
          }
          writes.push(write)
        }
        return result
      })
      queue = pending.catch(() => {})
      return pending
    },
  })
  return {
    records,
    writes,
    queries,
    update,
    before: (action) => {
      beforeTransaction = action
    },
    preflights: () => preflights,
  }
}

test('Concurrent Kitchen slug edits allow one claimant and reject the competing write', async () => {
  const h = harness()
  const outcomes = await Promise.allSettled(
    ['first', 'second'].map((kitchenId) =>
      h.update(
        {},
        {
          kitchen_id: kitchenId,
          patch: { 'identity.slug': 'shared' },
        }
      )
    )
  )
  assert.equal(
    outcomes.filter((result) => result.status === 'fulfilled').length,
    1
  )
  const rejected = outcomes.find((result) => result.status === 'rejected')
  assert.equal(rejected.reason.statusCode, 409)
  assert.match(rejected.reason.message, /already taken/)
  assert.equal(h.writes.length, 1)
  assert.deepEqual(h.queries, ['shared', 'shared', 'shared', 'shared'])
  assert.equal(h.preflights(), 0)
})

test('Kitchen keeps its current slug and writes the verified actor and App audit stamp', async () => {
  const h = harness()
  const created = structuredClone(h.records.get('kitchens/first').created)
  await h.update(
    {},
    {
      kitchen_id: 'first',
      patch: { 'identity.slug': 'first', 'identity.status': 'archived' },
    }
  )
  assert.deepEqual(h.writes[0], {
    target: kitchens,
    id: 'first',
    patch: {
      'identity.slug': 'first',
      'identity.status': 'archived',
      updated: { at: 'server-now', by: 'operator', app_id: 'owner-app' },
    },
  })
  assert.deepEqual(h.records.get('kitchens/first').created, created)
  assert.equal(h.records.get('kitchens/first').identity.visibility, true)
})

test('Kitchen-owned names can be renamed without changing the slug or Place-owned identity', async () => {
  const h = harness()
  const first = h.records.get('kitchens/first')
  first.identity.source = 'user'
  first.identity.name = 'First Kitchen'
  const rename = (kitchen_id, name) =>
    h.update({}, { kitchen_id, patch: { 'identity.name': name } })
  await rename('first', '  Another Name  ')
  assert.equal(first.identity.name, 'Another Name')
  assert.equal(first.identity.slug, 'first')
  assert.equal(h.queries.length, 0)
  await assert.rejects(rename('first', ' '), { statusCode: 400 })
  await assert.rejects(rename('second', 'Place rename'), { statusCode: 409 })
  assert.equal(h.writes.length, 1)
})

test('Kitchen-only updates preserve stored capability settings and reject capability patches', async () => {
  const h = harness(true)
  const kitchen = h.records.get('kitchens/first')
  kitchen.identity.source = 'user'
  kitchen.identity.name = 'First Kitchen'
  kitchen.orders = { printing: { ticket_device_id: 1 } }
  kitchen.services = { item_images: 'old value' }
  kitchen.tables = { count: 501 }
  const before = structuredClone(kitchen)
  const rename = { 'identity.name': 'New Kitchen name' }
  const capability = {
    'services.title': 'Lunch',
    'services.item_images': true,
    'tables.count': 6,
  }
  for (const [field, value] of Object.entries(capability)) {
    await assert.rejects(
      h.update(
        {},
        { kitchen_id: 'first', patch: { ...rename, [field]: value } }
      ),
      { statusCode: 400 }
    )
  }
  assert.deepEqual(kitchen, before)
  assert.deepEqual(h.writes, [])
  await h.update({}, { kitchen_id: 'first', patch: rename })
  assert.equal(kitchen.identity.name, rename['identity.name'])
  for (const field of ['orders', 'services', 'tables'])
    assert.deepEqual(kitchen[field], before[field])
  const full = harness()
  await full.update({}, { kitchen_id: 'first', patch: capability })
  for (const [field, value] of Object.entries(capability))
    assert.equal(full.writes[0].patch[field], value)
})

test('Kitchen rechecks revoked membership and lifetime-bound access before slug query or write', async () => {
  for (const revoke of [
    (h) => h.records.delete('apps/owner-app/users/operator'),
    (h) => {
      h.records.get('apps/owner-app/users/operator').role = 'guest'
    },
    (h) => {
      h.records.get('apps/owner-app/users/operator').created.at = {
        seconds: 2,
        nanoseconds: 0,
      }
    },
    (h) => {
      h.records.get('kitchen_access/operator').apps['owner-app'].ids = []
    },
  ]) {
    const h = harness()
    h.before(() => revoke(h))
    await assert.rejects(
      h.update(
        {},
        {
          kitchen_id: 'first',
          patch: { 'identity.slug': 'shared' },
        }
      ),
      { statusCode: 403 }
    )
    assert.deepEqual(h.queries, [])
    assert.deepEqual(h.writes, [])
    assert.equal(h.preflights(), 0)
  }
})

test('Another App grant cannot authorize a Kitchen update', async () => {
  const h = harness()
  await assert.rejects(
    h.update(
      {},
      {
        kitchen_id: 'foreign',
        patch: { 'identity.visibility': false },
      }
    ),
    { statusCode: 403 }
  )
  assert.deepEqual(h.writes, [])
})

test('flat Identity accepts a name-only root and preserves unrelated data and the published slug', async () => {
  const h = harness()
  const initial = {
    name: 'Minimal',
    slug: 'stable-url',
    status: 'active',
    visibility: 'public',
    description: 'Earlier public intro',
    theme: { legacy: true },
  }
  h.records.set('kitchens/first', initial)
  h.records.set('places/real-place', { name: 'Venue unchanged' })
  await h.update(
    {},
    {
      kitchen_id: 'first',
      patch: {
        name: 'Renamed',
        description: null,
        imageUrl: 'https://example.test/image.png',
        placeId: 'real-place',
      },
    }
  )
  assert.equal(initial.name, 'Renamed')
  assert.equal(initial.slug, 'stable-url')
  assert.equal(initial.visibility, 'public')
  assert.equal(initial.description, undefined)
  assert.equal(initial.imageUrl, 'https://example.test/image.png')
  assert.equal(initial.placeId, 'real-place')
  assert.deepEqual(initial.theme, { legacy: true })
  assert.deepEqual(h.records.get('places/real-place'), {
    name: 'Venue unchanged',
  })
  assert.equal(h.queries.length, 0)
  await h.update({}, { kitchen_id: 'first', patch: { placeId: null } })
  assert.equal(initial.placeId, null)
  h.records.set('kitchens/second', { name: 'Name only' })
  await h.update(
    {},
    { kitchen_id: 'second', patch: { name: 'Updated name only' } }
  )
  assert.equal(h.records.get('kitchens/second').name, 'Updated name only')
  assert.equal(h.records.get('kitchens/second').status, undefined)
})

test('flat Identity rejects unsafe or conflicting changes without writing', async () => {
  const h = harness()
  h.records.set('kitchens/first', { name: 'Name only' })
  h.records.get('kitchens/second').slug = 'flat-claimed'
  for (const [patch, statusCode] of [
    [{ slug: 'flat-claimed' }, 409],
    [{ slug: 'second' }, 409],
    [{ status: 'active', visibility: 'public' }, 400],
    [{ visibility: true }, 400],
    [{ status: 'inactive' }, 400],
    [{ imageUrl: 'javascript:alert(1)' }, 400],
    [{ placeId: 'unknown-place' }, 400],
    [{ placeId: 'places/id' }, 400],
    [{ items: [] }, 400],
  ]) {
    await assert.rejects(h.update({}, { kitchen_id: 'first', patch }), {
      statusCode,
    })
  }
  await assert.rejects(
    h.update({}, { kitchen_id: 'foreign', patch: { name: 'Unauthorised' } }),
    { statusCode: 403 }
  )
  assert.deepEqual(h.writes, [])
})
