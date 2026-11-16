import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { transpileModule, ModuleKind } from 'typescript'
import { parse, compileScript } from 'vue/compiler-sfc'
import { computed, createRenderer, createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'

const require = createRequire(import.meta.url)
const appRoot = new URL('../', import.meta.url)
const coreRoot = new URL(
  '../../../../packages/core/fireux-core/src/runtime/',
  appRoot
)

function component(file, bindings = {}) {
  const { descriptor } = parse(readFileSync(file, 'utf8'))
  const source = compileScript(descriptor, {
    id: file.pathname,
    inlineTemplate: true,
  }).content.replaceAll('import.meta.dev', 'false')
  const code = transpileModule(source, {
    compilerOptions: { module: ModuleKind.CommonJS },
  }).outputText
  const exports = {}
  compileFunction(code, ['require', 'exports', ...Object.keys(bindings)])(
    (name) =>
      name.endsWith('/useSeo')
        ? { useSeo: bindings.useSeo }
        : name.endsWith('/useMenuDirectory')
          ? { useMenuDirectory: bindings.useMenuDirectory }
          : name.endsWith('/useToolProviderHeight')
            ? { useToolProviderHeight: bindings.useToolProviderHeight }
            : require(name),
    exports,
    ...Object.values(bindings)
  )
  return exports.default
}

test('Ordering supplies a native element to Core height observation and cleans up', async () => {
  const { useToolProviderHeight } = await import(
    new URL(
      'composables/fireux/tool-provider/useToolProviderHeight.ts',
      coreRoot
    )
  )
  class Element {
    constructor(tag) {
      this.tag = tag
      this.scrollHeight = 320
    }
    getBoundingClientRect() {
      return { height: 320 }
    }
  }
  const renderer = createRenderer({
    createElement: (tag) => new Element(tag),
    createText: (text) => ({ text }),
    createComment: (text) => ({ text }),
    insert() {},
    remove() {},
    setText() {},
    setElementText() {},
    parentNode() {
      return null
    },
    nextSibling() {
      return null
    },
    patchProp() {},
  })
  const observed = []
  const messages = []
  const listeners = new Set()
  let disconnected = false
  const body = new Element('body')
  const globals = {
    window: {
      parent: { postMessage: (...args) => messages.push(args) },
      addEventListener: (name) => listeners.add(name),
      removeEventListener: (name) => listeners.delete(name),
    },
    document: { body },
    ResizeObserver: class {
      observe(target) {
        assert.ok(
          target instanceof Element,
          'ResizeObserver target must be a native element'
        )
        observed.push(target)
      }
      disconnect() {
        disconnected = true
      }
    },
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    },
    cancelAnimationFrame() {},
  }
  const previous = Object.fromEntries(
    Object.keys(globals).map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ])
  )
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    })
  }
  const surface = component(new URL('pages/tools/ordering.vue', appRoot), {
    definePageMeta: (metadata) => assert.equal(metadata.layout, false),
    useToolProviderHeight,
  })
  const app = renderer.createApp(surface)
  app.component('UPage', {
    setup:
      (_, { slots }) =>
      () =>
        h('section', slots.default?.()),
  })
  app.component('ProviderToolsOrdering', { render: () => h('article') })
  try {
    app.mount(new Element('root'))
    await nextTick()
    assert.equal(observed.length, 2)
    assert.ok(observed[0] instanceof Element)
    assert.equal(observed[1], body)
    assert.deepEqual(messages, [
      [
        {
          source: 'misebox',
          tool: 'ordering',
          type: 'tool-height',
          height: 320,
        },
        '*',
      ],
    ])
    assert.deepEqual([...listeners].sort(), ['message', 'resize'])
  } finally {
    app.unmount()
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  }
  assert.equal(disconnected, true)
  assert.equal(listeners.size, 0)
})

function renderedApp(surface, props = {}) {
  const app = createSSRApp(surface, props)
  const wrapper = {
    setup:
      (_, { slots }) =>
      () =>
        h('div', slots.default?.()),
  }
  for (const name of ['UPage', 'UPageBody', 'UCard', 'UPageGrid'])
    app.component(name, wrapper)
  app.component('UButton', {
    props: ['to'],
    setup:
      (props, { slots }) =>
      () =>
        h('a', { href: props.to }, slots.default?.()),
  })
  app.component('UPageHeader', {
    props: ['title', 'description'],
    setup: (props) => () =>
      h('header', [h('h1', props.title), h('p', props.description)]),
  })
  for (const name of ['UBadge', 'UIcon', 'AppBrandLogo'])
    app.component(name, { render: () => null })
  return app
}

