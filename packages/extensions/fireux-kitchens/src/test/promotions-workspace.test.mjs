import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as Vue from 'vue'

const runtime = new URL('../runtime/kitchen/', import.meta.url)
function load(path, result, deps) {
  let source = readFileSync(new URL(path, runtime), 'utf8')
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function fixture() {
  const promotion = {
    id: 'sunday',
    name: 'Sunday pizzas',
    status: 'active',
    currency: 'CHF',
    days: ['sunday'],
    dishes: [{ dishId: 'pizza', price: 11 }],
  }
  const state = {
    identity: { outcome: Vue.ref('ready') },
    collection: {
      outcome: Vue.ref('ready'),
      items: Vue.ref([promotion]),
      error: Vue.ref(null),
    },
    dishes: {
      outcome: Vue.ref('ready'),
      items: Vue.ref([{ id: 'pizza', name: 'Pizza' }]),
      error: Vue.ref(null),
    },
    canWrite: Vue.ref(true),
    editorOwnerKey: Vue.ref('account-a/kitchen-a'),
  }
  const scope = Vue.effectScope()
  const context = scope.run(() =>
    load(
      'composables/promotions/useKitchenPromotionsContext.ts',
      'createKitchenPromotionsContext()',
      {
        computed: Vue.computed,
        shallowRef: Vue.shallowRef,
        watch: Vue.watch,
        useKitchenPromotions: () => state,
      }
    )
  )
  return { state, promotion, context, scope }
}

function renderer() {
  const make = (type) => ({ type, children: [], parent: null })
  return {
    make,
    host: Vue.createRenderer({
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
    }),
  }
}

test('mounted Promotions editor survives refresh/error and closes only when its owner changes', async () => {
  const f = fixture()
  const { host, make } = renderer()
  let mounted = 0,
    unmounted = 0
  const source = readFileSync(
    new URL('components/Workspace/Promotions/Index.vue', runtime),
    'utf8'
  )
  const template = source
    .split('<template>')[1]
    .split('</template>\n<script')[0]
  // Use Vue's runtime compiler directly so the actual parent template controls mounting.
  const app = host.createApp({
    setup: () =>
      load(
        'components/Workspace/Promotions/Index.vue',
        '({ editor, canCreate, createPromotion })',
        {
          provideKitchenPromotionsContext: () => f.context,
        }
      ),
    render: Vue.compile(template),
  })
  const warnings = []
  app.config.warnHandler = (warning) => warnings.push(warning)
  app.component('WorkspaceKitchenCollectionHeader', {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h('header', slots.actions?.()),
  })
  app.component('UButton', { render: () => Vue.h('button') })
  app.component('WorkspaceKitchenPromotionsCollection', {
    render: () => Vue.h('div'),
  })
  app.component('WorkspaceKitchenPromotionsEditor', {
    setup() {
      mounted++
      Vue.onUnmounted(() => unmounted++)
      return () => Vue.h('form')
    },
  })
  f.context.editPromotion(f.promotion)
  app.mount(make('root'))
  assert.equal(mounted, 1)
  f.state.identity.outcome.value = 'pending'
  f.state.collection.outcome.value = 'pending'
  f.state.collection.items.value = []
  f.state.canWrite.value = false
  await Vue.nextTick()
  assert.equal(unmounted, 0)
  assert.equal(f.context.canSave.value, false)
  f.state.collection.outcome.value = 'error'
  f.state.collection.error.value = new Error('Offline')
  await Vue.nextTick()
  assert.equal(unmounted, 0)
  assert.equal(f.context.editor.value.promotion.name, 'Sunday pizzas')
  f.state.identity.outcome.value = 'ready'
  f.state.collection.outcome.value = 'empty'
  f.state.collection.error.value = null
  f.state.canWrite.value = true
  await Vue.nextTick()
  assert.equal(f.context.editorMissing.value, true)
  assert.equal(f.context.canSave.value, false)
  assert.equal(unmounted, 0)
  f.state.editorOwnerKey.value = 'account-a/kitchen-b'
  await Vue.nextTick()
  assert.equal(unmounted, 1)
  assert.equal(f.context.editor.value, null)
  assert.deepEqual(warnings, [])
  app.unmount()
  f.scope.stop()
})

test('promotion sessions snapshot records, block unavailable creation and recover without rewriting values', () => {
  const f = fixture()
  f.context.editPromotion(f.promotion)
  f.promotion.dishes[0].price = 99
  assert.equal(f.context.editor.value.promotion.dishes[0].price, 11)
  f.context.closeEditor()
  f.state.collection.outcome.value = 'pending'
  f.context.createPromotion()
  assert.equal(f.context.editor.value, null)
  f.state.collection.outcome.value = 'ready'
  f.context.createPromotion()
  assert.equal(f.context.editor.value.key, 'new')
  f.state.editorOwnerKey.value = 'account-b/kitchen-a'
  assert.equal(f.context.editor.value, null)
  f.scope.stop()
})

test('readiness changes do not change the promotion editor owner or acquire extra readers', () => {
  const identity = {
    kitchenId: Vue.ref('kitchen-a'),
    outcome: Vue.ref('ready'),
    canWrite: Vue.ref(true),
    selectedKitchen: Vue.ref({}),
  }
  const session = {
    uid: Vue.ref('account-a'),
    appUser: Vue.ref({ role: 'user', created: { at: 1 } }),
  }
  const reads = []
  const state = load(
    'composables/promotions/useKitchenPromotions.ts',
    'useKitchenPromotions()',
    {
      computed: Vue.computed,
      useKitchenWorkspaceIdentity: () => identity,
      useAppSession: () => session,
      useFireUXConfig: () => ({ appId: 'misebox' }),
      useKitchenChildCollection: (name, kitchenId) => {
        reads.push({ name, kitchenId })
        return {
          items: Vue.ref([]),
          outcome: Vue.ref('empty'),
          error: Vue.ref(null),
        }
      },
      readPlaceCurrencyCode: () => 'CHF',
      useCommandScope: () => () => () => true,
      useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
    }
  )
  const owner = state.editorOwnerKey.value
  identity.outcome.value = 'pending'
  identity.canWrite.value = false
  assert.equal(state.kitchenId.value, '')
  assert.equal(state.editorOwnerKey.value, owner)
  identity.outcome.value = 'error'
  assert.equal(state.editorOwnerKey.value, owner)
  assert.deepEqual(
    reads.map((read) => read.name),
    ['promotions', 'dishes']
  )
  assert.ok(reads.every((read) => read.kitchenId.value === ''))
  identity.kitchenId.value = 'kitchen-b'
  assert.notEqual(state.editorOwnerKey.value, owner)
  identity.kitchenId.value = 'kitchen-a'
  session.uid.value = 'account-b'
  assert.notEqual(state.editorOwnerKey.value, owner)
})
