import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { useMenuOverviewCard } from '../runtime/kitchen/components/Workspace/Menu/Overview/Collection/useCard.ts'

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
    assert.ok(bindings[name], name)
    return bindings[name]
  }, exports)
  return exports.default
}
const base = 'kitchen/components/Workspace/Menu/'
const Card = component(`${base}Overview/Collection/Card.vue`, {
  './useCard': { useMenuOverviewCard },
})
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
      published_dates: ['2026-11-23'],
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
    if (name.endsWith('/calendar/daily')) return { publishedMenuDates }
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
  const { query, status } = list
  let creates = 0
  const overviewSource = readFileSync(
    new URL('kitchen/composables/workspace/menu/overview.ts', runtime),
    'utf8'
  )
  const overviewCode = ts.transpileModule(overviewSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const overviewExports = {}
  const capability = {
    selectedKitchen: Vue.ref(null),
    derived: Vue.computed(() => ({
      capability: {
        primitives: { create: { available: canCreateMenu.value } },
      },
    })),
    menuCreateBlockedMessage: Vue.computed(() =>
      canCreateMenu.value ? '' : 'Upgrade to add another menu.'
    ),
    actions: {
      openCreate: () => {
        if (canCreateMenu.value) creates++
      },
    },
  }
  compileFunction(overviewCode, ['require', 'exports'])((name) => {
    if (name === 'vue') return Vue
    if (name.endsWith('/calendar/daily')) return { publishedMenuDates }
    if (name.endsWith('/kitchen-readers'))
      return { readKitchenThemePalette: () => null }
    if (name === './state')
      return {
        requireMenuWorkspace: () => ({
          menus: capability,
          overview: { menusOutcome: outcome },
        }),
      }
    if (name === '../menus/useMenuList') return { useMenuList: () => list }
    assert.fail(name)
  }, overviewExports)
  const loadPresenter = (path) => {
    const code = ts.transpileModule(
      readFileSync(new URL(path, runtime), 'utf8'),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      }
    ).outputText
    const exports = {}
    compileFunction(code, ['require', 'exports'])((name) => {
      if (name === 'vue') return Vue
      if (name.endsWith('/menu/overview')) return overviewExports
      assert.fail(name)
    }, exports)
    return exports
  }
  const local = loadPresenter(`${base}Overview/Controls/useControls.ts`)
  const Actions = component(`${base}Overview/Controls/Actions.vue`)
  const Filters = component(`${base}Overview/Controls/Filters.vue`)
  const Controls = component(`${base}Overview/Controls/Index.vue`, {
    './index': { Actions, Filters },
    './useControls': local,
  })
  const Grid = component(`${base}Overview/Collection/Grid.vue`, {
    './Card.vue': { default: Card },
  })
  const Collection = component(`${base}Overview/Collection/Index.vue`, {
    './index': { Grid },
    './useCollection': loadPresenter(
      `${base}Overview/Collection/useCollection.ts`
    ),
  })
  const overview = component(`${base}Overview/Index.vue`, {
    './index': { Controls, Collection },
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
  app.component('USelect', {
    props: ['modelValue', 'items'],
    emits: ['update:modelValue'],
    setup:
      (props, { emit }) =>
      () =>
        Vue.h(
          'select',
          {
            value: props.modelValue,
            onChange: (event) => emit('update:modelValue', event.target.value),
          },
          props.items.map((item) =>
            Vue.h('option', { value: item.value }, item.label)
          )
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
    status,
    outcome,
    canCreateMenu,
    all,
    text,
    creates: () => creates,
  }
}

test('composed menu overview retains ordering, controlled search/status choices, destinations and creation availability', async () => {
  const view = mount()
  try {
    assert.deepEqual(view.all('h3').map(view.text), ['Specials', 'Drinks'])
    assert.ok(
      view
        .all('article')
        .some((node) => view.text(node).includes('Daily specials'))
    )
    assert.deepEqual(
      view.all('time').map((node) => node.props.datetime),
      ['2026-11-23']
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
      .find((node) => view.text(node) === 'Add menu')
      .props.onClick()
    assert.equal(view.creates(), 1)
    view.canCreateMenu.value = false
    await Vue.nextTick()
    const create = view
      .all('button')
      .find((node) => view.text(node) === 'Add menu')
    assert.equal(create.props.disabled, true)
    create.props.onClick()
    assert.equal(view.creates(), 1)
    assert.equal(
      view.all('p').some((node) => view.text(node).includes('Upgrade')),
      true
    )
    view.all('input')[0].props.onInput({ target: { value: 'missing' } })
    await Vue.nextTick()
    assert.equal(view.query.value, 'missing')
    assert.ok(
      view.all('p').some((node) => view.text(node) === 'No matching menus.')
    )
    view.query.value = ''
    await Vue.nextTick()
    for (const [status, expected] of [
      ['published', ['Specials']],
      ['draft', ['Drinks']],
      ['archived', ['Old']],
      ['all', ['Specials', 'Drinks']],
    ]) {
      view.all('select')[0].props.onChange({ target: { value: status } })
      await Vue.nextTick()
      assert.equal(view.status.value, status)
      assert.deepEqual(view.all('h3').map(view.text), expected)
    }
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
      const create = view
        .all('button')
        .find((node) => view.text(node) === 'Add menu')
      assert.equal(create.props.disabled, true)
      assert.equal(
        view
          .all('p')
          .some((node) =>
            /No matching menus|No menus yet/.test(view.text(node))
          ),
        false
      )
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
        .some((node) => view.text(node).includes('Add your first menu'))
    )
    assert.equal(view.all('input').length, 1)
    view.rows.value = [{ id: 'old', name: 'Previous menu', status: 'archived' }]
    view.outcome.value = 'ready'
    await Vue.nextTick()
    assert.ok(
      view.all('p').some((node) => view.text(node).includes('Choose Archived'))
    )
    view.status.value = 'archived'
    await Vue.nextTick()
    assert.deepEqual(view.all('h3').map(view.text), ['Previous menu'])
  } finally {
    view.app.unmount()
  }
})
