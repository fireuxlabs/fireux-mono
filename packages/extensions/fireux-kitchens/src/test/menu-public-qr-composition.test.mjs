import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
const runtime = new URL('../runtime/', import.meta.url)
function load(filename, modules = {}) {
  const { descriptor } = parse(readFileSync(filename, 'utf8'), {
    filename: filename.pathname,
  })
  const script = compileScript(descriptor, {
    id: filename.pathname,
    inlineTemplate: true,
  })
  const code = ts.transpileModule(
    script.content.replaceAll('import.meta.client', 'false'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }
  ).outputText
  const exports = {}
  compileFunction(code, ['require', 'exports'])((id) => {
    if (id === 'vue') return Vue
    assert.ok(modules[id], id)
    return modules[id]
  }, exports)
  return exports.default
}
test('public QR composes truthful states and a printable view with a gated print action', async () => {
  for (const state of ['loading', 'missing', 'generating', 'ready', 'error']) {
    let readers = 0,
      renderers = 0
    const failure =
      state === 'missing'
        ? {
            statusCode: 404,
            title: 'Menu not found',
            description: 'Unavailable context',
          }
        : null
    const view = {
      ready: Promise.resolve(),
      applyResponseStatus() {},
      pending: state === 'loading',
      qrFailure: failure,
      qrError: false,
      qrState:
        state === 'loading' ? 'loading' : failure ? 'unavailable' : 'ready',
      headingId:
        state === 'loading'
          ? 'menu-qr-loading-title'
          : failure
            ? 'menu-qr-failure-title'
            : 'menu-qr-title',
      hasMenu: !failure,
      menuId: 'food',
      menuContext: 'generic',
      menuRouteScope: { kind: 'directory' },
      renderKind: 'structured',
      menuPath: '/menus/food',
      menuIndexPath: '/menus',
      menuUrl: 'https://example.test/menus/food',
      menuName: 'Food',
      kitchenName: 'Venue',
      kitchenSlug: 'venue',
      kitchenLogoImageUrl: '/logo.png',
    }
    const Index = load(new URL('menu/components/QR/Index.vue', runtime), {
      '../../composables/useMenuQrPage': {
        useMenuQrPage: () => {
          readers++
          return view
        },
      },
    })
    const Printable = load(
      new URL('menu/components/QR/Printable.vue', runtime),
      {
        '../../composables/useMenuQrRenderer': {
          useMenuQrRenderer: () => {
            renderers++
            return {
              qrContainer: Vue.ref(null),
              qrReady: Vue.ref(state === 'ready'),
              qrError: Vue.ref(state === 'error'),
            }
          },
        },
      }
    )
    const app = Vue.createSSRApp({
      render: () =>
        Vue.h(Index, { menuId: 'food', menuRouteScope: { kind: 'directory' } }),
    })
    app.component('MenuQRPrintable', Printable)
    app.component(
      'MenuQRState',
      load(new URL('menu/components/QR/State.vue', runtime))
    )
    app.component(
      'MenuQRPrintAction',
      load(new URL('menu/components/QR/PrintAction.vue', runtime))
    )
    app.component(
      'MoleculesStateCard',
      load(
        new URL(
          '../../../../core/fireux-core/src/runtime/components/molecules/StateCard.vue',
          runtime
        )
      )
    )
    app.component('UCard', {
      setup:
        (_, { slots }) =>
        () =>
          Vue.h('section', slots.default?.()),
    })
    app.component('UButton', {
      props: ['to', 'disabled'],
      setup:
        (p, { slots }) =>
        () =>
          Vue.h(
            p.to ? 'a' : 'button',
            { href: p.to, disabled: p.disabled },
            slots.default?.()
          ),
    })
    app.component('NuxtLink', {
      props: ['to'],
      setup:
        (p, { slots }) =>
        () =>
          Vue.h('a', { href: p.to }, slots.default?.()),
    })
    for (const name of ['UIcon', 'MoleculesCopyError'])
      app.component(name, { render: () => null })
    const html = await renderToString(app)
    assert.equal(readers, 1)
    assert.equal(renderers, ['loading', 'missing'].includes(state) ? 0 : 1)
    if (state === 'loading') {
      assert.match(html, /Loading menu/)
      assert.doesNotMatch(html, /Print QR|Food/)
      continue
    }
    if (state === 'missing') {
      assert.match(html, /Unavailable context/)
      assert.match(html, /Back to menus/)
      assert.doesNotMatch(html, /Print QR/)
      continue
    }
    assert.match(html, /Scan to explore the menu/)
    assert.match(html, /https:\/\/example.test\/menus\/food/)
    assert.match(html, /id="menu-qr-title"/)
    assert.match(html, /Print QR/)
    if (state === 'ready') assert.doesNotMatch(html, /<button[^>]* disabled/)
    else assert.match(html, /<button[^>]* disabled/)
    if (state === 'error') assert.match(html, /QR code unavailable/)
  }
})
