import { readItemIdentity } from '../runtime/kitchen/utils/item-identity.ts'
import { ItemStorage } from '../runtime/kitchen/records/menus/items/item.ts'
import { readItemReferenceIds } from '../runtime/kitchen/utils/item-preparation.ts'
import { resolveHttpDocumentOutcome } from '../../../../core/fireux-core/src/runtime/utils/http-document-outcome.ts'
import {
  itemCataloguePath,
  readItemCatalogueQuery,
  itemCatalogueReturn,
} from '../runtime/kitchen/utils/item-catalogue-route.ts'
import { itemPricingHelpers } from './helpers/item-pricing.mjs'
import {
  readItemChoiceGroups,
  itemChoiceRule,
  priceItemChoices,
} from '../runtime/kitchen/utils/item-choices.ts'
import { readPlaceCurrencyCode } from '../../../fireux-places/src/runtime/place/utils/place-spine.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  compile,
  computed,
  createSSRApp,
  effectScope,
  h,
  inject,
  nextTick,
  provide,
  reactive,
  ref,
  shallowRef,
  toValue,
  unref,
  watch,
  watchEffect,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'

const runtime = new URL('../runtime/', import.meta.url)
function load(path, result, deps) {
  let source = readFileSync(new URL(path, runtime), 'utf8')
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.server', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const { normalizeItem, normalizeLegacyItemKind } = load(
  'kitchen/utils/item.ts',
  '({ normalizeItem, normalizeLegacyItemKind })',
  { readItemReferenceIds, readItemIdentity, ...itemPricingHelpers }
)
const { resolveKitchenChildCollectionBasePath } = load(
  'kitchen/utils/kitchen-collection-path.ts',
  '({ resolveKitchenChildCollectionBasePath })',
  {}
)
const { useFirestoreCollectionState } = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCollection.ts',
  '({ useFirestoreCollectionState })',
  { computed, resolveReadOutcome, resolveHttpDocumentOutcome, toValue }
)
const { useKitchenWorkspaceReadPage } = load(
  'kitchen/composables/workspace/useKitchenWorkspaceReadPage.ts',
  '({ useKitchenWorkspaceReadPage })',
  { computed, unref }
)
const enhanceFirestoreRead = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreRead.ts',
  'enhanceFirestoreRead',
  {
    computed,
    ref,
    shallowRef,
    unref,
    watch,
    resolveReadOutcome,
    resolveHttpDocumentOutcome,
  }
)
function bindingFixture() {
  const scope = effectScope(),
    raw = ref([
      { id: 'soup', name: 'Soup', item_kind: 'food', price: 12 },
      { id: 'tea', name: 'Tea', item_kind: 'drink', price: 3 },
    ])
  Object.assign(raw, {
    data: raw,
    pending: ref(false),
    error: ref(undefined),
    promise: shallowRef(Promise.resolve()),
    stop: () => {},
  })
  let target
  const read = {
    firestoreFetchDoc: (p, id) => {
      target = computed(() =>
        toValue(p) && toValue(id) ? `${toValue(p)}/${toValue(id)}` : ''
      )
      const document = computed(() =>
        raw.value.find((row) => row.id === toValue(id))
      )
      Object.assign(document, {
        data: document,
        pending: raw.pending,
        error: raw.error,
        promise: raw.promise,
        stop: raw.stop,
      })
      return enhanceFirestoreRead(document, {
        active: computed(() => Boolean(toValue(target))),
        source: target,
        kind: 'document',
      })
    },
    firestoreFetchCollection: (p) => {
      target = p
      return enhanceFirestoreRead(raw, {
        active: computed(() => Boolean(toValue(p))),
        source: p,
        kind: 'collection',
      })
    },
  }
  return {
    scope,
    raw,
    read,
    get path() {
      return toValue(target)
    },
    settle(rows) {
      raw.value = rows.map((row) => ({ price: 12, ...row }))
      raw.pending.value = false
      raw.promise.value = Promise.resolve()
    },
  }
}
function lowerReader(f) {
  return load(
    'kitchen/composables/useKitchenItemCollection.ts',
    'useKitchenItemCollection',
    {
      computed,
      unref,
      toValue,
      useFireUXConfig: () => ({ appId: 'app' }),
      useFirestoreRead: () => f.read,
      ItemStorage,
      normalizeItem,
      readItemIdentity,
      readItemOffer: itemPricingHelpers.readItemOffer,
      resolveKitchenChildCollectionBasePath,
      useFirestoreCollectionState,
    }
  )
}
function workspaceFixture() {
  const f = bindingFixture(),
    workspace = {
      id: ref('mine'),
      data: ref({ id: 'mine', name: 'Mine' }),
      outcome: ref('ready'),
      accountReady: ref(true),
      hasAccount: ref(true),
    }
  const access = { ids: ref(['mine']), error: ref(null) },
    session = { error: ref(null) }
  const use = load(
    'kitchen/composables/workspace/menu/items/useKitchenWorkspaceItems.ts',
    'useKitchenWorkspaceItems',
    {
      computed,
      useKitchenWorkspace: () => workspace,
      useKitchenAccess: () => access,
      useAppSession: () => session,
      useKitchenItemCollection: lowerReader(f),
      ItemStorage,
      readRuntimeFirestoreDatabaseId: () => 'misebox',
      useKitchenWorkspaceReadPage,
    }
  )
  const state = f.scope.run(use)
  return {
    ...f,
    workspace,
    access,
    session,
    state,
    get path() {
      return f.path
    },
  }
}
function kindContext(f, kind) {
  const published = []
  const create = load(
    'kitchen/composables/workspace/menu/items/useKitchenItemsContext.ts',
    'createKitchenItemsWorkspace',
    {
      computed,
      ref,
      watch,
      watchEffect,
      useKitchenWorkspaceItems: () => f.state,
      useWorkspacePageState: () => ({
        publish: (value) => published.push(value),
      }),
      defineWorkspaceCapabilityContext: (value) => value,
    }
  )
  const context = f.scope.run(() => create(kind))
  return { context, published }
}

