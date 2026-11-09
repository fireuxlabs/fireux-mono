import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'
import { resolveHttpDocumentOutcome } from '../../../../core/fireux-core/src/runtime/utils/http-document-outcome.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction as compileNative } from 'node:vm'
let currentReadFetch
const compileFunction = (source, args = []) => {
  const mocks = {
    $fetch: { create: () => currentReadFetch },
    setResponseHeader: () => {},
  }
  const names = Object.keys(mocks).filter((name) => !args.includes(name))
  return compileNative(source, [...names, ...args]).bind(
    null,
    ...names.map((name) => mocks[name])
  )
}
import { computed, ref, toValue } from 'vue'

function load(path, dependencies, result) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

test('Place Kitchen lookup stays scoped, uses public reads and hides stale or failed data', async () => {
  let fetcher
  const state = {
    data: ref([]),
    pending: ref(false),
    error: ref(null),
    refresh: async () => {},
    then: () => Promise.resolve(),
  }
  const useCollection = load(
    '../runtime/kitchen/composables/useKitchens.ts',
    {
      computed,
      toValue,
      useAsyncData: (_key, read) => {
        fetcher = read
        return state
      },
      resolveReadOutcome: ({ active, pending, error, present }) =>
        !active
          ? 'idle'
          : error
            ? 'error'
            : pending
              ? 'pending'
              : present
                ? 'ready'
                : 'empty',
      resolveHttpDocumentOutcome,
    },
    'useKitchens'
  )
  const placeId = ref('CaseSensitivePlace')
  const collection = useCollection({ placeId })
  let endpoint
  await ((currentReadFetch = async (url) => {
    endpoint = url
    return []
  }),
  fetcher({}, { signal: new AbortController().signal }))
  assert.equal(endpoint, '/api/kitchens?placeId=CaseSensitivePlace')
  state.data.value = [{ id: 'CaseSensitivePlace' }, { id: 'unrelated' }]
  assert.deepEqual(
    collection.collection.value.map((item) => item.id),
    ['CaseSensitivePlace']
  )
  placeId.value = 'another'
  assert.deepEqual(collection.collection.value, [])
  placeId.value = 'CaseSensitivePlace'
  state.pending.value = true
  assert.deepEqual(collection.collection.value, [])
  state.pending.value = false
  state.error.value = new Error('failed')
  assert.deepEqual(collection.collection.value, [])
  placeId.value = ''
  let called = false
  await ((currentReadFetch = async () => {
    called = true
    return []
  }),
  fetcher({}, { signal: new AbortController().signal }))
  assert.equal(
    called,
    false,
    'an unresolved Place must never request all Kitchens'
  )
})

test('workspace handoff waits for access and only selects an available Kitchen', () => {
  let reconcile
  const source = { kitchens: ref([{ id: 'allowed' }]), outcome: ref('pending') }
  const route = {
    path: '/workspace/kitchen',
    meta: { workspace: 'kitchen' },
    query: { kitchenId: 'allowed', keep: 'yes' },
    hash: '#overview',
  }
  const selectedId = ref('previous')
  const navigations = []
  const useIndex = load(
    '../runtime/kitchen/composables/workspace/useKitchenWorkspace.ts',
    {
      computed,
      useCommandScope: () => () => true,
      useWorkspaceEntryCta: () => ({
        workspaceEntryPath: ref('/workspace/kitchen'),
      }),
      useRouter: () => ({ getRoutes: () => [] }),
      useAppSession: () => ({
        pending: ref(false),
        error: ref(null),
        appUser: ref({}),
      }),
      resolveAppUserAccess: () => ({}),
      watch: (_sources, callback) => {
        reconcile = callback
        callback()
      },
      useRoute: () => route,
      useFireUXConfig: () => ({ appId: 'test' }),
      useState: (_key, init) => ref(init()),
      useWorkspace: () => ({
        selectedId,
        select: (id) => {
          selectedId.value = id
        },
        reconcile: () => {},
      }),
      defineWorkspace: (setup) => setup,
      useKitchenCollection: () => source,
      useKitchenAccess: () => ({
        outcome: ref('ready'),
        ids: ref(['allowed']),
      }),
      useKitchenRead: () => ({
        kitchen: ref(null),
        place: ref(null),
        outcome: ref('pending'),
        placeOutcome: ref('idle'),
      }),
      useKitchenInterface: () => ({ surface: (value) => value }),
      navigateTo: (to, options) => {
        navigations.push({ to, options })
      },
    },
    'useKitchenWorkspace'
  )
  useIndex()
  assert.equal(selectedId.value, 'previous')
  assert.equal(navigations.length, 0)
  source.outcome.value = 'empty'
  reconcile()
  assert.equal(
    navigations.length,
    0,
    'guest/empty access must preserve the sign-in destination'
  )
  source.outcome.value = 'ready'
  reconcile()
  assert.equal(selectedId.value, 'allowed')
  assert.deepEqual(navigations[0], {
    to: {
      path: '/workspace/kitchen',
      query: { keep: 'yes' },
      hash: '#overview',
    },
    options: { replace: true },
  })
  route.query.kitchenId = 'unauthorized'
  reconcile()
  assert.equal(selectedId.value, 'allowed')
  assert.equal(
    navigations.length,
    1,
    'an unavailable Kitchen must not consume the requested destination'
  )
  source.outcome.value = 'error'
  route.query.kitchenId = 'allowed'
  selectedId.value = 'previous'
  reconcile()
  assert.equal(selectedId.value, 'previous')
})

test('ordinary Kitchen directories retain their reader key and hide records during unsettled refresh', async () => {
  const records = [{ id: 'one' }, { id: 'two' }]
  const state = {
    data: ref(records),
    pending: ref(false),
    error: ref(null),
    refresh: async () => {},
    then: () => Promise.resolve(),
  }
  let key
  let fetcher
  const useCollection = load(
    '../runtime/kitchen/composables/useKitchens.ts',
    {
      computed,
      toValue,
      useAsyncData: (sourceKey, read) => {
        key = sourceKey
        fetcher = read
        return state
      },
      resolveReadOutcome,
      resolveHttpDocumentOutcome,
    },
    'useKitchens'
  )
  const collection = useCollection()
  assert.equal(key(), 'kitchens')
  currentReadFetch = (url) => {
    assert.equal(url, '/api/kitchens')
    return Promise.resolve(records)
  }
  await fetcher({}, { signal: new AbortController().signal })
  assert.deepEqual(collection.collection.value, records)
  state.pending.value = true
  assert.deepEqual(collection.collection.value, [])
  assert.equal(collection.outcome.value, 'pending')
  state.pending.value = false
  state.error.value = new Error('refresh failed')
  assert.deepEqual(collection.collection.value, [])
  assert.equal(collection.outcome.value, 'error')
})
