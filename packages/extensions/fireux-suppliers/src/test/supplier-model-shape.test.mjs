import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'
import { normalizeSupplier } from '../runtime/supplier/utils/normalize-supplier.ts'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'
function load(file, result, deps = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export(?: type)? \{[\s\S]*?\} from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source, { mode: 'transform' })};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const stamp = { at: { seconds: 1, nanoseconds: 0 }, by: 'u' }
const root = () => ({
  id: 's',
  company_id: 'company',
  management: { mode: 'workspace' },
  identity: { slug: 's', status: 'active', visibility: true },
  catalogue: { mode: 'directory_only' },
  delivery: { areas: [' Switzerland '] },
  created: stamp,
  updated: stamp,
})
const surface = load(
  '../runtime/supplier/composables/firestore/utils/view/useSupplierInterface.ts',
  'useSupplierInterface()',
  {
    normalizeSupplier,
    SupplierStorage: { collection: 'suppliers' },
    safeString: (value) => String(value ?? ''),
    safeStringArray: (value) => (Array.isArray(value) ? value : []),
    csv: (value) => value.join(', '),
  }
)
test('Supplier has exact nested configuration with Company/Place identity and separate growing records', () => {
  const value = normalizeSupplier('s', root())
  assert.ok(value)
  assert.deepEqual(value.delivery, { areas: ['Switzerland'] })
  for (const key of [
    'slug',
    'status',
    'visibility',
    'catalogue_state',
    'delivery_areas',
    'items',
    'ingredients',
    'catalogues',
    'team',
  ])
    assert.equal(key in value, false)
  const body = root()
  delete body.id
  assert.equal(normalizeSupplier('s', body).id, 's')
  assert.equal(normalizeSupplier('other', root()), null)
  for (const bad of [
    { ...root(), status: 'active' },
    { ...root(), identity: { ...root().identity, status: ['active'] } },
    { ...root(), identity: { ...root().identity, visibility: 'true' } },
    { ...root(), identity: { ...root().identity, workflow: {} } },
    { ...root(), catalogue: { mode: 'other' } },
    { ...root(), delivery: { areas: [123] } },
    { ...root(), delivery: { areas: [''] } },
    { ...root(), company_id: { id: 'company' } },
    { ...root(), company_id: 'parent/child' },
  ])
    assert.equal(normalizeSupplier('s', bad), null)
})
test('Supplier surface composes the exact linked Place without copying it onto storage fields', () => {
  const value = surface.surface({
    supplier: root(),
    companyPlace: {
      id: 'company',
      name: 'Company',
      tagline: 'Fresh food',
      short_address: 'Bern',
    },
  })
  assert.equal(value.company_place.name, 'Company')
  assert.equal('name' in value, false)
  const card = surface.interface(value)
  assert.equal(card.to, '/suppliers/s')
  assert.equal(card.title, 'Company')
  assert.equal(card.status, 'active')
  assert.deepEqual(card.badges, ['Switzerland'])
  assert.equal(
    surface.surface({ supplier: root(), companyPlace: { id: 'other' } }),
    null
  )
  assert.equal(
    surface.surface({ supplier: { ...root(), delivery_areas: [] } }),
    null
  )
})
test('Directory uses nested eligibility, rejects malformed roots, and exact detail retains its separate eligibility policy', async () => {
  let rows = [
    root(),
    {
      ...root(),
      id: 'private',
      identity: { slug: 'private', status: 'inactive', visibility: false },
    },
  ]
  let related = []
  const readers = load(
    '../runtime/supplier/server/identity/read.ts',
    '({ readSuppliers, readSupplier })',
    {
      normalizeSupplier,
      SupplierStorage: { collection: 'suppliers' },
      createError: (value) => Object.assign(Error(value.statusMessage), value),
      requireFirestoreDocumentId: (value) => value,
      getRuntimeFirestore: () => ({
        collection: () => ({
          limit: () => ({
            get: async () => ({
              docs: rows.map((row) => ({ id: row.id, data: () => row })),
            }),
          }),
          doc: (id) => ({
            get: async () => {
              const row = rows.find((row) => row.id === id)
              return { id, exists: Boolean(row), data: () => row }
            },
          }),
        }),
      }),
      readCompanyDetail: async (id) => {
        related.push(id)
        return { company: { id }, place: { id, name: 'Company' } }
      },
    }
  )
  const directory = await readers.readSuppliers()
  assert.deepEqual(
    directory.suppliers.map((row) => row.id),
    ['s']
  )
  assert.deepEqual(related, ['company'])
  assert.equal(
    (await readers.readSupplier('private')).supplier.identity.visibility,
    false
  )
  await assert.rejects(
    readers.readSupplier('missing'),
    (error) => error.statusCode === 404
  )
  rows = [{ ...root(), catalogue: { mode: 'invalid' } }]
  await assert.rejects(
    readers.readSuppliers(),
    (error) => error.statusCode === 500
  )
  await assert.rejects(
    readers.readSupplier('s'),
    (error) => error.statusCode === 500
  )
})
test('Malformed granted Supplier roots produce a failed collection without partial or stale results', () => {
  const docs = ref([root()]),
    pending = ref(false),
    error = ref(null)
  const collection = load(
    '../runtime/supplier/composables/useSupplierCollection.ts',
    'useSupplierCollection()',
    {
      computed,
      useSupplierInterface: () => surface,
      useSupplierCollectionSelection: () => ({
        sourceMode: ref('live'),
        hasFilter: ref(true),
        filterIdSet: ref(new Set(['s', 'other'])),
        usesTargetedRootRead: ref(true),
      }),
      useFirestoreRead: () => ({
        firestoreLoadDocsByIds: () => ({ docs, pending, error }),
      }),
      useLiveAsyncData: () => ({
        data: ref(null),
        pending: ref(false),
        error: ref(null),
      }),
      DEFAULT_COLLECTION_PATH: 'suppliers',
      UNSUPPORTED_TEST_SOURCE_MESSAGE: 'Unsupported',
      resolveSupplierId: (value) => value.id,
      useFirestoreCollectionState: (options) => ({
        outcome: computed(() =>
          resolveReadOutcome({
            active: options.active.value,
            pending: options.pending.value,
            error: options.error.value,
            kind: 'collection',
            present: options.count.value > 0,
          })
        ),
      }),
    }
  )
  assert.equal(collection.outcome.value, 'ready')
  docs.value = [root(), { ...root(), id: 'other', status: 'retired shape' }]
  assert.equal(collection.outcome.value, 'error')
  assert.deepEqual(collection.suppliers.value, [])
  assert.deepEqual(collection.roots.value, [])
  assert.equal(collection.count.value, 0)
  docs.value = [root()]
  assert.equal(collection.outcome.value, 'ready')
  pending.value = true
  assert.deepEqual(collection.suppliers.value, [])
  pending.value = false
  error.value = Error('denied')
  assert.equal(collection.outcome.value, 'error')
  assert.deepEqual(collection.suppliers.value, [])
})
test('Invalid Supplier detail binding is an error instead of an endless pending Workspace', () => {
  const source = ref(root())
  source.pending = ref(false)
  source.error = ref(null)
  source.outcome = ref('ready')
  const api = load(
    '../runtime/supplier/composables/firestore/fetch/useSupplierFetch.ts',
    "useSupplierFetch('s')",
    {
      computed,
      isRef: (value) => Boolean(value?.__v_isRef),
      SupplierStorage: { collection: 'suppliers' },
      useSupplierInterface: () => surface,
      useFirestoreRead: () => ({ firestoreFetchDoc: () => source }),
    }
  )
  assert.equal(api.outcome.value, 'ready')
  source.value = { ...root(), slug: 'old-shape' }
  assert.equal(api.outcome.value, 'error')
  assert.equal(api.supplier.value, null)
  source.value = root()
  assert.equal(api.supplier.value.id, 's')
})
test('Supplier SEO uses nested publication without confusing catalogue mode with publication', () => {
  const build = load(
    '../runtime/supplier/composables/useSupplierSeo.ts',
    'buildSupplierJsonLd'
  )
  const place = { name: 'Company', tagline: 'Supply' }
  assert.equal(build(root(), place).name, 'Company')
  assert.equal(
    build(
      { ...root(), identity: { ...root().identity, visibility: false } },
      place
    ),
    null
  )
  assert.equal(
    build({ id: 's', status: 'active', visibility: true }, place),
    null
  )
})


