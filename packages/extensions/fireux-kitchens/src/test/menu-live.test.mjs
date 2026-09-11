import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, watch, effectScope, toValue } from 'vue'
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
      '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/readLivePages.ts',
      import.meta.url
    ),
    'utf8'
  )
).replace(/^export /gm, '')
const readLivePages = compileFunction(`${pageSource}; return readLivePages`)()

test('Menu directory uses the shared live projection and replaces unpublished records across loaded pages', async () => {
  let published = true
  const menu = { id: 'first', status: 'published' }
  const later = { id: 'later', status: 'published' }
  const fetch = async (_url, options) =>
    options?.query?.cursor
      ? { scope: { kind: 'root' }, items: [later], nextCursor: null }
      : {
          scope: { kind: 'root' },
          items: published ? [menu] : [],
          nextCursor: 'second',
        }
  let state
  const dependencies = {
    computed,
    ref,
    watch,
    toValue,
    readLivePages,
    useLiveAsyncData: (_key, handler) => {
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
          state.data.value = await handler(fetch)
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
  const directory = scope.run(() => useDirectory())
  await directory.loadMore()
  assert.deepEqual(
    directory.collection.value.map((item) => item.id),
    ['first', 'later']
  )
  published = false
  // The shared transport invokes this read on a Firestore event (proved in Core's live-client test).
  await state.refresh()
  assert.deepEqual(
    directory.collection.value.map((item) => item.id),
    ['later']
  )
  scope.stop()
})
