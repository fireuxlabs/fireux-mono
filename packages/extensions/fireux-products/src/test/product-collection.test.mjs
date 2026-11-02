import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'
import { joinProductRead } from '../runtime/product/utils/normalize-product.ts'

function collection(prices, fetchRead) {
  const source = readFileSync(
    new URL(
      '../runtime/product/composables/useProductCollection.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  let handler
  let key
  const data = ref([])
  const pending = ref(true)
  const error = ref(null)
  const deps = {
    computed,
    joinProductRead,
    $fetch: fetchRead,
    useFireUXConfig: () => ({ role: 'tenant', appId: 'yellow-velo' }),
    useAsyncData: (cacheKey, read) => {
      key = cacheKey
      handler = read
      return { data, pending, error }
    },
    useFirestoreCollectionState: () => ({
      outcome: computed(() =>
        error.value
          ? 'error'
          : pending.value
            ? 'pending'
            : data.value.length
              ? 'ready'
              : 'empty'
      ),
    }),
  }
  const state = compileFunction(
    `${stripTypeScriptTypes(source)};return useProductCollection({prices})`,
    [...Object.keys(deps), 'prices']
  )(...Object.values(deps), prices)
  return {
    state,
    key,
    async read(signal) {
      pending.value = true
      try {
        data.value = await handler(null, { signal })
      } catch (failure) {
        error.value = failure
        throw failure
      } finally {
        pending.value = false
      }
    },
  }
}

test('priced catalogue uses safe public detail reads and one cancellation signal', async () => {
  const signal = new AbortController().signal
  const calls = []
  const product = { id: 'bike one' }
  const read = {
    product,
    prices: [{ id: 'p', unit_amount: 1300 }],
    defaultPrice: { id: 'p' },
  }
  const reader = collection(true, async (path, options) => {
    calls.push([path, options.signal])
    return path === '/api/products' ? [product] : read
  })
  assert.equal(reader.state.pending.value, true)
  await reader.read(signal)
  assert.deepEqual(calls, [
    ['/api/products', signal],
    ['/api/products/bike%20one', signal],
  ])
  assert.deepEqual(reader.state.productReads.value, [read])
  assert.deepEqual(reader.state.products.value, [product])
  assert.equal(reader.state.outcome.value, 'ready')
})

test('price failure fails the whole requested catalogue instead of presenting partial success', async () => {
  const failure = new Error('price unavailable')
  const reader = collection(true, async (path) => {
    if (path === '/api/products') return [{ id: 'bike' }]
    throw failure
  })
  await assert.rejects(reader.read(new AbortController().signal), failure)
  assert.equal(reader.state.error.value, failure)
  assert.equal(reader.state.outcome.value, 'error')
  assert.deepEqual(reader.state.productReads.value, [])
})

test('unpriced and empty catalogues do not fetch prices and use distinct Nuxt keys', async () => {
  const calls = []
  const reader = collection(false, async (path) => {
    calls.push(path)
    return []
  })
  await reader.read(new AbortController().signal)
  assert.deepEqual(calls, ['/api/products'])
  assert.equal(reader.state.outcome.value, 'empty')
  assert.notEqual(reader.key, collection(true, async () => []).key)
})

test('cancelling during price acquisition rejects the same read without publishing partial rows', async () => {
  const controller = new AbortController()
  const reader = collection(true, async (path, { signal }) => {
    if (path === '/api/products') return [{ id: 'bike' }]
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), {
        once: true,
      })
      controller.abort(new Error('obsolete catalogue'))
    })
  })
  await assert.rejects(reader.read(controller.signal), /obsolete catalogue/)
  assert.deepEqual(reader.state.productReads.value, [])
})
