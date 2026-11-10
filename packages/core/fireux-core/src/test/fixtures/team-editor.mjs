import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import ts from 'typescript'
import * as Vue from 'vue'
import { compileScript, parse } from 'vue/compiler-sfc'
import { useCommandScope } from '../../runtime/composables/fireux/commands/useCommandScope.ts'
import { useCollectionSearch } from '../../runtime/composables/shared/useCollectionSearch.ts'

const { h, nextTick, ref, computed } = Vue
const runtime = new URL('../../runtime/workspace/components/', import.meta.url)
const cache = new Map()
function component(file) {
  if (cache.has(file.href)) return cache.get(file.href)
  const filename = file.pathname
  const { descriptor } = parse(readFileSync(file, 'utf8'), { filename })
  const { content } = compileScript(descriptor, {
    id: filename,
    inlineTemplate: true,
  })
  const { outputText } = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  })
  const exports = {}
  compileFunction(outputText, ['require', 'exports'])((id) => {
    if (id === 'vue') return Vue
    if (id.endsWith('.vue')) return { default: component(new URL(id, file)) }
    if (id.endsWith('/useCollectionSearch')) return { useCollectionSearch }
    if (id.endsWith('/useCommandScope')) return { useCommandScope }
    if (id.includes('useToast')) return { useToast: () => ({ add() {} }) }
    throw new Error('Unexpected Team test import: ' + id)
  }, exports)
  cache.set(file.href, exports.default)
  return exports.default
}

const renderer = Vue.createRenderer({
  createElement: (tag) => ({ tag, props: {}, children: [] }),
  createText: (text) => ({ text }),
  createComment: () => ({}),
  setText: (node, text) => {
    node.text = text
  },
  setElementText: (node, text) => {
    node.text = text
    node.children = []
  },
  patchProp: (node, key, _old, value) => {
    node.props[key] = value
  },
  insert: (node, parent, anchor) => {
    node.parent = parent
    const at = parent.children.indexOf(anchor)
    parent.children.splice(at < 0 ? parent.children.length : at, 0, node)
  },
  remove: (node) => {
    node.parent.children.splice(node.parent.children.indexOf(node), 1)
  },
  parentNode: (node) => node.parent,
  nextSibling: (node) =>
    node.parent?.children[node.parent.children.indexOf(node) + 1],
})
export const nodes = (node) => [node, ...(node.children || []).flatMap(nodes)]
export const textOf = (node) =>
  nodes(node)
    .map((part) => part.text || '')
    .join('')
    .trim()
const buttons = (node) => nodes(node).filter((part) => part.tag === 'button')
export const button = (node, label) => {
  const found = buttons(node).find((part) => textOf(part) === label)
  assert.ok(found, 'Expected button ' + label + ' in ' + textOf(node))
  return found.props.onClick
}

export function mountTeamEditor(
  t,
  { memberId, status = 'ready', roster, links = true } = {}
) {
  const selected = ref('a'),
    workspaceId = ref('first'),
    actions = ref(['create', 'read', 'update', 'delete'])
  const members = roster ?? [
    { id: 'a', name: 'Alex', userId: '', roleIds: [] },
    { id: 'b', name: 'Morgan', userId: '', roleIds: [] },
  ]
  const calls = [],
    selections = []
  const team = {
    workspaceId,
    state: computed(() => ({
      team: { members, selectedTeamMemberId: selected.value },
    })),
    derived: computed(() => ({
      status,
      capability: {
        availableActions: actions.value,
        primitives: Object.fromEntries(
          ['create', 'read', 'update', 'delete'].map((action) => [
            action,
            { available: actions.value.includes(action) },
          ])
        ),
      },
    })),
    primitives: {
      create: () => assert.fail('Preparing an action created a member'),
      update: () => assert.fail('Preparing an action updated a member'),
      delete: (id, isCurrent) => {
        const { promise, resolve, reject } = Promise.withResolvers()
        calls.push({ id, isCurrent, resolve, reject })
        return promise
      },
    },
    natives: {
      select: (id) => {
        selections.push(id)
        selected.value = id
      },
    },
  }
  const editor = ref(),
    root = { children: [] }
  const Editor = component(new URL('Team/Editor.vue', runtime))
  const app = renderer.createApp({
    render: () =>
      h(
        Editor,
        {
          ref: editor,
          team,
          memberId,
          title: 'Example Team',
          error: 'Connection failed',
          roleLabels: { a: ['Host'], b: ['Cook'] },
          memberPath: links
            ? (id) => '/workspace/project/team/' + id
            : undefined,
        },
        { single: () => h('span', 'Domain action') }
      ),
  })
  const slot = (tag) => ({
    setup:
      (_, { slots }) =>
      () =>
        h(tag, [slots.actions?.(), slots.default?.()]),
  })
  for (const name of ['UCard', 'UFormField', 'UBadge', 'WorkspaceSingleCard'])
    app.component(name, slot('div'))
  for (const name of ['UAvatar', 'UIcon', 'FireCopyError'])
    app.component(name, { render: () => null })
  app.component(
    'WorkspaceEntityCollection',
    component(new URL('EntityCollection.vue', runtime))
  )
  app.component('FireStateCard', {
    props: ['state', 'title', 'description'],
    setup: (p) => () =>
      h('section', { state: p.state }, p.title || p.description),
  })
  app.component('WorkspaceTeamCrudCreate', {
    props: ['open', 'initialName'],
    setup: (p) => () =>
      p.open ? h('dialog', h('input', { value: p.initialName })) : null,
  })
  app.component('UButton', {
    props: ['label', 'to'],
    setup:
      (p, { slots }) =>
      () =>
        h(p.to ? 'a' : 'button', { href: p.to }, p.label || slots.default?.()),
  })
  app.component('UInput', {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    setup:
      (p, { emit }) =>
      () =>
        h('input', {
          value: p.modelValue,
          onInput: (value) => emit('update:modelValue', value),
        }),
  })
  app.component(
    'WorkspaceSelectionRow',
    component(new URL('SelectionRow.vue', runtime))
  )
  app.component('UModal', {
    props: ['open', 'title', 'description'],
    setup:
      (p, { slots }) =>
      () =>
        p.open
          ? h('dialog', [
              p.title,
              ' ',
              p.description,
              ' ',
              slots.body?.(),
              slots.footer?.(),
            ])
          : null,
  })
  app.mount(root)
  t.after(() => app.unmount())
  return {
    selected,
    workspaceId,
    actions,
    calls,
    root,
    selections,
    prepare: async (action, name = '') => {
      editor.value.openAction({ action, name, message: '' })
      await nextTick()
    },
    dialog: () => nodes(root).find((node) => node.tag === 'dialog'),
  }
}
