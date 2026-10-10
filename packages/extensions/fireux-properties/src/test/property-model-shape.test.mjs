import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  computed,
  ref,
  watch,
  effectScope,
  nextTick,
  toValue,
  onScopeDispose,
} from 'vue'
function load(file, result, deps = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type \{[\s\S]*?\} from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source, { mode: 'transform' })};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const isFirestoreDocumentId = load(
  '../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts',
  'isFirestoreDocumentId'
)
const readFireuxEntityManagement = load(
  '../../../../core/fireux-core/src/runtime/utils/entity-management.ts',
  'readFireuxEntityManagement'
)
const model = load(
  '../runtime/property/models/property.model.ts',
  '({PropertyModel,PropertyManualModel})',
  {
    defineFireuxEntity: (value) => value,
    FireuxEntityManagementDefaults: { mode: 'root' },
  }
)
const canonicalPropertyRoot = load(
  '../runtime/property/utils/normalize-property.ts',
  'canonicalPropertyRoot',
  { readFireuxEntityManagement, isFirestoreDocumentId }
)
const usePropertyInterface = load(
  '../runtime/property/composables/firestore/utils/view/usePropertyInterface.ts',
  'usePropertyInterface',
  {
    PropertyManualModel: model.PropertyManualModel,
    PropertyStorage: { rootCollection: 'properties' },
    canonicalPropertyRoot,
  }
)
const build = load(
  '../runtime/property/utils/property-create.ts',
  'buildPropertyCreateRoot',
  {
    normalizeSlug: (value) => value.toLowerCase().replace(/\s+/g, '-'),
    readFireuxEntityManagement,
    isFirestoreDocumentId,
  }
)
const stamp = { at: { seconds: 1, nanoseconds: 0 }, by: 'u' }
const root = () => ({
  ...model.PropertyModel,
  id: 'p',
  place_id: 'place',
  identity: { ...model.PropertyModel.identity, name: 'Home', slug: 'home' },
  created: { ...stamp, app_id: 'app' },
  updated: stamp,
})
test('Property identity is a complete nested contract without a valuation prerequisite', () => {
  const value = canonicalPropertyRoot(root())
  assert.equal(value.identity.slug, 'home')
  assert.equal(value.identity.status, 'active')
  assert.equal(value.identity.publication_state, 'draft')
  assert.equal(value.valuation, undefined)
  for (const key of ['slug', 'status', 'publication_state'])
    assert.equal(key in value, false)
  const old = root()
  old.slug = 'home'
  assert.equal(canonicalPropertyRoot(old), null)
  const oldPrice = root()
  oldPrice.identity.estimated_value = 100
  assert.equal(canonicalPropertyRoot(oldPrice), null)
})
test('Optional valuation retains explicit facts without default currency or leakage into identity cards', () => {
  const value = root()
  value.valuation = { estimated_value: 0, currency_code: ' chf ' }
  const parsed = canonicalPropertyRoot(value)
  assert.deepEqual(parsed.valuation, {
    estimated_value: 0,
    currency_code: 'CHF',
  })
  const card = usePropertyInterface().interface(parsed)
  assert.equal(card.to, '/properties/home')
  assert.ok(!card.meta.includes('CHF'))
  for (const valuation of [
    { estimated_value: null, currency_code: '' },
    { estimated_value: 100, currency_code: 'CHF' },
  ])
    assert.ok(canonicalPropertyRoot({ ...root(), valuation }))
  for (const valuation of [
    { estimated_value: -1, currency_code: 'CHF' },
    { estimated_value: 100, currency_code: '' },
    { estimated_value: NaN, currency_code: 'CHF' },
    { estimated_value: 1, currency_code: 'EURO' },
  ])
    assert.equal(canonicalPropertyRoot({ ...root(), valuation }), null)
})
test('Creation writes nested draft identity and relationships, with no invented financial facts', () => {
  const plan = build({
    place_id: 'venue',
    portfolio_id: 'portfolio',
    identity: { name: ' Home ', unit_count: 3 },
  })
  assert.equal(plan.id, 'home')
  assert.deepEqual(plan.payload.identity, {
    name: 'Home',
    image_url: '',
    property_type: 'residential',
    unit_count: 3,
    slug: 'home',
    status: 'active',
    publication_state: 'draft',
  })
  assert.equal(plan.payload.portfolio_id, 'portfolio')
  assert.equal(plan.payload.valuation, undefined)
  assert.ok(
    canonicalPropertyRoot({
      ...plan.payload,
      id: plan.id,
      created: stamp,
      updated: stamp,
    })
  )
  for (const identity of [
    { name: 'Home', estimated_value: 0 },
    { name: 'Home', publication_state: 'published' },
    { name: 'Home', unit_count: -1 },
    { name: 1 },
    { name: 'Home', status: 'other' },
  ])
    assert.throws(() => build({ place_id: 'venue', identity }))
})

