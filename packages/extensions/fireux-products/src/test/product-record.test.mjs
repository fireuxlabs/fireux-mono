import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, shallowRef, toValue, reactive } from 'vue'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'
import {
  normalizeProduct,
  normalizeProductPrice,
  joinProductRead,
} from '../runtime/product/utils/normalize-product.ts'
function load(path, names, deps) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const where = (field, operator, value) => ({ field, operator, value })
const { productReadConstraints } = load(
  '../runtime/product/utils/product-read-constraints.ts',
  'productReadConstraints',
  { where }
)
const row = (id, extra = {}) => ({
  id,
  slug: id,
  product_type: 'module',
  visibility: 'public',
  active: true,
  source_app_id: 'app-a',
  name: id,
  ...extra,
})
function fixture() {
  const id = ref('chosen-slug'),
    uid = ref('user'),
    config = reactive({ appId: 'app-a', role: 'global', isTenant: false }),
    membership = {
      appUser: ref({ role: 'user' }),
      pending: ref(false),
      error: ref(null),
    }
  const rows = ref([
    row('chosen', { slug: 'chosen-slug' }),
    row('other'),
    row('hidden', { visibility: 'app' }),
    row('not-module', { product_type: 'service' }),
  ])
  const prices = ref([
      { id: 'price', currency: 'chf', unit_amount: 1000, default: true },
    ]),
    failure = ref(null),
    priceFailure = ref(null),
    bound = shallowRef(null)
  let q, pricePath
  const calls = []
  const match = (item, filter) =>
    filter.and
      ? filter.and.every((x) => match(item, x))
      : filter.or
        ? filter.or.some((x) => match(item, x))
        : item[filter.field === '__name__' ? 'id' : filter.field] ===
          filter.value
  const deps = {
    computed,
    toValue,
    resolveReadOutcome,
    normalizeProduct,
    normalizeProductPrice,
    joinProductRead,
    productReadConstraints,
    where,
    documentId: () => '__name__',
    and: (...and) => ({ and }),
    or: (...or) => ({ or }),
    limit: (n) => ({ limit: n }),
    collection: () => 'products',
    query: (path, ...filters) => ({ path, filters }),
    useFireUXConfig: () => config,
    useAuth: () => ({ uid }),
    useAppUserRead: () => membership,
    useFirestore: () => ({}),
    ProductStorage: { collection: 'products' },
    ProductPriceStorage: { collection: 'prices' },
    useFirestoreRead: () => ({
      firestoreQuery: (query) => {
        q = query
        bound.value = q.value
        calls.push('product')
        const pending = computed(() => q.value !== bound.value)
        return Object.assign(
          computed(() =>
            !q.value || pending.value || failure.value
              ? undefined
              : rows.value
                  .filter((item) => match(item, q.value.filters[0]))
                  .slice(0, q.value.filters[1].limit)
          ),
          { pending, error: failure }
        )
      },
      firestoreFetchCollection: (path) => {
        pricePath = path
        calls.push('prices')
        return Object.assign(
          computed(() => (path.value ? prices.value : undefined)),
          { pending: ref(false), error: priceFailure }
        )
      },
    }),
  }
  const { useProductRecord } = load(
    '../runtime/product/composables/useProductRecord.ts',
    'useProductRecord',
    deps
  )
  const state = useProductRecord(id, { productType: 'module' })
  return {
    state,
    id,
    uid,
    config,
    membership,
    rows,
    prices,
    failure,
    priceFailure,
    calls,
    settle: () => {
      bound.value = q.value
    },
    get pricePath() {
      return pricePath.value
    },
    get query() {
      return q.value
    },
  }
}
test('module lookup reads one matching ID or slug and only its prices, with live changes', () => {
  const f = fixture()
  assert.equal(f.state.read.value.product.id, 'chosen')
  assert.equal(f.pricePath, 'products/chosen/prices')
  assert.deepEqual(f.calls, ['product', 'prices'])
  assert.equal(f.query.filters[1].limit, 2)
  f.prices.value[0].unit_amount = 1500
  assert.equal(f.state.read.value.defaultPrice.unit_amount, 1500)
  f.id.value = 'other'
  assert.equal(f.state.read.value, null)
  assert.equal(f.pricePath, '')
  f.settle()
  assert.equal(f.pricePath, 'products/other/prices')
  f.id.value = 'not-module'
  f.settle()
  assert.equal(f.state.outcome.value, 'missing')
  assert.equal(f.pricePath, '')
})
test('existing public, tenant/standalone and admin-owned Product scope is preserved', () => {
  const f = fixture()
  f.id.value = 'hidden'
  f.settle()
  assert.equal(f.state.read.value, null)
  f.membership.appUser.value.role = 'admin'
  f.settle()
  assert.equal(f.state.read.value.product.id, 'hidden')
  f.config.appId = 'app-b'
  f.settle()
  assert.equal(f.state.outcome.value, 'missing')
  f.membership.appUser.value.role = 'user'
  f.id.value = 'chosen'
  f.settle()
  assert.equal(f.state.outcome.value, 'ready')
  f.config.role = 'standalone'
  f.settle()
  assert.equal(f.state.outcome.value, 'missing')
  f.config.appId = 'app-a'
  f.config.role = 'tenant'
  f.config.isTenant = true
  f.settle()
  assert.equal(f.state.outcome.value, 'ready')
  f.uid.value = 'another-user'
  assert.equal(f.state.read.value, null)
})
test('ambiguous locators, deletion and Product/price failures do not show stale module data', () => {
  const f = fixture()
  f.rows.value.push(row('duplicate', { slug: 'chosen-slug' }))
  assert.equal(f.state.outcome.value, 'error')
  assert.equal(f.pricePath, '')
  f.rows.value.pop()
  f.failure.value = new Error('Denied')
  assert.equal(f.state.read.value, null)
  f.failure.value = null
  f.priceFailure.value = new Error('Prices failed')
  assert.equal(f.state.outcome.value, 'error')
  assert.equal(f.state.read.value, null)
  f.priceFailure.value = null
  f.rows.value = []
  assert.equal(f.state.outcome.value, 'missing')
})
