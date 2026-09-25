import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import * as vue from 'vue'
import { parse, compileScript } from 'vue/compiler-sfc'
import { renderToString } from 'vue/server-renderer'
import ts from 'typescript'
const runtime = new URL('../runtime/kitchen/', import.meta.url)
const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
const sellable = () => ({
  id: 'shared',
  dish_id: 'dish',
  status: 'active',
  revision: 4,
  variants: [
    {
      id: 'default',
      label: 'Default',
      quantity: 1,
      unit: 'piece',
      implicit: true,
    },
  ],
  terms: {
    currency: 'CHF',
    prices: { default: 18 },
    add_ons: [],
    fulfilment: { default: ['collection'] },
  },
})
function setup({ fail = false, token = async () => 'token' } = {}) {
  const currentUser = vue.ref({ uid: 'user', getIdToken: token })
  const kitchenId = vue.ref('kitchen'),
    sellableId = vue.ref('shared'),
    writable = vue.ref(true)
  const source = {
    data: vue.ref(null),
    status: vue.ref('pending'),
    error: vue.ref(null),
    refresh: async () => {
      refreshes++
    },
  }
  let handler,
    refreshes = 0
  const calls = []
  const exports = {}
  compileFunction(
    transpile(
      readFileSync(
        new URL(
          'composables/workspace/menus/useKitchenSellableTerms.ts',
          runtime
        ),
        'utf8'
      )
    ),
    ['require', 'exports', '$fetch']
  )(
    (id) => {
      if (id === 'vue') return vue
      if (id.includes('useAuth')) return { useAuth: () => ({ currentUser }) }
      if (id.includes('useLiveAsyncData'))
        return {
          useLiveAsyncData: (_key, run) => {
            handler = run
            return source
          },
        }
      throw new Error(id)
    },
    exports,
    async (url, options) => {
      calls.push({ url, ...options })
      if (fail) throw { statusCode: 409 }
      return { revision: 5 }
    }
  )
  let model
  const scope = vue.effectScope()
  scope.run(() => {
    model = exports.useKitchenSellableTerms({
      kitchenId,
      sellableId,
      canWrite: writable,
    })
  })
  const ready = () => {
    source.data.value = {
      scope: JSON.stringify([
        currentUser.value.uid,
        kitchenId.value,
        sellableId.value,
      ]),
      record: sellable(),
    }
    source.status.value = 'success'
  }
  return {
    model,
    source,
    currentUser,
    kitchenId,
    sellableId,
    writable,
    calls,
    ready,
    scope,
    handler: () => handler,
    refreshes: () => refreshes,
  }
}
test('live reader scopes canonical values to account/Kitchen/item and suppresses stale records', async () => {
  const s = setup()
  s.ready()
  assert.equal(s.model.record.value.terms.prices.default, 18)
  const requests = []
  const result = await s.handler()(async (url, options) => {
    requests.push({ url, ...options })
    return sellable()
  })
  assert.equal(requests[0].url, '/api/workspace/kitchen/sellables')
  assert.deepEqual(requests[0].query, {
    kitchenId: 'kitchen',
    sellableId: 'shared',
  })
  assert.equal(result.record.id, 'shared')
  s.kitchenId.value = 'other'
  assert.equal(s.model.record.value, null)
  assert.equal(s.model.canEdit.value, false)
  s.currentUser.value = null
  assert.equal(s.model.outcome.value, 'idle')
  s.scope.stop()
})
test('shared update sends revision and preserves fulfilment; conflict never retries the write', async () => {
  const s = setup()
  s.ready()
  await s.model.update({
    ...s.model.record.value.terms,
    prices: { default: 21 },
  })
  assert.equal(s.calls[0].body.expectedRevision, 4)
  assert.deepEqual(s.calls[0].body.terms.fulfilment, {
    default: ['collection'],
  })
  assert.equal(s.calls[0].body.terms.prices.default, 21)
  assert.equal(s.refreshes(), 1)
  s.scope.stop()
  const conflict = setup({ fail: true })
  conflict.ready()
  await assert.rejects(
    conflict.model.update(conflict.model.record.value.terms),
    /changed elsewhere/
  )
  assert.equal(conflict.calls.length, 1)
  assert.equal(conflict.refreshes(), 1)
  assert.match(conflict.model.saveError.value, /Review the latest/)
  conflict.scope.stop()
})
test('account or selection changes while token is resolving cannot send an obsolete update', async () => {
  let release
  const s = setup({
    token: () =>
      new Promise((resolve) => {
        release = resolve
      }),
  })
  s.ready()
  const pending = s.model.update(s.model.record.value.terms)
  s.sellableId.value = 'other'
  release('token')
  await assert.rejects(pending)
  assert.equal(s.calls.length, 0)
  assert.equal(s.model.saveError.value, '')
  s.scope.stop()
})
function component(file, dependencies) {
  const { descriptor } = parse(readFileSync(new URL(file, runtime), 'utf8'))
  const compiled = compileScript(descriptor, { id: file, inlineTemplate: true })
  const exports = {}
  compileFunction(transpile(compiled.content), ['require', 'exports'])(
    (id) => (id === 'vue' ? vue : dependencies(id)),
    exports
  )
  return exports.default
}
const row = {
  id: 'placement',
  item: { sellable_id: 'shared' },
  dishId: 'dish',
  label: 'Burger',
  price: 999,
  priceOptions: [],
  addOns: [],
}
async function renderShared(state, record = sellable()) {
  const options = component(
    'components/Workspace/Menus/Items/Options.vue',
    () => ({
      normalizeSlug: (value) =>
        String(value).toLowerCase().replaceAll(' ', '-'),
    })
  )
  const view = component(
    'components/Workspace/Menus/Items/SharedTerms.vue',
    (id) =>
      id.endsWith('Options.vue')
        ? { default: options }
        : {
            useKitchenSellableTerms: () => ({
              outcome: vue.ref(state),
              record: vue.ref(state === 'ready' ? record : null),
              canEdit: vue.ref(true),
              saveError: vue.ref(''),
              update: async () => {},
            }),
          }
  )
  const app = vue.createSSRApp(view, {
    row,
    kitchenId: 'kitchen',
    sellableId: 'shared',
    canWrite: true,
  })
  app.config.warnHandler = () => {}
  app.component('MoleculesFormsEditableSimpleField', {
    props: ['label', 'value'],
    render() {
      return vue.h('div', `${this.label}: ${this.value}`)
    },
  })
  app.component('MoleculesStateCard', {
    props: ['title'],
    render() {
      return vue.h('div', this.title)
    },
  })
  app.component('MoleculesDisclosurePanel', {
    render() {
      return vue.h('section', this.$slots.default?.())
    },
  })
  return (await renderToString(app))
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
}
test('implicit shared price has no variant ceremony and never renders frozen placement amount', async () => {
  const html = await renderShared('ready')
  assert.match(html, /Price \(CHF\): 18/)
  assert.match(html, /shared with every menu/)
  assert.doesNotMatch(html, /999|Variant prices|New variant/)
  assert.doesNotMatch(await renderShared('pending'), /999|Price \(CHF\)/)
  assert.match(await renderShared('error'), /Shared prices unavailable/)
})
test('named variants retain labels and canonical prices without variant mutation controls', async () => {
  const record = sellable()
  record.variants = [
    { id: 'small', label: 'Small', quantity: 1, unit: 'piece' },
    { id: 'large', label: 'Large', quantity: 2, unit: 'piece' },
  ]
  record.terms.prices = { small: 12, large: 19 }
  const html = await renderShared('ready', record)
  assert.match(html, /Small/)
  assert.match(html, /Option price: 12/)
  assert.match(html, /Option price: 19/)
  assert.doesNotMatch(html, /999|New variant|Option label/)
})

