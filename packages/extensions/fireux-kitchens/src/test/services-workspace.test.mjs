import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as Vue from 'vue'
import { parse } from 'vue/compiler-sfc'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import {
  offeringOverviewPolicy,
  serviceMenuPolicy,
} from './offering-test-helpers.mjs'
const runtime = new URL('../runtime/kitchen/', import.meta.url)
function load(path, result, deps) {
  let source = readFileSync(new URL(path, runtime), 'utf8')
  if (path.endsWith('.vue'))
    source = parse(source).descriptor.scriptSetup.content
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function fixture() {
  const source = {
    selectedKitchen: Vue.ref({ id: 'k', services: { title: 'Food & drinks' } }),
    kitchenId: Vue.ref('k'),
    outcome: Vue.ref('ready'),
    error: Vue.ref(null),
    editorOwnerKey: Vue.ref('account/k'),
    editorAccessDenied: Vue.ref(false),
    offerings: Vue.ref([{ id: 'collection', menu_ids: ['food'] }]),
    menus: Vue.ref([{ id: 'food' }]),
    menusOutcome: Vue.ref('ready'),
    canWrite: Vue.ref(true),
    timezone: Vue.ref('Europe/Zurich'),
    kitchenHours: Vue.ref(null),
  }
  const scope = Vue.effectScope(),
    published = []
  let acquisitions = 0
  const context = scope.run(() =>
    load(
      'composables/offerings/useKitchenServicesContext.ts',
      'createKitchenServicesContext()',
      {
        ...Vue,
        useKitchenWorkspace: () => ({ id: source.kitchenId }),
        useKitchenOfferings: (kitchenId) => {
          assert.equal(kitchenId, source.kitchenId)
          acquisitions++
          return source
        },
        kitchenOfferingOptions: [{ key: 'collection', label: 'Collection' }],
        serviceOverviewSnapshot: (input) => ({
          services: [],
          derived: { outcome: input.outcome },
        }),
        useWorkspacePageState: () => ({
          publish: (value) => published.push(value),
        }),
      }
    )
  )
  return { scope, context, source, published, acquisitions }
}
function host() {
  const make = (type) => ({ type, children: [], parent: null })
  const renderer = Vue.createRenderer({
    createElement: make,
    createText: make,
    createComment: make,
    setText() {},
    setElementText() {},
    patchProp() {},
    insert(node, parent, anchor) {
      if (node.parent)
        node.parent.children.splice(node.parent.children.indexOf(node), 1)
      node.parent = parent
      const index = anchor ? parent.children.indexOf(anchor) : -1
      if (index < 0) parent.children.push(node)
      else parent.children.splice(index, 0, node)
    },
    remove(node) {
      if (node.parent) {
        node.parent.children.splice(node.parent.children.indexOf(node), 1)
        node.parent = null
      }
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) =>
      node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
  })
  return { renderer, make }
}

test('the mounted Services section addresses every named record, an ordinary single record, and first-time setup', async () => {
  const calls = []
  const option = (key) =>
    offeringOverviewPolicy.kitchenOfferingOptions.find((row) => row.key === key)
  const row = (id, name, enabled, types) => ({
    id,
    name,
    enabled,
    menu_ids: ['food'],
    interactions: types.map((type) => ({ type, enabled })),
  })
  const records = [
    row('a', 'Test setup', false, ['collection']),
    row('b', 'Weekend pickup', true, ['collection', 'delivery']),
    row('c', 'Guest rooms', true, ['room_service']),
  ]
  const retained = Vue.ref({
    offerings: records,
    menus: [{ id: 'food', status: 'published', format: 'interactive' }],
  })
  const workspace = {
    retained,
    source: {
      kitchenId: Vue.ref('k'),
      canWrite: Vue.ref(true),
      configure: async (input) => {
        calls.push(input)
        return {
          offering:
            records.find((record) => record.id === input.offeringId) ||
            row('new', 'Pre-order', true, ['pre_order']),
        }
      },
      updateInteraction: async (id, type, changes) => {
        calls.push({ id, type, changes })
        return { offering: records.find((record) => record.id === id) }
      },
    },
  }
  const deps = {
    ...Vue,
    ...offeringOverviewPolicy,
    ...serviceMenuPolicy,
    useCommandScope,
    newKitchenOfferingInteraction: (type) => ({ type, enabled: false }),
    useRoute: () => ({ hash: '' }),
    useKitchenServicesContext: () => workspace,
    kitchenOrderTypeLabel: (type) => type,
    Symbol,
  }
  deps.useServiceSetup = load(
    'composables/offerings/useServiceSetup.ts',
    'useServiceSetup',
    deps
  )
  deps.provideKitchenServiceEditor = load(
    'composables/offerings/useKitchenServiceEditor.ts',
    'provideKitchenServiceEditor',
    deps
  )
  const component = (file, props, exposed) => {
    const path = 'components/Menu/Services/' + file + '.vue'
    const template = parse(readFileSync(new URL(path, runtime), 'utf8'))
      .descriptor.template.content
    return {
      props,
      setup: (value) =>
        load(path, exposed, { ...deps, defineProps: () => value }),
      render: Vue.compile(template),
    }
  }
  const group = component(
    'Service',
    ['option'],
    '({section,sectionId,offerings})'
  )
  const record = component(
    'Record',
    ['option', 'offering', 'anchor'],
    '({name,editor,services,readiness,disabled,kitchenOrderTypeLabel})'
  )
  const { renderer, make } = host()
  const controls = new Map()
  const app = renderer.createApp({
    render: () =>
      Vue.h(
        'main',
        ['collection', 'room_service', 'pre_order'].map((key) =>
          Vue.h(group, { option: option(key) })
        )
      ),
  })
  app.component('KitchenMenuServicesRecord', record)
  for (const name of ['UIcon', 'KitchenMenuServicesSetup', 'FireCopyError'])
    app.component(name, { render: () => null })
  app.component('USwitch', {
    props: ['modelValue', 'label', 'disabled'],
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      return () => {
        controls.set(attrs['aria-label'] || props.label, {
          value: props.modelValue,
          change: (value) => emit('update:modelValue', value),
        })
        return Vue.h('button')
      }
    },
  })
  const warnings = []
  app.config.warnHandler = (warning) => warnings.push(warning)
  app.mount(make('root'))
  assert.equal(controls.get('Test setup availability').value, false)
  assert.equal(controls.get('Weekend pickup availability').value, true)
  assert.equal(controls.get('Guest rooms availability').value, true)
  assert.equal(controls.get('Pre-order availability').value, false)
  controls.get('collection').change(false)
  await new Promise((resolve) => setImmediate(resolve))
  assert.deepEqual(calls[0], {
    id: 'b',
    type: 'collection',
    changes: { enabled: false },
  })
  controls.get('Weekend pickup availability').change(false)
  await Vue.nextTick()
  assert.equal(calls[1].offeringId, 'b')
  controls.get('Guest rooms availability').change(false)
  controls.get('Pre-order availability').change(true)
  await Vue.nextTick()
  assert.equal(calls[2].offeringId, 'c')
  assert.equal(calls[3].option, 'pre_order')
  assert.equal('offeringId' in calls[3], false)
  assert.deepEqual(warnings, [])
  app.unmount()
})

