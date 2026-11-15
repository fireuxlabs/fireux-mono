import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { reactive, ref, toRefs, toValue } from 'vue'
import { useCollectionPage } from '../../../../../packages/core/fireux-core/src/runtime/composables/shared/useCollectionPage.ts'
import { isDirectoryAppIndexable } from '../utils/directorySearchPolicy.ts'

const core = '../../../../../packages/core/fireux-core/src/runtime/'
const ecosystemRoute =
  '../../../../../packages/extensions/fireux-ecosystem/src/runtime/pages/apps/index.vue'

function load(path, symbol, dependencies) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (path.endsWith('.vue'))
    source = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${symbol}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

for (const { route, scope, endpoint, layout } of [
  {
    route: ecosystemRoute,
    scope: 'ecosystem',
    endpoint: '/api/apps?limit=24',
    layout: 'default',
  },
  {
    route: '../pages/apps/index.vue',
    scope: 'platform',
    endpoint: '/api/platform/apps?limit=24',
    layout: 'framework',
  },
]) {
  test(`${scope} Apps route supplies its endpoint to the shared controller and retains paging, states and SEO`, async () => {
    const apps = ref([
      { id: 'published', name: 'Published App' },
      { id: 'fireux-blank', name: 'Reference App' },
    ])
    const outcome = ref('ready')
    const error = ref(null)
    const pagingError = ref(null)
    let reads = 0,
      more = 0,
      seo,
      metadata
    const useAppCollectionPage = load(
      `${core}app/composables/useAppCollectionPage.ts`,
      'useAppCollectionPage',
      {
        reactive,
        toRefs,
        useCollectionPage,
        useFireUXConfig: () => ({ appName: 'Example' }),
        useSeo: (options) => {
          seo = options
        },
        useAppCollection: (selectedEndpoint) => {
          reads++
          assert.equal(selectedEndpoint, endpoint)
          return {
            apps,
            outcome,
            error,
            hasMore: ref(true),
            loadingMore: ref(false),
            loadMoreError: pagingError,
            loadMore: async () => {
              more++
              apps.value = [...apps.value, { id: 'next', name: 'Next App' }]
            },
          }
        },
      }
    )
    const usePlatformAppsPage = load(
      '../composables/usePlatformAppsPage.ts',
      'usePlatformAppsPage',
      {
        useAppCollectionPage,
        isDirectoryAppIndexable,
        buildPublicPageJsonLd: load(
          `${core}composables/fireux/seo/useSeo.ts`,
          'buildPublicPageJsonLd',
          {}
        ),
      }
    )
    const page = load(route, 'page', {
      useAppCollectionPage,
      usePlatformAppsPage,
      definePageMeta: (value) => {
        metadata = value
      },
    })

    assert.equal(reads, 1)
    assert.equal(metadata.nav.key, 'apps')
    assert.equal(metadata.layout, layout)
    assert.equal(page.diagnostics.derived.scope, scope)
    assert.equal(page.apps, apps.value)
    assert.equal(page.ready, true)
    await page.loadMore()
    assert.equal(more, 1)
    assert.equal(reads, 1)
    assert.equal(page.apps.at(-1).id, 'next')
    pagingError.value = new Error('Next page unavailable')
    assert.equal(page.pagination.error, pagingError.value)
    assert.equal(page.ready, true)
    outcome.value = 'error'
    error.value = new Error('Refresh unavailable')
    assert.equal(page.ready, false)
    assert.equal(page.state.outcome, 'error')
    assert.equal(page.state.error, error.value)
    assert.equal(seo.path, '/apps')

    if (scope === 'platform') {
      assert.equal(page.title, 'Showcase')
      assert.equal(seo.title, 'FireUX Apps')
      const schema = seo.jsonLdBuilder({
        canonicalUrl: 'https://fireux.app/apps',
        description: seo.description,
        title: seo.title,
        image: 'https://fireux.app/img/app/cover.png',
        absoluteUrl: (path) => `https://fireux.app${path}`,
      })
      assert.equal(schema['@graph'][0]['@type'], 'CollectionPage')
      assert.deepEqual(
        schema['@graph'][1].itemListElement.map((item) => item.url),
        ['https://fireux.app/apps/published', 'https://fireux.app/apps/next']
      )
      assert.equal(page.apps.length, 3)
    } else {
      assert.equal(page.title, 'Apps')
      assert.equal(toValue(seo.title), 'Example | Apps')
      assert.equal(metadata.appRole, 'global')
      assert.equal(seo.jsonLdBuilder, undefined)
    }
  })
}
