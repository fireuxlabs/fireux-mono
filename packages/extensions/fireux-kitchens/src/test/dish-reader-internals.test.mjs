import { readItemReferenceIds } from '../runtime/kitchen/utils/item-preparation.ts'
import { resolveHttpDocumentOutcome } from '../../../../core/fireux-core/src/runtime/utils/http-document-outcome.ts'
import {
  dishCataloguePath,
  readDishCatalogueQuery,
  dishCatalogueQuery,
  dishCatalogueReturn,
} from '../runtime/kitchen/utils/dish-catalogue-route.ts'
import { dishPricingHelpers } from './helpers/dish-pricing.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  compile,
  computed,
  createRenderer,
  createSSRApp,
  effectScope,
  h,
  inject,
  nextTick,
  onUnmounted,
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
const { dishCategories, dishCategoryLabel } = load(
  'kitchen/models/dish.model.ts',
  '({ dishCategories, dishCategoryLabel })',
  {}
)
const { DishStorage, normalizeDish, normalizeDishItemKind } = load(
  'kitchen/utils/dish.ts',
  '({ DishStorage, normalizeDish, normalizeDishItemKind })',
  { dishCategories, readItemReferenceIds, ...dishPricingHelpers }
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
    'kitchen/composables/useKitchenDishCollection.ts',
    'useKitchenDishCollection',
    {
      computed,
      unref,
      toValue,
      useFireUXConfig: () => ({ appId: 'app' }),
      useFirestoreRead: () => f.read,
      DishStorage,
      normalizeDish,
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
    'kitchen/composables/workspace/dishes/useKitchenWorkspaceDishes.ts',
    'useKitchenWorkspaceDishes',
    {
      computed,
      useKitchenWorkspace: () => workspace,
      useKitchenAccess: () => access,
      useAppSession: () => session,
      useKitchenDishCollection: lowerReader(f),
      DishStorage,
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
    'kitchen/composables/workspace/dishes/useKitchenDishesContext.ts',
    'createKitchenDishesWorkspace',
    {
      computed,
      ref,
      watch,
      watchEffect,
      useKitchenWorkspaceDishes: () => f.state,
      useWorkspacePageState: () => ({
        publish: (value) => published.push(value),
      }),
      defineWorkspaceCapabilityContext: (value) => value,
    }
  )
  const context = f.scope.run(() => create(kind))
  return { context, published }
}

test('Dish collection binds only exact ready Kitchen and clears retained rows immediately across owner changes', () => {
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
test('Dish source and owner failures beat loading; inactive owner clears old errors and authority', () => {
  const f = workspaceFixture()
  f.raw.pending.value = true
  assert.equal(f.state.outcome.value, 'pending')
  assert.deepEqual(f.state.dishes.value, [])
  f.raw.error.value = new Error('Dishes denied')
  assert.equal(f.state.outcome.value, 'error')
  assert.equal(f.state.pending.value, false)
  assert.equal(f.state.error.value.message, 'Dishes denied')
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
    const html = await render('kitchen/components/Menu/Items/Index.vue', {
      storageKitchenId: f.state.storageKitchenId,
      outcome: f.state.outcome,
      catalogue,
    })
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
test('Dish lower reader honours deliberately inactive parent path', () => {
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
test('Food and Drinks partition one live Dish collection; failures disable Create instead of publishing an empty ready capability', async () => {
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
  assert.equal(drinks.context.selectedDishId.value, 'tea')
  f.workspace.id.value = 'other'
  assert.equal(drinks.context.selectedDishId.value, '')
  assert.deepEqual(drinks.context.dishes.value, [])
  f.scope.stop()
})
test('Dish record route stays reactive across both kinds while catalogues retain kind filtering and read outcomes', () => {
  const f = workspaceFixture(),
    { context } = kindContext(f, 'food'),
    id = ref('soup'),
    access = { ...f.access, outcome: ref('ready') }
  const use = load(
    'kitchen/composables/dish/useKitchenDishDetail.ts',
    'useKitchenDishDetail',
    {
      computed,
      toValue,
      DishStorage,
      normalizeDish,
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
  assert.equal(record.dish.value.name, 'Soup')
  assert.equal(
    context.dishes.value.some((dish) => dish.id === 'tea'),
    false
  )
  id.value = 'tea'
  f.settle(f.raw.value)
  assert.equal(record.dish.value.name, 'Tea')
  id.value = 'missing'
  f.settle(f.raw.value)
  assert.equal(record.outcome.value, 'empty')
  assert.equal(record.dish.value, null)
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
function components(app, spec) {
  const empty = [
    'FireDiagnosticsDebugPanel',
    'UIcon',
    'UAvatar',
    'UBadge',
    'KitchenMenuItemsCollection',
    'KitchenMenuItemsCardsCell',
    'UPagination',
    'USelect',
    'UCheckbox',
    'KitchenMenuItemsCategories',
    'WorkspaceKitchenAICapability',
    'KitchenMenuItemsEdit',
    'KitchenMenuItemsPreparationStations',
    'KitchenMenuItemsPhoto',
    'KitchenMenuItemsGroups',
    'KitchenMenuItemsCollectionAssignGroup',
    'KitchenMenuItemsPricing',
    'KitchenMenuItemsDelete',
    'DishPreparation',
    'DishMenus',
    'DishMenu',
    'DishMenuSection',
    'FireCopyError',
    'FireContextRecord',
    'KitchenMenuItemsCreate',
  ]
  for (const name of empty)
    app.component(name, {
      props: ['message'],
      setup: (props) => () => (props.message ? h('p', props.message) : null),
    })
  app.component(
    'DishSpec',
    spec || { render: () => h('p', 'Specification editor') }
  )
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
  for (const name of ['UAlert', 'FireStateCard'])
    app.component(name, {
      props: ['title'],
      setup: (props) => () => h('p', props.title),
    })
  for (const name of [
    'WorkspaceKitchenCollectionHeader',
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
  title: 'Dishes',
  singular: 'dish',
  plural: 'dishes',
  path: '/workspace/kitchen/menu/items',
  createPath: '/workspace/kitchen/menu/items?create=food',
  icon: 'i-lucide-utensils',
}
function readView(overrides = {}) {
  return {
    catalogue,
    outcome: 'ready',
    error: null,
    pending: false,
    focus: { name: 'Mine' },
    readOnly: false,
    visibleDishes: [],
    dishes: [],
    pageDishes: [],
    query: '',
    selected: [],
    moreActions: [],
    view: 'list',
    category: 'all',
    categoryFilters: [{ value: 'all', label: 'All dishes', count: 0 }],
    filters: [{ value: 'all', label: 'All', count: 0 }],
    filter: 'all',
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
    dish: { id: 'soup', name: 'Soup' },
    pending: false,
    error: null,
    canWrite: true,
    selectedKitchen: { id: 'mine', name: 'Mine' },
    kitchenId: 'mine',
    storageKitchenId: 'mine',
    dishId: 'soup',
    catalogueReturn: catalogue.path,
    menuReturn: '',
    manage: false,
    route: { query: {} },
    views: [],
    view: 'preparation',
    dishCategoryLabel,
    removeDish: () => {},
    ...overrides,
  }
}
test('actual Dish index distinguishes Kitchen loading, failure, missing and inactive selection', async () => {
  for (const [outcome, expected] of [
    ['pending', 'Loading Kitchen'],
    ['error', 'Kitchen unavailable'],
    ['empty', 'Kitchen not found'],
    ['idle', 'Select a kitchen'],
  ])
    assert.match(
      await render('kitchen/components/Menu/Items/Index.vue', {
        storageKitchenId: '',
        outcome,
        catalogue,
      }),
      new RegExp(expected)
    )
})
async function renderCatalogue(state) {
  return (
    await Promise.all(
      ['Controls', 'Results'].map((child) =>
        render(`kitchen/components/Menu/Items/Collection/${child}.vue`, state)
      )
    )
  ).join('')
}

test('actual Dish collection hides premature counts, categories, filters and Create during loading/failure', async () => {
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
      /Count:|Dish categories|Filter catalogue|No dishes yet|Add dish/
    )
  }
  const html = await renderCatalogue(readView({ outcome: 'empty' }))
  assert.match(html, /Count: 0/)
  assert.match(html, /No dishes yet/)
  assert.match(html, /Add dish/)
})
test('actual Dish record error does not render not-found, old read header or editable management', async () => {
  const html = await render(
    'kitchen/components/Menu/Items/Detail/Index.vue',
    recordView({ dish: null, outcome: 'error', error: new Error('Failed') })
  )
  assert.match(html, /dish unavailable/)
  assert.doesNotMatch(html, /not found|Item actions|Soup/)
  const empty = await render(
    'kitchen/components/Menu/Items/Detail/Index.vue',
    recordView({ dish: null, outcome: 'empty' })
  )
  assert.match(empty, /dish not found/)
  assert.doesNotMatch(empty, /Specification editor/)
})
test('actual Dish owner retains mounted Spec through child refresh/failure and releases it on owner invalidation', async () => {
  let mounted = 0,
    unmounted = 0
  const make = (type) => ({ type, children: [], parent: null })
  const renderer = createRenderer({
    createElement: make,
    createText: (text) => ({ ...make('text'), text }),
    createComment: (text) => ({ ...make('comment'), text }),
    setText: (node, text) => {
      node.text = text
    },
    setElementText: (node, text) => {
      node.text = text
    },
    patchProp: () => {},
    insert: (node, parent, anchor) => {
      if (node.parent)
        node.parent.children.splice(node.parent.children.indexOf(node), 1)
      node.parent = parent
      const i = anchor ? parent.children.indexOf(anchor) : -1
      parent.children.splice(i < 0 ? parent.children.length : i, 0, node)
    },
    remove: (node) => {
      if (node.parent)
        node.parent.children.splice(node.parent.children.indexOf(node), 1)
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) => {
      const s = node.parent?.children || []
      return s[s.indexOf(node) + 1] || null
    },
  })
  const state = reactive(recordView()),
    warnings = [],
    app = renderer.createApp({
      setup: () => state,
      render: template('kitchen/components/Menu/Items/Detail/Index.vue'),
    })
  app.config.warnHandler = (warning) => warnings.push(warning)
  components(app, {
    setup() {
      mounted++
      onUnmounted(() => unmounted++)
      return () => h('p', 'Local Spec draft')
    },
  })
  app.mount(make('root'))
  assert.equal(mounted, 1)
  state.dish = null
  state.outcome = 'pending'
  state.pending = true
  await nextTick()
  assert.equal(mounted, 1)
  assert.equal(unmounted, 0)
  state.outcome = 'error'
  state.pending = false
  state.error = new Error('Failed')
  await nextTick()
  assert.equal(unmounted, 0)
  state.storageKitchenId = ''
  state.outcome = 'pending'
  await nextTick()
  assert.equal(unmounted, 1)
  app.unmount()
  assert.deepEqual(warnings, [])
})
test('Dish linked read perspectives bind exact ready storage owner instead of remembered Kitchen selection', () => {
  const owner = {
    kitchenId: ref('remembered'),
    storageKitchenId: ref('ready'),
    dishId: ref('soup'),
    dish: ref(null),
    databaseId: ref('misebox'),
    rootCollection: ref('kitchens'),
    selectedKitchen: ref(null),
  }
  const paths = ['Preparation', 'Menus', 'Menu', 'MenuSection']
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
      load(`kitchen/components/Menu/Items/${view}.vue`, '({})', {
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
        useKitchenItemDetail: () => owner,
        useKitchenPrepItems: reader,
        useKitchenMenuCollection: reader,
        useMenuSectionCollection: reader,
        useMenuSectionItemCollection: reader,
        useMenuRecordNavigation: () => ({ rememberView: () => {} }),
      })
    )
    assert.equal(toValue(target), 'ready', view)
    owner.storageKitchenId.value = ''
    assert.equal(toValue(target), '', view)
    owner.storageKitchenId.value = 'ready'
    scope.stop()
  }
})
test('actual Dish Preparation and Menu perspectives render failed linked reads without false empty states', async () => {
  const prep = await render('kitchen/components/Menu/Items/Preparation.vue', {
    dish: { spec: { portion: 1 } },
    error: new Error('Denied'),
    pending: true,
    rows: [],
    groups: [],
  })
  assert.match(prep, /Prep items unavailable/)
  assert.doesNotMatch(prep, /No mise en place linked|Loading preparations/)
  const menus = await render('kitchen/components/Menu/Items/Menus.vue', {
    error: new Error('Denied'),
    pending: true,
    activeMenus: [],
    kitchenId: 'mine',
  })
  assert.match(menus, /Menus unavailable/)
  assert.doesNotMatch(menus, /No menus in this kitchen|Loading menus/)
})

test('Dish projection preserves canonical pricing and excludes the removed deal flag', () => {
  const input = {
    id: 'margherita',
    price: 13,
    price_options: [{ label: 'Large', quantity: 0, unit: '', price: 18 }],
    add_ons: [{ id: 'cheese', label: 'Cheese', price: 2 }],
    is_deal: true,
  }
  const dish = normalizeDish(input)
  assert.equal(dish.price, 13)
  assert.deepEqual(dish.price_options, input.price_options)
  assert.deepEqual(dish.add_ons, input.add_ons)
  assert.equal(Object.hasOwn(dish, 'is_deal'), false)
  assert.equal(Object.hasOwn(normalizeDish({ id: 'new-dish' }), 'price'), false)
  assert.equal(normalizeDish({ id: 'free-dish', price: 0 }).price, 0)
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
  assert.equal(context.selectedDishId.value, '')
  f.scope.stop()
})

test('combined catalogue filters food and drinks and opens each in its correct editor', async () => {
  const f = workspaceFixture()
  const { context } = kindContext(f, 'all')
  const view = f.scope.run(() =>
    load(
      'kitchen/composables/workspace/dishes/useDishCatalogue.ts',
      'useDishCatalogue()',
      {
        useRoute: () => ({ query: {} }),
        useRouter: () => ({ replace: async () => {} }),
        dishCataloguePath,
        readDishCatalogueQuery,
        dishCatalogueQuery,
        useKitchenDishesContext: () => context,
        computed,
        ref,
        watch,
        dishCategories,
        dishCategoryLabel,
        buildMissingDishImageSuggestions: () => [],
        buildMissingDrinkImageSuggestions: () => [],
      }
    )
  )
  assert.deepEqual(
    view.visibleDishes.value.map((item) => item.id),
    ['soup', 'tea']
  )
  view.kind.value = 'drink'
  await nextTick()
  assert.deepEqual(
    view.visibleDishes.value.map((item) => item.id),
    ['tea']
  )
  assert.match(
    view.dishLink('tea'),
    /^\/workspace\/kitchen\/menu\/items\/tea\?/
  )
  view.kind.value = 'food'
  await nextTick()
  assert.deepEqual(
    view.visibleDishes.value.map((item) => item.id),
    ['soup']
  )
  assert.match(
    view.dishLink('soup'),
    /^\/workspace\/kitchen\/menu\/items\/soup\?/
  )
  view.clearFilters()
  view.query.value = 'tea'
  assert.deepEqual(
    view.visibleDishes.value.map((item) => item.id),
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
      'kitchen/composables/workspace/dishes/useDishCatalogue.ts',
      'useDishCatalogue()',
      {
        useRoute: () => route,
        useRouter: () => ({
          replace: async (destination) => {
            destinations.push(destination)
            route.query = destination.query
          },
        }),
        useKitchenDishesContext: () => context,
        computed,
        ref,
        watch,
        dishCategories,
        dishCategoryLabel,
        dishCataloguePath,
        readDishCatalogueQuery,
        dishCatalogueQuery,
        buildMissingDishImageSuggestions: () => [],
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

test('Food & drinks item round trip restores kind, search, filters, layout and page', async () => {
  const f = workspaceFixture()
  f.settle(catalogueRows())
  const { view, route } = catalogueView(f)
  view.kind.value = 'drink'
  view.query.value = 'Cola'
  view.filter.value = 'image'
  view.view.value = 'grid'
  await nextTick()
  view.page.value = 2
  await nextTick()
  assert.equal(route.query.page, '2')
  assert.equal(route.query.kind, 'drink')
  const link = new URL(
    view.dishLink(view.pageDishes.value[0].id),
    'http://localhost'
  )
  assert.equal(
    link.pathname,
    `${dishCataloguePath}/${view.pageDishes.value[0].id}`
  )
  const returnTo = dishCatalogueReturn(Object.fromEntries(link.searchParams))
  assert.equal(returnTo.path, '/workspace/kitchen/menu/items')
  assert.deepEqual(returnTo.query, route.query)
  const restored = catalogueView(f, returnTo.query).view
  assert.equal(restored.kind.value, 'drink')
  assert.equal(restored.query.value, 'Cola')
  assert.equal(restored.filter.value, 'image')
  assert.equal(restored.view.value, 'grid')
  assert.equal(restored.page.value, 2)
  assert.equal(restored.pageDishes.value[0].id, view.pageDishes.value[0].id)
  assert.equal(f.state.dishes.value[0].price, 4)
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

test('catalogue return keeps food categories and accepts only catalogue state', () => {
  assert.deepEqual(
    dishCatalogueReturn({
      kind: 'food',
      category: 'mains',
      search: 'pizza',
      filter: 'description',
      layout: 'list',
      page: '2',
      view: 'pricing',
      menu: 'other',
    }).query,
    {
      kind: 'food',
      category: 'mains',
      search: 'pizza',
      filter: 'description',
      layout: 'list',
      page: '2',
    }
  )
  for (const page of ['0', '-1', 'NaN', '1.5', ['2']])
    assert.equal(readDishCatalogueQuery({ page }).page, 1)
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
  const { context } = kindContext(f, 'all')
  const route = reactive({ query: { create: 'drink', search: 'cola' } })
  const state = f.scope.run(() =>
    load(
      'kitchen/components/Menu/Items/Collection/Dialogs.vue',
      '({ createKind, aiOpen, openCreate, openAI, closeCreate })',
      {
        computed,
        ref,
        watch,
        useKitchenDishesContext: () => context,
        useRoute: () => route,
        useRouter: () => ({
          replace: async ({ query }) => {
            route.query = query
          },
        }),
        buildMissingDishImageSuggestions: () => [],
        buildMissingDrinkImageSuggestions: () => [],
        defineExpose: () => {},
      }
    )
  )
  assert.equal(state.createKind.value, 'drink')
  assert.equal(route.query.create, undefined)
  assert.equal(route.query.search, 'cola')
  state.closeCreate(false)
  assert.equal(state.createKind.value, null)
  state.openCreate('food')
  assert.equal(state.createKind.value, 'food')
  state.openAI()
  f.workspace.id.value = 'other'
  await nextTick()
  assert.equal(state.createKind.value, null)
  assert.equal(state.aiOpen.value, false)
  state.openCreate('drink')
  assert.equal(state.createKind.value, null)
  f.scope.stop()
})

test('item editor links encode record identity without changing catalogue state', () => {
  const f = workspaceFixture()
  const { view } = catalogueView(f, { search: 'soup & tea' })
  const link = new URL(view.dishLink('food/tea #1'), 'http://localhost')
  assert.equal(link.pathname, `${dishCataloguePath}/food%2Ftea%20%231`)
  assert.equal(link.searchParams.get('search'), 'soup & tea')
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
    'kitchen/server/dishes/flagship-projection.ts',
    'readKitchenFlagshipDish',
    {
      DishStorage,
      normalizeDishItemKind,
      normalizeDish,
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

test('the flagship presentation uses the stored Dish image and path ID independently of commercial fields', async () => {
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
    item_kind: 'food',
    is_flagship: true,
  })
  assert.equal(result.contentReadiness.eligibleDishCount, 2)
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
  assert.equal(result.contentReadiness.eligibleDishCount, 2)
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
  const old = normalizeDish({
    id: 'old',
    name: 'Old Item',
    spec: { station: 'Bar' },
  })
  assert.equal(old.item_kind, 'food')
  assert.deepEqual(old.group_ids, [])
  assert.equal(old.preparation_station_ids, undefined)
  assert.equal(old.spec.station, 'Bar')
  assert.equal(
    normalizeDish({ id: 'old', group_ids: ['renamed-group'] }).item_kind,
    'food'
  )
  const current = normalizeDish({
    id: 'new',
    item_kind: null,
    group_ids: ['merch'],
    preparation_station_ids: [],
  })
  assert.equal(current.item_kind, undefined)
  assert.deepEqual(current.group_ids, ['merch'])
  assert.deepEqual(current.preparation_station_ids, [])
  assert.equal(
    normalizeDish({ id: 'new', group_ids: [], preparation_station_ids: null })
      .preparation_station_ids,
    undefined
  )
})

test('Item detail context shares its live reader and requires the owning provider', async () => {
  const context = load(
    'kitchen/composables/dish/useKitchenItemDetailContext.ts',
    '({provideKitchenItemDetail,useKitchenItemDetail})',
    { provide, inject }
  )
  const owner = { dish: ref({ name: 'Soup' }), canWrite: ref(true) }
  const Child = {
    setup() {
      const detail = context.useKitchenItemDetail()
      assert.equal(detail, owner)
      return () => h('p', detail.dish.value.name)
    },
  }
  const renderOwner = () =>
    renderToString(
      createSSRApp({
        setup() {
          assert.equal(context.provideKitchenItemDetail(owner), owner)
          return () => h(Child)
        },
      })
    )
  assert.match(await renderOwner(), /Soup/)
  owner.dish.value = { name: 'Salad' }
  assert.match(await renderOwner(), /Salad/)
  const orphan = createSSRApp(Child)
  orphan.config.warnHandler = () => {}
  await assert.rejects(renderToString(orphan), /requires its detail provider/)
})

test('Item placements return to the inline Menu builder or exact daily section', () => {
  const scope = effectScope()
  scope.run(() => {
    const props = reactive({
      menu: { id: 'menu', slug: 'lunch special', schedule: 'regular' },
      section: { id: 'main course', label: 'Main course' },
    })
    const owner = { dishId: ref('soup'), storageKitchenId: ref('kitchen') }
    const rows = ref([{ id: 'placement', dish_id: 'soup' }])
    const pending = ref(false),
      error = ref(null),
      emitted = []
    const state = load(
      'kitchen/components/Menu/Items/MenuSection.vue',
      '({destination,matches})',
      {
        computed,
        watch,
        defineProps: () => props,
        defineEmits: () => (_, result) => emitted.push(result),
        useKitchenItemDetail: () => owner,
        useMenuSectionItemCollection: () => ({ items: rows, pending, error }),
      }
    )
    assert.equal(
      state.destination.value,
      '/workspace/kitchen/menu/menus/lunch%20special?section=main%20course'
    )
    assert.equal(emitted.at(-1), 'match')
    props.menu.schedule = 'daily'
    assert.equal(
      state.destination.value,
      '/workspace/kitchen/menu/menus/lunch%20special/main%20course'
    )
    owner.dishId.value = 'other'
    assert.equal(state.matches.value.length, 0)
  })
  scope.stop()
})
