import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'

test('completion supplies path identity to Sale creation without storing it on the Order', async () => {
  const source = readFileSync(new URL('../../runtime/server/api/workspace/kitchen/orders/transition.post.ts', import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace('export default defineEventHandler', 'const handler = defineEventHandler')
  const writes = []
  const stored = { status: 'ready', order_number: '32', order_type: 'collection' }
  const dependencies = {
    defineEventHandler: fn => fn,
    readBody: async () => ({ app_id: 'misebox-app', kitchen_id: 'baren', order_id: 'test-order', transition: 'complete' }),
    requirePathSegment: value => value,
    isKitchenOrderTransition: value => value === 'complete',
    requireKitchenOperator: async () => 'operator',
    serverKitchenOrdersTarget: () => 'orders',
    serverKitchenSalesTarget: () => 'sales',
    serverAppFinancialFactsTarget: () => 'facts',
    FieldValue: { serverTimestamp: () => 'timestamp' },
    buildKitchenOrderTransitionPatch: () => ({ status: 'completed' }),
    buildCompletedKitchenOrderSale: input => {
      assert.equal(input.order.id, 'test-order')
      assert.equal(input.orderId, 'test-order')
      assert.equal(input.order.status, 'ready')
      assert.equal(input.actorId, 'operator')
      return { sale: { id: input.orderId }, financialFact: { id: 'sale-fact' } }
    },
    runGuardedServerTransaction: async (_scope, fn) => fn({
      read: async () => ({ exists: true, data: stored }),
      create: (target, id, data) => writes.push({ target, id, data }),
      update: (target, id, data) => writes.push({ target, id, data }),
    }),
    createError: options => Object.assign(new Error(options.statusMessage), options),
    KitchenSaleInvariantError: class extends Error {},
  }
  const handler = compileFunction(stripTypeScriptTypes(source) + '\nreturn handler', Object.keys(dependencies))(...Object.values(dependencies))
  const result = await handler({})
  assert.equal(result.order.id, 'test-order')
  assert.equal(result.order.status, 'completed')
  assert.deepEqual(writes.map(write => write.target), ['sales', 'facts', 'orders'])
  assert.equal(writes[2].data.status, 'completed')
  assert.equal('id' in writes[2].data, false)
  assert.equal('id' in stored, false)
})
