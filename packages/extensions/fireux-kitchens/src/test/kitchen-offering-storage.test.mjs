import { resolveHttpDocumentOutcome } from '../../../../core/fireux-core/src/runtime/utils/http-document-outcome.ts'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  computed,
  ref,
  shallowRef,
  watch,
  unref,
  toValue,
  effectScope,
  nextTick,
} from 'vue'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'
import {
  offeringContract,
  loadOfferingContract,
  offeringReads,
  offeringHarness,
  loadOfferingSource,
} from './offering-test-helpers.mjs'
const valid = {
  name: 'Pickup',
  enabled: false,
  menu_ids: [],
  interactions: [
    {
      type: 'collection',
      enabled: false,
      slot_interval_minutes: 30,
      schedule_horizon_days: 7,
      availability: { paused: false },
      notifications: { whatsapp: { enabled: false } },
    },
  ],
}

test('child snapshot id is authoritative and valid nested settings are retained exactly', () => {
  const result = offeringContract.readKitchenOffering('pickup', valid)
  assert.deepEqual(result, { id: 'pickup', ...valid })
  assert.deepEqual(offeringContract.kitchenOfferingData(result), valid)
  assert.equal(
    offeringContract.readKitchenOffering('pickup', { ...valid, id: 'other' }),
    null
  )
})
test('saved schedules survive the Nitro browser-global replacement', () => {
  const require = createRequire(import.meta.url)
  const nitroRequire = createRequire(require.resolve('nitropack/package.json'))
  const replace = nitroRequire('@rollup/plugin-replace')
  const plugin = replace({
    preventAssignment: true,
    delimiters: [String.raw`\b`, String.raw`\b(?![\.$])`],
    values: { 'typeof window': '"undefined"' },
  })
  const compiled = loadOfferingContract(
    (source) =>
      plugin.transform.call({}, source, 'offerings.js')?.code || source
  )
  const saved = {
    ...valid,
    enabled: true,
    menu_ids: ['food'],
    hours: {
      source: 'custom',
      timezone: 'Europe/Zurich',
      windows: [{ days: ['monday', 'tuesday'], open: '00:00', close: '23:59' }],
    },
  }
  assert.deepEqual(compiled.readKitchenOffering('pickup', saved), {
    id: 'pickup',
    ...saved,
  })
  assert.equal(
    compiled.readKitchenOffering('pickup', {
      ...saved,
      hours: {
        ...saved.hours,
        windows: [{ days: ['invalid'], open: '00:00', close: '23:59' }],
      },
    }),
    null
  )
})
test('malformed child rows and nested policy reject the entire projection', () => {
  for (const changes of [
    { slot_interval_minutes: 17 },
    { schedule_horizon_days: 1.5 },
    { notice_hours: '1' },
    { availability: { paused: 'false' } },
    { fulfilment: { deposit: { type: 'percent', amount: 101 } } },
    { table_channels: { staff_pos: true, table_qr: true } },
    { unsupported: true },
  ]) {
    const bad = {
      ...valid,
      interactions: [{ ...valid.interactions[0], ...changes }],
    }
    assert.equal(offeringContract.readKitchenOffering('bad', bad), null)
    assert.throws(
      () =>
        offeringContract.readKitchenOfferingRecords([
          { id: 'good', data: valid },
          { id: 'bad', data: bad },
        ]),
      /could not be read/
    )
  }
  for (const bad of [
    { ...valid, hours: { timezone: 'bad' } },
    { ...valid, interactions: [...valid.interactions, ...valid.interactions] },
    { ...valid, menu_ids: ['a', 'a'] },
  ])
    assert.equal(offeringContract.readKitchenOffering('bad', bad), null)
})
test('only canonical children are read; absent children never revive a root array; failures propagate', async () => {
  const paths = []
  const db = {
    collection: (path) => {
      paths.push(path)
      return { get: async () => ({ docs: [] }) }
    },
    doc: () => {
      throw Error('Root read forbidden')
    },
  }
  assert.deepEqual(await offeringReads.readKitchenOfferings(db, 'k'), [])
  assert.deepEqual(paths, ['kitchens/k/offerings'])
  await assert.rejects(
    offeringReads.readKitchenOfferings(
      {
        collection: () => ({
          get: async () => {
            throw Error('Unavailable')
          },
        }),
      },
      'k'
    ),
    /Unavailable/
  )
  await assert.rejects(
    offeringReads.readKitchenOfferings(db, 'k/other'),
    /Invalid id/
  )
})
test('transaction reader includes every child beyond a page and uses stable record ordering', async () => {
  const rows = Array.from({ length: 1001 }, (_, i) => ({
    id: String(i).padStart(4, '0'),
    ...valid,
  }))
  const h = offeringHarness(rows),
    calls = []
  const values = await offeringReads.readKitchenOfferingsInTransaction(
    {
      readAll: async (target, limit, after) => {
        calls.push([target.collectionPath, limit, after])
        return h.readAll(target, limit, after)
      },
    },
    'k'
  )
  assert.equal(values.length, 1001)
  assert.deepEqual(calls, [
    ['kitchens/k/offerings', 1000, undefined],
    ['kitchens/k/offerings', 1000, '0999'],
  ])
})
function loadCore(deps) {
  const source = readFileSync(
    new URL(
      '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreRead.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.server', 'false')
  return compileFunction(
    stripTypeScriptTypes(source) + ';return useFirestoreRead',
    Object.keys(deps)
  )(...Object.values(deps))
}
function readerHarness() {
  const scope = effectScope(),
    id = ref('k'),
    uid = ref('alice'),
    appUser = ref({ created: { at: 1 } }),
    config = { appId: 'app' }
  const access = { ids: ref(['k']), outcome: ref('ready'), error: ref(null) }
  const session = { uid, appUser, pending: ref(false), error: ref(null) }
  const rows = ref([{ id: 'pickup', ...valid }]),
    bindingError = ref(),
    loading = ref(false),
    promise = ref(Promise.resolve()),
    queries = []
  let query
  const binding = Object.assign(rows, {
    error: bindingError,
    pending: loading,
    promise,
    stop() {},
  })
  const useFirestoreRead = loadCore({
    computed,
    ref,
    shallowRef,
    unref,
    watch,
    resolveReadOutcome,
    resolveHttpDocumentOutcome,
    useFirestoreResolver: () => () => ({}),
    collection: (_db, path) => ({ path }),
    fsq: (collection, ...constraints) => ({ collection, constraints }),
    useCollection: (q) => {
      query = q
      watch(q, (value) => queries.push(value), { flush: 'sync' })
      queries.push(q.value)
      return binding
    },
    guardFirestorePromise() {},
  })
  const api = scope.run(() =>
    loadOfferingSource(
      'kitchen/composables/useKitchenOfferingCollection',
      'useKitchenOfferingCollection',
      {
        computed,
        ref,
        watch,
        toValue,
        useAppSession: () => session,
        useFireUXConfig: () => config,
        useKitchenAccess: () => access,
        useFirestoreRead,
        isFirestoreDocumentId: (v) =>
          typeof v === 'string' && !!v && !v.includes('/'),
        ...offeringContract,
      }
    ).useKitchenOfferingCollection(id)
  )
  const settle = async () => {
    promise.value = Promise.resolve()
    await nextTick()
  }
  return {
    api,
    id,
    uid,
    appUser,
    config,
    access,
    session,
    rows,
    bindingError,
    loading,
    queries,
    scope,
    settle,
    get query() {
      return query.value
    },
  }
}
test('actual live binding masks old records on Kitchen and account round trips until a new read is installed', async () => {
  const h = readerHarness()
  assert.equal(h.api.outcome.value, 'ready')
  assert.equal(h.api.offerings.value.length, 1)
  h.uid.value = 'bob'
  h.uid.value = 'alice'
  assert.equal(h.api.outcome.value, 'pending')
  assert.deepEqual(h.api.offerings.value, [])
  await h.settle()
  assert.equal(h.api.outcome.value, 'ready')
  h.id.value = 'other'
  h.id.value = 'k'
  assert.equal(h.api.outcome.value, 'pending')
  assert.deepEqual(h.api.offerings.value, [])
  await h.settle()
  assert.equal(h.api.outcome.value, 'ready')
  h.scope.stop()
})
test('retained selected id cannot read after sign-out, membership loss or access revocation', async () => {
  for (const revoke of [
    (h) => (h.uid.value = ''),
    (h) => (h.appUser.value = null),
    (h) => (h.access.ids.value = []),
    (h) => (h.access.outcome.value = 'pending'),
  ]) {
    const h = readerHarness()
    revoke(h)
    assert.equal(h.query, null)
    assert.deepEqual(h.api.offerings.value, [])
    await h.settle()
    assert.deepEqual(h.api.offerings.value, [])
    h.scope.stop()
  }
})
test('authority and child failures remain errors, loading is pending, malformed and empty are distinct', async () => {
  const h = readerHarness()
  h.access.error.value = Error('Authority unavailable')
  assert.equal(h.query, null)
  assert.equal(h.api.outcome.value, 'error')
  assert.match(h.api.error.value.message, /Authority/)
  h.session.pending.value = true
  assert.equal(h.api.outcome.value, 'error')
  h.session.pending.value = false
  h.access.error.value = null
  await h.settle()
  h.loading.value = true
  assert.equal(h.api.outcome.value, 'pending')
  assert.deepEqual(h.api.offerings.value, [])
  h.loading.value = false
  h.bindingError.value = Error('Child unavailable')
  assert.equal(h.api.outcome.value, 'error')
  assert.deepEqual(h.api.offerings.value, [])
  h.bindingError.value = null
  h.rows.value = [
    {
      id: 'bad',
      ...valid,
      interactions: [
        { type: 'collection', enabled: true, slot_interval_minutes: 17 },
      ],
    },
  ]
  assert.equal(h.api.outcome.value, 'error')
  assert.deepEqual(h.api.offerings.value, [])
  h.rows.value = []
  assert.equal(h.api.outcome.value, 'empty')
  assert.deepEqual(h.api.offerings.value, [])
  h.scope.stop()
})

test('offline proposals preserve exact policy and require canonical validation before any future application', () => {
  const planner = fileURLToPath(
    new URL(
      '../../../../../tools/misebox-migrations/kitchen-offerings.py',
      import.meta.url
    )
  )
  const before = {
    identity: { slug: 'k' },
    services: [{ id: 'pickup', ...valid }],
  }
  const inventory = {
    database: 'projects/misebox-78f9c/databases/misebox',
    documents: [{ path: 'kitchens/k', data: before, update_time: 'revision' }],
  }
  const plan = JSON.parse(
    execFileSync(
      'python3',
      [
        '-c',
        'import runpy,json,sys; module=runpy.run_path(sys.argv[1]); print(json.dumps(module["build_plan"](json.load(sys.stdin))))',
        planner,
      ],
      { input: JSON.stringify(inventory), encoding: 'utf8' }
    )
  )
  const proposed = plan.entries[0].create_only_children[0]
  assert.deepEqual(plan.preimages[0].data, before)
  assert.deepEqual(
    offeringContract.readKitchenOffering('pickup', proposed.data),
    { id: 'pickup', ...valid }
  )
  assert.equal(plan.apply_supported, false)
  assert.equal(plan.target_validation_required, true)
  assert.deepEqual(plan.entries[0].root_proposal.data, {
    identity: { slug: 'k' },
  })
})

test('saved schedules and snapshot identities are canonical and cannot be normalized during a rename', () => {
  const hours = {
    source: 'custom',
    timezone: 'Europe/Zurich',
    windows: [{ days: ['monday'], open: '12:00', close: '14:00' }],
  }
  assert.deepEqual(
    offeringContract.readKitchenOffering('pickup', { ...valid, hours }).hours,
    hours
  )
  for (const value of [
    { ...hours, unknown: 'would disappear' },
    { ...hours, source: 'place' },
    {
      ...hours,
      windows: [{ ...hours.windows[0], unknown: 'would disappear' }],
    },
    {
      ...hours,
      windows: [{ ...hours.windows[0], days: ['monday', 'monday'] }],
    },
  ])
    assert.equal(
      offeringContract.readKitchenOffering('pickup', {
        ...valid,
        hours: value,
      }),
      null
    )
  assert.equal(offeringContract.readKitchenOffering(' pickup ', valid), null)
  assert.equal(
    offeringContract.readKitchenOffering('pickup', {
      ...valid,
      menu_ids: [' food '],
    }),
    null
  )
})
