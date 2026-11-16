import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { compileFunction } from 'node:vm'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { ModuleKind, transpileModule } from 'typescript'
import { parse, compileScript } from 'vue/compiler-sfc'
import { createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { resolveReadOutcome } from '../../../../../../packages/core/fireux-core/src/runtime/utils/read-outcome.ts'

const require = createRequire(import.meta.url)
const root = new URL('../../../../../../', import.meta.url)
const appRoots = {
  misebox: new URL('projects/misebox/misebox-app/app/', root),
  fireux: new URL('projects/fireux/fireux-app/app/', root),
}
const runtime = new URL('packages/extensions/fireux-app/src/runtime/', root)

function load(file, dependencies = {}, bindings = {}) {
  const { descriptor } = parse(readFileSync(file, 'utf8'), {
    filename: fileURLToPath(file),
  })
  const source = compileScript(descriptor, {
    id: file.pathname,
    inlineTemplate: true,
    fs: {
      fileExists: existsSync,
      readFile: (path) => readFileSync(path, 'utf8'),
    },
  }).content
  const code = transpileModule(source, {
    compilerOptions: { module: ModuleKind.CommonJS },
  }).outputText
  const exports = {}
  compileFunction(code, ['require', 'exports', ...Object.keys(bindings)])(
    (name) => {
      if (name === 'vue') return require(name)
      assert.ok(name in dependencies, `Unexpected runtime dependency: ${name}`)
      return dependencies[name]
    },
    exports,
    ...Object.values(bindings)
  )
  return exports.default
}

function fixture() {
  return {
    ok: true,
    messaging: {
      hero_prefix: 'Public<br>headline',
      hero_headline: 'App headline',
      hero_html: '<strong>Public copy</strong>, ready to read.',
      summary: 'Public summary',
      workspace_bridge_html:
        '<script>untrustedMarkup()</script> Safe & readable <unfinished',
      highlight_terms: ['Menus', 'Kitchens'],
    },
    seo: {
      title: 'App SEO default',
      description: 'App description',
      keywords: ['Menus'],
      audience: ['Operators'],
      categories: ['Hospitality'],
      primary_topic: 'Menus',
      canonical_path: '/',
      open_graph: {
        title: 'App SEO default',
        description: 'App description',
        image_url: 'https://example.test/public.png',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'App SEO default',
        description: 'App description',
        image_url: 'https://example.test/public.png',
      },
    },
    legal: {
      notices: [
        {
          id: 'public-notice',
          title: 'Public notice',
          description: 'Public legal information',
          jurisdiction: 'Example',
          items: ['Reviewed notice text'],
          sources: [
            { label: 'Official guidance', to: 'https://example.test/legal' },
          ],
        },
      ],
    },
    now: '2026-11-16T00:00:00.000Z',
    privateRecord: { secret: 'DO_NOT_RENDER_PRIVATE_EXTRA' },
  }
}

async function render({
  response = fixture(),
  state = 'success',
  consumer = 'misebox',
} = {}) {
  const status = ref(state)
  const data = ref(response)
  const requests = []
  const actions = new Map()
  let pageMeta,
    seo,
    acquisitions = 0
  const fetch = async (url, options) => {
    requests.push({ url, options })
    return response
  }
  const dependencies = {
    '#imports': {
      async useAsyncData(key, handler) {
        acquisitions++
        assert.equal(
          key,
          consumer === 'legal' ? 'legal-app-meta' : 'public-app-meta'
        )
        const acquire = () =>
          handler({}, { signal: new AbortController().signal })
        await acquire()
        return {
          data,
          status,
          async refresh() {
            status.value = 'pending'
            data.value = await acquire()
            status.value = 'success'
          },
        }
      },
    },
    'fireux-core/runtime/utils/read-outcome': { resolveReadOutcome },
    'fireux-core/runtime/composables/fireux/seo/useSeo': {
      useSeo: (value) => {
        seo = value
      },
    },
  }
  const bindings = {
    definePageMeta: (value) => {
      pageMeta = value
    },
    $fetch: fetch,
  }
  const page = load(
    consumer === 'legal'
      ? new URL('components/Legal/AppNotices.vue', runtime)
      : new URL('pages/meta.vue', appRoots[consumer]),
    dependencies,
    bindings
  )
  const app = createSSRApp(page)
  const wrapper = {
    setup:
      (_, { slots }) =>
      () =>
        h('div', [slots.header?.(), slots.default?.()]),
  }
  for (const name of [
    'UPage',
    'UContainer',
    'UPageBody',
    'UPageGrid',
    'UPageList',
    'UPageSection',
    'USeparator',
    'UCard',
    'UBadge',
    'UAlert',
  ])
    app.component(name, wrapper)
  app.component('UPageHeader', {
    props: ['title', 'description', 'links'],
    setup: (props) => () =>
      h('header', [
        h('h1', props.title),
        h('p', props.description),
        ...props.links.map((link) => h('a', { href: link.to }, link.label)),
      ]),
  })
  app.component('ULink', {
    props: ['to'],
    setup:
      (props, { slots }) =>
      () =>
        h('a', { href: props.to }, slots.default?.()),
  })
  app.component('UButton', {
    props: ['label', 'loading'],
    setup: (props, { attrs }) => {
      if (attrs.onClick) actions.set(props.label, attrs.onClick)
      return () => h('button', attrs, props.label)
    },
  })
  for (const name of ['UIcon', 'FireCopyError'])
    app.component(name, { render: () => null })
  app.component(
    'FireState',
    load(
      new URL(
        'packages/core/fireux-core/src/runtime/components/molecules/State.vue',
        root
      )
    )
  )
  app.component(
    'FireLegalNotice',
    load(
      new URL(
        'packages/extensions/fireux-app/src/runtime/components/Legal/Notice.vue',
        root
      )
    )
  )
  app.component(
    'FireMeta',
    load(new URL('components/Meta/Index.vue', runtime), dependencies, bindings)
  )
  for (const name of ['Copy', 'Seo', 'Legal'])
    app.component(
      `FireMeta${name}`,
      load(new URL(`components/Meta/${name}.vue`, runtime))
    )
  const html = await renderToString(app)
  return { html, requests, actions, pageMeta, seo, acquisitions, status }
}

for (const [consumer, appName] of [
  ['misebox', 'Misebox'],
  ['fireux', 'FireUX'],
]) {
  test(`${appName} opts into one public read with its own route policy and readable copy`, async () => {
    const result = await render({ consumer })
    assert.equal(result.acquisitions, 1)
    assert.equal(result.requests.length, 1)
    assert.equal(result.requests[0].url, '/api/app/meta')
    assert.deepEqual(Object.keys(result.requests[0].options), ['signal'])
    assert.equal(result.html.match(/<h1>/g)?.length, 1)
    assert.match(result.html, /Public summary/)
    assert.match(result.html, /App SEO default/)
    assert.equal(result.html.match(/App SEO default/g)?.length, 1)
    assert.equal(result.html.match(/App description/g)?.length, 1)
    assert.match(result.html, /Public notice/)
    assert.match(result.html, /href="\/api\/app\/meta"/)
    assert.match(result.html, /href="\/legal"/)
    assert.match(result.html, /href="https:\/\/example.test\/public.png"/)
    assert.equal(
      result.html.match(/href="https:\/\/example.test\/public.png"/g)?.length,
      1
    )
    assert.match(result.html, /<h2[^>]*>Copy<\/h2>/)
    assert.match(result.html, /Public headline/)
    assert.match(result.html, /Public copy, ready to read\./)
    assert.match(result.html, /Safe &amp; readable &lt;unfinished/)
    assert.equal(result.actions.has('Refresh metadata'), false)
    assert.doesNotMatch(
      result.html,
      /<script>|<strong>|&lt;strong|&lt;script|Refresh metadata|Messaging|DO_NOT_RENDER_PRIVATE_EXTRA|<input|<form|<textarea/
    )
    assert.equal(
      result.pageMeta.layout,
      consumer === 'fireux' ? 'framework' : 'default'
    )
    assert.equal(result.pageMeta.sitemap, false)
    assert.equal(result.seo.path, '/meta')
    assert.equal(result.seo.title, `Public metadata · ${appName}`)
    assert.equal(result.seo.robots, 'noindex,follow')
  })
}

test('distinct social copy and images remain visible without repeating search defaults', async () => {
  const response = fixture()
  response.seo.open_graph.title = 'Open Graph title'
  response.seo.open_graph.label = 'DO_NOT_RENDER_UNKNOWN_SOCIAL_FIELD'
  response.seo.twitter.description = 'Twitter description'
  response.seo.twitter.image_url = 'https://example.test/twitter.png'
  const result = await render({ response })
  assert.match(result.html, /Open Graph title/)
  assert.match(result.html, /Twitter description/)
  assert.match(result.html, /href="https:\/\/example.test\/public.png"/)
  assert.match(result.html, /href="https:\/\/example.test\/twitter.png"/)
  assert.equal(result.html.match(/App SEO default/g)?.length, 1)
  assert.equal(result.html.match(/App description/g)?.length, 1)
  assert.doesNotMatch(result.html, /DO_NOT_RENDER_UNKNOWN_SOCIAL_FIELD/)
})

test('pending and failed reads hide retained content; retry makes only another public read', async () => {
  const pending = await render({ state: 'pending' })
  assert.match(pending.html, /Loading public App metadata/)
  assert.doesNotMatch(
    pending.html,
    /Public summary|App SEO default|Public notice/
  )
  const failed = await render({ state: 'error' })
  assert.match(failed.html, /Unable to load public App metadata/)
  assert.doesNotMatch(
    failed.html,
    /Public summary|App SEO default|Public notice|DO_NOT_RENDER_PRIVATE_EXTRA/
  )
  assert.ok(failed.actions.has('Try again'))
  failed.actions.get('Try again')()
  await Promise.resolve()
  assert.equal(failed.requests.length, 2)
  assert.ok(
    failed.requests.every(
      ({ url, options }) =>
        url === '/api/app/meta' && Object.keys(options).join() === 'signal'
    )
  )
})

test('successful absence and empty legal information remain explicit', async () => {
  const absent = await render({ response: null })
  assert.match(absent.html, /No public App metadata yet/)
  const response = fixture()
  response.legal.notices = []
  const emptyLegal = await render({ response })
  assert.match(emptyLegal.html, /No App-specific legal notices are published/)
  assert.match(emptyLegal.html, /href="\/legal"/)
})

test('ordinary Legal notices keep their one public read and render the same shared notice card', async () => {
  const legal = await render({ consumer: 'legal' })
  assert.equal(legal.acquisitions, 1)
  assert.equal(legal.requests.length, 1)
  assert.equal(legal.requests[0].url, '/api/app/meta')
  assert.match(legal.html, /Public notice/)
  assert.match(legal.html, /Public legal information/)
  assert.match(legal.html, /Reviewed notice text/)
  assert.match(legal.html, /href="https:\/\/example.test\/legal"/)
})
