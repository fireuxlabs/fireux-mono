import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = readFileSync(new URL('../runtime/product/composables/firestore/mutations/useProductCreate.ts', import.meta.url), 'utf8')
const start = source.indexOf('  const normalizePrices =')
const end = source.indexOf('  const provisionStripeProduct', start)
function normalize(uid) {
  return compileFunction(`${stripTypeScriptTypes(source.slice(start, end))}; return normalizePrices`,
    ['Timestamp', 'currentUser', 'normalizeString'])(
    { now: () => ({ seconds: 100, nanoseconds: 0 }) },
    { value: uid ? { uid } : null },
    value => String(value ?? '').trim(),
  )
}

test('Saved price records have required defaults, identity and audit stamps', () => {
  const prices = normalize('creator')([{ currency: 'CHF', unit_amount: 100 }], ['price_one'], 'product')
  const price = prices[0]
  assert.equal(price.id, 'price_one')
  assert.equal(price.product_id, 'product')
  assert.equal(price.type, 'one_time')
  assert.equal(price.billing_scheme, 'per_unit')
  assert.equal(price.currency, 'chf')
  assert.deepEqual(price.created, { at: { seconds: 100, nanoseconds: 0 }, by: 'creator' })
  assert.deepEqual(price.updated, price.created)
})

test('Price creation requires an authenticated author', () => {
  assert.throws(() => normalize(null)([], [], 'product'), /Sign in/)
})