test('Offline Supplier plan preserves old facts and produces the current canonical reader shape', () => {
  const current = root()
  const before = {
    company_id: current.company_id,
    management: current.management,
    created: current.created,
    updated: current.updated,
    ...current.identity,
    catalogue_state: current.catalogue.mode,
    delivery_areas: current.delivery.areas,
  }
  const tool = fileURLToPath(new URL('../../../../../tools/workspace-migrations/supplier-configuration.py', import.meta.url))
  const script = `import importlib.util,json,sys
spec=importlib.util.spec_from_file_location('planner',sys.argv[1])
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
print(json.dumps(m.build_plan(json.load(sys.stdin))))`
  const plan = JSON.parse(execFileSync('python3', ['-c', script, tool], {
    input: JSON.stringify({ database: 'projects/bringli-b0517/databases/bringli', documents: [{ path: 'suppliers/s', data: before }] }),
    encoding: 'utf8',
  }))
  const entry = plan.entries[0]
  assert.deepEqual(entry.preimage, before)
  assert.equal(entry.status, 'proposed')
  assert.equal('id' in entry.proposed, false)
  assert.deepEqual(normalizeSupplier('s', entry.proposed), normalizeSupplier('s', current))
  for (const count of [80, 81]) {
    const input = { ...before, delivery_areas: ['😀'.repeat(count)] }
    const planned = JSON.parse(execFileSync('python3', ['-c', script, tool], {
      input: JSON.stringify({ database: 'projects/bringli-b0517/databases/bringli', documents: [{ path: 'suppliers/s', data: input }] }), encoding: 'utf8',
    })).entries[0]
    assert.equal(planned.status, count === 80 ? 'proposed' : 'invalid')
    if (planned.proposed) assert.ok(normalizeSupplier('s', planned.proposed))
  }
  assert.equal(plan.apply_supported, false)
  assert.equal(plan.target_validation_required, true)
})
