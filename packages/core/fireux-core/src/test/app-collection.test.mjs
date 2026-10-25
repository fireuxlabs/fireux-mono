import { resolveHttpDocumentOutcome } from '../runtime/utils/http-document-outcome.ts'
import { useCollectionPage } from '../runtime/composables/shared/useCollectionPage.ts'
import { resolveReadOutcome } from '../runtime/utils/read-outcome.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, reactive, ref, toRefs, toValue, watch } from 'vue'

function load(path, name, dependencies) {
  dependencies = {
    resolveReadOutcome,
    resolveHttpDocumentOutcome,
    ...dependencies,
  }
  const code = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(code)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function controller(fetch) {
  let execute
  const data = ref()
  const pending = ref(false)
  const error = ref(null)
  const factory = load(
    '../runtime/app/composables/useAppCollection.ts',
    'useAppCollection',
    {
      computed,
      ref,
      toValue,
      watch,
      useAuth: () => ({ currentUser: ref(null), hasAuthState: ref(true) }),
      readLivePages: load(
        '../runtime/composables/fireux/firestore/readLivePages.ts',
        'readLivePages',
        {}
      ),
      useLiveAsyncData: (_key, handler) => {
        execute = async () => {
          pending.value = true
          error.value = null
          try {
            data.value = await handler((url, options) =>
              fetch(
                url +
                  (options?.query?.cursor
                    ? `&cursor=${options.query.cursor}`
                    : '')
              )
            )
          } catch (cause) {
            error.value = cause
          } finally {
            pending.value = false
          }
        }
        return {
          data,
          pending,
          error,
          refresh: () => execute(),
        }
      },
    }
  )
  const endpoint = ref('/apps?limit=2')
  return { endpoint, state: factory(endpoint), execute: () => execute() }
}

test('App pages append without duplicates and expose the next cursor', async () => {
  const urls = []
  const c = controller(async (url) => {
    urls.push(url)
    return url.includes('cursor=')
      ? { ok: true, items: [{ id: 'b' }, { id: 'c' }], nextCursor: null }
      : { ok: true, items: [{ id: 'a' }, { id: 'b' }], nextCursor: 'b' }
  })
  await c.execute()
  await c.state.loadMore()
  assert.deepEqual(
    c.state.apps.value.map((a) => a.id),
    ['a', 'b', 'c']
  )
  assert.equal(c.state.hasMore.value, false)
  assert.match(urls[2], /cursor=b/)
})

test('A late page cannot enter a different relationship', async () => {
  let resolve
  const c = controller(async (url) =>
    url.includes('cursor=')
      ? new Promise((done) => {
          resolve = done
        })
      : { ok: true, items: [{ id: 'a' }], nextCursor: 'a' }
  )
  await c.execute()
  const pending = c.state.loadMore()
  while (!resolve) await new Promise((done) => setImmediate(done))
  c.endpoint.value = '/apps?projectId=other'
  resolve({ ok: true, items: [{ id: 'stale' }], nextCursor: null })
  await pending
  assert.deepEqual(c.state.apps.value, [])
  assert.equal(c.state.loadingMore.value, false)
})

test('An empty scope performs no request', async () => {
  const c = controller(async () => {
    throw new Error('Unexpected request')
  })
  c.endpoint.value = ''
  await c.execute()
  assert.equal(c.state.outcome.value, 'idle')
})

test('Page validation rejects unbounded or malformed requests', () => {
  const parse = load(
    '../runtime/app/server/collection/read.ts',
    'readAppPageInput',
    {
      createError: (input) => new Error(input.statusMessage),
    }
  )
  assert.deepEqual(parse({}), { limit: 24, cursor: '' })
  for (const limit of [0, -1, 101, 'bad']) assert.throws(() => parse({ limit }))
  assert.throws(() => parse({ cursor: 'a/b' }))
})

test('Merged pages have stable cursors and reject duplicate identities', () => {
  const page = load(
    '../runtime/app/server/collection/read.ts',
    'appCollectionPage',
    {
      createError: (input) => new Error(input.statusMessage),
    }
  )
  assert.deepEqual(page([{ id: 'c' }, { id: 'a' }, { id: 'b' }], 2), {
    ok: true,
    items: [{ id: 'a' }, { id: 'b' }],
    nextCursor: 'b',
  })
  assert.throws(() => page([{ id: 'a' }, { id: 'a' }]), /Duplicate/)
})

test('A failed next page preserves ready records and can retry', async () => {
  let fail = true
  let release
  const c = controller(async (url) => {
    if (!url.includes('cursor='))
      return { ok: true, items: [{ id: 'a' }], nextCursor: 'a' }
    await new Promise((done) => {
      release = done
    })
    if (fail) throw new Error('Next page unavailable')
    return { ok: true, items: [{ id: 'b' }], nextCursor: null }
  })
  await c.execute()
  const failed = c.state.loadMore()
  while (!release) await new Promise((done) => setImmediate(done))
  assert.equal(c.state.outcome.value, 'ready')
  assert.equal(c.state.loadingMore.value, true)
  release()
  await failed
  assert.equal(c.state.outcome.value, 'ready')
  assert.equal(c.state.error.value, null)
  assert.match(String(c.state.loadMoreError.value), /Next page unavailable/)
  assert.deepEqual(
    c.state.apps.value.map((x) => x.id),
    ['a']
  )
  assert.equal(c.state.hasMore.value, true)
  fail = false
  release = undefined
  const retry = c.state.loadMore()
  while (!release) await new Promise((done) => setImmediate(done))
  release()
  await retry
  assert.equal(c.state.loadMoreError.value, null)
  assert.deepEqual(
    c.state.apps.value.map((x) => x.id),
    ['a', 'b']
  )
  assert.equal(c.state.hasMore.value, false)
})

for (const scope of ['ecosystem', 'platform']) {
  test(`App page ${scope} coordination shares reactive records with presentation and SEO`, async () => {
    let reads = 0
    let endpoint
    let seo
    let more = 0
    let seoRecords
    const records = ref([{ id: 'first' }])
    const outcome = ref('ready')
    const nextError = ref(null)
    const reader = {
      apps: records,
      outcome,
      error: ref(null),
      hasMore: ref(true),
      loadingMore: ref(false),
      loadMoreError: nextError,
      loadMore: async () => {
        more++
      },
    }
    const usePage = load(
      '../runtime/app/composables/useAppCollectionPage.ts',
      'useAppCollectionPage',
      {
        computed,
        reactive,
        toValue,
        useCollectionPage,
        toRefs,
        useAppCollection: (value) => {
          reads++
          endpoint = value
          return reader
        },
        useFireUXConfig: () => ({ appName: 'Example' }),
        useSeo: (value) => {
          seo = value
        },
      }
    )
    const title = ref('Apps')
    const page = usePage({
      scope,
      title,
      seo: {
        jsonLdBuilder: (_context, apps) => {
          seoRecords = apps
          return { ids: apps.map((app) => app.id) }
        },
      },
    })
    assert.equal(
      endpoint,
      scope === 'platform'
        ? '/api/platform/apps?limit=24'
        : '/api/apps?limit=24'
    )
    assert.equal(reads, 1)
    assert.equal(page.apps, records.value)
    assert.deepEqual(seo.jsonLdBuilder({}).ids, ['first'])
    assert.equal(seoRecords, page.apps)
    records.value = [{ id: 'second' }]
    assert.deepEqual(seo.jsonLdBuilder({}).ids, ['second'])
    assert.equal(page.diagnostics.objects.apps, page.apps)
    assert.equal(page.diagnostics.derived.count, 1)
    title.value = 'Updated'
    assert.equal(page.title, 'Updated')
    assert.equal(toValue(seo.title), 'Example | Updated')
    outcome.value = 'pending'
    assert.equal(page.ready, false)
    assert.equal(page.state.outcome, 'pending')
    outcome.value = 'ready'
    nextError.value = new Error('Next page unavailable')
    assert.equal(page.ready, true)
    assert.equal(page.pagination.error, nextError.value)
    await page.loadMore()
    assert.equal(more, 1)
    assert.equal(reads, 1)
  })
}
