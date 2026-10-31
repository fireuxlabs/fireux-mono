import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { compile, createSSRApp, h, ref, computed, reactive, toRefs } from 'vue'
import { useCollectionPage } from '../../../../core/fireux-core/src/runtime/composables/shared/useCollectionPage.ts'
import { renderToString } from 'vue/server-renderer'
const source = readFileSync(
  new URL('../runtime/pages/menus/index.vue', import.meta.url),
  'utf8'
)
async function page(changes = {}) {
  let request,
    retries = 0
  const state = {
    collection: ref([]),
    pending: ref(false),
    error: ref(null),
    loadMoreError: ref(null),
    hasMore: ref(false),
    loadingMore: ref(false),
    loadMore: () => {},
    refresh: () => {
      retries++
    },
    ...changes,
  }
  const script = source
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import.*\n/gm, '')
  const coordinatorSource = readFileSync(
    new URL(
      '../runtime/menu/composables/useMenuCollectionPage.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import.*\n/gm, '')
    .replace(/^export /gm, '')
  const owners = {
    ref,
    computed,
    reactive,
    toRefs,
    useCollectionPage,
    useSeo: () => {},
    useFireUXConfig: () => ({ appName: 'Test' }),
    useMenuDirectory: (options) => {
      request = options
      return state
    },
  }
  const useMenuCollectionPage = compileFunction(
    `${stripTypeScriptTypes(coordinatorSource)};return useMenuCollectionPage`,
    Object.keys(owners)
  )(...Object.values(owners))
  const deps = { definePageMeta: () => {}, useMenuCollectionPage }
  const page = compileFunction(
    `${stripTypeScriptTypes(script)};return page`,
    Object.keys(deps)
  )(...Object.values(deps))
  const api = { ...toRefs(page), page }
  const app = createSSRApp({
    setup: () => api,
    render: compile(source.slice(10, source.lastIndexOf('</template>'))),
  })
  for (const name of ['UPage', 'UPageBody'])
    app.component(name, {
      setup: (_, ctx) => () => h('div', ctx.slots.default?.()),
    })
  app.component('MenuCollectionHeader', { render: () => null })
  app.component('FireDiagnosticsDebugPanel', { render: () => null })
  app.component('FireCollectionPagination', { render: () => null })
  app.component('MenuCollectionResults', {
    props: ['hideResults'],
    setup: (props, ctx) => () =>
      h(
        'section',
        {
          ...ctx.attrs,
          style: props.hideResults ? { display: 'none' } : undefined,
          'data-results': '',
        },
        'Loaded menus'
      ),
  })
  let retry
  app.component('FireState', {
    props: ['outcome', 'error'],
    setup: (props, ctx) => {
      retry = ctx.attrs.onRetry
      return () =>
        h(
          'div',
          { 'data-state': props.outcome },
          props.error ? String(props.error) : ''
        )
    },
  })
  const html = await renderToString(app)
  return { html, api, request, retry, retries: () => retries }
}
test('portal uses server online filtering and renders loading separately from empty', async () => {
  const result = await page({ pending: ref(true) })
  assert.equal(result.request.service.value, 'online')
  assert.match(result.html, /data-state="pending"/)
  assert.match(result.html, /display:none/)
  assert.doesNotMatch(result.html, /data-state="error"/)
  result.api.service.value = 'delivery'
  assert.equal(result.request.service.value, 'delivery')
})
test('failed initial read shows retry and hides result empty state', async () => {
  const result = await page({ error: ref(new Error('Offline')) })
  assert.match(result.html, /data-state="error"/)
  assert.match(result.html, /display:none/)
  result.retry()
  assert.equal(result.retries(), 1)
})
test('settled empty read reaches the result owner and later-page read failures show retry', async () => {
  const empty = await page()
  assert.doesNotMatch(
    empty.html,
    /display:none|data-state="error"|data-state="pending"/
  )
  const failed = await page({
    collection: ref([{ id: 'food' }]),
    error: ref(new Error('Offline')),
    loadMoreError: ref(new Error('Offline')),
  })
  assert.match(failed.html, /data-state="error"/)
  assert.match(failed.html, /display:none/)
})

test('result template distinguishes a genuinely empty service from an unmatched search', async () => {
  const resultSource = readFileSync(
    new URL(
      '../runtime/menu/components/Collection/Results.vue',
      import.meta.url
    ),
    'utf8'
  )
  const template = resultSource.slice(
    10,
    resultSource.lastIndexOf('</template>')
  )
  async function empty(query) {
    const app = createSSRApp({
      setup: () => ({
        query,
        groups: [],
        visibleItems: [],
        choices: [],
        service: '',
        hideResults: false,
      }),
      render: compile(template),
    })
    app.component('UInput', { render: () => null })
    app.component('UAlert', {
      props: ['title', 'description'],
      setup: (props) => () => h('div', props.title + ' ' + props.description),
    })
    return renderToString(app)
  }
  assert.match(await empty(''), /No menus available for this service/)
  assert.match(await empty('sushi'), /No matching menus/)
})