test('Item collection binds only exact ready Kitchen and clears retained rows immediately across owner changes', () => {
  const f = workspaceFixture()
  assert.equal(f.path, 'kitchens/mine/dishes')
  assert.equal(f.state.dishes.value.length, 2)
  for (const outcome of ['pending', 'error', 'empty', 'idle']) {
    f.workspace.outcome.value = outcome
    assert.equal(f.path, '')
    assert.deepEqual(f.state.dishes.value, [])
    assert.equal(f.state.readOnly.value, true)
    assert.equal(f.state.outcome.value, outcome)
  }
  f.workspace.outcome.value = 'ready'
  f.workspace.data.value = { id: 'wrong' }
  assert.equal(f.path, '')
  assert.equal(f.state.outcome.value, 'pending')
  f.workspace.data.value = { id: 'mine' }
  f.settle([{ id: 'soup', name: 'Fresh soup' }])
  f.workspace.id.value = 'other'
  assert.equal(f.path, '')
  assert.deepEqual(f.state.dishes.value, [])
  f.workspace.data.value = { id: 'other' }
  f.access.ids.value = ['other']
  assert.equal(f.path, 'kitchens/other/dishes')
  assert.equal(f.state.outcome.value, 'pending')
  f.settle([{ id: 'other-soup', name: 'Other soup' }])
  assert.equal(f.state.dishes.value[0].name, 'Other soup')
  f.scope.stop()
})
test('Item source and owner failures beat loading; inactive owner clears old errors and authority', () => {
  const f = workspaceFixture()
  f.raw.pending.value = true
  assert.equal(f.state.outcome.value, 'pending')
  assert.deepEqual(f.state.dishes.value, [])
  f.raw.error.value = new Error('Items denied')
  assert.equal(f.state.outcome.value, 'error')
  assert.equal(f.state.pending.value, false)
  assert.equal(f.state.error.value.message, 'Items denied')
  f.settle([])
  assert.equal(f.state.outcome.value, 'empty')
  assert.equal(f.state.readOnly.value, false)
  f.access.ids.value = []
  assert.equal(f.state.readOnly.value, true)
  f.workspace.outcome.value = 'error'
  f.session.error.value = new Error('Account read failed')
  assert.equal(f.state.error.value.message, 'Account read failed')
  f.workspace.id.value = ''
  f.workspace.outcome.value = 'idle'
  assert.equal(f.state.outcome.value, 'idle')
  assert.equal(f.state.error.value, undefined)
  f.scope.stop()
})
test('No selected Kitchen preserves pending or failed account/access outcomes before showing selection', async () => {
  const f = workspaceFixture()
  f.workspace.id.value = ''
  f.workspace.data.value = null
  for (const parentOutcome of ['pending', 'error']) {
    f.workspace.outcome.value = parentOutcome
    f.access.error.value =
      parentOutcome === 'error' ? new Error('Kitchen access denied') : null
    assert.equal(f.state.outcome.value, parentOutcome)
    assert.equal(f.state.pending.value, parentOutcome === 'pending')
    assert.equal(f.path, '')
    assert.deepEqual(f.state.dishes.value, [])
    const html = await render(
      'kitchen/components/Workspace/Menu/Items/Collection/Results.vue',
      {
        storageKitchenId: f.state.storageKitchenId,
        outcome: f.state.outcome,
        pending: f.state.pending,
        catalogue,
      }
    )
    assert.match(
      html,
      parentOutcome === 'error' ? /Kitchen unavailable/ : /Loading Kitchen/
    )
    assert.doesNotMatch(html, /Select a kitchen/)
    if (parentOutcome === 'error')
      assert.equal(f.state.error.value.message, 'Kitchen access denied')
  }
  f.workspace.outcome.value = 'idle'
  assert.equal(f.state.outcome.value, 'idle')
  assert.equal(f.state.error.value, undefined)
  f.scope.stop()
})
test('Item lower reader honours deliberately inactive parent path', () => {
  const f = bindingFixture(),
    use = lowerReader(f)
  const state = f.scope.run(() =>
    use(ref('mine'), { kitchenCollectionPath: ref('') })
  )
  assert.equal(f.path, '')
  assert.equal(state.outcome.value, 'idle')
  assert.deepEqual(state.dishes.value, [])
  f.scope.stop()
})
test('Food and Drinks partition one live Item collection; failures disable Create instead of publishing an empty ready capability', async () => {
  const f = workspaceFixture(),
    food = kindContext(f, 'food'),
    drinks = kindContext(f, 'drink')
  assert.deepEqual(
    food.context.dishes.value.map((x) => x.id),
    ['soup']
  )
  assert.deepEqual(
    drinks.context.dishes.value.map((x) => x.id),
    ['tea']
  )
  assert.equal(food.context.outcome.value, 'ready')
  f.settle([{ id: 'tea', item_kind: 'drink', name: 'Tea' }])
  await nextTick()
  assert.equal(food.context.outcome.value, 'empty')
  assert.equal(drinks.context.outcome.value, 'ready')
  assert.equal(
    food.context.derived.value.capability.primitives.create.available,
    true
  )
  f.raw.pending.value = true
  f.raw.error.value = new Error('Denied')
  assert.equal(food.context.derived.value.status, 'error')
  assert.equal(
    food.context.derived.value.capability.primitives.create.available,
    false
  )
  assert.equal(drinks.context.derived.value.capability.primitives.read.count, 0)
  f.settle([{ id: 'tea', item_kind: 'drink', name: 'Tea' }])
  await nextTick()
  assert.equal(drinks.context.selectedItemId.value, 'tea')
  f.workspace.id.value = 'other'
  assert.equal(drinks.context.selectedItemId.value, '')
  assert.deepEqual(drinks.context.dishes.value, [])
  f.scope.stop()
})
test('Item record route stays reactive across both kinds while catalogues retain kind filtering and read outcomes', () => {
  const f = workspaceFixture(),
    { context } = kindContext(f, 'food'),
    id = ref('soup'),
    access = { ...f.access, outcome: ref('ready') }
  const use = load(
    'kitchen/composables/items/useKitchenItemRead.ts',
    'useKitchenItemRead',
    {
      computed,
      toValue,
      ItemStorage,
      normalizeItem,
      readItemIdentity,
      readItemOffer: itemPricingHelpers.readItemOffer,
      useKitchenAccess: () => access,
      useFirestoreRead: () => f.read,
      readRuntimeFirestoreDatabaseId: () => 'misebox',
    }
  )
  const record = f.scope.run(() =>
    use(
      () => (f.workspace.outcome.value === 'ready' ? f.workspace.id.value : ''),
      id
    )
  )
  assert.equal(f.path, 'kitchens/mine/dishes/soup')
  assert.equal(record.item.value.name, 'Soup')
  assert.equal(
    context.dishes.value.some((dish) => dish.id === 'tea'),
    false
  )
  id.value = 'tea'
  f.settle(f.raw.value)
  assert.equal(record.item.value.name, 'Tea')
  id.value = 'missing'
  f.settle(f.raw.value)
  assert.equal(record.outcome.value, 'empty')
  assert.equal(record.item.value, null)
  f.raw.pending.value = true
  assert.equal(record.outcome.value, 'pending')
  f.raw.error.value = new Error('Read failed')
  assert.equal(record.outcome.value, 'error')
  assert.equal(record.error.value.message, 'Read failed')
  f.workspace.id.value = ''
  f.workspace.outcome.value = 'idle'
  assert.equal(record.outcome.value, 'idle')
  f.scope.stop()
})

