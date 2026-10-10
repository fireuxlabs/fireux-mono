import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as vue from 'vue'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'

const runtime = new URL('../runtime/kitchen/', import.meta.url)
const core = new URL(
  '../../../../core/fireux-core/src/runtime/',
  import.meta.url
)
function load(url, result, deps = {}) {
  const source = readFileSync(url, 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useCommandScope = load(
  new URL('composables/fireux/commands/useCommandScope.ts', core),
  'useCommandScope',
  vue
)
const resolveReadOutcome = load(
  new URL('composables/fireux/firestore/operations/read-outcome.ts', core),
  'resolveReadOutcome'
)
const isFirestoreDocumentId = load(
  new URL('utils/firestoreDocumentId.ts', core),
  'isFirestoreDocumentId'
)
const readSellableTerms = load(
  new URL('utils/sellable.ts', runtime),
  'readSellableTerms'
)
const normalizeSlug = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const useEditableStringField = load(
  new URL('composables/forms/useEditableStringField.ts', core),
  'useEditableStringField',
  { ...vue, useCommandScope, normalizeSlug }
)
const record = () => ({
  id: 'shared',
  dish_id: 'dish',
  revision: 4,
  status: 'active',
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
const row = () => ({
  id: 'placement',
  item: {
    kitchen_id: 'kitchen',
    menu_id: 'menu',
    section_id: 'section',
    sellable_id: 'shared',
  },
  dishId: 'dish',
  label: 'Burger',
  price: 999,
  priceOptions: [],
  addOns: [],
})
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
async function drain() {
  for (let i = 0; i < 8; i++) await Promise.resolve()
  await vue.nextTick()
}
function context() {
  const scope = vue.effectScope(),
    token = deferred(),
    response = deferred(),
    calls = []
  const user = { uid: 'actor', getIdToken: () => token.promise },
    currentUser = vue.ref(user)
  const config = vue.reactive({ appId: 'app' }),
    appUser = vue.ref({ created: { at: 1 } })
  const appPending = vue.ref(false),
    appError = vue.ref(null),
    appOutcome = vue.ref('ready')
  const access = {
    ids: vue.ref(['kitchen', 'other']),
    outcome: vue.ref('ready'),
  }
  const selectedId = vue.ref('kitchen')
  const kitchenId = vue.ref('kitchen'),
    sellableId = vue.ref('shared'),
    writable = vue.ref(true)
  const route = vue.reactive({ fullPath: '/workspace/kitchen/menus/menu' })
  const source = {
    data: vue.ref(null),
    error: vue.ref(null),
    status: vue.ref('pending'),
    refresh: async () => {
      throw Error('Refresh should not replace a conflict')
    },
  }
  let handler, model
  const deps = {
    ...vue,
    useCommandScope,
    resolveReadOutcome,
    isFirestoreDocumentId,
    readSellableTerms,
    normalizeSlug,
    useAuth: () => ({ currentUser }),
    useFireUXConfig: () => config,
    useUserSession: () => ({ appUser, appPending, appError, appOutcome }),
    useKitchenAccess: () => access,
    useKitchenWorkspaceSelection: () => ({ selectedId }),
    useRoute: () => route,
    useLiveAsyncData: (_key, run) => {
      handler = run
      return source
    },
    $fetch: (url, options) => {
      calls.push({ url, options })
      return response.promise
    },
  }
  deps.useMenuEditorScope = load(
    new URL('../menu/composables/useMenuEditorScope.ts', runtime),
    'useMenuEditorScope',
    deps
  )
  const useKitchenSellableTerms = load(
    new URL('composables/workspace/menus/useKitchenSellableTerms.ts', runtime),
    'useKitchenSellableTerms',
    deps
  )
  scope.run(() => {
    model = useKitchenSellableTerms({
      kitchenId,
      sellableId,
      canWrite: writable,
    })
  })
  deps.useKitchenSellableTerms = () => model
  function ready(value = record()) {
    source.error.value = null
    source.data.value = { scope: model.scope.value, record: value }
    source.status.value = 'success'
  }
  function change(kind) {
    const toggle = (ref, value) => {
      const old = ref.value
      ref.value = value
      ref.value = old
    }
    if (kind === 'account') toggle(currentUser, { uid: 'other' })
    if (kind === 'app') {
      config.appId = 'other'
      config.appId = 'app'
    }
    if (kind === 'member') toggle(appUser, { created: { at: 2 } })
    if (kind === 'pending') toggle(appPending, true)
    if (kind === 'error') toggle(appError, Error('Membership failed'))
    if (kind === 'outcome') toggle(appOutcome, 'pending')
    if (kind === 'access') toggle(access.ids, [])
    if (kind === 'access-outcome') toggle(access.outcome, 'pending')
    if (kind === 'kitchen') {
      toggle(selectedId, 'other')
      toggle(kitchenId, 'other')
    }
    if (kind === 'sellable') toggle(sellableId, 'other')
    if (kind === 'write') toggle(writable, false)
    if (kind === 'route') {
      route.fullPath = '/other'
      route.fullPath = '/workspace/kitchen/menus/menu'
    }
    if (kind === 'dispose') scope.stop()
  }
  return {
    scope,
    token,
    response,
    calls,
    source,
    model,
    deps,
    ready,
    change,
    handler: (...args) => handler(...args),
    currentUser,
    appUser,
    appPending,
    appError,
    appOutcome,
    access,
    kitchenId,
    sellableId,
    writable,
    route,
  }
}
const ownerChanges = [
  'account',
  'app',
  'member',
  'pending',
  'error',
  'outcome',
  'access',
  'access-outcome',
  'kitchen',
  'sellable',
  'dispose',
]
function component(name, deps, exposed = '{}') {
  const path = new URL(`components/Workspace/Menus/Items/${name}.vue`, runtime)
  const content = readFileSync(path, 'utf8').replace(
    '</script>',
    `\ndefineExpose(${exposed})\n</script>`
  )
  const { descriptor } = parse(content),
    compiled = compileScript(descriptor, { id: name, inlineTemplate: true }),
    exports = {}
  compileFunction(
    ts.transpileModule(compiled.content, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    ['require', 'exports', '$fetch']
  )(
    (id) => {
      if (id === 'vue') return vue
      if (id.endsWith('Options.vue'))
        return {
          default: component(
            'Options',
            deps,
            '{addOnDraft,variantDraft,addAddOn,addPriceOption,saveAddOnPrice,saveOptionPrice,canAddAddOn,canAddVariant,captureScope}'
          ),
        }
      if (
        id === '#imports' ||
        /useKitchen|useMenu|useUserSession|useAuth|firestoreDocumentId|normalizeSlug/.test(
          id
        )
      )
        return deps
      throw Error(`Unexpected component dependency: ${id}`)
    },
    exports,
    deps.$fetch
  )
  return exports.default
}
function mount(h, name, extraProps = {}, expose = '{}') {
  const fields = [],
    warnings = [],
    adopted = []
  const props = vue.reactive({
    row: row(),
    kitchenId: 'kitchen',
    sellableId: 'shared',
    menuId: 'menu',
    sectionId: 'section',
    canWrite: true,
    ...extraProps,
  })
  const renderer = vue.createRenderer({
    createElement: (type) => ({ type, props: {}, children: [], style: {} }),
    createText: (text) => ({ text }),
    createComment: (text) => ({ text }),
    setText: (node, text) => {
      node.text = text
    },
    setElementText: (node, text) => {
      node.text = text
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) =>
      node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
    insert: (node, parent, anchor) => {
      if (node.parent) {
        const i = node.parent.children.indexOf(node)
        if (i >= 0) node.parent.children.splice(i, 1)
      }
      node.parent = parent
      const i = anchor ? parent.children.indexOf(anchor) : -1
      if (i < 0) parent.children.push(node)
      else parent.children.splice(i, 0, node)
    },
    remove: (node) => {
      const i = node.parent?.children.indexOf(node)
      if (i >= 0) node.parent.children.splice(i, 1)
    },
    patchProp: (node, key, _old, value) => {
      node.props[key] = value
    },
  })
  const view = component(name, h.deps, expose)
  const app = renderer.createApp({
    setup: () => () =>
      vue.h(view, { ...props, onAdopted: (id) => adopted.push(id) }),
  })
  app.config.warnHandler = (message) => warnings.push(message)
  for (const name of [
    'UAlert',
    'UBadge',
    'UFormField',
    'MoleculesStateCard',
    'MoleculesCopyError',
    'MoleculesDisclosurePanel',
  ])
    app.component(name, {
      render() {
        return vue.h('div', this.$attrs, [
          this.$props.title,
          this.$slots.default?.(),
        ])
      },
    })
  app.component('UModal', {
    props: ['open', 'dismissible'],
    render() {
      return vue.h(
        'div',
        { 'data-modal-open': this.open, dismissible: this.dismissible },
        [
          this.$slots.default?.(),
          ...(this.open ? [this.$slots.body?.(), this.$slots.footer?.()] : []),
        ]
      )
    },
  })
  for (const [name, type] of [
    ['UInput', 'input'],
    ['UButton', 'button'],
  ])
    app.component(name, {
      render() {
        return vue.h(type, this.$attrs, this.$slots.default?.())
      },
    })
  app.component('MoleculesFormsEditableSimpleField', {
    props: [
      'label',
      'value',
      'update',
      'captureIntent',
      'disabled',
      'validationFunction',
      'type',
    ],
    setup(props) {
      const state = useEditableStringField({
        value: () => props.value,
        disabled: () => props.disabled,
        type: () => props.type,
        validationFunction: () => props.validationFunction,
        captureIntent: () => props.captureIntent?.() ?? (() => true),
        sources: [() => props.update],
        update: (value, current) => props.update(value, current),
      })
      const field = { state, props, active: true }
      fields.push(field)
      vue.onUnmounted(() => {
        field.active = false
      })
      return () =>
        vue.h('input', {
          'data-field': props.label,
          value: state.isEditing.value
            ? state.draft.value
            : state.effectiveValue.value,
          disabled: state.disabled.value || state.saving.value,
        })
    },
  })
  const root = { children: [] }
  app.mount(root)
  const nodes = (type) => {
    const found = []
    const walk = (node) => {
      if (!type || node.type === type) found.push(node)
      for (const child of node.children || []) walk(child)
    }
    walk(root)
    return found
  }
  const api = app._instance.subTree.component.exposed
  const optionsApi = () => {
    const seen = new Set()
    let result
    const walk = (vnode) => {
      if (!vnode || typeof vnode !== 'object' || seen.has(vnode)) return
      seen.add(vnode)
      if (vnode.component?.exposed?.addOnDraft) result = vnode.component.exposed
      if (vnode.component) walk(vnode.component.subTree)
      if (Array.isArray(vnode.children))
        for (const child of vnode.children) walk(child)
    }
    walk(app._instance.subTree)
    return result
  }
  return {
    api,
    optionsApi,
    props,
    fields,
    adopted,
    nodes,
    root,
    close() {
      app.unmount()
      h.scope.stop()
      assert.deepEqual(warnings, [])
    },
  }
}

test('Sellable reader credentials cannot cross owner ABA transitions or disposal', async () => {
  for (const failed of [false, true])
    for (const kind of ownerChanges) {
      const h = context(),
        reads = []
      const pending = h.handler(async (...args) => {
        reads.push(args)
        return record()
      })
      h.change(kind)
      failed
        ? h.token.reject(Error('Obsolete credentials'))
        : h.token.resolve('token')
      assert.equal(await pending, null, kind)
      assert.equal(reads.length, 0, kind)
      h.scope.stop()
    }
})
test('Sellable reader suppresses obsolete projection after live response', async () => {
  for (const failed of [false, true])
    for (const kind of ownerChanges) {
      const h = context(),
        response = deferred()
      h.token.resolve('token')
      const pending = h.handler(() => response.promise)
      await drain()
      h.change(kind)
      failed
        ? response.reject(Error('Obsolete response'))
        : response.resolve(record())
      assert.equal(await pending, null, kind)
      h.scope.stop()
    }
})
test('Sellable document outcomes require settled exact membership and scope; 404 is missing', async () => {
  const h = context()
  h.ready()
  h.appPending.value = true
  assert.equal(h.model.outcome.value, 'pending')
  assert.equal(h.model.record.value, null)
  h.appPending.value = false
  h.access.ids.value = []
  assert.equal(h.model.canEdit.value, false)
  h.access.ids.value = ['kitchen', 'other']
  h.token.resolve('token')
  await h.handler(async () => record())
  h.source.error.value = { statusCode: 404 }
  h.source.status.value = 'error'
  assert.equal(h.model.outcome.value, 'missing')
  assert.equal(h.model.record.value, null)
  h.kitchenId.value = 'other'
  h.deps.useKitchenWorkspaceSelection().selectedId.value = 'other'
  assert.equal(h.model.outcome.value, 'pending')
  await h.handler(async () => record())
  h.source.error.value = Error('Unavailable')
  assert.equal(h.model.outcome.value, 'error')
  h.scope.stop()
})
test('Terms are detached before credentials, preserve zero and fulfilment, and return committed success after intent changes', async () => {
  const h = context()
  h.ready()
  const terms = {
    currency: 'CHF',
    prices: { default: 0 },
    add_ons: [{ id: 'extra', label: 'Extra', price: 0 }],
    fulfilment: { default: [] },
  }
  const pending = h.model.update(terms)
  terms.prices.default = 999
  terms.add_ons[0].price = 999
  terms.fulfilment.default.push('delivery')
  h.token.resolve('token')
  await drain()
  assert.deepEqual(h.calls[0].options.body, {
    kitchenId: 'kitchen',
    sellableId: 'shared',
    expectedRevision: 4,
    terms: {
      currency: 'CHF',
      prices: { default: 0 },
      add_ons: [{ id: 'extra', label: 'Extra', price: 0 }],
      fulfilment: { default: [] },
    },
  })
  h.change('dispose')
  const result = {
    ok: true,
    kitchenId: 'kitchen',
    sellableId: 'shared',
    revision: 5,
  }
  h.response.resolve(result)
  assert.deepEqual(await pending, result)
  assert.equal(h.model.saveError.value, '')
})
test('Shared writes reject obsolete owner, draft or revision before dispatch', async () => {
  for (const kind of [...ownerChanges, 'write', 'draft', 'revision']) {
    const h = context()
    h.ready()
    let local = true
    const pending = h.model.update(h.model.record.value.terms, () => local)
    if (kind === 'draft') local = false
    else if (kind === 'revision') h.ready({ ...record(), revision: 5 })
    else h.change(kind)
    h.token.resolve('token')
    await assert.rejects(pending, /Review|saved/)
    assert.equal(h.calls.length, 0, kind)
    assert.equal(h.model.busy.value, false, kind)
    h.scope.stop()
  }
})
test('Invalid commercial prices and exact-target response mismatches fail without converting to zero', async () => {
  for (const price of ['', '2', -1, NaN, Infinity, null]) {
    const h = context()
    h.ready()
    await assert.rejects(
      h.model.update({ ...record().terms, prices: { default: price } }),
      /Invalid sellable/
    )
    assert.equal(h.calls.length, 0)
    assert.equal(h.model.busy.value, false)
    h.scope.stop()
  }
  for (const result of [
    { ok: true, kitchenId: 'other', sellableId: 'shared', revision: 5 },
    { ok: true, kitchenId: 'kitchen', sellableId: 'other', revision: 5 },
    { ok: true, kitchenId: 'kitchen', sellableId: 'shared', revision: 4 },
  ]) {
    const h = context()
    h.ready()
    h.token.resolve('token')
    h.response.resolve(result)
    await assert.rejects(h.model.update(record().terms), /could not be saved/)
    h.scope.stop()
  }
})
test('A revision conflict preserves its message and performs no redundant failing refresh', async () => {
  const h = context()
  h.ready()
  h.token.resolve('token')
  h.response.reject({ statusCode: 409 })
  await assert.rejects(h.model.update(record().terms), /changed elsewhere/)
  assert.match(h.model.saveError.value, /Review the latest/)
  assert.equal(h.calls.length, 1)
  assert.equal(h.model.busy.value, false)
  h.scope.stop()
})
test('Native shared editor keeps dirty field and add-on drafts through revision and same-owner pending/error', async () => {
  const h = context()
  h.ready()
  const m = mount(h, 'SharedTerms', {}, '{editorRecord}')
  const field = m.fields.find((f) => f.props.label === 'Price (CHF)')
  const options = m.optionsApi()
  options.addOnDraft.label = 'Dirty extra'
  options.addOnDraft.price = '3'
  field.state.startEditing()
  field.state.draft.value = '27'
  h.source.status.value = 'pending'
  await drain()
  assert.equal(field.active, true)
  assert.equal(field.state.draft.value, '27')
  assert.equal(field.props.disabled, true)
  assert.ok(m.nodes('div').some((node) => node.style.display === 'none'))
  h.token.resolve('token')
  await h.handler(async () => record())
  h.source.error.value = Error('Unavailable')
  h.source.status.value = 'error'
  await drain()
  assert.equal(field.active, true)
  assert.equal(field.state.draft.value, '27')
  h.ready({
    ...record(),
    revision: 5,
    terms: { ...record().terms, prices: { default: 22 } },
  })
  await drain()
  assert.equal(field.active, true)
  assert.equal(field.state.draft.value, '27')
  assert.equal(field.props.value, 22)
  assert.equal(m.optionsApi(), options)
  assert.equal(options.addOnDraft.label, 'Dirty extra')
  assert.equal(options.addOnDraft.price, '3')
  field.state.cancel()
  assert.equal(field.state.draft.value, '22')
  h.appPending.value = true
  await drain()
  assert.equal(field.active, false)
  assert.equal(m.api.editorRecord.value, null)
  m.close()
})
test('Native named-price callback remains current during its own busy render and zero price dispatches', async () => {
  const h = context(),
    r = record()
  r.variants = [{ id: 'small', label: 'Small', quantity: 1, unit: 'piece' }]
  r.terms.prices = { small: 12 }
  delete r.terms.fulfilment
  h.ready(r)
  const m = mount(h, 'SharedTerms')
  const field = m.fields.find((f) => f.props.label === 'Option price')
  field.state.startEditing()
  field.state.draft.value = '0'
  const pending = field.state.save()
  await drain()
  assert.equal(h.model.busy.value, true)
  assert.equal(field.props.disabled, true)
  h.token.resolve('token')
  await drain()
  assert.equal(h.calls.length, 1)
  assert.deepEqual(h.calls[0].options.body.terms.prices, { small: 0 })
  h.response.resolve({
    ok: true,
    kitchenId: 'kitchen',
    sellableId: 'shared',
    revision: 5,
  })
  await pending
  assert.equal(field.state.isEditing.value, false)
  assert.equal(field.state.errorMessage.value, '')
  m.close()
})
test('Native field draft change while credentials wait prevents dispatch and preserves the new draft', async () => {
  const h = context()
  h.ready()
  const m = mount(h, 'SharedTerms')
  const field = m.fields[0]
  field.state.startEditing()
  field.state.draft.value = '20'
  const pending = field.state.save()
  field.state.draft.value = '30'
  h.token.resolve('token')
  await pending
  assert.equal(h.calls.length, 0)
  assert.equal(field.state.draft.value, '30')
  assert.equal(field.state.isEditing.value, true)
  assert.equal(field.state.errorMessage.value, '')
  assert.equal(h.model.busy.value, false)
  m.close()
})
test('Options rejects invalid raw draft prices, forwards local intent, and does not erase changed drafts', async () => {
  const h = context(),
    gate = deferred(),
    changes = [],
    ownerBusy = vue.ref(false)
  const captureOwner = h.scope.run(() => useCommandScope([h.kitchenId]))
  const m = mount(
    h,
    'Options',
    {
      shared: true,
      canWrite: true,
      captureIntent: captureOwner,
      updatePriceOptions: async () => {},
      updateAddOns: async (values, _title, current) => {
        ownerBusy.value = true
        m.props.canWrite = false
        changes.push({ values, current })
        await gate.promise
      },
    },
    '{addOnDraft,addAddOn,canAddAddOn,saveAddOnPrice}'
  )
  m.api.addOnDraft.label = 'Extra'
  for (const price of ['', ' ', '-1', 'Infinity', 'NaN']) {
    m.api.addOnDraft.price = price
    assert.equal(m.api.canAddAddOn(), false)
    await m.api.addAddOn()
    assert.equal(changes.length, 0)
  }
  m.api.addOnDraft.price = '0'
  const pending = m.api.addAddOn()
  await drain()
  assert.equal(changes[0].values[0].price, 0)
  assert.equal(changes[0].current(), true)
  m.api.addOnDraft.label = 'New local extra'
  assert.equal(changes[0].current(), false)
  gate.resolve()
  await pending
  assert.equal(m.api.addOnDraft.label, 'New local extra')
  m.close()
})
test('Adoption draft edits invalidate pending intent without resetting local forms', async () => {
  for (const stage of ['credentials', 'response']) {
    const h = context(),
      r = row()
    r.priceOptions = [{ label: 'Glass', quantity: 1, unit: 'glass', price: 4 }]
    const m = mount(
      h,
      'AdoptSharedTerms',
      { row: r },
      '{open,busy,error,forms,adopt}'
    )
    m.api.open.value = true
    await drain()
    m.api.forms.value[0].volume = '300'
    m.api.forms.value[0].container = 'glass'
    const pending = m.api.adopt()
    await drain()
    assert.equal(m.api.busy.value, true)
    assert.ok(m.nodes('input').every((node) => node.props.disabled === true))
    if (stage === 'response') {
      h.token.resolve('token')
      await drain()
      assert.equal(h.calls.length, 1)
    }
    m.api.forms.value[0].volume = '500'
    assert.equal(m.api.forms.value[0].container, 'glass')
    h.token.resolve('token')
    h.response.resolve({ sellableId: 'canonical' })
    await pending
    assert.equal(h.calls.length, stage === 'response' ? 1 : 0)
    assert.deepEqual(m.adopted, [])
    assert.equal(m.api.open.value, true)
    assert.equal(m.api.forms.value[0].volume, '500')
    assert.equal(m.api.error.value, '')
    m.close()
  }
})
test('Adoption rejects authority ABA/disposal, invalid volume, and invalid response identity', async () => {
  for (const kind of [
    'account',
    'app',
    'member',
    'pending',
    'error',
    'outcome',
    'access',
    'access-outcome',
    'route',
    'kitchen',
    'write',
    'dispose',
  ]) {
    const h = context(),
      m = mount(h, 'AdoptSharedTerms', {}, '{open,busy,error,forms,adopt}')
    m.api.open.value = true
    const pending = m.api.adopt()
    if (kind === 'kitchen') h.change('kitchen')
    else if (kind === 'write') {
      m.props.canWrite = false
      await drain()
      m.props.canWrite = true
      await drain()
    } else if (kind === 'dispose') m.close()
    else h.change(kind)
    h.token.resolve('token')
    await pending
    assert.equal(h.calls.length, 0, kind)
    assert.deepEqual(m.adopted, [], kind)
    if (kind !== 'dispose') m.close()
  }
  for (const id of ['', 'bad/id', ' canonical ']) {
    const h = context(),
      m = mount(h, 'AdoptSharedTerms', {}, '{open,busy,error,forms,adopt}')
    m.api.open.value = true
    h.token.resolve('token')
    h.response.resolve({ sellableId: id })
    await m.api.adopt()
    assert.deepEqual(m.adopted, [])
    assert.match(m.api.error.value, /Could not confirm/)
    m.close()
  }
})

test('Live committed prices before PATCH response keep success truthful and sibling drafts intact', async () => {
  const h = context(),
    r = record()
  r.variants = [
    { id: 'small', label: 'Small', quantity: 1, unit: 'piece' },
    { id: 'large', label: 'Large', quantity: 2, unit: 'piece' },
  ]
  r.terms.prices = { small: 12, large: 20 }
  delete r.terms.fulfilment
  h.ready(r)
  const m = mount(h, 'SharedTerms')
  const [saving, sibling] = m.fields.filter(
    (field) => field.props.label === 'Option price'
  )
  const options = m.optionsApi()
  options.addOnDraft.label = 'Dirty extra'
  options.addOnDraft.price = '3'
  sibling.state.startEditing()
  sibling.state.draft.value = '31'
  saving.state.startEditing()
  saving.state.draft.value = '13'
  const pending = saving.state.save()
  h.token.resolve('token')
  await drain()
  assert.equal(h.calls.length, 1)
  h.source.status.value = 'pending'
  await drain()
  assert.equal(saving.active, true)
  assert.equal(sibling.active, true)
  h.ready({
    ...r,
    revision: 5,
    terms: { ...r.terms, prices: { small: 13, large: 20 } },
  })
  await drain()
  h.response.resolve({
    ok: true,
    kitchenId: 'kitchen',
    sellableId: 'shared',
    revision: 5,
  })
  await pending
  assert.equal(h.model.busy.value, false)
  assert.equal(h.model.saveError.value, '')
  assert.equal(saving.state.errorMessage.value, '')
  assert.equal(saving.state.draft.value, '13')
  assert.equal(sibling.state.draft.value, '31')
  assert.equal(sibling.state.isEditing.value, true)
  assert.equal(m.optionsApi(), options)
  assert.equal(options.addOnDraft.label, 'Dirty extra')
  assert.equal(options.addOnDraft.price, '3')
  assert.equal(h.calls.length, 1)
  m.close()
})

test('Options same row identity and route cannot complete against another Kitchen owner', async () => {
  const h = context(),
    gate = deferred(),
    calls = []
  const r = row()
  r.addOns = [{ id: 'extra', label: 'Extra', price: 1 }]
  const m = mount(
    h,
    'Options',
    {
      row: r,
      updatePriceOptions: async () => {},
      updateAddOns: async (value, _title, current) => {
        calls.push({ value, current })
        await gate.promise
      },
    },
    '{saveAddOnPrice}'
  )
  const pending = m.api.saveAddOnPrice(0, '2')
  assert.equal(calls[0].current(), true)
  m.props.row.item.kitchen_id = 'other'
  assert.equal(m.props.row.id, 'placement')
  assert.equal(h.route.fullPath, '/workspace/kitchen/menus/menu')
  assert.equal(calls[0].current(), false)
  gate.resolve()
  await pending
  m.close()
})

test('Native adoption captures numeric volume and exact placement; closed or unsettled forms cannot submit', async () => {
  const h = context(),
    r = row()
  r.priceOptions = [{ label: 'Glass', quantity: 1, unit: 'glass', price: 4 }]
  const m = mount(
    h,
    'AdoptSharedTerms',
    { row: r },
    '{open,busy,error,forms,adopt}'
  )
  await m.api.adopt()
  assert.equal(h.calls.length, 0)
  h.appPending.value = true
  await drain()
  assert.equal(m.nodes('button')[0].props.disabled, true)
  h.appPending.value = false
  m.api.open.value = true
  await drain()
  for (const value of ['0', '-1', 'Infinity', 'NaN', 'bad']) {
    m.api.forms.value[0].volume = value
    await m.api.adopt()
    assert.equal(h.calls.length, 0)
    assert.match(m.api.error.value, /volume greater than zero/)
  }
  m.api.forms.value[0].volume = '300'
  m.api.forms.value[0].container = ' Glass '
  const pending = m.api.adopt()
  h.token.resolve('token')
  await drain()
  assert.equal(h.calls.length, 1)
  assert.deepEqual(h.calls[0].options.body, {
    kitchenId: 'kitchen',
    menuId: 'menu',
    sectionId: 'section',
    itemId: 'placement',
    variantForms: [{ volume: { value: 300, unit: 'ml' }, container: 'Glass' }],
    expectedPriceOptions: [
      { label: 'Glass', quantity: 1, unit: 'glass', price: 4 },
    ],
  })
  h.response.resolve({ sellableId: 'canonical' })
  await pending
  assert.deepEqual(m.adopted, ['canonical'])
  assert.equal(m.api.open.value, false)
  m.close()
})

test('An obsolete adoption cannot clear a newer in-flight draft submission', async () => {
  const h = context(),
    r = row()
  r.priceOptions = [{ label: 'Glass', quantity: 1, unit: 'glass', price: 4 }]
  const m = mount(
    h,
    'AdoptSharedTerms',
    { row: r },
    '{open,busy,error,forms,adopt}'
  )
  m.api.open.value = true
  m.api.forms.value[0].volume = '300'
  const first = m.api.adopt()
  m.api.forms.value[0].volume = '500'
  const second = m.api.adopt()
  h.token.resolve('token')
  await first
  await drain()
  assert.equal(h.calls.length, 1)
  assert.equal(m.api.busy.value, true)
  assert.deepEqual(h.calls[0].options.body.variantForms, [
    { volume: { value: 500, unit: 'ml' } },
  ])
  h.response.resolve({ sellableId: 'canonical' })
  await second
  assert.equal(m.api.busy.value, false)
  assert.deepEqual(m.adopted, ['canonical'])
  m.close()
})
