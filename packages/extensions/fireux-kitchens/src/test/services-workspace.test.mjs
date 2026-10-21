import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as Vue from 'vue'
import { parse } from 'vue/compiler-sfc'
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
        useKitchenOfferings: () => {
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
    insert(node, parent) {
      node.parent = parent
      parent.children.push(node)
    },
    remove(node) {
      if (node.parent)
        node.parent.children.splice(node.parent.children.indexOf(node), 1)
    },
    parentNode: (node) => node.parent,
    nextSibling: () => null,
  })
  return { renderer, make }
}

test('mounted service editors and local drafts survive refresh/error; actual owner changes dispose them', async () => {
  const f = fixture(),
    { renderer, make } = host()
  const source = readFileSync(
    new URL('components/FoodAndDrink/Services/Index.vue', runtime),
    'utf8'
  )
  let mounted = 0,
    unmounted = 0,
    draft
  const app = renderer.createApp({
    setup: () =>
      load(
        'components/FoodAndDrink/Services/Index.vue',
        '({ source, retained, snapshot, options })',
        {
          provideKitchenServicesContext: () => f.context,
        }
      ),
    render: Vue.compile(parse(source).descriptor.template.content),
  })
  for (const name of [
    'KitchenFoodAndDrinkServicesStatus',
    'KitchenFoodAndDrinkServicesTitle',
    'DiagnosticsDebugPanel',
  ])
    app.component(name, { render: () => null })
  app.component('KitchenFoodAndDrinkServicesService', {
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