test('mounted service editors and local drafts survive refresh/error; actual owner changes dispose them', async () => {
  const f = fixture(),
    { renderer, make } = host()
  const source = readFileSync(
    new URL('components/Menu/Services/Index.vue', runtime),
    'utf8'
  )
  let mounted = 0,
    unmounted = 0,
    draft
  const app = renderer.createApp({
    setup: () =>
      load(
        'components/Menu/Services/Index.vue',
        '({ source, retained, snapshot, options })',
        {
          provideKitchenServicesContext: () => f.context,
        }
      ),
    render: Vue.compile(parse(source).descriptor.template.content),
  })
  for (const name of ['KitchenMenuServicesStatus', 'FireDiagnosticsDebugPanel'])
    app.component(name, { render: () => null })
  app.component('KitchenMenuServicesService', {
    setup() {
      mounted++
      draft = Vue.ref('18:')
      Vue.onUnmounted(() => unmounted++)
      return () => Vue.h('input', { value: draft.value })
    },
  })
  const warnings = []
  app.config.warnHandler = (warning) => warnings.push(warning)
  app.mount(make('root'))
  assert.equal(mounted, 1)
  f.source.outcome.value = 'pending'
  f.source.offerings.value = []
  f.source.canWrite.value = false
  await Vue.nextTick()
  assert.equal(unmounted, 0)
  assert.equal(draft.value, '18:')
  assert.equal(f.context.retained.value.offerings[0].id, 'collection')
  assert.equal(f.context.source.canWrite.value, false)
  assert.equal(f.context.snapshot.value.derived.outcome, 'pending')
  f.source.outcome.value = 'error'
  f.source.error.value = new Error('Offline')
  await Vue.nextTick()
  assert.equal(unmounted, 0)
  f.source.outcome.value = 'ready'
  f.source.offerings.value = [
    { id: 'collection', menu_ids: ['food', 'drinks'] },
  ]
  f.source.canWrite.value = true
  await Vue.nextTick()
  assert.equal(mounted, 1)
  assert.equal(draft.value, '18:')
  f.source.outcome.value = 'pending'
  f.source.editorOwnerKey.value = 'another-account/k'
  await Vue.nextTick()
  assert.equal(unmounted, 1)
  assert.equal(f.context.retained.value, null)
  assert.equal(f.acquisitions, 1)
  assert.deepEqual(warnings, [])
  app.unmount()
  f.scope.stop()
})

test('settled access loss clears retained service presentation', async () => {
  const f = fixture()
  f.source.outcome.value = 'idle'
  f.source.editorAccessDenied.value = true
  await Vue.nextTick()
  assert.equal(f.context.retained.value, null)
  f.scope.stop()
})
