import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { transpileModule, ModuleKind } from 'typescript'
import { parse, compileScript } from 'vue/compiler-sfc'
import { createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useCollectionPage } from '../../../../../packages/core/fireux-core/src/runtime/composables/shared/useCollectionPage.ts'

const require = createRequire(import.meta.url)
const appRoot = new URL('../', import.meta.url)
const repo = new URL('../../../../../', import.meta.url)
function evaluate(source, bindings) {
  const code = transpileModule(source, {
    compilerOptions: { module: ModuleKind.CommonJS },
  }).outputText
  const exports = {}
  compileFunction(code, ['require', 'exports', ...Object.keys(bindings)])(
    (name) => {
      if (name === '#imports') return bindings
      if (name.endsWith('/useSeo'))
        return { useAppLandingSeo: bindings.useAppLandingSeo }
      if (name.endsWith('/useKitchens'))
        return { useKitchens: bindings.useKitchens }
      if (name.endsWith('/useCollectionPage')) return { useCollectionPage }
      if (name.endsWith('/useWorkspaceEntryCta'))
        return { useWorkspaceEntryCta: bindings.useWorkspaceEntryCta }
      if (name.endsWith('/Landing/Public.vue'))
        return { default: bindings.LandingPublic }
      if (name === 'fireux-ecosystem/config')
        return { defineFireuxEcosystem: (value) => value }
      return require(name)
    },
    exports,
    ...Object.values(bindings)
  )
  return exports.default
}
function component(path, bindings = {}) {
  const { descriptor } = parse(readFileSync(path, 'utf8'))
  return evaluate(
    compileScript(descriptor, { id: path.pathname, inlineTemplate: true })
      .content,
    bindings
  )
}
function application(surface) {
  const app = createSSRApp(surface)
  const wrap = {
    setup:
      (_, { slots }) =>
      () =>
        h('div', slots.default?.()),
  }
  for (const name of ['UPage', 'UPageBody']) app.component(name, wrap)
  app.component('UIcon', { render: () => null })
  app.component('FireDiagnosticsDebugPanel', { render: () => null })
  app.component('FireCopyError', { render: () => null })
  app.component('UPageHeader', {
    props: ['title', 'description'],
    setup:
      (props, { slots }) =>
      () =>
        h('header', [
          slots.headline?.(),
          h('h1', props.title),
          h('p', props.description),
          slots.links?.(),
        ]),
  })
  app.component('UPageCTA', {
    props: ['title', 'description', 'links'],
    setup: (props) => () =>
      h('section', [
        h('h2', props.title),
        h('p', props.description),
        ...props.links.map((link) => h('a', { href: link.to }, link.label)),
      ]),
  })
  return app
}

for (const outcome of ['pending', 'error', 'empty', 'ready']) {
  test(`public Home uses one Kitchen reader with shared presentation (${outcome})`, async () => {
    let reads = 0
    let refreshed = 0
    let retry
    let metadata
    let seo
    const bindings = {
      useKitchens: () => {
        reads++
        return {
          collection: ref(
            outcome === 'ready'
              ? [{ id: 'venue', name: 'Fixture Kitchen' }]
              : []
          ),
          outcome: ref(outcome),
          error: ref(
            outcome === 'error' ? new Error('Read unavailable') : null
          ),
          refresh: () => {
            refreshed++
          },
        }
      },
      useWorkspaceEntryCta: () => ({
        workspaceEntryHref: ref('/workspace/kitchen'),
      }),
      useRoute: () => ({ path: '/' }),
      definePageMeta: (value) => {
        metadata = value
      },
      useAppLandingSeo: (value) => {
        seo = value
      },
    }
    bindings.LandingPublic = component(
      new URL('components/Landing/Public.vue', appRoot),
      bindings
    )
    const app = application(
      component(new URL('pages/index.vue', appRoot), bindings)
    )
    app.component(
      'PublicKitchenIntro',
      component(
        new URL(
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Intro.vue',
          repo
        ),
        bindings
      )
    )
    app.component(
      'LandingWorkspaceEntry',
      component(
        new URL('components/Landing/WorkspaceEntry.vue', appRoot),
        bindings
      )
    )
    app.component(
      'FireState',
      component(
        new URL(
          'packages/core/fireux-core/src/runtime/components/molecules/State.vue',
          repo
        )
      )
    )
    app.component('PublicKitchenCollection', {
      props: ['kitchens'],
      setup: (props) => () =>
        h(
          'div',
          props.kitchens.map((kitchen) => h('h2', kitchen.name))
        ),
    })
    app.component('UButton', {
      props: ['label', 'to'],
      setup: (props, { attrs, slots }) => {
        if (props.label === 'Try again') retry = attrs.onClick
        return () =>
          h(
            props.to ? 'a' : 'button',
            { href: props.to },
            props.label || slots.default?.()
          )
      },
    })
    const html = await renderToString(app)
    assert.equal(reads, 1)
    assert.deepEqual(metadata, { layout: 'default', requiresAuth: false })
    assert.equal(seo.path, '/')
    assert.equal((html.match(/<h1>/g) || []).length, 1)
    assert.match(html, /Discover your next favourite Kitchen/)
    assert.match(html, /href="\/kitchens"/)
    assert.match(html, /href="\/menus"/)
    assert.match(html, /href="\/workspace\/kitchen"/)
    assert.equal(html.includes('Fixture Kitchen'), outcome === 'ready')
    if (outcome === 'pending') assert.match(html, /Loading kitchens/)
    if (outcome === 'empty') assert.match(html, /No kitchens yet/)
    if (outcome === 'error') {
      assert.match(html, /role="alert"/)
      assert.match(html, /Unable to load kitchens/)
      retry()
      assert.equal(refreshed, 1)
    }
  })
}

test('/home redirects to the canonical public root with query and fragment intact', async () => {
  const route = {
    path: '/home',
    query: { category: 'tapas' },
    hash: '#directory',
  }
  let destination
  let options
  let metadata
  const surface = component(new URL('pages/home.vue', appRoot), {
    definePageMeta: (value) => {
      metadata = value
    },
    useRoute: () => route,
    navigateTo: async (target, config) => {
      destination = target
      options = config
    },
  })
  await renderToString(createSSRApp(surface))
  assert.deepEqual(destination, {
    path: '/',
    query: route.query,
    hash: route.hash,
  })
  assert.deepEqual(options, { redirectCode: 301, replace: true })
  assert.deepEqual(metadata, {
    layout: false,
    pageTransition: false,
    requiresAuth: false,
  })
})

test('Misebox navigation and indexing select the public root while preserving Kitchen Workspace', () => {
  const config = evaluate(
    readFileSync(new URL('../nuxt.config.ts', appRoot), 'utf8'),
    {}
  )
  assert.equal(config.homePath, '/')
  assert.ok(!config.seo.noindexPaths?.includes('/'))
  assert.ok(config.seo.staticPaths.includes('/'))
  assert.ok(!config.seo.staticPaths.includes('/home'))
  assert.deepEqual(config.workspaces, ['kitchen'])
})
