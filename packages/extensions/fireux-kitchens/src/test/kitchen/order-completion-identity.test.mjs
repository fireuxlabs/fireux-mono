import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'

test('completion supplies path identity to Sale creation without storing it on the Order', async () => {
  const source = readFileSync(
    new URL('../../runtime/kitchen/server/orders/actions.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  const writes = []
  const stored = {
    status: 'ready',
    order_number: '32',
    order_type: 'collection',
  }
  const dependencies = {
    defineEventHandler: (fn) => fn,
    readBody: async () => ({
      app_id: 'misebox-app',
      kitchen_id: 'baren',
      order_id: 'test-order',
      transition: 'complete',
    }),
    requirePathSegment: (value) => value,
    isKitchenOrderTransition: (value) => value === 'complete',
    requireKitchenOperator: async () => 'operator',
    requireKitchenWriterAccount: async (scope, uid, tx) => {
      assert.deepEqual(scope, { appId: 'misebox-app', kitchenId: 'baren' })
      assert.equal(uid, 'operator')
      assert.equal(typeof tx.read, 'function')
    },
    serverKitchenOrdersTarget: () => 'orders',
    serverKitchenSalesTarget: () => 'sales',
    serverAppFinancialFactsTarget: () => 'facts',
    FieldValue: { serverTimestamp: () => 'timestamp' },
    buildKitchenOrderTransitionPatch: () => ({ status: 'completed' }),
    buildCompletedKitchenOrderSale: (input) => {
      assert.equal(input.order.id, 'test-order')
      assert.equal(input.orderId, 'test-order')
      assert.equal(input.order.status, 'ready')
      assert.equal(input.actorId, 'operator')
      return { sale: { id: input.orderId }, financialFact: { id: 'sale-fact' } }
    },
    runGuardedServerTransaction: async (_scope, fn) =>
      fn({
        read: async () => ({ exists: true, data: stored }),
        create: (target, id, data) => writes.push({ target, id, data }),
        update: (target, id, data) => writes.push({ target, id, data }),
      }),
    createError: (options) =>
      Object.assign(new Error(options.statusMessage), options),
    KitchenSaleInvariantError: class extends Error {},
  }
  const handler = compileFunction(
    stripTypeScriptTypes(source) + '\nreturn executeKitchenOrderAction',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const result = await handler({}, await dependencies.readBody())
  assert.equal(result.order.id, 'test-order')
  assert.equal(result.order.status, 'completed')
  assert.deepEqual(
    writes.map((write) => write.target),
    ['sales', 'facts', 'orders']
  )
  assert.equal(writes[2].data.status, 'completed')
  assert.equal('id' in writes[2].data, false)
  assert.equal('id' in stored, false)
})

test('Order action rejects invalid action and denied operator before opening a transaction', async () => {
  const source = readFileSync(
    new URL('../../runtime/kitchen/server/orders/actions.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  let transactions = 0
  let accessChecks = 0
  const dependencies = {
    createError: (options) =>
      Object.assign(new Error(options.statusMessage), options),
    requirePathSegment: (value) => value,
    isKitchenOrderTransition: (value) => value === 'accept',
    requireKitchenOperator: async () => {
      accessChecks++
      throw new Error('Access denied')
    },
    runGuardedServerTransaction: async () => {
      transactions++
    },
  }
  const action = compileFunction(
    stripTypeScriptTypes(source) + '\nreturn executeKitchenOrderAction',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const input = {
    app_id: 'app-a',
    kitchen_id: 'kitchen-a',
    order_id: 'order-a',
  }
  await assert.rejects(
    action({}, { ...input, transition: 'unknown' }),
    /invalid/
  )
  assert.equal(accessChecks, 0)
  await assert.rejects(
    action({}, { ...input, transition: 'accept' }),
    /Access denied/
  )
  assert.equal(accessChecks, 1)
  assert.equal(transactions, 0)
})

test('HTTP adapter passes exact request and event to the Order action owner', async () => {
  const source = readFileSync(
    new URL(
      '../../runtime/server/api/workspace/kitchen/orders/transition.post.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(
      'export default defineEventHandler',
      'const handler = defineEventHandler'
    )
  const event = {},
    body = { transition: 'complete', order_id: 'order-a' }
  const expected = { ok: true, order: { id: 'order-a', status: 'completed' } }
  let calls = 0
  const dependencies = {
    defineEventHandler: (fn) => fn,
    readBody: async (received) => {
      assert.equal(received, event)
      return body
    },
    executeKitchenOrderAction: async (received, input) => {
      calls++
      assert.equal(received, event)
      assert.equal(input, body)
      return expected
    },
  }
  const handler = compileFunction(
    stripTypeScriptTypes(source) + '\nreturn handler',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  assert.equal(await handler(event), expected)
  assert.equal(calls, 1)
})

test('authority revoked between preflight and transaction prevents all lifecycle writes', async () => {
  const source = readFileSync(
    new URL('../../runtime/kitchen/server/orders/actions.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  let writes = 0,
    authorized = true,
    checks = 0
  const tx = {
    read: async () => {
      throw new Error('must authorize before reading order')
    },
    create: () => writes++,
    update: () => writes++,
  }
  const dependencies = {
    requirePathSegment: (x) => x,
    isKitchenOrderTransition: () => true,
    requireKitchenOperator: async () => {
      assert.equal(authorized, true)
      return 'operator'
    },
    requireKitchenWriterAccount: async (scope, uid, actualTx) => {
      checks++
      assert.equal(uid, 'operator')
      assert.deepEqual(scope, { appId: 'app', kitchenId: 'k' })
      assert.equal(actualTx, tx)
      if (!authorized) throw new Error('App membership revoked')
    },
    serverKitchenOrdersTarget: () => 'orders',
    serverKitchenSalesTarget: () => 'sales',
    serverAppFinancialFactsTarget: () => 'facts',
    runGuardedServerTransaction: async (_scope, callback) => {
      authorized = false
      return callback(tx)
    },
  }
  const action = compileFunction(
    stripTypeScriptTypes(source) + '\nreturn executeKitchenOrderAction',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  await assert.rejects(
    action(
      {},
      { app_id: 'app', kitchen_id: 'k', order_id: 'o', transition: 'complete' }
    ),
    /revoked/
  )
  assert.equal(checks, 1)
  assert.equal(writes, 0)
})
