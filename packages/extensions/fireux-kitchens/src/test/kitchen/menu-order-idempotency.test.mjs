import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createHash } from 'node:crypto'
import test from 'node:test'

// Use the existing command-test seam: real authored functions, injected I/O only.
function load(relative, deps, names) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return {${names.join(',')}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const core =
  '../../../../../core/fireux-core/src/runtime/utils/firestore-mutations/'
const definitions = load(core + 'target-definition.ts', {}, [
  'ALL_FIRESTORE_MUTATION_VERBS',
  'assertFirestoreMutationSegment',
  'defineFirestoreMutationTarget',
])
const targets = load(core + 'server-targets.ts', definitions, [
  'serverUserOrdersTarget',
  'serverKitchenOrderIdempotencyTarget',
  'serverKitchenOrdersTarget',
])
const scope = { appId: 'misebox-app', kitchenId: 'venue-one', menuId: 'food' }
const request = { items: [{ id: 'pizza', quantity: 1 }], channel: 'menu' }
const key = 'isolated-retry-key-0001'

function harness() {
  const records = new Map()
  const writes = []
  const reads = []
  let sequences = 0
  const path = (target, id) => `${target.collectionPath}/${id}`
  const mutations = {
    read: async (target, id) => {
      const value = records.get(path(target, id))
      return { exists: Boolean(value), data: value }
    },
    create: (target, id, data) => {
      const at = path(target, id)
      assert.ok(!records.has(at))
      records.set(at, data)
      writes.push(at)
    },
    update: (target, id, data) => {
      const at = path(target, id)
      records.set(at, data)
      writes.push(at)
    },
  }
  const api = load(
    '../../runtime/menu/server/ordering/idempotency.ts',
    {
      createHash,
      ...targets,
      Timestamp: { fromMillis: (value) => ({ toMillis: () => value }) },
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
      runGuardedServerTransaction: async (_context, callback) =>
        callback(mutations),
      nextKitchenOrderNumber: async () => ({ number: ++sequences }),
      applyKitchenOrderNumbering: ({ payload, response }) => ({
        payload,
        response,
      }),
      applyKitchenOrderNumberingToResponse: (response) => response,
    },
    ['commitMenuOrderIdempotently', 'readMenuOrderIdempotentResponse']
  )
  const db = {
    doc: (at) => ({
      get: async () => {
        reads.push(at)
        const data = records.get(at)
        return { exists: Boolean(data), data: () => data }
      },
    }),
  }
  const commit = (overrides = {}) =>
    api.commitMenuOrderIdempotently({
      ...scope,
      key,
      request,
      orderId: 'order-one',
      orderPath: 'kitchens/venue-one/orders/order-one',
      payload: { kitchen_id: scope.kitchenId },
      response: { id: 'order-one', kitchen_id: scope.kitchenId },
      ...overrides,
    })
  const replay = (overrides = {}) =>
    api.readMenuOrderIdempotentResponse(db, {
      ...scope,
      key,
      request,
      ...overrides,
    })
  return { commit, replay, writes, reads, records, sequences: () => sequences }
}

test('committed order replays from the actual canonical writer target without another write or sequence', async () => {
  const h = harness()
  const first = await h.commit()
  const count = h.writes.length
  assert.deepEqual(await h.replay(), first.response)
  assert.ok(h.writes.includes(h.reads[0]))
  assert.match(h.reads[0], /^kitchens\/venue-one\/order-idempotency\//)
  assert.equal(h.writes.length, count)
  assert.equal(h.sequences(), 1)
  assert.equal(
    h.records.get('kitchens/venue-one/orders/order-one').kitchen_id,
    'venue-one'
  )
})
test('same retry key with different request fails409 before further writes', async () => {
  const h = harness()
  await h.commit()
  const count = h.writes.length
  await assert.rejects(
    h.replay({
      request: { items: [{ id: 'pizza', quantity: 2 }], channel: 'menu' },
    }),
    { statusCode: 409 }
  )
  assert.equal(h.writes.length, count)
})
test('another App, Kitchen or Menu cannot replay this reservation', async () => {
  const h = harness()
  await h.commit()
  for (const other of [
    { appId: 'other-app' },
    { kitchenId: 'venue-two' },
    { menuId: 'drinks' },
  ])
    assert.equal(await h.replay(other), null)
})
test('transaction duplicate still returns original response and does not create another order', async () => {
  const h = harness()
  const first = await h.commit()
  const count = h.writes.length
  const retry = await h.commit({ orderId: 'order-two' })
  assert.equal(retry.duplicate, true)
  assert.deepEqual(retry.response, first.response)
  assert.equal(h.writes.length, count)
  assert.equal(h.sequences(), 1)
})

test('failed commit-time validation writes no order, reservation or service sequence; replay does not reprice', async () => {
  const h = harness()
  let checks = 0
  await assert.rejects(
    h.commit({
      validateBeforeCreate: async () => {
        checks++
        throw new Error('changed quote')
      },
    }),
    /changed quote/
  )
  assert.equal(h.writes.length, 0)
  assert.equal(h.sequences(), 0)
  await h.commit({
    validateBeforeCreate: async () => {
      checks++
    },
  })
  assert.equal(checks, 2)
  await h.commit({
    validateBeforeCreate: async () => {
      throw new Error('must not reprice replay')
    },
  })
  assert.equal(h.sequences(), 1)
})
