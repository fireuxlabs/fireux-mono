import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { menuWorkspaceDestination } from '../runtime/kitchen/utils/menu-workspace-destination.ts'

const runtime = new URL('../runtime/', import.meta.url)
function component(path, bindings = {}) {
  const file = new URL(path, runtime)
  const { descriptor } = parse(readFileSync(file, 'utf8'), {
    filename: file.pathname,
  })
  const script = compileScript(descriptor, { id: path, inlineTemplate: true })
  const code = ts.transpileModule(script.content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const exports = {}
  compileFunction(code, ['require', 'exports'])((name) => {
    if (name === 'vue') return Vue
    if (name.endsWith('/menu-workspace-destination'))
      return { menuWorkspaceDestination }
    assert.ok(bindings[name], name)
    return bindings[name]
  }, exports)
  return exports.default
}
const base = 'kitchen/components/Menu/Menus/'
const Controls = component(`${base}Overview/Controls.vue`)
const List = component(`${base}Overview/List.vue`)
const Card = component(`${base}Overview/Card.vue`)
const Toolbar = component('kitchen/components/Workspace/Collection/Toolbar.vue')
const State = component(
  '../../../../core/fireux-core/src/runtime/components/molecules/State.vue'
)
function mount() {
  const rows = Vue.ref([
    {
      id: 'draft',
      name: 'Drinks',
      slug: 'drinks',
      status: 'draft',
      sort_order: 0,
    },
    {
      id: 'published',
      name: 'Specials',
      slug: 'specials',
      status: 'published',
      schedule: 'daily',
      purpose: 'specials',
      sort_order: 1,
    },
    {
      id: 'archived',
      name: 'Old',
      slug: 'old',
      status: 'archived',
      sort_order: 2,
    },
  ])
  const outcome = Vue.ref('ready'),
    canCreateMenu = Vue.ref(true)
  const choices = Vue.ref({})
  const listExports = {}
  const listCode = ts.transpileModule(
    readFileSync(
      new URL('kitchen/composables/workspace/menus/useMenuList.ts', runtime),
      'utf8'
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }
  ).outputText
  compileFunction(listCode, ['require', 'exports'])((name) => {
    if (name === 'vue') return Vue
    if (name === '#imports') return { useState: () => choices }
    if (name.endsWith('/useAppSession'))
      return { useAppSession: () => ({ uid: Vue.ref('actor') }) }
    if (name === './useKitchenMenus')
      return {
        useKitchenMenus: () => ({
          rawMenus: rows,
          activeKitchenAppId: Vue.ref('app'),
          kitchenId: Vue.ref('k'),
        }),
      }
    assert.fail(name)
  }, listExports)
  const list = listExports.useMenuList()
  const { query, showArchived } = list
  let creates = 0
  const overview = component(`${base}Overview.vue`, {
    '../../../composables/workspace/menu-group/useMenuGroupIndex': {
      useMenuGroupIndex: () => ({ menus: rows, menusOutcome: outcome }),
    },
    '../../../composables/workspace/menus/useKitchenMenus': {
      useKitchenMenus: () => ({
        actions: { openCreate: () => creates++ },
        canCreateMenu,
        menuCreateBlockedMessage: Vue.computed(() =>
          canCreateMenu.value ? '' : 'Upgrade to add another menu.'
        ),
      }),
    },
    '../../../composables/workspace/menus/useMenuList': {
      useMenuList: () => list,
    },
  })
  const node = (type, text = '') => ({
    type,
    text,
    props: {},
    children: [],
    parent: null,
  })
  const renderer = Vue.createRenderer({
    createElement: (type) => node(type),
    createText: (text) => node('#text', text),
    createComment: () => node('#comment'),
    setText: (value, text) => {
      value.text = text
    },
    setElementText: (value, text) => {
      value.text = text
      value.children = []
    },
    parentNode: (value) => value.parent,
    nextSibling: (value) =>
      value.parent?.children[value.parent.children.indexOf(value) + 1] || null,
    patchProp: (value, key, _before, after) => {
      value.props[key] = after
    },
    insert(value, parent, anchor = null) {
      if (value.parent)
        value.parent.children.splice(value.parent.children.indexOf(value), 1)
      value.parent = parent
      const index = parent.children.indexOf(anchor)
      parent.children.splice(
        index < 0 ? parent.children.length : index,
        0,
        value
      )
    },
    remove(value) {
      if (value.parent)
        value.parent.children.splice(value.parent.children.indexOf(value), 1)
      value.parent = null
    },
  })
  const app = renderer.createApp(overview)
  for (const [name, value] of Object.entries({
    KitchenMenuMenusOverviewControls: Controls,
    KitchenMenuMenusOverviewList: List,
    KitchenMenuMenusOverviewCard: Card,
    WorkspaceKitchenCollectionToolbar: Toolbar,
    FireState: State,
  }))
    app.component(name, value)
  app.component('UButton', {
    props: ['label', 'disabled'],
    emits: ['click'],
    setup:
      (props, { emit }) =>
      () =>
        Vue.h(
          'button',
          {
            disabled: props.disabled,
            onClick: () => {
              if (!props.disabled) emit('click')
            },
          },
          props.label
        ),
  })
  app.component('UInput', {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    setup:
      (props, { emit }) =>
      () =>
        Vue.h('input', {
          value: props.modelValue,
          onInput: (event) => emit('update:modelValue', event.target.value),
        }),
  })
  app.component('UPageGrid', {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h('ul', slots.default?.()),
  })
  app.component('UPageCard', {
    props: ['to', 'description'],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h('article', [
          slots.header?.(),
          Vue.h('a', { href: props.to }, slots.title?.()),
          props.description,
          slots.footer?.(),
        ]),
  })
  for (const name of ['UBadge', 'UIcon', 'FireCopyError'])
    app.component(name, {
      setup:
        (_, { slots }) =>
        () =>
          Vue.h('span', slots.default?.()),
    })
  const root = node('root')
  app.mount(root)
  const all = (type) => {
    const found = []
    const visit = (value) => {
      if (value.type === type) found.push(value)
      value.children.forEach(visit)
    }
    visit(root)
    return found
  }
  const text = (value) => value.text + value.children.map(text).join('')
  return {
    app,
    rows,
    query,
    showArchived,
    outcome,
    canCreateMenu,
    all,
    text,
    creates: () => creates,
  }
}

test('composed menu overview retains ordering, controlled search/archive choices, destinations and creation availability', async () => {
  const view = mount()
  try {
    assert.deepEqual(view.all('h3').map(view.text), ['Specials', 'Drinks'])
    assert.ok(
      view
        .all('article')
        .some((node) => view.text(node).includes('Daily specials'))
    )
    view.rows.value = view.rows.value.map((menu) =>
      menu.id === 'draft' ? { ...menu, schedule: 'daily' } : menu
    )
    await Vue.nextTick()
    const daily = view
      .all('article')
      .find((node) => view.text(node).includes('Drinks'))
    assert.ok(view.text(daily).includes('Daily menu'))
    assert.equal(view.text(daily).includes('Daily specials'), false)

    assert.deepEqual(
      view.all('a').map((node) => node.props.href),
      [
        '/workspace/kitchen/menu/menus/specials',
        '/workspace/kitchen/menu/menus/drinks',
      ]
    )
    view
      .all('button')
      .find((node) => view.text(node) === 'Create menu')
      .props.onClick()
    assert.equal(view.creates(), 1)
    view.canCreateMenu.value = false
    await Vue.nextTick()
    const create = view
      .all('button')
      .find((node) => view.text(node) === 'Create menu')
    assert.equal(create.props.disabled, false)
    create.props.onClick()
    assert.equal(view.creates(), 2)
    assert.equal(
      view.all('p').some((node) => view.text(node).includes('Upgrade')),
      false
    )
    view.all('input')[0].props.onInput({ target: { value: 'missing' } })
    await Vue.nextTick()
    assert.equal(view.query.value, 'missing')
    assert.ok(
      view.all('p').some((node) => view.text(node) === 'No matching menus.')
    )
    view.query.value = ''
    await Vue.nextTick()
    view
      .all('button')
      .find((node) => view.text(node) === 'Show archived')
      .props.onClick()
    await Vue.nextTick()
    assert.equal(view.showArchived.value, true)
    assert.deepEqual(view.all('h3').map(view.text), [
      'Specials',
      'Drinks',
      'Old',
    ])
  } finally {
    view.app.unmount()
  }
})

test('shared collection feedback hides stale cards while loading or failed and preserves the create-first empty state', async () => {
  const view = mount()
  try {
    for (const outcome of ['idle', 'pending', 'error']) {
      view.outcome.value = outcome
      await Vue.nextTick()
      assert.equal(view.all('article').length, 0)
      assert.equal(view.all('input').length, 0)
      assert.ok(
        view
          .all('p')
          .some((node) =>
            /Loading menus|Unable to load menus/.test(view.text(node))
          )
      )
    }
    view.outcome.value = 'empty'
    view.rows.value = []
    await Vue.nextTick()
    assert.ok(
      view
        .all('p')
        .some((node) => view.text(node).includes('Create your first menu'))
    )
    assert.equal(view.all('input').length, 1)
  } finally {
    view.app.unmount()
  }
})