function template(path) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
  return compile(
    source.slice(
      source.indexOf('<template>') + 10,
      source.lastIndexOf('</template>')
    ),
    {
      onError: (e) => {
        throw e
      },
      onWarn: (e) => {
        throw e
      },
    }
  )
}
function components(app) {
  const empty = [
    'FireDiagnosticsDebugPanel',
    'UIcon',
    'UAvatar',
    'UBadge',
    'KitchenWorkspaceMenuItemsCollection',
    'KitchenWorkspaceMenuItemsCardsCell',
    'MenuItemDisplay',
    'Preview',
    'UPagination',
    'USelect',
    'UCheckbox',
    'WorkspaceKitchenAICapability',
    'WorkspaceKitchenAICapabilityInfo',
    'WorkspaceKitchenAIFocus',
    'KitchenWorkspaceMenuItemsEdit',
    'KitchenWorkspaceMenuItemsPhoto',
    'KitchenWorkspaceMenuItemsGroups',
    'KitchenWorkspaceMenuItemsCollectionAssignGroup',
    'KitchenWorkspaceMenuItemsPricing',
    'KitchenWorkspaceMenuItemsDelete',
    'ItemMenus',
    'ItemMenu',
    'ItemMenuSection',
    'FireCopyError',
    'FireContextRecord',
    'KitchenWorkspaceMenuItemsCreate',
  ]
  for (const name of empty)
    app.component(name, {
      props: ['message'],
      setup: (props) => () => (props.message ? h('p', props.message) : null),
    })
  app.component('FireDisclosurePanel', {
    setup:
      (_, { slots }) =>
      () =>
        h('div', slots.default?.()),
  })
  app.component('UButton', {
    props: ['label'],
    setup: (props) => () => h('button', props.label),
  })
  for (const name of ['UAlert', 'FireState', 'FireCopyError'])
    app.component(name, {
      props: ['title'],
      setup: (props) => () => h('p', props.title),
    })
  for (const name of [
    'WorkspaceKitchenCollectionHeader',
    'WorkspacePageHeader',
    'UTooltip',
    'UCard',
    'UPageGrid',
    'UDropdownMenu',
    'NuxtLink',
  ])
    app.component(name, {
      setup:
        (_, { slots }) =>
        () =>
          h('div', [slots.header?.(), slots.default?.(), slots.actions?.()]),
    })
  for (const name of ['UModal', 'USlideover'])
    app.component(name, {
      props: ['open'],
      setup:
        (props, { slots }) =>
        () =>
          props.open ? h('div', slots.body?.()) : null,
    })
  app.component('FireState', {
    props: ['outcome', 'entity'],
    setup: (props) => () =>
      props.outcome === 'pending'
        ? h('p', { role: 'status' }, `Loading ${props.entity}…`)
        : null,
  })
  app.component('WorkspaceKitchenCollectionToolbar', {
    props: ['count'],
    setup: (props) => () => h('p', `Count: ${props.count}`),
  })
}
async function render(path, state) {
  const warnings = [],
    app = createSSRApp({ setup: () => state, render: template(path) })
  app.config.warnHandler = (warning) => warnings.push(warning)
  components(app)
  const html = await renderToString(app)
  assert.deepEqual(warnings, [])
  return html
}
const catalogue = {
  itemKind: 'food',
  title: 'Items',
  singular: 'dish',
  plural: 'dishes',
  path: '/workspace/kitchen/menu/items',
  createPath: '/workspace/kitchen/menu/items?create=food',
  icon: 'i-lucide-utensils',
}
function readView(overrides = {}) {
  return {
    catalogue,
    storageKitchenId: 'mine',
    outcome: 'ready',
    error: null,
    pending: false,
    focus: { name: 'Mine' },
    canCreate: true,
    visibleCount: 0,
    dishes: [],
    pageItems: [],
    query: '',
    selected: [],
    moreActions: [],
    view: 'list',
    kind: 'all',
    kindFilters: [
      { value: 'all', label: 'All Items' },
      { value: 'food', label: 'Food' },
      { value: 'drink', label: 'Drinks' },
    ],
    page: 1,
    pageSize: 40,
    organise: false,
    aiOpen: false,
    suggestions: [],
    actionTargets: [],
    debug: {},
    createKind: null,
    closeCreate: () => {},
    emit: () => {},
    ...overrides,
  }
}
function recordView(overrides = {}) {
  return {
    catalogue,
    outcome: 'ready',
    item: { id: 'soup', name: 'Soup' },
    pending: false,
    error: null,
    canWrite: true,
    selectedKitchen: { id: 'mine', name: 'Mine' },
    kitchenId: 'mine',
    storageKitchenId: 'mine',
    itemId: 'soup',
    catalogueReturn: catalogue.path,
    menuReturn: '',
    manage: false,
    route: { query: {} },
    views: [],
    view: 'details',
    removeItem: () => {},
    ...overrides,
  }
}
test('Items prices use the supplied Kitchen currency and keep missing currency explicit', () => {
  const currency = ref('CHF')
  const priceLabel = load(
    'kitchen/components/Workspace/Menu/Items/Collection/Results.vue',
    'priceLabel',
    {
      computed,
      defineEmits: () => () => {},
      useItemCatalogueContext: () => ({ currency }),
      readPlaceCurrencyCode,
      readItemChoiceGroups,
      itemChoiceRule,
      priceItemChoices,
    }
  )
  assert.match(priceLabel({ price: 12.5 }), /CHF/)
  assert.match(priceLabel({ price: 12.5 }), /12\.50/)
  currency.value = ''
  assert.equal(priceLabel({ price: 12.5 }), 'Currency not set')
  assert.equal(priceLabel({}), 'Not set')
  assert.equal(priceLabel({ pricing_error: true }), 'Review price & choices')
})
test('actual Item collection distinguishes Kitchen loading, failure, missing and inactive selection', async () => {
  for (const [outcome, expected] of [
    ['pending', 'Loading Kitchen'],
    ['error', 'Kitchen unavailable'],
    ['empty', 'Kitchen not found'],
    ['idle', 'Select a kitchen'],
  ])
    assert.match(
      await render(
        'kitchen/components/Workspace/Menu/Items/Collection/Results.vue',
        {
          storageKitchenId: '',
          outcome,
          pending: outcome === 'pending',
          catalogue,
        }
      ),
      new RegExp(expected)
    )
})
async function renderCatalogue(state) {
  return (
    await Promise.all(
      ['Controls', 'Results'].map((child) =>
        render(
          `kitchen/components/Workspace/Menu/Items/Collection/${child}.vue`,
          {
            ...state,
            ready:
              ['ready', 'empty'].includes(state.outcome) &&
              Boolean(state.storageKitchenId),
          }
        )
      )
    )
  ).join('')
}