test('operator adoption uses exact placement, omits default ceremony and emits canonical identity', async () => {
  const calls = [],
    adopted = []
  const { descriptor } = parse(
    readFileSync(
      new URL('components/Workspace/Menus/Items/AdoptSharedTerms.vue', runtime),
      'utf8'
    )
  )
  const compiled = compileScript(descriptor, {
    id: 'adopt',
    inlineTemplate: true,
  })
  const exports = {}
  compileFunction(transpile(compiled.content), [
    'require',
    'exports',
    '$fetch',
  ])(
    (id) =>
      id === 'vue'
        ? vue
        : {
            useAuth: () => ({
              currentUser: vue.ref({
                uid: 'user',
                getIdToken: async () => 'token',
              }),
            }),
          },
    exports,
    async (url, options) => {
      calls.push({ url, ...options })
      return { sellableId: 'canonical' }
    }
  )
  const renderer = vue.createRenderer({
    createElement: (type) => ({ type, children: [], props: {} }),
    createText: (text) => ({ text }),
    createComment: (text) => ({ text }),
    setText: (node, text) => {
      node.text = text
    },
    setElementText: (node, text) => {
      node.text = text
    },
    parentNode: (node) => node.parent,
    nextSibling: () => null,
    insert: (node, parent) => {
      node.parent = parent
      parent.children.push(node)
    },
    remove: () => {},
    patchProp: (node, key, _old, value) => {
      node.props[key] = value
    },
  })
  const root = { children: [] }
  const app = renderer.createApp(exports.default, {
    row: { ...row, item: {} },
    kitchenId: 'kitchen',
    menuId: 'menu',
    sectionId: 'section',
    canWrite: true,
    onAdopted: (id) => adopted.push(id),
  })
  app.config.warnHandler = () => {}
  app.component('UModal', {
    render() {
      return vue.h('div', [
        this.$slots.default?.(),
        this.$slots.body?.(),
        this.$slots.footer?.(),
      ])
    },
  })
  app.component('UButton', {
    render() {
      return vue.h('button', this.$attrs, this.$slots.default?.())
    },
  })
  app.mount(root)
  const buttons = []
  const walk = (node) => {
    if (node.type === 'button') buttons.push(node)
    for (const child of node.children || []) walk(child)
  }
  walk(root)
  await buttons[1].props.onClick()
  assert.deepEqual(calls[0].body, {
    kitchenId: 'kitchen',
    menuId: 'menu',
    sectionId: 'section',
    itemId: 'placement',
  })
  assert.equal(calls[0].url, '/api/workspace/kitchen/sellables/bind')
  assert.deepEqual(adopted, ['canonical'])
  app.unmount()
})
