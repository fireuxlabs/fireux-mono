import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as Vue from 'vue'
import { readPlaceCurrencyCode } from '../../../fireux-places/src/runtime/place/utils/place-spine.ts'
import {
  normalizeKitchenPromotion,
  promotionDays,
} from '../runtime/kitchen/utils/promotions/pricing.ts'

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
        useKitchenWorkspacePromotions: () => state,
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
    new URL('components/FoodAndDrink/Promotions/Index.vue', runtime),
    'utf8'
  )
  const template = source
    .split('<template>')[1]
    .split('</template>\n<script')[0]
  // Use Vue's runtime compiler directly so the actual parent template controls mounting.
  const app = host.createApp({
    setup: () =>
      load(
        'components/FoodAndDrink/Promotions/Index.vue',
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
  app.component('KitchenFoodAndDrinkPromotionsCollection', {
    render: () => Vue.h('div'),
  })
  app.component('KitchenFoodAndDrinkPromotionsEditor', {
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
    currencyCode: Vue.ref('CHF'),
  }
  const session = {
    uid: Vue.ref('account-a'),
    appUser: Vue.ref({ role: 'user', created: { at: 1 } }),
  }
  const reads = []
  const state = load(
    'composables/workspace/promotions/useKitchenWorkspacePromotions.ts',
    'useKitchenWorkspacePromotions()',
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
      useCommandScope: () => () => () => true,
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

test('Promotion save uses the linked Place currency supplied by Kitchen Identity', async () => {
  const place = Vue.ref({ id: 'k', default_currency_code: 'CHF' })
  const identity = load(
    'composables/useKitchenIdentity.ts',
    'useKitchenIdentityProjection(input)',
    {
      computed: Vue.computed,
      readPlaceCurrencyCode,
      input: {
        id: Vue.ref('k'),
        data: Vue.ref({
          id: 'k',
          identity: { slug: 'venue', status: 'active', visibility: true },
        }),
        outcome: Vue.ref('ready'),
        place,
        placeOutcome: Vue.ref('ready'),
      },
    }
  )
  identity.canWrite = Vue.ref(true)
  const state = load(
    'composables/workspace/promotions/useKitchenWorkspacePromotions.ts',
    'useKitchenWorkspacePromotions()',
    {
      computed: Vue.computed,
      useKitchenWorkspaceIdentity: () => identity,
      useAppSession: () => ({
        uid: Vue.ref('operator'),
        appUser: Vue.ref({ role: 'user' }),
      }),
      useFireUXConfig: () => ({ appId: 'misebox' }),
      useKitchenChildCollection: () => ({
        items: Vue.ref([]),
        outcome: Vue.ref('empty'),
      }),
      useCommandScope: () => () => () => true,
    }
  )
  const saves = []
  state.save = async (...args) => saves.push(args)
  const editor = load(
    'composables/promotions/usePromotionEditor.ts',
    'usePromotionEditor()',
    {
      computed: Vue.computed,
      ref: Vue.ref,
      normalizeKitchenPromotion,
      promotionDays,
      useKitchenPromotionsContext: () => ({
        state,
        editor: Vue.ref({
          promotion: {
            id: 'sunday',
            name: 'Sunday pizzas',
            status: 'active',
            currency: 'CHF',
            days: ['sunday'],
            dishes: [{ dishId: 'pizza', price: 11 }],
          },
        }),
        canSave: Vue.ref(true),
        closeEditor() {},
      }),
    }
  )
  assert.equal(state.currency.value, 'CHF')
  await editor.save()
  assert.equal(editor.error.value, '')
  assert.equal(saves[0][0].currency, 'CHF')
  assert.equal(saves[0][1], 'sunday')
  place.value = { id: 'k', default_currency_code: 'EUR' }
  await editor.save()
  assert.equal(saves[1][0].currency, 'EUR')
})