test('actual Item collection hides premature counts, categories, filters and Create during loading/failure', async () => {
  for (const outcome of ['pending', 'error']) {
    const html = await renderCatalogue(
      readView({
        outcome,
        pending: outcome === 'pending',
        error: outcome === 'error' ? new Error('Failed') : null,
      })
    )
    assert.doesNotMatch(
      html,
      /Count:|Item categories|Filter catalogue|No dishes yet|Add item/
    )
  }
  const html = await renderCatalogue(readView({ outcome: 'empty' }))
  assert.match(html, /Count: 0/)
  assert.match(html, /No dishes yet/)
})
test('Items landing lists one Kitchen read and links directly to Octopus Roll', async () => {
  const path = 'kitchen/components/Workspace/Menu/Items/Index.vue'
  let reads = 0
  const destinations = []
  const state = load(
    path,
    '({ items, outcome, storageKitchenId, error, itemCataloguePath, canCreate, createOpen, openItem })',
    {
      computed,
      ref,
      watch,
      itemCataloguePath,
      navigateTo: (path) => destinations.push(path),
      useKitchenWorkspaceItems: () => {
        reads++
        return {
          storageKitchenId: ref('la-tapberne'),
          readOnly: ref(false),
          outcome: ref('ready'),
          dishes: ref([
            { id: 'octopus-roll', name: 'Octopus Roll' },
            { id: 'tortilla', name: 'Tortilla de Patata' },
          ]),
        }
      },
    }
  )
  assert.equal(reads, 1)
  const app = createSSRApp({ setup: () => state, render: template(path) })
  app.component('WorkspacePageHeader', {
    setup:
      (_, { slots }) =>
      () =>
        h('header', slots.actions?.()),
  })
  app.component('UButton', {
    props: ['label'],
    setup: (props) => () => h('button', props.label),
  })
  app.component('UModal', { render: () => null })
  app.component('FireState', { render: () => null })
  app.component('NuxtLink', {
    props: ['to'],
    setup:
      (props, { slots }) =>
      () =>
        h('a', { href: props.to }, slots.default?.()),
  })
  const html = await renderToString(app)
  assert.match(
    html,
    /href="\/workspace\/kitchen\/menu\/items\/octopus-roll">Octopus Roll/
  )
  assert.match(html, /Tortilla de Patata/)
  assert.match(html, /Add item/)
  assert.doesNotMatch(html, /Search items/)
  state.createOpen.value = true
  state.openItem('new item')
  assert.equal(state.createOpen.value, false)
  assert.deepEqual(destinations, [`${itemCataloguePath}/new%20item`])
})

test('Item usage ignores retained placements when the Kitchen or Item changes', () => {
  const kitchenId = ref('kitchen-a')
  const itemId = ref('picanha')
  const placement = { kind: 'menu', id: 'food', name: 'Comida Casera' }
  const data = ref({
    kitchenId: 'kitchen-a',
    dishId: 'picanha',
    usages: [placement],
  })
  const pending = ref(false)
  const error = ref(null)
  let key
  const usage = load(
    'kitchen/composables/items/useItemUsage.ts',
    'useItemUsage(kitchenId, itemId)',
    {
      computed,
      kitchenId,
      itemId,
      useAuth: () => ({ currentUser: ref({ uid: 'operator' }) }),
      useAsyncData: (readKey) => {
        key = readKey
        return { data, pending, error }
      },
    }
  )
  assert.deepEqual(usage.usages.value, [placement])
  itemId.value = 'octopus-roll'
  assert.equal(key.value, 'dish-usage:operator:kitchen-a:octopus-roll')
  assert.equal(usage.ready.value, false)
  assert.deepEqual(usage.usages.value, [])
  itemId.value = 'picanha'
  kitchenId.value = 'kitchen-b'
  assert.equal(usage.ready.value, false)
  data.value = { kitchenId: 'kitchen-b', dishId: 'picanha', usages: [] }
  assert.equal(usage.ready.value, true)
  pending.value = true
  assert.equal(usage.ready.value, false)
})

