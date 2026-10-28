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
import { computed, ref, watch, toValue, isRef, effectScope } from 'vue'
import { resolveReadOutcome } from '../runtime/utils/read-outcome.ts'
import { useCollectionPage } from '../runtime/composables/shared/useCollectionPage.ts'

const root = new URL('../../../../../', import.meta.url)
function load(file, name, dependencies = {}) {
  const source = readFileSync(new URL(file, root), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const vue = { computed, ref, watch, toValue, isRef, resolveReadOutcome }
const useFirestoreCollectionState = load(
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCollection.ts',
  'useFirestoreCollectionState',
  vue
)
const readPages = load(
  'packages/core/fireux-core/src/runtime/composables/http/readPages.ts',
  'readPages'
)
const members = [
  [
    'App',
    'packages/core/fireux-core/src/runtime/app/composables/useAppCollection.ts',
    'useAppCollection',
    'apps',
  ],
  [
    'Place',
    'packages/extensions/fireux-places/src/runtime/place/composables/usePlaceCollection.ts',
    'usePlaceCollection',
    'collection',
  ],
  [
    'Job',
    'packages/extensions/fireux-jobs/src/runtime/job/composables/useJobDirectory.ts',
    'useJobDirectory',
    'jobs',
  ],
  [
    'Portfolio',
    'packages/extensions/fireux-properties/src/runtime/portfolio/composables/usePortfolioDirectory.ts',
    'usePortfolioDirectory',
    'portfolios',
  ],
  [
    'Property',
    'packages/extensions/fireux-properties/src/runtime/property/composables/usePropertyDirectory.ts',
    'usePropertyDirectory',
    'properties',
  ],
  [
    'Menu',
    'packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuDirectory.ts',
    'useMenuDirectory',
    'collection',
  ],
]
for (const [name, file, exported, rows] of members) {
  test(`${name}: one reader, retained next-page failure, exact retry and a later independent failure`, async () => {
    const scope = effectScope()
    const data = ref(),
      pending = ref(false),
      error = ref(null)
    let readers = 0,
      executions = 0,
      fail = true,
      release,
      reached
    const secondPage = () =>
      new Promise((resolve) => {
        reached = resolve
      })
    let arrived = secondPage()
    let cursors = []
    let run
    const deps = {
      ...vue,
      useFirestoreCollectionState,
      readPages,
      useAuth: () => ({ currentUser: ref(null), hasAuthState: ref(true) }),
      useFireUXConfig: () => ({ appId: 'app', isTenant: false }),
      useFireuxJobsConfig: () => ({ categoryScope: 'all', categories: [] }),
      useRouter: () => ({
        resolve: () => ({ matched: [{ meta: { menuProjection: true } }] }),
      }),
      rootMenuRouteScope: () => ({ kind: 'root' }),
      MENU_DIRECTORY_PAGE_SIZE: 24,
      MENU_DIRECTORY_MAX_PAGE_SIZE: 100,
      PLACE_INDEX_PAGE_SIZE: 24,
      JOB_DIRECTORY_PAGE_SIZE: 24,
      JOB_DIRECTORY_MAX_PAGE_SIZE: 100,
      PROPERTY_DIRECTORY_PAGE_SIZE: 24,
      PROPERTY_DIRECTORY_MAX_PAGE_SIZE: 100,
      useAsyncData: (_key, handler) => {
        readers++
        run = async () => {
          executions++
          pending.value = true
          error.value = null
          try {
            data.value = await ((currentReadFetch = async (_url, options) => {
              const cursor = options?.query?.cursor
              cursors.push(cursor)
              if (!cursor)
                return { ok: true, items: [{ id: 'a' }], nextCursor: 'a' }
              if (fail) {
                reached()
                await new Promise((resolve) => {
                  release = resolve
                })
                throw new Error('Next page failed')
              }
              return { ok: true, items: [{ id: 'b' }], nextCursor: null }
            }),
            handler({}, { signal: new AbortController().signal }))
          } catch (failure) {
            error.value = failure
          } finally {
            pending.value = false
          }
        }
        return {
          data,
          pending,
          error,
          refresh: () => run(),
          then: (done) => Promise.resolve().then(done),
        }
      },
    }
    const reader = scope.run(() =>
      load(
        file,
        exported,
        deps
      )(...(name === 'App' ? ['/api/apps?limit=24'] : []))
    )
    try {
      await run()
      const page = useCollectionPage({
        entity: 'records',
        title: name,
        collection: {
          records: reader[rows],
          outcome: reader.outcome,
          error: reader.error,
        },
        pagination: {
          hasMore: reader.hasMore,
          loading: reader.loadingMore,
          error: reader.loadMoreError,
          loadMore: reader.loadMore,
        },
      })
      const initial = data.value
      assert.equal(page.ready, true)
      const flight = reader.loadMore()
      await arrived
      await reader.loadMore() // Repeated clicks cannot start another expansion.
      assert.equal(executions, 2)
      assert.equal(page.ready, true)
      release()
      await flight
      assert.equal(readers, 1)
      assert.equal(page.ready, true)
      assert.equal(Boolean(reader.error.value), false)
      assert.match(String(page.pagination.error), /Next page failed/)
      assert.deepEqual(
        reader[rows].value.map((row) => row.id),
        ['a']
      )
      for (let attempt = 0; attempt < 5; attempt++) {
        arrived = secondPage()
        cursors = []
        const retry = reader.loadMore()
        await arrived
        release()
        await retry
        assert.deepEqual(cursors, [undefined, 'a'])
        assert.equal(page.ready, true)
        assert.equal(readers, 1)
      }
      error.value = new Error('Independent live read failure')
      assert.equal(page.state.outcome, 'error')
      assert.equal(page.ready, false)
      data.value = undefined
      assert.equal(page.state.outcome, 'error') // An old paging error cannot hide lost records.
      data.value = initial
      fail = false
      cursors = []
      await reader.loadMore()
      assert.deepEqual(cursors, [undefined, 'a'])
      assert.equal(Boolean(reader.loadMoreError.value), false)
      assert.deepEqual(
        reader[rows].value.map((row) => row.id),
        ['a', 'b']
      )
      assert.equal(page.ready, true)
      assert.equal(page.pagination.hasMore, false)
    } finally {
      scope.stop()
    }
  })
}
