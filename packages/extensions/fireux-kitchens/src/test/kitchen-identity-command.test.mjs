import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { readAppUserSubscription } from '../../../../core/fireux-core/src/runtime/app/models/app-user.model.ts'
import { readMembershipAccessIds } from '../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts'

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

function harness() {
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
  const matching = (slug) =>
    [...records.entries()]
      .filter(
        ([path, value]) =>
          path.startsWith('kitchens/') && value.identity.slug === slug
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
    createError,
    parseKitchenUpdate,
    serverAuditStamp,
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
            assert.equal(input.field, 'identity.slug')
            assert.equal(input.op, '==')
            assert.equal(input.limit, 2)
            queries.push(input.value)
            return matching(input.value)
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
  assert.deepEqual(h.queries, ['shared', 'shared'])
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
