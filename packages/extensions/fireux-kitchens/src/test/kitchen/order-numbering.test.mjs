import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createHash } from 'node:crypto'

function load(path, names, deps = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export \{[\s\S]*?\} from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return { ${names} }`, Object.keys(deps))(...Object.values(deps))
}
const projection = load('../../runtime/kitchen/utils/order-numbering.ts', 'applyKitchenOrderNumbering,applyKitchenOrderNumberingToResponse')
const target = load('../../runtime/kitchen/server/orders/numbering-target.ts', 'serverKitchenOrderNumberingTarget', {
  defineFirestoreMutationTarget: value => value,
  requireFirestoreDocumentId: value => { if (!value || value.includes('/')) throw new Error('Invalid Kitchen id'); return value },
})
const scope = { appId: 'app-a', kitchenId: 'kitchen-a' }
const counterPath = 'kitchens/kitchen-a/order-service/current'
const stamp = { toMillis: () => 1000 }
function harness({ counter, statuses = [], deny = false, failOrder = false, retryConflict = false } = {}) {
  const records = new Map(counter === undefined ? [] : [[counterPath, counter]])
  const commits = [], reads = []
  let attempts = 0, authorityTransaction
  const deps = {
    ...projection, ...target,
    Timestamp: { now: () => stamp, fromMillis: value => ({ toMillis: () => value }) }, randomUUID: () => 'fresh-period',
    createError: value => Object.assign(new Error(value.statusMessage), value),
    serverKitchenOrdersTarget: id => ({ collectionPath: `kitchens/${id}/orders` }),
    serverUserOrdersTarget: id => ({ collectionPath: `users/${id}/orders` }),
    requireKitchenWriterAccount: async (_scope, _actor, tx) => { authorityTransaction = tx; if (deny) throw new Error('Membership revoked') },
    runGuardedServerTransaction: async (_placement, run) => {
      for (;;) {
        attempts++
        const pending = [], snapshot = new Map(records)
        const tx = {
          read: async (target, id) => {
            const path = `${target.collectionPath}/${id}`; reads.push(path)
            return { exists: snapshot.has(path), data: snapshot.get(path) }
          },
          query: async (_target, query) => statuses.filter(status => query.value.includes(status)).map(status => ({ status })),
          update: (target, id, data) => pending.push([`${target.collectionPath}/${id}`, data]),
          create: (target, id, data) => {
            if (failOrder && target.collectionPath.endsWith('/orders')) throw new Error('Order write failed')
            pending.push([`${target.collectionPath}/${id}`, data])
          },
        }
        const result = await run(tx)
        if (retryConflict && attempts === 1) {
          records.set(counterPath, { ...records.get(counterPath), last_order_number: 7 })
          continue // Controlled optimistic-conflict retry; not a live Firestore concurrency proof.
        }
        for (const [path, data] of pending) { records.set(path, data); commits.push(path) }
        return result
      }
    },
  }
  const api = load('../../runtime/kitchen/server/orders/order-numbering.ts', 'nextKitchenOrderNumber,commitKitchenOrderWithNumbering,resetKitchenOrderNumbering', deps)
  const idempotency = load('../../runtime/menu/server/ordering/idempotency.ts', 'commitMenuOrderIdempotently', {
    ...deps, ...api, createHash,
    serverKitchenOrderIdempotencyTarget: id => ({ collectionPath: `kitchens/${id}/order-idempotency` }),
  })
  const commitIdempotently = () => idempotency.commitMenuOrderIdempotently({
    ...scope, menuId: 'menu-a', key: 'numbering-retry-key-abcdef', request: { items: ['item-a'] },
    orderId: 'idempotent-order', orderPath: 'kitchens/kitchen-a/orders/idempotent-order',
    payload: { kitchen_id: scope.kitchenId }, response: { id: 'idempotent-order', receipt: { id: 'idempotent-order' } },
  })
  const commit = (extra = {}) => api.commitKitchenOrderWithNumbering({ ...scope,
    orderId: 'order-a', payload: { kitchen_id: scope.kitchenId, kitchen_offering_id: 'breakfast' },
    response: { id: 'order-a', receipt: { id: 'order-a' } }, ...extra })
  return { api, records, commits, reads, commit, commitIdempotently, attempts: () => attempts, authorityTransaction: () => authorityTransaction }
}
const saved = { service_id: 'period-a', last_order_number: 4, started_at: stamp }

test('missing counter starts one period and commits matching Order, response and receipt numbers', async () => {
  const w = harness(); const result = await w.commit()
  assert.deepEqual(w.commits, [counterPath, 'kitchens/kitchen-a/orders/order-a'])
  const order = w.records.get(w.commits[1])
  for (const value of [order, result, result.receipt]) {
    assert.equal(value.service_id, 'service-1000'); assert.equal(value.service_number, 1); assert.equal(value.order_number, '1')
  }
  assert.equal(order.kitchen_offering_id, 'breakfast')
})

test('existing counter increments without replacing its period or start time', async () => {
  const w = harness({ counter: saved }); const result = await w.commit()
  assert.equal(result.service_id, 'period-a'); assert.equal(result.service_number, 5)
  assert.equal(w.records.get(counterPath).started_at, stamp)
})

for (const counter of [ {}, { ...saved, service_id: '' }, { ...saved, service_id: ' period-a' },
  { ...saved, last_order_number: '4' }, { ...saved, last_order_number: -1 },
  { ...saved, last_order_number: 1.5 }, { ...saved, last_order_number: Infinity },
  { ...saved, last_order_number: Number.MAX_SAFE_INTEGER + 1 },
]) {
  test(`malformed counter fails without writes: ${JSON.stringify(counter)}`, async () => {
    const w = harness({ counter }); await assert.rejects(w.commit(), /needs repair/)
    await assert.rejects(w.api.resetKitchenOrderNumbering({ ...scope, actorId: 'operator' }), /needs repair/)
    assert.deepEqual(w.commits, []); assert.deepEqual(w.records.get(counterPath), counter)
  })
}

test('last safe number cannot overflow, but can explicitly reset when there are no active orders', async () => {
  const w = harness({ counter: { ...saved, last_order_number: Number.MAX_SAFE_INTEGER } })
  await assert.rejects(w.commit(), /reached its limit/); assert.deepEqual(w.commits, [])
  const result = await w.api.resetKitchenOrderNumbering({ ...scope, actorId: 'operator' })
  assert.equal(result.previous_order_count, Number.MAX_SAFE_INTEGER)
  assert.equal(w.records.get(counterPath).last_order_number, 0)
})

test('failed validation or order write cannot commit a counter increment', async () => {
  const first = harness({ counter: saved })
  await assert.rejects(first.commit({ validateBeforeCreate: async () => { throw new Error('Menu withdrawn') } }), /withdrawn/)
  assert.deepEqual(first.reads, []); assert.deepEqual(first.commits, [])
  const second = harness({ counter: saved, failOrder: true })
  await assert.rejects(second.commit(), /write failed/)
  assert.deepEqual(second.commits, []); assert.equal(second.records.get(counterPath).last_order_number, 4)
})

test('transaction conflict reruns allocation from the newly committed counter', async () => {
  const w = harness({ counter: saved, retryConflict: true }); const result = await w.commit()
  assert.equal(w.attempts(), 2); assert.equal(result.service_number, 8)
  assert.equal(w.records.get(counterPath).last_order_number, 8)
  assert.equal(w.commits.filter(path => path.endsWith('/orders/order-a')).length, 1)
})

for (const status of ['pending_payment','pending_acceptance','awaiting_payment_choice','awaiting_preparation','scheduled','accepted','ready']) {
  test(`active ${status} Order blocks numbering reset`, async () => {
    const w = harness({ counter: saved, statuses: [status] })
    await assert.rejects(w.api.resetKitchenOrderNumbering({ ...scope, actorId: 'operator' }), /Finish active orders/)
    assert.deepEqual(w.commits, []); assert.deepEqual(w.records.get(counterPath), saved)
  })
}

test('reset checks transaction authority and preserves the ended count before the next Order starts at one', async () => {
  const denied = harness({ counter: saved, deny: true })
  await assert.rejects(denied.api.resetKitchenOrderNumbering({ ...scope, actorId: 'operator' }), /revoked/)
  assert.ok(denied.authorityTransaction()); assert.deepEqual(denied.reads, []); assert.deepEqual(denied.commits, [])
  const w = harness({ counter: saved, statuses: ['completed', 'rejected'] })
  const reset = await w.api.resetKitchenOrderNumbering({ ...scope, actorId: 'operator' })
  assert.deepEqual(reset, { service_id: 'service-fresh-period', previous_service_id: 'period-a', previous_order_count: 4 })
  const order = await w.commit(); assert.equal(order.service_id, reset.service_id); assert.equal(order.service_number, 1)
})


test('actual idempotent writer replays the saved numbered receipt without allocating again', async () => {
  const w = harness({ counter: saved })
  const first = await w.commitIdempotently()
  const before = [...w.commits]
  const replay = await w.commitIdempotently()
  assert.equal(first.duplicate, false); assert.equal(replay.duplicate, true)
  assert.deepEqual(replay.response, first.response)
  assert.equal(replay.response.receipt.service_id, 'period-a')
  assert.equal(replay.response.receipt.service_number, 5)
  assert.equal(w.records.get(counterPath).last_order_number, 5)
  assert.deepEqual(w.commits, before)
})
