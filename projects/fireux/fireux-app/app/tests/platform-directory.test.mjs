import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'
import { toEcosystemDirectoryEntry } from '../../../../../packages/core/fireux-core/src/runtime/ecosystem/server/directory/projection.ts'

function load(path, symbol, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${symbol}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const ecosystem = (id, name, status = 'active') => ({
  id,
  name,
  status,
  project_id: 'project',
  context: 'private context',
  created: { at: { seconds: 1, nanoseconds: 0 } },
  updated: { at: { seconds: 1, nanoseconds: 0 } },
})

test('Ecosystem directory projection exposes discovery fields without private context or audit data', () => {
  const source = {
    ...ecosystem('one', 'One'),
    description: 'Description',
    image_url: 'https://image',
    website_url: 'https://website',
  }
  const before = structuredClone(source)
  assert.deepEqual(
    toEcosystemDirectoryEntry(source, {
      appCount: 2,
      detailUrl: '/ecosystems/one',
    }),
    {
      id: 'one',
      name: 'One',
      status: 'active',
      project_id: 'project',
      description: 'Description',
      image_url: 'https://image',
      website_url: 'https://website',
      app_count: 2,
      detail_url: '/ecosystems/one',
    }
  )
  assert.deepEqual(source, before)
  const sparse = toEcosystemDirectoryEntry(ecosystem('empty', 'Empty'), {
    appCount: 0,
    detailUrl: '/ecosystems/empty',
  })
  assert.equal('description' in sparse, false)
  assert.equal('image_url' in sparse, false)
  assert.equal('website_url' in sparse, false)
})

test('platform aggregation keeps complete App counts, sorted Ecosystems and source failures', async () => {
  let fail = false
  const read = load(
    '../../server/utils/default-directory.ts',
    'readPlatformDirectory',
    {
      toEcosystemDirectoryEntry,
      readPlatformEcosystems: async () => [
        ecosystem('b', 'Beta'),
        ecosystem('a/b', 'Alpha'),
      ],
      readPlatformApps: async (options) => {
        assert.deepEqual(options, { requireComplete: true })
        if (fail) throw new Error('Unavailable source')
        return [{ ecosystem_id: ' b ' }, { ecosystem_id: 'b' }]
      },
    }
  )
  const result = await read()
  assert.equal(result.ok, true)
  assert.ok(Number.isFinite(Date.parse(result.generatedAt)))
  assert.deepEqual(
    result.ecosystems.map(({ id, app_count, detail_url }) => ({
      id,
      app_count,
      detail_url,
    })),
    [
      { id: 'a/b', app_count: 0, detail_url: '/ecosystems/a%2Fb' },
      { id: 'b', app_count: 2, detail_url: '/ecosystems/b' },
    ]
  )
  fail = true
  await assert.rejects(read(), /Unavailable source/)
})

test('platform consumer keeps one native read, active filtering, refresh and read states', async () => {
  let reads = 0,
    fetches = 0
  const data = ref({
    ecosystems: [
      ecosystem('a', 'Active'),
      ecosystem('b', 'Inactive', 'inactive'),
    ],
  })
  const pending = ref(true),
    error = ref(null),
    refresh = async () => {}
  const signal = new AbortController().signal
  const useDirectory = load(
    '../composables/usePlatformDirectory.ts',
    'usePublishedPlatformEcosystemDirectory',
    {
      computed,
      useAsyncData: (key, handler, options) => {
        reads++
        assert.equal(key, 'fireux-default-directory')
        assert.deepEqual(options, { server: true, lazy: false })
        void handler({}, { signal })
        return { data, pending, error, refresh }
      },
      $fetch: {
        create: (options) => {
          assert.equal(options.signal, signal)
          assert.equal(options.cache, 'no-store')
          return async (path) => {
            fetches++
            assert.equal(path, '/api/directory')
            return data.value
          }
        },
      },
    }
  )
  const view = useDirectory()
  assert.equal(view.outcome.value, 'pending')
  pending.value = false
  assert.equal(view.outcome.value, 'ready')
  assert.deepEqual(
    view.ecosystems.value.map((row) => row.id),
    ['a']
  )
  assert.equal(view.count.value, 1)
  assert.equal(view.refresh, refresh)
  assert.equal(view.source, 'platform')
  error.value = new Error('offline')
  assert.equal(view.outcome.value, 'error')
  error.value = null
  data.value = { ecosystems: [] }
  assert.equal(view.outcome.value, 'empty')
  assert.equal(view.count.value, 0)
  assert.equal(reads, 1)
  assert.equal(fetches, 1)
})