test('the Item route reads once for the read surfaces', async () => {
  const route = 'pages/workspace/kitchen/menu/items/[dishId].vue'
  const path = 'kitchen/components/Workspace/Menu/Items/Detail/Index.vue'
  const publicItem = 'menu/components/ItemDetail.vue'
  const renderRecord = (
    item,
    menu = '',
    manifest = null,
    directory = null,
    itemOutcome = item ? 'ready' : 'empty',
    workspaceOutcome = 'ready'
  ) => {
    let reads = 0
    const app = createSSRApp({
      setup: () =>
        load(route, '({ item, route, data, outcome })', {
          computed,
          definePageMeta: () => {},
          provideKitchenItemContext: (reader) => reader,
          useRoute: () => ({ query: { menu } }),
          useRouteParam: () => ref('octopus-roll'),
          useKitchenWorkspace: () => ({
            outcome: ref(workspaceOutcome),
            id: ref('la-tapberne'),
            data: ref({ slug: 'la-tapberne' }),
          }),
          useKitchenItemRead: (kitchenId, itemId) => {
            reads += 1
            assert.equal(
              kitchenId(),
              workspaceOutcome === 'ready' ? 'la-tapberne' : ''
            )
            assert.equal(itemId.value, 'octopus-roll')
            return { item: ref(item), outcome: ref(itemOutcome) }
          },
        }),
      render: template(route),
    })
    app.component('KitchenWorkspaceMenuItemsDetail', {
      props: ['item', 'menu', 'kitchenSlug', 'outcome'],
      setup: () => ({ dev: false }),
      render: template(path),
    })
    app.component('UAlert', {
      props: ['title'],
      render() {
        return h('p', this.title)
      },
    })
    app.component('FireDisclosurePanel', {
      props: ['title'],
      setup: (props) => () => h('button', props.title),
    })
    app.component('ItemMenuPlacements', { render: () => null })
    app.component('WorkspaceItemEdit', { render: () => null })
    for (const [name, file] of [
      ['Detail.Status', 'Status'],
      ['Detail.Menus', 'MenusCapability'],
      ['Detail.Diagnostics', 'ItemData'],
      ['Detail.Prep', 'Prep'],
      ['Detail.Team', 'Team'],
    ]) {
      app.component(name, {
        props: name === 'Detail.Status' ? ['outcome'] : [],
        render: template(
          `kitchen/components/Workspace/Menu/Items/Detail/${file}.vue`
        ),
      })
    }
    app.component('Detail.Basics', {
      props: ['item'],
      render: template(
        'kitchen/components/Workspace/Menu/Items/Detail/WorkspaceItemDetail.vue'
      ),
    })
    app.component('KitchenMenuItemDetail', {
      props: ['item', 'menu', 'kitchenSlug'],
      setup: (props) =>
        load(publicItem, '({ menuSlug, lookingUpMenu })', {
          computed,
          defineProps: () => props,
          useApiRead: (key) => {
            assert.equal(
              key(),
              menu
                ? 'item-menu-preview|'
                : `item-menu-preview|/api/menus?kitchenSlug=la-tapberne&dishId=${item.id}&limit=1`
            )
            return { data: ref(directory), pending: ref(false) }
          },
        }),
      render: template(publicItem),
    })
    app.component('ItemPlacement', {
      props: ['dishId', 'menuSlug', 'kitchenSlug'],
      setup: (props) =>
        load(
          'menu/components/ItemPlacement.vue',
          '({ presentation, sections, copy, className, styleVars, pending })',
          {
            computed,
            defineProps: () => props,
            useMenu: (id, options) => {
              assert.equal(id(), menu || directory?.items[0]?.slug || '')
              assert.equal(options.routeScope().kitchenSlug, 'la-tapberne')
              return { manifest: ref(manifest), pending: ref(false) }
            },
            directoryMenuRouteScope: (kitchenSlug) => ({
              kind: 'directory',
              kitchenSlug,
            }),
            useKitchenOfferingNow: () => ({ now: ref(new Date()) }),
            promotionPricedSections: (sections) => sections,
            resolveMenuBrowseSurfaceCopy: () => ({}),
            useMenuThemeSurface: ({ theme }) => ({
              className: ref('menu-theme--light'),
              styleVars: computed(() => ({
                '--menu-bg': theme()?.palette.canvas,
              })),
            }),
          }
        ),
      render: template('menu/components/ItemPlacement.vue'),
    })
    app.component('MenuBrowseCatalogue', {
      props: [
        'sections',
        'copy',
        'currencyCode',
        'currencyFormat',
        'showCurrency',
        'showItemImages',
      ],
      setup: (props) => () =>
        h(
          'div',
          {
            'data-currency': props.currencyCode,
            'data-images': String(props.showItemImages),
          },
          props.sections.flatMap((section) =>
            section.items.map((item) => item.name)
          )
        ),
    })
    app.component('ItemPhoto', {
      props: ['src', 'alt'],
      setup: (props) => () => h('img', { src: props.src, alt: props.alt }),
    })
    app.component('MenuItemImage', {
      props: ['imageUrl'],
      setup: (props) => () => h('img', { src: props.imageUrl, alt: '' }),
    })
    app.component('MenuItemDisplay', {
      props: [
        'as',
        'nameId',
        'nameTo',
        'announcePrice',
        'promotionLabel',
        'name',
        'description',
        'price',
        'headingTag',
        'imageUrl',
      ],
      render: template('menu/components/ItemDisplay.vue'),
    })
    return renderToString(app).then((html) => {
      assert.equal(reads, 1)
      return html
    })
  }
  const missing = await renderRecord(null)
  assert.match(missing, /Item not found/)
  assert.doesNotMatch(missing, /<article|<h2/)
  assert.match(missing, /workspace-item-basics.*display:none/)
  assert.match(
    await renderRecord(null, '', null, null, 'pending'),
    /Loading item/
  )
  assert.match(
    await renderRecord(null, '', null, null, 'error'),
    /Item unavailable/
  )
  assert.match(
    await renderRecord(null, '', null, null, 'idle'),
    /Select a Kitchen/
  )
  assert.match(
    await renderRecord(null, '', null, null, 'idle', 'pending'),
    /Loading item/
  )
  assert.match(
    await renderRecord(null, '', null, null, 'idle', 'error'),
    /Item unavailable/
  )
  assert.match(
    await renderRecord(null, '', null, null, 'ready'),
    /Item unavailable/
  )
  const html = await renderRecord({
    id: 'octopus-roll',
    name: 'Octopus Roll',
    description: 'La Tap special',
  })
  assert.doesNotMatch(html, /<pre>|Item data/)
  assert.match(html, />Menus<[^]*>Placements</)
  assert.doesNotMatch(
    html,
    /Item diagnostics|Saved menu sections that include this item/
  )
  assert.match(html, /class="[^"]*menu-item-detail"/)
  assert.doesNotMatch(html, /Workspace list/)
  assert.match(
    html,
    /<h2 class="workspace-item-basics__name">Octopus Roll<\/h2>/
  )
  assert.match(html, /workspace-item-basics__description">La Tap special<\/p>/)
  assert.match(
    html,
    /<article[\s\S]*<h1[^>]*>[\s\S]*?Octopus Roll[\s\S]*?<\/h1>[\s\S]*La Tap special[\s\S]*<\/article>/
  )
  assert.doesNotMatch(html, /menu-browse-item__price/)
  assert.doesNotMatch(html, /<img/)
  const withImage = await renderRecord({
    id: 'octopus-roll',
    name: 'Octopus Roll',
    image: '/octopus-roll.jpg',
  })
  assert.equal([...withImage.matchAll(/src="\/octopus-roll.jpg"/g)].length, 2)
  const placed = { id: 'picanha-smashburger', name: 'Kitchen burger' }
  const menu = 'comida-casera-2'
  const manifest = {
    source: { kitchenSlug: 'la-tapberne', menuSlug: menu },
    presentation: {
      currencyCode: 'CHF',
      showItemImages: false,
      theme: { palette: { canvas: '#171717' } },
    },
    content: {
      name: 'Comida Casera',
      sections: [
        {
          id: 'onlyhands',
          items: [
            { dishId: placed.id, name: 'Picanha Smashburger' },
            { dishId: 'other', name: 'Different Item' },
          ],
        },
      ],
    },
  }
  const themed = await renderRecord(placed, menu, manifest)
  assert.doesNotMatch(themed, /Public menu preview|Workspace item/)
  assert.match(themed, /--menu-bg:#171717/)
  assert.match(
    themed,
    /data-currency="CHF" data-images="false">Picanha Smashburger/
  )
  assert.doesNotMatch(themed, /Different Item|class="menu-item-detail"/)
  const defaultMenu = await renderRecord(placed, '', manifest, {
    scope: { kind: 'directory', kitchenSlug: 'la-tapberne' },
    items: [{ slug: menu, matching_dishes: [{ id: placed.id }] }],
  })
  assert.equal(defaultMenu, themed)
  const missingPlacement = await renderRecord(placed, 'other-menu', manifest)
  assert.match(missingPlacement, /Item unavailable on this menu/)
  assert.doesNotMatch(missingPlacement, /Picanha Smashburger/)
})
test('Item linked read perspectives bind exact ready storage owner instead of remembered Kitchen selection', () => {
  const owner = {
    kitchenId: ref('remembered'),
    storageKitchenId: ref('ready'),
    dishId: ref('soup'),
    dish: ref(null),
    databaseId: ref('misebox'),
    rootCollection: ref('kitchens'),
    selectedKitchen: ref(null),
  }
  const paths = ['Index', 'Menu', 'Section']
  for (const view of paths) {
    let target
    const source = {
      prepItems: ref([]),
      activeMenus: ref([]),
      sections: ref([]),
      items: ref([]),
      pending: ref(false),
      error: ref(null),
    }
    const reader = (id) => {
      target = id
      return source
    }
    const scope = effectScope()
    scope.run(() =>
      load(
        `kitchen/components/Workspace/Menu/Items/Detail/Menus/${view}.vue`,
        '({})',
        {
          ref,
          computed,
          reactive,
          watch,
          defineProps: () => ({
            menu: { id: 'menu', slug: 'menu' },
            section: { id: 'section', label: 'Section' },
          }),
          defineEmits: () => () => {},
          useKitchenWorkspace: () => ({
            id: owner.kitchenId,
            outcome: ref('ready'),
          }),
          useRouteParam: () => owner.dishId,
          useKitchenItemRead: () => owner,
          useKitchenItemContext: () => owner,
          useKitchenPrepItems: reader,
          useKitchenMenuCollection: reader,
          useMenuSectionCollection: reader,
          useMenuEntryCollection: reader,
          useMenuRecordNavigation: () => ({ rememberView: () => {} }),
        }
      )
    )
    assert.equal(toValue(target), 'ready', view)
    owner.storageKitchenId.value = ''
    assert.equal(toValue(target), '', view)
    owner.storageKitchenId.value = 'ready'
    scope.stop()
  }
})
test('actual Item Menu perspectives render failed linked reads without false empty states', async () => {
  const menus = await render(
    'kitchen/components/Workspace/Menu/Items/Detail/Menus/Index.vue',
    {
      error: new Error('Denied'),
      pending: true,
      activeMenus: [],
      kitchenId: 'mine',
    }
  )
  assert.match(menus, /Menus unavailable/)
  assert.doesNotMatch(menus, /No menus in this kitchen|Loading menus/)
})

test('Item projection preserves canonical pricing and excludes the removed deal flag', () => {
  const input = {
    id: 'margherita',
    price: 13,
    price_options: [{ label: 'Large', quantity: 0, unit: '', price: 18 }],
    add_ons: [{ id: 'cheese', label: 'Cheese', price: 2 }],
    is_deal: true,
    category: 'main',
  }
  const dish = normalizeItem(input)
  assert.equal(dish.price, 13)
  assert.deepEqual(dish.price_options, input.price_options)
  assert.deepEqual(dish.add_ons, input.add_ons)
  assert.equal(Object.hasOwn(dish, 'is_deal'), false)
  assert.equal(Object.hasOwn(dish, 'category'), false)
  assert.equal(input.category, 'main')
  assert.equal(Object.hasOwn(normalizeItem({ id: 'new-dish' }), 'price'), false)
  assert.equal(normalizeItem({ id: 'free-dish', price: 0 }).price, 0)
})

test('combined Food & drinks catalogue retains both kinds and responds to live removal and owner changes', async () => {
  const f = workspaceFixture()
  const { context } = kindContext(f, 'all')
  assert.deepEqual(
    context.dishes.value.map((item) => item.id),
    ['soup', 'tea']
  )
  assert.equal(context.catalogue.title, 'Items')
  assert.equal(context.derived.value.capability.primitives.read.count, 2)
  f.settle([{ id: 'tea', name: 'Tea', item_kind: 'drink' }])
  await nextTick()
  assert.deepEqual(
    context.dishes.value.map((item) => item.id),
    ['tea']
  )
  assert.equal(context.outcome.value, 'ready')
  f.workspace.id.value = 'other'
  assert.deepEqual(context.dishes.value, [])
  assert.equal(context.selectedItemId.value, '')
  f.scope.stop()
})

test('combined catalogue filters food and drinks and opens each in its correct editor', async () => {
  const f = workspaceFixture()
  const { context } = kindContext(f, 'all')
  const view = f.scope.run(() =>
    load(
      'kitchen/composables/workspace/menu/items/useItemCatalogue.ts',
      'useItemCatalogue(context)',
      {
        useRoute: () => ({ query: {} }),
        useRouter: () => ({ replace: async () => {} }),
        itemCataloguePath,
        readItemCatalogueQuery,
        context,
        computed,
        ref,
        watch,
        buildMissingItemImageSuggestions: () => [],
        buildMissingDrinkImageSuggestions: () => [],
      }
    )
  )
  assert.deepEqual(
    view.pageItems.value.map((item) => item.id),
    ['soup', 'tea']
  )
  view.kind.value = 'drink'
  await nextTick()
  assert.deepEqual(
    view.pageItems.value.map((item) => item.id),
    ['tea']
  )
  assert.equal(view.itemLink('tea'), `${itemCataloguePath}/tea`)
  view.kind.value = 'food'
  await nextTick()
  assert.deepEqual(
    view.pageItems.value.map((item) => item.id),
    ['soup']
  )
  assert.equal(view.itemLink('soup'), `${itemCataloguePath}/soup`)
  view.clearFilters()
  view.query.value = 'tea'
  assert.deepEqual(
    view.pageItems.value.map((item) => item.id),
    ['tea']
  )
  assert.equal(
    f.state.dishes.value.find((item) => item.id === 'tea').name,
    'Tea'
  )
  f.scope.stop()
})

function catalogueView(f, query = {}) {
  const { context } = kindContext(f, 'all')
  const route = reactive({
    path: '/workspace/kitchen/menu/items',
    query,
  })
  const destinations = []
  const view = f.scope.run(() =>
    load(
      'kitchen/composables/workspace/menu/items/useItemCatalogue.ts',
      'useItemCatalogue(context)',
      {
        useRoute: () => route,
        useRouter: () => ({
          replace: async (destination) => {
            destinations.push(destination)
            route.query = destination.query
          },
        }),
        context,
        computed,
        ref,
        watch,
        itemCataloguePath,
        readItemCatalogueQuery,
        buildMissingItemImageSuggestions: () => [],
        buildMissingDrinkImageSuggestions: () => [],
      }
    )
  )
  return { view, route, destinations }
}
const catalogueRows = () =>
  Array.from({ length: 100 }, (_, n) => ({
    id: `drink-${n}`,
    name: `Cola ${String(n).padStart(3, '0')}`,
    item_kind: 'drink',
    price: 4,
  }))

test('Food & drinks catalogue controls and record links keep catalogue state out of the URL', async () => {
  const f = workspaceFixture()
  const rows = catalogueRows()
  rows[0].image = 'https://example.com/cola.jpg'
  f.settle(rows)
  const { view, route } = catalogueView(f, { filter: 'image' })
  view.kind.value = 'drink'
  view.query.value = 'Cola'
  view.view.value = 'grid'
  await nextTick()
  view.page.value = 2
  await nextTick()
  assert.deepEqual(route.query, {})
  assert.equal(view.page.value, 2)
  assert.equal(view.kind.value, 'drink')
  assert.equal(view.query.value, 'Cola')
  assert.equal(view.visibleCount.value, 99)
  assert.equal(view.view.value, 'grid')
  const id = view.pageItems.value[0].id
  assert.equal(view.itemLink(id), `${itemCataloguePath}/${id}`)
  assert.deepEqual(itemCatalogueReturn({}), {
    path: itemCataloguePath,
    query: {},
  })
  assert.equal(f.state.dishes.value[0].price, 4)
  view.clearFilters()
  assert.equal(view.visibleCount.value, 100)
  f.scope.stop()
})

test('obsolete category links cannot hide Items and retain the type and restored page', async () => {
  const f = workspaceFixture()
  f.settle(
    catalogueRows().map((item, index) => ({
      ...item,
      category: index % 2 ? 'main' : 'side',
    }))
  )
  const { view, route } = catalogueView(f, {
    kind: 'drink',
    category: 'category:main',
    page: '2',
  })
  await nextTick()
  assert.equal(view.visibleCount.value, 100)
  assert.equal(view.kind.value, 'drink')
  assert.equal(view.page.value, 2)
  assert.equal(Object.hasOwn(route.query, 'category'), false)
  assert.equal(
    new URL(view.itemLink('drink-1'), 'http://localhost').searchParams.has(
      'category'
    ),
    false
  )
  f.scope.stop()
})

test('restored catalogue page survives loading, clamps after results settle, and resets when filters change', async () => {
  const f = workspaceFixture()
  f.raw.pending.value = true
  const { view } = catalogueView(f, { kind: 'drink', page: '3' })
  assert.equal(view.page.value, 3)
  await nextTick()
  assert.equal(view.page.value, 3)
  f.settle(catalogueRows())
  await nextTick()
  assert.equal(view.page.value, 3)
  f.settle(catalogueRows().slice(0, 45))
  await nextTick()
  assert.equal(view.page.value, 2)
  view.query.value = '001'
  await nextTick()
  assert.equal(view.page.value, 1)
  f.scope.stop()
})

test('catalogue return drops UI state and keeps the workspace group', () => {
  assert.deepEqual(
    itemCatalogueReturn({
      kind: 'food',
      category: 'mains',
      search: 'pizza',
      filter: 'description',
      layout: 'list',
      page: '2',
      view: 'pricing',
      menu: 'other',
      group: 'kitchen',
    }).query,
    { group: 'kitchen' }
  )
  for (const page of ['0', '-1', 'NaN', '1.5', ['2']])
    assert.equal(readItemCatalogueQuery({ page }).page, 1)
})

test('first Kitchen resolution does not reset a restored catalogue page', async () => {
  const f = workspaceFixture()
  f.workspace.id.value = ''
  f.workspace.outcome.value = 'pending'
  const { view } = catalogueView(f, { page: '2' })
  await nextTick()
  assert.equal(view.page.value, 2)
  f.workspace.id.value = 'mine'
  f.workspace.outcome.value = 'ready'
  f.settle(catalogueRows())
  await nextTick()
  assert.equal(view.page.value, 2)
  f.scope.stop()
})

test('Items dialogs honour create authority, consume create links and close when the Kitchen changes', async () => {
  const f = workspaceFixture()
  const { view, route } = catalogueView(f, { create: 'drink', search: 'cola' })
  const state = f.scope.run(() =>
    load(
      'kitchen/components/Workspace/Menu/Items/Collection/Dialogs.vue',
      '({ createKind, openCreate, onOpenChange })',
      {
        computed,
        ref,
        watch,
        useItemCatalogueContext: () => view,
        useRoute: () => route,
        useRouter: () => ({
          replace: async ({ query }) => {
            route.query = query
          },
        }),
        buildMissingItemImageSuggestions: () => [],
        buildMissingDrinkImageSuggestions: () => [],
        defineExpose: () => {},
      }
    )
  )
  assert.equal(state.createKind.value, 'drink')
  assert.equal(route.query.create, undefined)
  assert.equal(route.query.search, undefined)
  assert.equal(view.query.value, 'cola')
  state.onOpenChange(false)
  assert.equal(state.createKind.value, null)
  state.openCreate('food')
  assert.equal(state.createKind.value, 'food')
  f.workspace.id.value = 'other'
  await nextTick()
  assert.equal(state.createKind.value, null)
  state.openCreate('drink')
  assert.equal(state.createKind.value, null)
  f.scope.stop()
})

test('default catalogue URLs are clean and preserve unrelated query parameters', async () => {
  const f = workspaceFixture()
  const { view, route } = catalogueView(f, {
    kind: 'all',
    search: '',
    filter: 'all',
    layout: 'grid',
    page: '1',
    group: 'kitchen',
  })
  await nextTick()
  assert.deepEqual(route.query, { group: 'kitchen' })
  assert.equal(view.view.value, 'grid')
  view.view.value = 'list'
  view.view.value = 'grid'
  await nextTick()
  assert.deepEqual(route.query, { group: 'kitchen' })
  assert.equal(view.itemLink('tea'), `${itemCataloguePath}/tea`)
  assert.equal(
    view.itemLink('tea', { view: 'details' }, '#item-price-choices'),
    `${itemCataloguePath}/tea?view=details#item-price-choices`
  )
  assert.deepEqual(itemCatalogueReturn({}), {
    path: itemCataloguePath,
    query: {},
  })
  f.scope.stop()
})

test('item editor links encode record identity without changing catalogue state', () => {
  const f = workspaceFixture()
  const { view } = catalogueView(f, { search: 'soup & tea' })
  const link = new URL(view.itemLink('food/tea #1'), 'http://localhost')
  assert.equal(link.pathname, `${itemCataloguePath}/food%2Ftea%20%231`)
  assert.equal(view.query.value, 'soup & tea')
  assert.equal(link.search, '')
  assert.equal(link.hash, '')
  f.scope.stop()
})

function flagshipFixture({ exists = true, rows = [], selectedRows } = {}) {
  const reads = []
  const documents = rows.map(({ key, ...data }) => ({
    id: key,
    ref: key,
    data: () => data,
    get: (field) => data[field],
  }))
  const collection = {
    select(...fields) {
      reads.push(fields)
      return { get: async () => ({ docs: documents }) }
    },
  }
  const root = {
    get: async () => ({
      exists,
      data: () => ({}),
    }),
    collection: () => collection,
  }
  const db = {
    collection: () => ({ doc: () => root }),
    getAll: async (id, projection) => {
      reads.push(projection.fieldMask)
      return selectedRows === undefined
        ? documents.filter((doc) => doc.id === id)
        : selectedRows.map(({ key, ...data }) => ({
            id: key,
            data: () => data,
          }))
    },
  }
  const read = load(
    'kitchen/server/items/flagship-projection.ts',
    'readKitchenFlagshipItem',
    {
      ItemStorage,
      normalizeLegacyItemKind,
      normalizeItem,
      readItemIdentity,
      readItemOffer: itemPricingHelpers.readItemOffer,
      getRuntimeFirestore: () => db,
      requireFirestoreDocumentId: (value) => {
        if (typeof value !== 'string' || !value.trim() || value.includes('/'))
          throw Object.assign(Error('Invalid id'), { statusCode: 400 })
        return value
      },
      createError: (value) => Object.assign(Error(value.statusMessage), value),
      readRecordString: (data, key) =>
        typeof data[key] === 'string' ? data[key].trim() : '',
    }
  )
  return { read, reads }
}

test('the flagship presentation uses the stored Item image and path ID independently of commercial fields', async () => {
  const rows = [
    {
      key: 'soup',
      id: 'obsolete-client-id',
      name: 'Soup',
      image: 'soup.webp',
      is_flagship: true,
    },
    { key: 'bread', name: 'Bread', price: 'old price' },
    { key: 'water', name: 'Water', item_kind: 'drink' },
  ]
  const { read } = flagshipFixture({ rows })
  const result = await read('venue', 'k')
  assert.equal(result.ready, true)
  assert.deepEqual(result.dish, {
    id: 'soup',
    name: 'Soup',
    slug: '',
    description: '',
    image: 'soup.webp',
    item_kind: undefined,
    is_flagship: true,
  })
  assert.equal(result.contentReadiness.eligibleItemCount, 2)
})

test('flagship reads validate paths and require the Kitchen root without historical management data', async () => {
  for (const [options, app, kitchen, code] of [
    [{}, 'venue', 'k/sub/entity', 400],
    [{}, 'invalid/app', 'k', 400],
    [{ exists: false }, 'venue', 'k', 404],
  ]) {
    const { read, reads } = flagshipFixture(options)
    await assert.rejects(read(app, kitchen), { statusCode: code })
    assert.deepEqual(reads, [])
  }
  for (const app of ['venue', 'misebox-app']) {
    const result = await flagshipFixture().read(app, 'k')
    assert.equal(result.issue, 'missing')
  }
  const empty = flagshipFixture()
  assert.equal((await empty.read('', 'k')).issue, 'missing')
  assert.equal((await empty.read('venue', '')).issue, 'missing')
  assert.deepEqual(empty.reads, [])
})

test('flagship readiness follows stored flags and stops before presentation reads for ambiguous choices', async () => {
  const archived = {
    key: 'old',
    name: 'Old flagship',
    is_flagship: false,
    status: 'archived',
  }
  const selected = {
    key: 'soup',
    name: 'Soup',
    is_flagship: true,
    image: 'soup.webp',
  }
  const current = flagshipFixture({ rows: [archived, selected] })
  const result = await current.read('venue', 'k')
  assert.equal(result.ready, true)
  assert.equal(result.contentReadiness.eligibleItemCount, 2)
  assert.deepEqual(current.reads, [
    ['name', 'item_kind', 'is_flagship'],
    ['name', 'slug', 'description', 'item_kind', 'image', 'is_flagship'],
  ])
  const ambiguous = flagshipFixture({
    rows: [selected, { ...selected, key: 'bread' }],
  })
  assert.equal((await ambiguous.read('venue', 'k')).issue, 'multiple')
  assert.equal(ambiguous.reads.length, 1)
  const imageMissing = flagshipFixture({ rows: [{ ...selected, image: '' }] })
  assert.equal((await imageMissing.read('venue', 'k')).issue, 'missing-image')
})

test('flagship presentation rechecks a selected record removed or unflagged during the read', async () => {
  const selected = {
    key: 'soup',
    name: 'Soup',
    is_flagship: true,
    image: 'soup.webp',
  }
  for (const selectedRows of [[], [{ ...selected, is_flagship: false }]]) {
    const { read } = flagshipFixture({ rows: [selected], selectedRows })
    const result = await read('venue', 'k')
    assert.equal(result.ready, false)
    assert.equal(result.issue, 'missing')
    assert.equal(result.dish, null)
    assert.equal(result.contentReadiness.uniqueFlagship, false)
  }
})

test('organisation fields keep historical Items readable without inventing group or Station links', () => {
  const old = normalizeItem({
    id: 'old',
    name: 'Old Item',
    spec: { station: 'Bar' },
  })
  assert.equal(old.item_kind, undefined)
  assert.deepEqual(old.group_ids, [])
  assert.equal(old.preparation_station_ids, undefined)
  assert.equal(Object.hasOwn(old, 'spec'), false)
  assert.equal(
    normalizeItem({ id: 'old', group_ids: ['renamed-group'] }).item_kind,
    undefined
  )
  const current = normalizeItem({
    id: 'new',
    item_kind: null,
    group_ids: ['merch'],
    preparation_station_ids: [],
  })
  assert.equal(current.item_kind, undefined)
  assert.deepEqual(current.group_ids, ['merch'])
  assert.deepEqual(current.preparation_station_ids, [])
  assert.equal(
    normalizeItem({ id: 'new', group_ids: [], preparation_station_ids: null })
      .preparation_station_ids,
    undefined
  )
})

test('Item detail context shares its live reader and requires the owning provider', async () => {
  const context = load(
    'kitchen/composables/items/useKitchenItemContext.ts',
    '({provideKitchenItemContext,useKitchenItemContext})',
    { provide, inject }
  )
  const owner = { dish: ref({ name: 'Soup' }), canWrite: ref(true) }
  const Child = {
    setup() {
      const detail = context.useKitchenItemContext()
      assert.equal(detail, owner)
      return () => h('p', detail.dish.value.name)
    },
  }
  const renderOwner = () =>
    renderToString(
      createSSRApp({
        setup() {
          assert.equal(context.provideKitchenItemContext(owner), owner)
          return () => h(Child)
        },
      })
    )
  assert.match(await renderOwner(), /Soup/)
  owner.dish.value = { name: 'Salad' }
  assert.match(await renderOwner(), /Salad/)
  const orphan = createSSRApp(Child)
  orphan.config.warnHandler = () => {}
  await assert.rejects(
    renderToString(orphan),
    /requires its Item context provider/
  )
})

test('Item placements return to the inline Menu builder or exact daily section', () => {
  const scope = effectScope()
  scope.run(() => {
    const props = reactive({
      menu: { id: 'menu', slug: 'lunch special', schedule: 'regular' },
      section: { id: 'main course', label: 'Main course' },
    })
    const owner = { itemId: ref('soup'), storageKitchenId: ref('kitchen') }
    const rows = ref([{ id: 'placement', dish_id: 'soup' }])
    const pending = ref(false),
      error = ref(null),
      emitted = []
    const state = load(
      'kitchen/components/Workspace/Menu/Items/Detail/Menus/Section.vue',
      '({destination,matches})',
      {
        computed,
        watch,
        defineProps: () => props,
        defineEmits: () => (_, result) => emitted.push(result),
        useKitchenItemRead: () => owner,
        useKitchenItemContext: () => owner,
        useMenuEntryCollection: () => ({ items: rows, pending, error }),
      }
    )
    assert.equal(
      state.destination.value,
      '/workspace/kitchen/menu/lunch%20special?section=main%20course'
    )
    assert.equal(emitted.at(-1), 'match')
    props.menu.schedule = 'daily'
    assert.equal(
      state.destination.value,
      '/workspace/kitchen/menu/lunch%20special/main%20course'
    )
    owner.itemId.value = 'other'
    assert.equal(state.matches.value.length, 0)
  })
  scope.stop()
})
