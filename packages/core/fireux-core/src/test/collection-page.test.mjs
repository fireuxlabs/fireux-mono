import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'
import { useCollectionPage } from '../runtime/composables/shared/useCollectionPage.ts'

test('non-paginated pages track live records and outcomes without inventing an operation', () => {
  const records = ref([])
  const outcome = ref('pending')
  const error = ref(null)
  const title = ref('Kitchens')
  const page = useCollectionPage({
    entity: 'kitchens',
    title,
    collection: { records, outcome, error },
  })
  assert.equal(page.state.outcome, 'pending')
  assert.equal(page.loadMore, undefined)
  assert.equal(page.pagination, undefined)
  records.value = [{ id: 'first' }]
  outcome.value = 'ready'
  title.value = 'Available Kitchens'
  assert.equal(page.ready, true)
  assert.equal(page.title, 'Available Kitchens')
  assert.equal(page.diagnostics.objects.kitchens, records.value)
  assert.equal(page.diagnostics.derived.count, 1)
  records.value = []
  outcome.value = 'error'
  error.value = new Error('Initial read failed')
  assert.equal(page.state.outcome, 'error')
  assert.equal(page.state.error, error.value)
})

test('next-page failure stays in pagination while existing records remain presentable', async () => {
  const records = ref([{ id: 'first' }])
  const outcome = ref('ready')
  const error = ref(null)
  const nextError = ref(null)
  let calls = 0
  const loadMore = async () => {
    calls++
  }
  const page = useCollectionPage({
    entity: 'places',
    title: 'Places',
    collection: { records, outcome, error },
    pagination: {
      hasMore: ref(true),
      loading: ref(false),
      error: nextError,
      loadMore,
    },
    diagnostics: { derived: () => ({ scope: 'app' }) },
  })
  await page.loadMore()
  assert.equal(calls, 1)
  assert.equal(page.loadMore, loadMore)
  nextError.value = new Error('Next page failed')
  assert.equal(page.state.outcome, 'ready')
  assert.equal(page.ready, true)
  assert.equal(page.pagination.error, nextError.value)
  assert.equal(page.diagnostics.derived.scope, 'app')
  outcome.value = 'error'
  error.value = new Error('The current read is unavailable')
  assert.equal(page.state.outcome, 'error')
  assert.equal(page.ready, false)
  assert.equal(page.state.error, error.value)
  records.value = []
  assert.equal(page.state.outcome, 'error')
  assert.equal(page.ready, false)
})

test('Menu page keeps one live reader connected to search, service and pagination', async () => {
  const { readFileSync } = await import('node:fs')
  const { stripTypeScriptTypes } = await import('node:module')
  const { compileFunction } = await import('node:vm')
  const { computed, reactive, toRefs } = await import('vue')
  let reads = 0
  let inputs
  let seo
  const rows = ref([])
  const failure = ref(null)
  const source = {
    collection: rows,
    pending: ref(false),
    error: failure,
    refresh: async () => {},
    hasMore: ref(true),
    loadingMore: ref(false),
    loadMoreError: ref(null),
    loadMore: async () => true,
  }
  const dependencies = {
    ref,
    computed,
    reactive,
    toRefs,
    useCollectionPage,
    useFireUXConfig: () => ({ appName: 'Misebox' }),
    useSeo: (value) => {
      seo = value
    },
    useMenuDirectory: (value) => {
      reads++
      inputs = value
      return source
    },
  }
  const code = readFileSync(
    new URL(
      '../../../../extensions/fireux-kitchens/src/runtime/menu/composables/useMenuCollectionPage.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const useMenuCollectionPage = compileFunction(
    `${stripTypeScriptTypes(code)}; return useMenuCollectionPage`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const page = useMenuCollectionPage()
  assert.equal(reads, 1)
  assert.equal(page.menus, rows.value)
  page.search = 'Soup'
  page.service = 'delivery'
  assert.equal(inputs.search.value, 'Soup')
  assert.equal(inputs.service.value, 'delivery')
  assert.equal(page.state.outcome, 'ready') // Menu Results owns its contextual empty state.
  failure.value = new Error('Read failed')
  assert.equal(page.state.outcome, 'error')
  assert.equal(page.pagination.hasMore, false)
  assert.equal(page.search, 'Soup')
  rows.value = [{ id: 'retained' }]
  source.loadMoreError.value = failure.value
  failure.value = null // The reader retains valid rows and normalizes paging feedback.
  assert.equal(page.unavailable, false)
  assert.equal(page.state.outcome, 'ready')
  assert.equal(page.pagination.hasMore, true)
  assert.equal(page.refresh, source.refresh)
  assert.equal(seo.path, '/menus')
  assert.equal(reads, 1)
})

test('Job route metadata remains evaluable independently of its page coordinator', async () => {
  const { readFileSync } = await import('node:fs')
  const source = readFileSync(
    new URL(
      '../../../../extensions/fireux-jobs/src/runtime/pages/jobs/index.vue',
      import.meta.url
    ),
    'utf8'
  )
  const declaration = source.match(/definePageMeta\([\s\S]*?\n\}\)/)?.[0]
  assert.ok(declaration)
  let metadata
  new Function('definePageMeta', declaration)((value) => {
    metadata = value
  })
  assert.equal(metadata.title, 'Jobs')
  assert.equal(typeof metadata.description, 'string')
  assert.ok(metadata.description.length > 0)
})

for (const outcome of ['idle', 'pending', 'error', 'empty', 'ready']) {
  test(`pagination cannot override the reader's ${outcome} outcome`, () => {
    const failure = new Error('Current read failed')
    const page = useCollectionPage({
      entity: 'apps',
      title: 'Apps',
      collection: { records: [{ id: 'retained' }], outcome, error: failure },
      pagination: {
        hasMore: true,
        error: new Error('Older page failure'),
        loadMore() {},
      },
    })
    assert.equal(page.state.outcome, outcome)
    assert.equal(page.ready, outcome === 'ready')
    assert.equal(page.state.error, failure)
  })
}
