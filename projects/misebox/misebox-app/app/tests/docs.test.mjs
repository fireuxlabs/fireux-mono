import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { compileFunction } from 'node:vm'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { ModuleKind, transpileModule } from 'typescript'
import { parse, compileScript } from 'vue/compiler-sfc'
import { createRenderer, createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as docs from '../content/docs.ts'
import { validateFireuxAppConfig } from '../../../../../packages/core/fireux-core/src/config/app/validate.ts'

const require = createRequire(import.meta.url)
const appRoot = new URL('../', import.meta.url)
const root = new URL('../../../../', appRoot)
const kitchen = new URL(
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/',
  root
)
const core = new URL('packages/core/fireux-core/src/runtime/components/', root)

function load(file, bindings = {}) {
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
  const exports = {}
  const code = transpileModule(source, {
    compilerOptions: { module: ModuleKind.CommonJS },
  }).outputText
  compileFunction(code, ['require', 'exports', ...Object.keys(bindings)])(
    (name) => {
      if (name.endsWith('/content/docs')) return docs
      if (name === 'fireux-core/runtime/composables/fireux/seo/useSeo') {
        assert.equal(typeof bindings.useSeo, 'function')
        return { useSeo: bindings.useSeo }
      }
      assert.equal(
        name,
        'vue',
        `Preview must not import a reader or service: ${name}`
      )
      return require(name)
    },
    exports,
    ...Object.values(bindings)
  )
  return exports.default
}

function register(app) {
  const wrapper = {
    setup:
      (_, { slots }) =>
      () =>
        h('div', [slots.header?.(), slots.default?.()]),
  }
  for (const name of ['UPage', 'UPageBody', 'UCard', 'UPageGrid', 'UPageCard'])
    app.component(name, wrapper)
  app.component('UPageHeader', {
    props: ['title', 'description'],
    setup: (props) => () =>
      h('header', [h('h1', props.title), h('p', props.description)]),
  })
  app.component('UNavigationMenu', {
    props: ['items'],
    setup: (props) => () =>
      h(
        'nav',
        props.items.map((item) => h('a', { href: item.to }, item.label))
      ),
  })
  app.component('ULink', {
    props: ['to'],
    setup:
      (props, { slots }) =>
      () =>
        h('a', { href: props.to }, slots.default?.()),
  })
  app.component('UButton', {
    props: ['label'],
    setup:
      (props, { attrs, slots }) =>
      () =>
        h('button', attrs, props.label || slots.default?.()),
  })
  app.component('UInput', {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    setup:
      (props, { attrs, emit }) =>
      () =>
        h('input', {
          ...attrs,
          value: props.modelValue,
          onInput: (event) => emit('update:modelValue', event.target.value),
        }),
  })
  app.component('USelect', {
    props: ['modelValue', 'items'],
    emits: ['update:modelValue'],
    setup:
      (props, { attrs, emit }) =>
      () =>
        h(
          'select',
          {
            ...attrs,
            value: props.modelValue,
            onChange: (event) => emit('update:modelValue', event.target.value),
          },
          props.items.map((item) => h('option', { value: item }, item))
        ),
  })
  app.component('UAlert', {
    props: ['title', 'description'],
    setup: (props) => () => h('aside', [props.title, props.description]),
  })
  app.component('UBadge', wrapper)
  for (const name of ['UIcon', 'UAvatar', 'FireCopyError'])
    app.component(name, { render: () => null })
  app.component(
    'FireActionSurface',
    load(new URL('molecules/ActionSurface.vue', core))
  )
  app.component('FireState', load(new URL('molecules/State.vue', core)))
  app.component(
    'PublicKitchenCardsPill',
    load(new URL('Cards/Pill.vue', kitchen))
  )
  app.component(
    'PublicKitchenCollectionControls',
    load(new URL('Collection/Controls.vue', kitchen))
  )
  for (const name of [
    'Setup',
    'Architecture',
    'ComponentExamples',
    'CompositionReferences',
  ]) {
    app.component(
      `Docs${name}`,
      load(new URL(`components/Docs/${name}.vue`, appRoot))
    )
  }
}

test('guide recipe validates and its source links resolve in the local checkout', () => {
  let captured
  const exports = {}
  const code = transpileModule(docs.miseboxAppExample, {
    compilerOptions: { module: ModuleKind.CommonJS },
  }).outputText
  compileFunction(code, ['require', 'exports'])(
    () => ({
      defineFireuxApp(input) {
        validateFireuxAppConfig(input)
        captured = input
        return input
      },
    }),
    exports
  )
  assert.equal(captured.role, 'tenant')
  assert.equal(captured.ecosystem, 'misebox')
  assert.deepEqual(captured.workspaces, ['kitchen'])
  assert.equal(captured.workspaceConfig.kitchen.canCreate, false)
  for (const to of Object.values(docs.miseboxDocsSources)) {
    const path = to.split('/blob/main/')[1].split('#')[0]
    assert.ok(existsSync(new URL(path, root)), path)
  }
  const surfaces = readFileSync(
    new URL('docs/concepts/components.md', root),
    'utf8'
  )
  assert.match(surfaces, /### Domain component surfaces/)
  assert.ok(
    docs.miseboxDocsResources.some(
      (item) => item.to === 'https://firebase.google.com/docs/web/setup'
    )
  )
})

for (const page of ['index', 'components']) {
  test(`/docs/${page} renders native navigation and curated content without service acquisition`, async () => {
    let meta, seo
    const surface = load(new URL(`pages/docs/${page}.vue`, appRoot), {
      definePageMeta: (value) => {
        meta = value
      },
      useSeoMeta() {},
      useSeo: (value) => {
        seo = value
      },
    })
    const app = createSSRApp(surface)
    register(app)
    const html = await renderToString(app)
    assert.equal(meta.layout, 'default')
    assert.equal((html.match(/<h1>/g) || []).length, 1)
    assert.match(html, /href="\/docs"/)
    assert.match(html, /href="\/docs\/components"/)
    if (page === 'index') {
      assert.equal(seo.path, '/docs')
      assert.equal(seo.title, 'Developer docs · Misebox')
      assert.match(html, /href="\/meta"/)
      assert.match(html, /href="\/api\/app\/meta"/)
      assert.match(html, /Compose an App/)
      assert.match(html, /Public experience, Workspace and domain owners/)
      assert.match(html, /firebase.google.com\/docs\/web\/setup/)
    } else {
      assert.match(html, /Preview controls · no Kitchen records/)
      assert.match(html, /Preview activations: 0/)
      assert.match(html, /No example Kitchens yet/)
      assert.match(html, /not an internal inventory/)
      assert.doesNotMatch(html, /<iframe/)
    }
  })
}

test('real supplied controls, pill and Core feedback change only preview state and reset', async () => {
  const element = (tag, text = '') => ({
    tag,
    text,
    props: {},
    children: [],
    parent: null,
  })
  const renderer = createRenderer({
    createElement: (tag) => element(tag),
    createText: (text) => element('#text', text),
    createComment: () => element('#comment'),
    insert(node, parent, anchor) {
      const index = anchor ? parent.children.indexOf(anchor) : -1
      if (index < 0) parent.children.push(node)
      else parent.children.splice(index, 0, node)
      node.parent = parent
    },
    remove(node) {
      node.parent.children.splice(node.parent.children.indexOf(node), 1)
    },
    setText(node, text) {
      node.text = text
    },
    setElementText(node, text) {
      node.text = text
      node.children = []
    },
    patchProp(node, key, _, value) {
      node.props[key] = value
    },
    parentNode: (node) => node.parent,
    nextSibling: () => null,
  })
  const target = element('root')
  const app = renderer.createApp(
    load(new URL('components/Docs/ComponentExamples.vue', appRoot))
  )
  register(app)
  const nodes = () => {
    const walk = (node) => [node, ...node.children.flatMap(walk)]
    return walk(target)
  }
  const text = (node) => node.text + node.children.map(text).join('')
  const button = (label) =>
    nodes().find((node) => node.tag === 'button' && text(node) === label)
  try {
    app.mount(target)
    nodes()
      .find((node) => node.tag === 'input')
      .props.onInput({ target: { value: 'local query' } })
    button('Café example').props.onClick()
    await nextTick()
    assert.match(text(target), /Preview query: local query · category: cafe/)
    button('Reset controls preview').props.onClick()
    nodes()
      .find((node) => node.props['data-action-surface'] === 'button')
      .props.onClick()
    nodes()
      .find((node) => node.tag === 'select')
      .props.onChange({ target: { value: 'error' } })
    await nextTick()
    assert.match(text(target), /Preview query: none · category: all/)
    assert.match(text(target), /Preview activations: 1/)
    button('Try again').props.onClick()
    await nextTick()
    assert.match(text(target), /Preview retries: 1/)
    button('Reset pill preview').props.onClick()
    button('Reset read-state preview').props.onClick()
    await nextTick()
    assert.match(text(target), /Preview activations: 0/)
    assert.match(text(target), /Preview retries: 0/)
    assert.match(text(target), /No example Kitchens yet/)
  } finally {
    app.unmount()
  }
})
