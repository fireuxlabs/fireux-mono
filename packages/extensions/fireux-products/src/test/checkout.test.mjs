import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createHash } from 'node:crypto'

function load(file, dependencies, result = 'handler') {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replaceAll('import.meta.url', '"file:///checkout-fixture.ts"')
    .replace(/^export default /m, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)

function statusHandler({
  owned = ['cs_test_owned'],
  payment = 'paid',
  status = 'complete',
} = {}) {
  let retrieved = 0
  const handler = load('../runtime/server/api/stripe/checkout-status.get.ts', {
    defineEventHandler: (value) => value,
    createError,
    getQuery: (event) => event.query,
    setResponseHeader: (event, key, value) => {
      event.headers[key] = value
    },
    checkoutBuyerSession: async () => ({ data: { checkouts: owned } }),
    createRequire: () => () =>
      class {
        checkout = {
          sessions: {
            retrieve: async () => {
              retrieved++
              return {
                status,
                payment_status: payment,
                customer_email: 'PRIVATE',
                metadata: { secret: 'PRIVATE' },
              }
            },
          },
        }
      },
    STRIPE_API_VERSION: 'fixture',
  })
  return { handler, retrieved: () => retrieved }
}

test('buyer read rejects missing, malformed, repeated and unowned session IDs before Stripe', async () => {
  const previous = process.env.STRIPE_SECRET_KEY
  process.env.STRIPE_SECRET_KEY = 'fixture-only'
  try {
    for (const id of [
      undefined,
      ['cs_test_owned'],
      '../private',
      'cs_test_other',
    ]) {
      const fixture = statusHandler()
      await assert.rejects(
        fixture.handler({ query: { session_id: id }, headers: {} }),
        (error) => [400, 404].includes(error.statusCode)
      )
      assert.equal(fixture.retrieved(), 0)
    }
  } finally {
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY
    else process.env.STRIPE_SECRET_KEY = previous
  }
})

test('buyer read returns Stripe status without customer or operator fields and prevents caching', async () => {
  const previous = process.env.STRIPE_SECRET_KEY
  process.env.STRIPE_SECRET_KEY = 'fixture-only'
  try {
    for (const [status, payment] of [
      ['complete', 'paid'],
      ['complete', 'unpaid'],
      ['open', 'unpaid'],
      ['expired', 'unpaid'],
    ]) {
      const fixture = statusHandler({ status, payment })
      const event = { query: { session_id: 'cs_test_owned' }, headers: {} }
      assert.deepEqual(await fixture.handler(event), {
        status,
        payment_status: payment,
      })
      assert.equal(event.headers['Cache-Control'], 'no-store')
    }
  } finally {
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY
    else process.env.STRIPE_SECRET_KEY = previous
  }
})

test('buyer proof delegates encryption and expiry to native H3, remains host-only and HttpOnly', async () => {
  const configs = []
  const buyerSession = load(
    '../runtime/product/server/integration/stripe/buyer-session.ts',
    {
      createHash,
      useRuntimeConfig: () => ({ public: { fireux: { id: 'misebox-app' } } }),
      getRequestURL: (event) => new URL(event.url),
      useSession: async (_, config) => {
        configs.push(config)
        return { data: {} }
      },
    },
    'checkoutBuyerSession'
  )
  await buyerSession({ url: 'http://localhost:3001' }, 'fixture-secret')
  await buyerSession({ url: 'https://misebox.app' }, 'fixture-secret')
  assert.equal(configs[0].cookie.secure, false)
  assert.equal(configs[1].cookie.secure, true)
  assert.equal(configs[1].cookie.httpOnly, true)
  assert.equal(configs[1].cookie.domain, undefined)
  assert.equal(configs[1].cookie.sameSite, 'lax')
  assert.equal(configs[1].sessionHeader, false)
  assert.equal(configs[1].maxAge, 86400)
  assert.equal(configs[1].name, 'fireux-checkout-misebox-app')
  assert.notEqual(configs[1].password, 'fixture-secret')
})

test('return page never treats a redirect, unpaid checkout or read failure as payment confirmation', async () => {
  const source = readFileSync(
    new URL('../runtime/pages/products/success.vue', import.meta.url),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import .*\n/gm, '')
  for (const fixture of [
    { data: null, expected: false },
    { data: { status: 'open', payment_status: 'paid' }, expected: false },
    { data: { status: 'complete', payment_status: 'unpaid' }, expected: false },
    { data: { status: 'complete', payment_status: 'paid' }, expected: true },
    {
      data: { status: 'complete', payment_status: 'no_payment_required' },
      expected: true,
    },
    {
      data: { status: 'complete', payment_status: 'paid' },
      error: true,
      expected: false,
    },
  ]) {
    const run = compileFunction(
      `return (async () => { ${stripTypeScriptTypes(source)}; return { confirmed: confirmed.value, message: message.value } })()`,
      ['computed', 'useRoute', 'useFetch']
    )
    const result = await run(
      (get) => ({
        get value() {
          return get()
        },
      }),
      () => ({ query: { session_id: 'cs_test_owned' } }),
      async () => ({
        data: { value: fixture.data },
        error: { value: fixture.error },
        status: { value: 'success' },
        refresh() {},
      })
    )
    assert.equal(result.confirmed, fixture.expected)
    if (fixture.expected)
      assert.match(result.message, /Delivery is a separate step/)
  }
})

function checkoutFixture({
  visibility = 'public',
  productApp = 'seller',
  priceActive = true,
  priceType = 'one_time',
  existing = [],
} = {}) {
  const captured = { sessions: [], buyer: null }
  const product = {
    source_app_id: productApp,
    slug: 'menu-express',
    active: true,
    visibility,
  }
  const handler = load(
    '../runtime/product/server/integration/stripe/checkout.ts',
    {
      defineEventHandler: (value) => value,
      createError,
      readBody: async (event) => event.body,
      getRequestURL: () => new URL('http://localhost:3001'),
      useRuntimeConfig: () => ({
        public: { fireux: { role: 'global', id: 'misebox-app' } },
      }),
      ProductStorage: { collection: 'products' },
      ProductPriceStorage: { collection: 'prices' },
      getProductsFirestore: () => ({
        doc: (path) => ({
          get: async () => ({
            exists: true,
            data: () =>
              path.includes('/prices/')
                ? { active: priceActive, type: priceType, provider: 'stripe' }
                : product,
          }),
        }),
      }),
      publicProduct: (_, raw, scope) => {
        assert.equal(scope.appId, 'misebox-app')
        return raw.visibility === 'public' ? raw : null
      },
      checkoutBuyerSession: async () => ({
        data: { checkouts: existing },
        update: async (data) => {
          captured.buyer = data
        },
      }),
      createRequire: () => () =>
        class {
          checkout = {
            sessions: {
              create: async (options) => {
                captured.sessions.push(options)
                return {
                  id: 'cs_test_new',
                  url: 'https://checkout.stripe.com/fixture',
                }
              },
            },
          }
        },
      STRIPE_API_VERSION: 'fixture',
    },
    'createProductCheckout'
  )
  return { handler: (event) => handler(event, event.body), captured }
}
const checkoutBody = {
  appId: 'seller',
  productId: 'menu-express',
  slug: 'menu-express',
  priceId: 'price_fixture',
  mode: 'payment',
}

test('checkout validates its owning Product and price before contacting Stripe or granting buyer proof', async () => {
  const previous = process.env.STRIPE_SECRET_KEY
  process.env.STRIPE_SECRET_KEY = 'fixture-only'
  try {
    for (const options of [
      { visibility: 'app' },
      { productApp: 'other' },
      { priceActive: false },
      { priceType: 'recurring' },
    ]) {
      const fixture = checkoutFixture(options)
      await assert.rejects(fixture.handler({ body: checkoutBody }), (error) =>
        [400, 404].includes(error.statusCode)
      )
      assert.equal(fixture.captured.sessions.length, 0)
      assert.equal(fixture.captured.buyer, null)
    }
  } finally {
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY
    else process.env.STRIPE_SECRET_KEY = previous
  }
})

test('checkout remembers its Stripe result with a bounded history; redirect uses the actual session placeholder', async () => {
  const previous = process.env.STRIPE_SECRET_KEY
  const previousDomain = process.env.APP_DOMAIN
  process.env.STRIPE_SECRET_KEY = 'fixture-only'
  process.env.APP_DOMAIN = 'http://localhost:3001'
  try {
    const existing = Array.from(
      { length: 15 },
      (_, index) => `cs_test_${index}`
    )
    const fixture = checkoutFixture({ existing })
    assert.equal(
      (await fixture.handler({ body: checkoutBody })).id,
      'cs_test_new'
    )
    assert.deepEqual(fixture.captured.buyer.checkouts, [
      ...existing.slice(-9),
      'cs_test_new',
    ])
    const options = fixture.captured.sessions[0]
    assert.equal(options.mode, 'payment')
    assert.match(options.success_url, /session_id=\{CHECKOUT_SESSION_ID\}/)
    assert.deepEqual(options.line_items, [
      { price: 'price_fixture', quantity: 1 },
    ])
  } finally {
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY
    else process.env.STRIPE_SECRET_KEY = previous
    if (previousDomain === undefined) delete process.env.APP_DOMAIN
    else process.env.APP_DOMAIN = previousDomain
  }
})
