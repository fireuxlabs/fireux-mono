import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(file, dependencies, result) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /m, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const normalizeProduct = load(
  '../runtime/product/utils/normalize-product.ts',
  {},
  'normalizeProduct'
)
const normalizeProductPrice = load(
  '../runtime/product/utils/normalize-product.ts',
  {},
  'normalizeProductPrice'
)
const publicProduct = load(
  '../runtime/product/server/read.ts',
  { normalizeProduct, normalizeProductPrice },
  'publicProduct'
)
const serializeFirestoreValue = load(
  '../runtime/product/server/read.ts',
  {},
  'serializeFirestoreValue'
)
const published = {
  name: 'Public fixture',
  active: true,
  visibility: 'public',
  source_app_id: 'app-a',
  provisioning: {
    actor_uid: 'PRIVATE',
    fingerprint: 'PRIVATE',
    request_id: 'PRIVATE',
  },
  private_secret: 'PRIVATE',
  metadata: { internal: 'PRIVATE' },
  created: {
    by: 'PRIVATE',
    app_id: 'PRIVATE',
    at: { seconds: 1, nanoseconds: 0 },
  },
  images: [{ url: 'https://example.com/image.webp', internal: 'PRIVATE' }],
  features: [{ title: 'Feature', available: true, internal: 'PRIVATE' }],
}

test('public Product DTO strips workflow, author identity and nested internal fields', () => {
  const product = publicProduct('fixture', published, {
    role: 'global',
    appId: 'global',
  })
  assert.equal(product.name, 'Public fixture')
  assert.equal(JSON.stringify(product).includes('PRIVATE'), false)
  assert.deepEqual(product.images, [
    { url: 'https://example.com/image.webp', alt: '' },
  ])
})
test('public Product scope fails closed for drafts, inactive, missing or foreign-App records', () => {
  for (const role of ['tenant', 'standalone']) {
    assert.ok(publicProduct('fixture', published, { role, appId: 'app-a' }))
    for (const appId of ['', 'app-b'])
      assert.equal(publicProduct('fixture', published, { role, appId }), null)
  }
  for (const raw of [
    null,
    { ...published, active: false },
    { ...published, visibility: 'app' },
  ]) {
    assert.equal(
      publicProduct('fixture', raw, { role: 'global', appId: 'app-a' }),
      null
    )
  }
  assert.equal(
    publicProduct('fixture', published, { role: 'unknown', appId: 'app-a' }),
    null
  )
})

test('public collection endpoint applies runtime scope and projects every returned record', async () => {
  for (const role of ['global', 'tenant', 'standalone']) {
    const constraints = [],
      headers = []
    const query = {
      where: (...args) => {
        constraints.push(args)
        return query
      },
      get: async () => ({
        docs: [
          { id: 'fixture', data: () => published },
          {
            id: 'foreign',
            data: () => ({ ...published, source_app_id: 'other' }),
          },
          { id: 'draft', data: () => ({ ...published, visibility: 'app' }) },
        ],
      }),
    }
    const handler = load(
      '../runtime/server/api/products/index.get.ts',
      {
        defineEventHandler: (value) => value,
        setResponseHeader: (...args) => headers.push(args),
        useRuntimeConfig: () => ({ public: { fireux: { role, id: 'app-a' } } }),
        getProductsFirestore: () => ({
          collection: (name) => {
            assert.equal(name, 'products')
            return query
          },
        }),
        publicProduct,
        serializeFirestoreValue,
      },
      'handler'
    )
    const result = await handler({})
    assert.equal(result.length, role === 'global' ? 2 : 1)
    assert.equal(JSON.stringify(result).includes('PRIVATE'), false)
    assert.deepEqual(constraints.slice(0, 2), [
      ['visibility', '==', 'public'],
      ['active', '==', true],
    ])
    assert.equal(
      constraints.some(([field]) => field === 'source_app_id'),
      role !== 'global'
    )
    assert.ok(
      headers.some(
        ([, key, value]) => key === 'Cache-Control' && value === 'no-store'
      )
    )
  }
})

test('public prices exclude inactive records, metadata and audit identity', () => {
  const project = load(
    '../runtime/product/server/read.ts',
    { normalizeProduct, normalizeProductPrice },
    'publicProductPrice'
  )
  const raw = {
    currency: 'CHF',
    unit_amount: 1000,
    metadata: { secret: 'PRIVATE' },
    created: { by: 'PRIVATE' },
  }
  assert.equal(
    JSON.stringify(project('product', 'price', raw)).includes('PRIVATE'),
    false
  )
  assert.equal(project('product', 'price', { ...raw, active: false }), null)
})
