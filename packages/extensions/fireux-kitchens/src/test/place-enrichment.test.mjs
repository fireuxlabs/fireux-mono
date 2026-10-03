import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
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
    '../runtime/kitchen/composables/useKitchenCollection.ts',
    {
      computed,
      toValue,
      useLiveAsyncData: (_key, read) => {
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
    },
    'useKitchenCollection'
  )
  const placeId = ref('CaseSensitivePlace')
  const collection = useCollection({ placeId })
  let endpoint
  await fetcher(async (url) => {
    endpoint = url
    return []
  })
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
  await fetcher(async () => {
    called = true
    return []
  })
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
    query: { kitchenId: 'allowed', keep: 'yes' },
    hash: '#overview',
  }
  const selectedId = ref('previous')
  const navigations = []
  const useIndex = load(
    '../runtime/kitchen/composables/workspace/useKitchenWorkspaceIndex.ts',
    {
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
      useKitchenWorkspaceKitchens: () => source,
      navigateTo: (to, options) => {
        navigations.push({ to, options })
      },
    },
    'useKitchenWorkspaceIndex'
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

test('Misebox workspace host routing preserves the requested Kitchen and leaves other Apps alone', () => {
  let requestUrl = new URL('http://localhost:3001/places/place')
  const source = readFileSync(
    new URL(
      '../../../../../projects/misebox/misebox-app/app/middleware/00-misebox-workspace-surface.global.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace('export default ', 'const middleware = ')
  const middleware = compileFunction(
    `${stripTypeScriptTypes(source)}; return middleware`,
    ['defineNuxtRouteMiddleware', 'navigateTo', 'useRequestURL']
  )(
    (value) => value,
    (to, options) => ({ to, options }),
    () => requestUrl
  )
  const target = {
    path: '/workspace/kitchen',
    fullPath: '/workspace/kitchen?kitchenId=CaseSensitivePlace',
    query: { kitchenId: 'CaseSensitivePlace' },
  }
  assert.equal(
    middleware(target).to,
    'http://workspace.localhost:3001/workspace/kitchen?kitchenId=CaseSensitivePlace'
  )
  requestUrl = new URL('https://misebox.app/')
  assert.equal(
    middleware(target).to,
    'https://workspace.misebox.app/workspace/kitchen?kitchenId=CaseSensitivePlace'
  )
  requestUrl = new URL('https://tenant.example/')
  assert.equal(middleware(target), undefined)
  requestUrl = new URL('https://workspace.misebox.app/')
  assert.equal(middleware(target), undefined)
})

test('ordinary Kitchen directories retain their existing reader key and loaded records during refresh', () => {
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
    '../runtime/kitchen/composables/useKitchenCollection.ts',
    {
      computed,
      toValue,
      useLiveAsyncData: (sourceKey, read) => {
        key = sourceKey
        fetcher = read
        return state
      },
      resolveReadOutcome: ({ pending, error, present }) =>
        error ? 'error' : pending ? 'pending' : present ? 'ready' : 'empty',
    },
    'useKitchenCollection'
  )
  const collection = useCollection()
  assert.equal(key(), 'kitchens')
  fetcher((url) => {
    assert.equal(url, '/api/kitchens')
    return Promise.resolve(records)
  })
  assert.deepEqual(collection.collection.value, records)
  state.pending.value = true
  assert.deepEqual(collection.collection.value, records)
  assert.equal(collection.outcome.value, 'pending')
  state.pending.value = false
  state.error.value = new Error('refresh failed')
  assert.deepEqual(collection.collection.value, records)
  assert.equal(collection.outcome.value, 'error')
})
