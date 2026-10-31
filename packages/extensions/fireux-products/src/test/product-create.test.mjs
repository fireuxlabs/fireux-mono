import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createHash } from 'node:crypto'
function load(file, deps, name) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.url', JSON.stringify(import.meta.url))
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${name}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const createError = (x) => Object.assign(Error(x.statusMessage), x)
const requireFirestoreDocumentId = (x) => {
  if (typeof x !== 'string' || !x || x.includes('/')) throw Error('Invalid id')
  return x
}
const readProductCreateInput = load(
  '../runtime/product/server/create/input.ts',
  {
    createError,
    validatePublicSlug: (x) => ({
      isValid: typeof x === 'string' && /^[a-z0-9-]+$/.test(x),
      slug: x,
    }),
  },
  'readProductCreateInput'
)
const requireProductManager = load(
  '../runtime/product/server/create/authority.ts',
  {
    createError,
    isAdminMembership: (data) => ['admin', 'dev'].includes(data?.role),
  },
  'requireProductManager'
)
const request = {
  requestId: 'request-1',
  payload: {
    name: 'Service',
    slug: 'service',
    visibility: 'public',
    source_app_id: 'app',
  },
  priceInputs: [
    { currency: 'CHF', unit_amount: 1000 },
    {
      currency: 'CHF',
      unit_amount: 1500,
      type: 'recurring',
      interval: 'month',
    },
  ],
}
function harness({ authenticated = true } = {}) {
  const records = new Map([['apps/app/users/u', { role: 'admin' }]]),
    calls = [],
    effects = new Map()
  let now = 100,
    fail = '',
    before = () => {},
    afterProvider = () => {}
  const providerCall = async (kind, existing, key) => {
    calls.push([kind, existing, key])
    if (existing) return existing
    const id = effects.get(key) || `${kind}-${effects.size}`
    effects.set(key, id)
    afterProvider()
    if (fail === kind) throw Error('Provider uncertain')
    return id
  }
  const create = load(
    '../runtime/product/server/create/command.ts',
    {
      createHash,
      createError,
      requireFirestoreDocumentId,
      readProductCreateInput,
      requireProductManager,
      useFireUXConfig: () => ({ appId: 'app' }),
      requireFirebaseBearerUser: async () => {
        if (!authenticated)
          throw createError({
            statusCode: 401,
            statusMessage: 'Sign in is required.',
          })
        return { uid: 'u' }
      },
      defineFirestoreMutationTarget: (x) => x.collectionPath,
      serverAppUsersTarget: (app) => `apps/${app}/users`,
      serverAuditStamp: (x) => ({ ...x, at: 'server' }),
      Date: { now: () => now },
      productProvisionProvider: () => ({
        product: (_p, _f, key, id) => providerCall('product', id, key),
        price: (_p, _v, _f, key, id) => providerCall('price', id, key),
      }),
      runGuardedServerTransaction: async (_, run) => {
        before()
        const staged = []
        const result = await run({
          read: async (t, id) => ({
            exists: records.has(`${t}/${id}`),
            data: structuredClone(records.get(`${t}/${id}`)),
          }),
          create: (t, id, data) => {
            if (records.has(`${t}/${id}`)) throw Error('exists')
            staged.push([`${t}/${id}`, data])
          },
          update: (t, id, data) => {
            if (!records.has(`${t}/${id}`)) throw Error('empty')
            staged.push([
              `${t}/${id}`,
              { ...records.get(`${t}/${id}`), ...data },
            ])
          },
        })
        if (
          fail === 'final' &&
          staged.some(([, data]) => data.provisioning?.complete)
        )
          throw Error('Commit failed')
        for (const [key, data] of staged)
          records.set(key, structuredClone(data))
        return result
      },
    },
    'createInteractiveProduct'
  )
  return {
    create,
    records,
    calls,
    effects,
    fail: (value) => (fail = value),
    advance: (ms) => (now += ms),
    before: (fn) => (before = fn),
    afterProvider: (fn) => (afterProvider = fn),
  }
}
test('Interactive Product owns current App and final catalogue+prices together, preserving defaults', async () => {
  const h = harness()
  await h.create({}, request)
  const product = h.records.get('products/service')
  assert.equal(product.source_app_id, 'app')
  assert.equal(product.visibility, 'public')
  assert.equal(product.active, true)
  assert.equal(product.provisioning.complete, true)
  const prices = [...h.records]
    .filter(([key]) => key.includes('/prices/'))
    .map(([, v]) => v)
  assert.equal(prices.length, 2)
  assert.equal(prices[1].default, true)
  assert.ok(h.records.has('products/service/prices/price-1'))
  assert.equal(prices[0].product_id, 'service')
  assert.equal(prices[0].provider_price_id, 'price-1')
  assert.equal(prices[0].type, 'one_time')
  assert.equal(prices[0].billing_scheme, 'per_unit')
  assert.equal(prices[0].currency, 'chf')
  assert.deepEqual(prices[0].created, { by: 'u', appId: 'app', at: 'server' })
  assert.deepEqual(prices[0].updated, prices[0].created)
  const count = h.calls.length
  await h.create({}, request)
  assert.equal(h.calls.length, count)
})
test('Failed provider and final transaction remain inactive and retry without duplicate provider effects', async () => {
  for (const stage of ['product', 'price', 'final']) {
    const h = harness()
    h.fail(stage)
    await assert.rejects(h.create({}, request))
    const reservation = h.records.get('products/service')
    assert.equal(reservation.active, false)
    assert.equal(reservation.visibility, 'app')
    assert.equal(
      [...h.records.keys()].some((x) => x.includes('/prices/')),
      false
    )
    const existingEffects = h.effects.size
    h.fail('')
    await h.create({}, request)
    assert.equal(h.effects.size, 3)
    assert.ok(existingEffects > 0)
    assert.equal(h.records.get('products/service').provisioning.complete, true)
  }
})
test('Expired unknown provider outcome stops before a new provider call; saved provider IDs remain recoverable', async () => {
  const h = harness()
  h.fail('product')
  await assert.rejects(h.create({}, request))
  const count = h.calls.length
  h.advance(24 * 60 * 60 * 1000)
  h.fail('')
  await assert.rejects(h.create({}, request), /retry window has expired/)
  assert.equal(h.calls.length, count)
  const saved = harness()
  saved.fail('final')
  await assert.rejects(saved.create({}, request))
  saved.advance(48 * 60 * 60 * 1000)
  saved.fail('')
  await saved.create({}, request)
  assert.equal(saved.effects.size, 3)
})
test('Current authority is checked before provision and after provider response, including flag policy', async () => {
  for (const role of ['admin', 'dev', 'flag']) {
    const h = harness()
    h.records.set(
      'apps/app/users/u',
      role === 'flag' ? { role: 'user', canManageProducts: true } : { role }
    )
    await h.create({}, request)
  }
  for (const late of [false, true]) {
    const h = harness()
    late
      ? h.afterProvider(() => h.records.delete('apps/app/users/u'))
      : h.records.set('apps/app/users/u', { role: 'user' })
    await assert.rejects(h.create({}, request), { statusCode: 403 })
    assert.notEqual(
      h.records.get('products/service')?.provisioning.complete,
      true
    )
    if (!late) assert.equal(h.calls.length, 0)
  }
})
test('Payload/owner/request conflict cannot overwrite reservation or another Product', async () => {
  const h = harness()
  h.fail('product')
  await assert.rejects(h.create({}, request))
  for (const changed of [
    { ...request, requestId: 'other' },
    { ...request, payload: { ...request.payload, name: 'Other' } },
    { ...request, payload: { ...request.payload, source_app_id: 'foreign' } },
  ])
    await assert.rejects(h.create({}, changed))
  const existing = harness()
  existing.records.set('products/service', { name: 'Existing' })
  await assert.rejects(existing.create({}, request), { statusCode: 409 })
  assert.equal(existing.calls.length, 0)
})
test('Creation body allowlist validates fields, prices and preserves zero price', () => {
  for (const value of [
    { ...request, extra: true },
    { ...request, payload: { ...request.payload, created: {} } },
    { ...request, payload: { ...request.payload, active: 'yes' } },
    { ...request, priceInputs: [{ currency: 'chf', unit_amount: -1 }] },
    {
      ...request,
      priceInputs: [
        { currency: 'chf', unit_amount: 1, type: 'recurring', interval: 'bad' },
      ],
    },
  ])
    assert.throws(() => readProductCreateInput(value, 'app'), {
      statusCode: 400,
    })
  assert.equal(
    readProductCreateInput(
      { ...request, priceInputs: [{ currency: 'CHF', unit_amount: 0 }] },
      'app'
    ).prices[0].unit_amount,
    0
  )
})
test('Provider sends stable keys and verifies stored IDs against owned metadata', async () => {
  const STRIPE_API_VERSION = load(
    '../runtime/product/server/integration/stripe/version.ts',
    {},
    'STRIPE_API_VERSION'
  )
  const providerSource = readFileSync(
    new URL('../runtime/product/server/create/provider.ts', import.meta.url),
    'utf8'
  )
  assert.match(
    providerSource,
    /import \{ STRIPE_API_VERSION \} from '\.\.\/integration\/stripe\/version'/
  )
  const calls = []
  class Stripe {
    constructor(_secret, opts) {
      assert.equal(opts.apiVersion, STRIPE_API_VERSION)
      this.products = {
        create: async (body, opts) => {
          calls.push([body, opts])
          return { id: 'prod', metadata: body.metadata }
        },
        retrieve: async () => ({
          id: 'prod',
          metadata: { fireux_create: 'hash' },
        }),
      }
      this.prices = {
        create: async (body, opts) => {
          calls.push([body, opts])
          return { id: 'price', product: body.product, metadata: body.metadata }
        },
        retrieve: async () => ({
          id: 'price',
          product: 'foreign',
          metadata: { fireux_create: 'hash' },
        }),
      }
    }
  }
  const provider = load(
    '../runtime/product/server/create/provider.ts',
    {
      createError,
      STRIPE_API_VERSION,
      createRequire: () => () => Stripe,
      process: { env: { STRIPE_SECRET_KEY: 'mock' } },
    },
    'productProvisionProvider'
  )()
  await provider.product(
    { name: 'Name', description: '', source_app_id: 'app', slug: 'slug' },
    'hash',
    'key'
  )
  await provider.price(
    'prod',
    {
      currency: 'chf',
      unit_amount: 100,
      type: 'one_time',
      metadata: { label: 'Base' },
    },
    'hash',
    'pricekey'
  )
  assert.equal(calls[0][1].idempotencyKey, 'key')
  assert.equal(calls[1][0].metadata.label, 'Base')
  await assert.rejects(
    provider.price('prod', {}, 'hash', 'key', 'price'),
    /ownership/
  )
  assert.equal(await provider.product({}, 'hash', 'key', 'prod'), 'prod')
})

test('Price creation rejects unauthenticated authors before writes or provider calls', async () => {
  const h = harness({ authenticated: false })
  await assert.rejects(h.create({}, request), { statusCode: 401 })
  assert.equal(h.calls.length, 0)
  assert.equal(h.effects.size, 0)
  assert.equal(h.records.has('products/service'), false)
})

test('Catalogue-only Product creates without contacting the payment provider and remains idempotent', async () => {
  const h = harness()
  const catalogue = { ...request, priceInputs: [] }
  await h.create({}, catalogue)
  assert.equal(h.calls.length, 0)
  assert.equal(h.effects.size, 0)
  const product = h.records.get('products/service')
  assert.equal(product.active, true)
  assert.equal(product.visibility, 'public')
  assert.equal(product.provisioning.complete, true)
  await h.create({}, catalogue)
  assert.equal(h.records.size, 2)
  assert.equal(h.calls.length, 0)
  await assert.rejects(h.create({}, { ...catalogue, requestId: 'other' }), {
    statusCode: 409,
  })
})