test('Property readers and creation reject coercible enums and invalid relationship IDs', () => {
  for (const key of ['status', 'property_type', 'publication_state']) {
    const value = root()
    value.identity[key] = [value.identity[key]]
    assert.equal(canonicalPropertyRoot(value), null, key)
  }
  for (const key of ['id', 'place_id', 'portfolio_id']) {
    for (const invalid of [
      { id: 'p' },
      ['p'],
      123,
      'parent/child',
      '..',
      '__private__',
    ]) {
      assert.throws(
        () =>
          build({
            place_id: 'venue',
            identity: { name: 'Home' },
            [key]: invalid,
          }),
        key
      )
      assert.equal(
        canonicalPropertyRoot({ ...root(), [key]: invalid }),
        null,
        key
      )
    }
  }
  assert.throws(() =>
    build({ place_id: 'venue', identity: { name: 'Home' }, slug: 'retired' })
  )
})
test('Malformed granted Property roots fail the selector without clearing its selection or exposing partial results', async () => {
  const source = ref([root()])
  source.pending = ref(false)
  source.error = ref(null)
  const ids = ref(new Set(['p', 'other']))
  const resolveReadOutcome = load(
    '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts',
    'resolveReadOutcome'
  )
  const collection = load(
    '../runtime/property/composables/usePropertyCollection.ts',
    'usePropertyCollection',
    {
      computed,
      useTargetCollectionSelection: () => ({
        sourceMode: ref('live'),
        hasFilter: ref(true),
        filterIdSet: ids,
        hasOperatorFilter: ref(false),
      }),
      useFirestoreRead: () => ({
        firestoreFetchCollection: () => source,
        firestoreLoadDocsByIds: () => ({
          docs: source,
          pending: source.pending,
          error: source.error,
        }),
      }),
      canonicalPropertyRoot: canonicalPropertyRoot,
      resolvePropertyId: (value) =>
        typeof value.id === 'string' ? value.id.trim() : '',
      DEFAULT_COLLECTION_PATH: 'properties',
      UNSUPPORTED_TEST_SOURCE_MESSAGE: 'Unsupported',
      useFirestoreCollectionState: (options) => ({
        outcome: computed(() =>
          resolveReadOutcome({
            active: true,
            pending: toValue(options.pending),
            error: toValue(options.error),
            kind: 'collection',
            present: toValue(options.count) > 0,
          })
        ),
      }),
    }
  )()
  const states = new Map(),
    cookies = new Map()
  const get = (map, key, init) => {
    if (!map.has(key)) map.set(key, ref(init()))
    return map.get(key)
  }
  const workspace = load(
    '../../../../core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspace.ts',
    'useWorkspace',
    {
      computed,
      useCookie: (key, options) => get(cookies, key, options.default),
      useState: (key, init) => get(states, key, init),
      useFireUXConfig: () => ({ appId: 'app' }),
      normalizeString: (value) => String(value ?? '').trim(),
    }
  )('property')
  workspace.select('p')
  const scope = effectScope()
  const index = scope.run(() =>
    load(
      '../runtime/property/composables/workspace/usePropertyWorkspaceIndex.ts',
      'usePropertyWorkspaceIndex',
      {
        computed,
        watch,
        useWorkspace: () => workspace,
        useAppSession: () => ({
          uid: ref('u'),
          appUser: ref({ role: 'user' }),
        }),
        useFireUXConfig: () => ({ appId: 'app' }),
        useState: (key, init) => get(states, key, init),
        useCommandScope: load(
          '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
          'useCommandScope',
          { watch, onScopeDispose }
        ),
        usePropertyCollection: () => collection,
        usePropertyAccess: () => ({
          ids: computed(() => [...ids.value]),
          outcome: ref('ready'),
        }),
        useRoute: () => ({ matched: [] }),
        useRouter: () => ({ getRoutes: () => [] }),
        propertyWorkspaceSwitchPath: () => undefined,
        navigateTo: () => {
          throw Error('unexpected navigation')
        },
      }
    )()
  )
  assert.equal(index.outcome.value, 'ready')
  source.value = [
    { ...root(), id: 'other' },
    { ...root(), slug: 'legacy' },
  ]
  await nextTick()
  assert.equal(index.outcome.value, 'error')
  assert.equal(index.selectedId.value, 'p')
  assert.equal(collection.count.value, 0)
  assert.deepEqual(index.collection.value, [])
  assert.match(collection.error.value.message, /invalid Property root/)
  source.value = [root()]
  await nextTick()
  assert.equal(index.outcome.value, 'ready')
  assert.equal(index.selectedId.value, 'p')
  source.pending.value = true
  assert.deepEqual(index.collection.value, [])
  scope.stop()
})

test('Offline conversion proposals validate against the current Property reader and retain preimages', () => {
  const before = root()
  before.slug = before.identity.slug
  before.status = before.identity.status
  before.publication_state = before.identity.publication_state
  delete before.identity.slug
  delete before.identity.status
  delete before.identity.publication_state
  before.identity.estimated_value = 100
  before.identity.estimated_value_currency = 'CHF'
  delete before.id // Stored creation bodies obtain their identity from the document path.
  const tool = fileURLToPath(
    new URL(
      '../../../../../tools/workspace-migrations/property-identity.py',
      import.meta.url
    )
  )
  const script = `import importlib.util,json,sys
spec=importlib.util.spec_from_file_location('planner',sys.argv[1])
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
print(json.dumps(m.build_plan(json.load(sys.stdin))))`
  const plan = JSON.parse(
    execFileSync('python3', ['-c', script, tool], {
      input: JSON.stringify({
        database: 'projects/buenohost-ecosystem/databases/buenohost',
        documents: [{ path: 'properties/p', data: before }],
      }),
      encoding: 'utf8',
    })
  )
  assert.deepEqual(plan.entries[0].preimage, before)
  assert.equal(plan.entries[0].status, 'proposed')
  assert.ok(
    canonicalPropertyRoot({
      ...plan.entries[0].proposed,
      id: plan.entries[0].path.split('/')[1],
    })
  )
  assert.equal(plan.apply_supported, false)
})
