import test from 'node:test'
import assert from 'node:assert/strict'
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
import { computed, ref, watch, effectScope, toValue, nextTick } from 'vue'
const source = stripTypeScriptTypes(
  readFileSync(
    new URL('../runtime/menu/composables/useMenuDirectory.ts', import.meta.url),
    'utf8'
  )
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
const pageSource = stripTypeScriptTypes(
  readFileSync(
    new URL(
      '../../../../core/fireux-core/src/runtime/composables/http/readPages.ts',
      import.meta.url
    ),
    'utf8'
  )
).replace(/^export /gm, '')
const readPages = compileFunction(`${pageSource}; return readPages`)()

test('Menu directory uses the shared live projection and replaces unpublished records across loaded pages', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let published = true
  const menu = { id: 'first', status: 'published' }
  const later = { id: 'later', status: 'published' }
  const fetch = async (_url, options) => {
    endpoint = _url
    return options?.query?.cursor
      ? { scope: { kind: 'root' }, items: [later], nextCursor: null }
      : {
          scope: { kind: 'root' },
          items: published ? [menu] : [],
          nextCursor: 'second',
        }
  }
  let state
  let endpoint
  let directoryKey
  const dependencies = {
    computed,
    ref,
    watch,
    toValue,
    readPages,
    useAsyncData: (_key, handler) => {
      directoryKey = _key
      state = {
        data: ref({
          scope: { kind: 'root' },
          items: [menu],
          nextCursor: 'second',
        }),
        pending: ref(false),
        error: ref(null),
        then: (fn) => Promise.resolve().then(fn),
        refresh: async () => {
          state.data.value = await ((currentReadFetch = fetch),
          handler({}, { signal: new AbortController().signal }))
        },
      }
      return state
    },
    useFirestoreCollectionState: () => ({ outcome: ref('ready') }),
    useRouter: () => ({ resolve: () => ({ matched: [] }) }),
    useFireUXConfig: () => ({ appId: 'test', isTenant: false }),
    rootMenuRouteScope: () => ({ kind: 'root' }),
    tenantMenuRouteScope: () => ({ kind: 'tenant' }),
    menuRoutePath: () => '',
    MENU_DIRECTORY_PAGE_SIZE: 24,
    MENU_DIRECTORY_MAX_PAGE_SIZE: 100,
  }
  const useDirectory = compileFunction(
    `${source}; return useMenuDirectory`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const scope = effectScope()
  const service = ref('online')
  const search = ref('')
  const directory = scope.run(() => useDirectory({ service, search }))
  await directory.loadMore()
  assert.deepEqual(
    directory.collection.value.map((item) => item.id),
    ['first', 'later']
  )
  assert.match(endpoint, /service=online/)
  const previousKey = directoryKey.value
  service.value = 'delivery'
  assert.equal(
    directoryKey.value,
    previousKey,
    'Service switch refreshes the existing reader instead of replacing its request owner'
  )
  await state.refresh()
  assert.match(endpoint, /service=delivery/)
  assert.deepEqual(
    directory.collection.value.map((item) => item.id),
    ['first']
  )
  await directory.loadMore()
  published = false
  // The shared transport invokes this read on a Firestore event (proved in Core's live-client test).
  await state.refresh()
  assert.deepEqual(
    directory.collection.value.map((item) => item.id),
    ['later']
  )
  search.value = 'Margherita'
  await nextTick()
  t.mock.timers.tick(250)
  await state.refresh()
  assert.match(endpoint, /search=Margherita/)
  assert.deepEqual(
    directory.collection.value,
    [],
    'Search resets the loaded page count'
  )
  scope.stop()
})