for (const [slug, title, tool] of [
  ['text', 'Text', null],
  ['qr-menu-url', 'Menu URL QR', 'ProviderGoQrTools'],
  [
    'multilingual-restaurant-menu',
    'Multilingual restaurant menu',
    'ProviderSproochliMenuTool',
  ],
]) {
  test(`${slug} renders its solution entrance and content in order`, async () => {
    let metadata
    let seo
    const surface = component(new URL(`pages/solutions/${slug}.vue`, appRoot), {
      definePageMeta: (value) => {
        metadata = value
      },
      useSeo: (value) => {
        seo = value
      },
    })
    const app = renderedApp(surface)
    app.component(
      'AppToolFoldaway',
      component(new URL('app/components/Tool/Foldaway.vue', coreRoot))
    )
    if (tool) {
      app.component(tool, { render: () => h('output', 'Provider tool') })
      for (const [name, heading] of [
        ['SolutionInstructions', 'Instructions'],
        ['SolutionIntegrations', 'Integrations'],
        ['SolutionUpgrades', 'Upgrades'],
        ['SolutionDev', 'Dev'],
      ])
        app.component(name, { render: () => h('h2', heading) })
    }
    const html = await renderToString(app)
    assert.equal(metadata.layout, 'landing')
    assert.equal(seo.title, `${title} - Misebox`)
    assert.equal(seo.path, `/solutions/${slug}`)
    assert.match(html, /href="\/solutions"[^>]*>Solutions<\/a>/)
    assert.equal((html.match(/<h1>/g) || []).length, 1)
    assert.ok(
      html.indexOf('>Solutions</a>') < html.indexOf(`<h1>${title}</h1>`)
    )
    if (tool) {
      const order = [
        'Provider tool',
        'Instructions',
        'Integrations',
        'Upgrades',
        'Dev',
      ].map((label) => html.indexOf(`>${label}<`))
      assert.ok(
        order.every(
          (position, index) =>
            position >= 0 && (!index || position > order[index - 1])
        )
      )
    } else {
      assert.equal(seo.robots, 'noindex, nofollow')
      assert.match(html, /<details open/)
      assert.match(html, /Coming soon\./)
      assert.doesNotMatch(html, /<iframe|loading|skeleton/i)
    }
  })
}

for (const props of [
  {},
  { title: 'Custom title', description: 'Custom description' },
]) {
  test(`Ordering retains provider attribution and one menu reader (${props.title || 'defaults'})`, async () => {
    let menuReads = 0
    const menuIndex = { outcome: 'empty', items: [] }
    const surface = component(
      new URL('components/Provider/Tools/Ordering.vue', appRoot),
      {
        useFetch: async (endpoint) => {
          assert.equal(endpoint, '/api/tools/ordering')
          return {
            data: {
              value: {
                tool: {
                  title: 'Ordering fixture',
                  description: 'Fixture description',
                },
              },
            },
          }
        },
        useMenuDirectory: () => {
          menuReads++
          return menuIndex
        },
        computed,
      }
    )
    const app = renderedApp(surface, props)
    app.component(
      'FireProviderToolFrame',
      component(new URL('components/Provider/Tool/Frame.vue', coreRoot))
    )
    let collection
    app.component('MenuCollection', {
      props: ['id', 'index', 'title', 'description', 'showVariantToggle'],
      setup: (props) => {
        collection = props
        return () => h('output', 'Menu collection')
      },
    })
    const html = await renderToString(app)
    assert.equal(menuReads, 1)
    assert.equal(collection.index, menuIndex)
    assert.equal(collection.id, 'misebox-ordering-menus')
    assert.equal(collection.showVariantToggle, false)
    assert.match(
      html,
      /href="https:\/\/misebox.app" target="_blank" rel="noopener"/
    )
    assert.match(html, /Powered by Misebox/)
    assert.ok(html.includes(`<h2>${props.title || 'Ordering fixture'}</h2>`))
    assert.ok(html.includes(props.description || 'Fixture description'))
    assert.match(html, /Menu collection/)
  })
}
