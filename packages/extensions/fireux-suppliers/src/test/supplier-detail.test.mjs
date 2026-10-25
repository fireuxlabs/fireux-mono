import { resolveHttpDocumentOutcome } from '../../../../core/fireux-core/src/runtime/utils/http-document-outcome.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, unref, reactive } from 'vue'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'

function fixture() {
  const id = ref('supplier-a'),
    config = reactive({ appId: 'bringli' })
  const state = {
    data: ref(null),
    pending: ref(true),
    error: ref(null),
    refresh: () => {},
    then: (fn) => Promise.resolve().then(fn),
  }
  let handler,
    calls = 0
  const source = readFileSync(
    new URL(
      '../runtime/supplier/composables/useSupplierDetail.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  const useSupplierDetail = compileFunction(
    `${stripTypeScriptTypes(source)}; return useSupplierDetail`,
    [
      'computed',
      'unref',
      'useFireUXConfig',
      'useLiveAsyncData',
      'resolveReadOutcome',
      'resolveHttpDocumentOutcome',
    ]
  )(
    computed,
    unref,
    () => config,
    (_key, read) => {
      handler = read
      calls++
      return state
    },
    resolveReadOutcome,
    resolveHttpDocumentOutcome
  )
  const detail = useSupplierDetail(id)
  const load = async (payload) => {
    state.data.value = await handler(async (url) => {
      assert.equal(url, `/api/suppliers/${encodeURIComponent(id.value.trim())}`)
      return payload
    })
    state.pending.value = false
    state.error.value = null
  }
  return {
    id,
    config,
    state,
    detail,
    load,
    get calls() {
      return calls
    },
  }
}
const payload = (id, extra = {}) => ({
  supplier: { id, identity: { status: 'active', visibility: true, ...extra } },
  company: { id: `${id}-company` },
  place: { id: `${id}-place` },
})

test('one server projection follows live identity and clears all parts on navigation and App scope change', async () => {
  const f = fixture()
  await f.load(payload('supplier-a'))
  assert.equal(f.detail.supplier.value.id, 'supplier-a')
  f.id.value = 'supplier-b'
  assert.equal(f.detail.outcome.value, 'pending')
  for (const name of ['supplier', 'company', 'place'])
    assert.equal(f.detail[name].value, null)
  await f.load(payload('supplier-b'))
  assert.equal(f.detail.place.value.id, 'supplier-b-place')
  f.state.data.value.supplier.identity.slug = 'Live change'
  assert.equal(f.detail.supplier.value.identity.slug, 'Live change')
  f.config.appId = 'another-app'
  assert.equal(f.detail.supplier.value, null)
  await f.load(payload('supplier-b'))
  assert.equal(f.detail.outcome.value, 'ready')
  assert.equal(f.calls, 1)
})

test('deletion, denied and failed reads never retain last-good Supplier or Place and recover live', async () => {
  const f = fixture()
  await f.load(payload('supplier-a'))
  for (const statusCode of [404, 403, 503]) {
    f.state.error.value = { statusCode }
    f.state.pending.value = false
    assert.equal(f.detail.outcome.value, statusCode === 404 ? 'empty' : 'error')
    for (const name of ['supplier', 'company', 'place'])
      assert.equal(f.detail[name].value, null)
    f.state.error.value = null
    assert.equal(f.detail.outcome.value, 'ready')
  }
  f.state.data.value = null
  assert.equal(f.detail.outcome.value, 'empty')
  await f.load(payload('supplier-a'))
  assert.equal(f.detail.outcome.value, 'ready')
})

test('detail keeps the current server eligibility contract, without imposing directory visibility', async () => {
  const f = fixture()
  await f.load(payload('supplier-a', { visibility: false, status: 'inactive' }))
  assert.equal(f.detail.outcome.value, 'ready')
  assert.equal(f.detail.supplier.value.identity.visibility, false)
})

test('detail preserves case-sensitive document identity and rejects a differently cased response', async () => {
  const f = fixture()
  f.id.value = '  Supplier-A  '
  await f.load(payload('Supplier-A'))
  assert.equal(f.detail.outcome.value, 'ready')
  assert.equal(f.detail.supplier.value.id, 'Supplier-A')
  await f.load(payload('supplier-a'))
  assert.equal(f.detail.outcome.value, 'empty')
  for (const name of ['supplier', 'company', 'place'])
    assert.equal(f.detail[name].value, null)
})
