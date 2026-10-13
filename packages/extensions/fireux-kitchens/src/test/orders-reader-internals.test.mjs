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
  onScopeDispose,
  reactive,
  ref,
  shallowRef,
  toValue,
  unref,
  watch,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'
const runtime = new URL('../runtime/', import.meta.url)
function load(path, result, deps) {
  let source = readFileSync(new URL(path, runtime), 'utf8')
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export(?: type)? \*[^\n]+\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.server', 'false')
    .replaceAll('import.meta.dev', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useCommandScope = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
const enhanceFirestoreRead = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreRead.ts',
  'enhanceFirestoreRead',
  { computed, ref, shallowRef, unref, watch, resolveReadOutcome }
)
const useFirestoreCollectionState = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCollection.ts',
  'useFirestoreCollectionState',
  { computed, resolveReadOutcome, toValue }
)
const useCollectionById = load(
  '../../../../core/fireux-core/src/runtime/composables/shared/useCollectionById.ts',
  'useCollectionById',
  { computed, unref }
)
const useKitchenWorkspaceReadPage = load(
  'kitchen/composables/workspace/useKitchenWorkspaceReadPage.ts',
  'useKitchenWorkspaceReadPage',
  { computed, unref }
)
const paths = load(
  'kitchen/utils/kitchen-collection-path.ts',
  '({normalizeString, resolveKitchenCollectionBasePath, resolveKitchenChildCollectionPath})',
  {}
)
const KitchenOrderStorage = load(
  'kitchen/utils/order.ts',
  'KitchenOrderStorage',
  {}
)
const deriveKitchenOrderBoardStage = load(
  'kitchen/models/order-lifecycle.model.ts',
  'deriveKitchenOrderBoardStage',
  {}
)
const fixtureOrder = (id, status = 'pending_acceptance') => ({
  id,
  kitchen_id: 'mine',
  order_number: id,
  order_type: 'collection',
  status,
  created: { at: '2026-10-09T12:00:00Z' },
  updated: { at: '2026-10-09T12:00:00Z' },
  payment: {},
  items: [{ id: 'soup', label: 'Original soup', quantity: 1, unit_price: 12 }],
})
function workspaceFixture() {
  const scope = effectScope(),
    raw = ref([
      fixtureOrder('incoming'),
      fixtureOrder('queue', 'accepted'),
      fixtureOrder('pass', 'ready'),
    ])
  Object.assign(raw, {
    data: raw,
    pending: ref(false),
    error: ref(undefined),
    promise: shallowRef(Promise.resolve()),
    stop: () => {},
  })
  let path
  const read = {
    firestoreFetchCollection: (p) => {
      path = p
      return enhanceFirestoreRead(raw, {
        active: computed(() => Boolean(toValue(p))),
        source: p,
        kind: 'collection',
      })
    },
  }
  const config = reactive({ appId: 'app' }),
    workspace = {
      id: ref('mine'),
      data: ref({ id: 'mine', name: 'Mine' }),
      outcome: ref('ready'),
      accountReady: ref(true),
      hasAccount: ref(true),
    },
    session = { error: ref(null) },
    access = { ids: ref(['mine']), error: ref(null) }
  const useKitchenChildCollection = load(
    'kitchen/composables/useKitchenChildCollection.ts',
    'useKitchenChildCollection',
    {
      computed,
      unref,
      ...paths,
      useFireUXConfig: () => config,
      useFirestoreRead: () => read,
      useFirestoreCollectionState,
    }
  )
  const useKitchenOrderFetch = load(
    'kitchen/composables/orders/useKitchenOrderFetch.ts',
    'useKitchenOrderFetch',
    { useKitchenChildCollection, useCollectionById, KitchenOrderStorage }
  )
  const calls = []
  const use = load(
    'kitchen/composables/workspace/orders/useKitchenWorkspaceOrders.ts',
    'useKitchenWorkspaceOrders',
    {
      computed,
      useKitchenOrderFetch,
      KitchenOrderStorage,
      deriveKitchenOrderBoardStage,
      useKitchenWorkspace: () => workspace,
      useAppSession: () => session,
      useKitchenAccess: () => access,
      useFireUXConfig: () => config,
      readRuntimeFirestoreDatabaseId: () => 'misebox',
      useKitchenWorkspaceReadPage,
      useKitchenOrderTransition: () => ({
        captureIntent: () => () => true,
        error: ref(''),
        pendingCount: ref(0),
        isTransitioning: () => false,
        transitionKitchenOrder: (...args) => calls.push(args),
      }),
      useKitchenOrderNumbering: () => ({
        resetNumbering: () => {},
        error: ref(''),
        pending: ref(false),
      }),
    }
  )
  const state = scope.run(use)
  return {
    scope,
    raw,
    config,
    workspace,
    session,
    access,
    state,
    calls,
    get path() {
      return toValue(path)
    },
    settle(rows) {
      raw.value = rows
      raw.pending.value = false
      raw.promise.value = Promise.resolve()
    },
  }
}
test('Orders binds exact ready Kitchen and preserves canonical board partitions while hiding obsolete rows', async () => {
  const f = workspaceFixture()
  assert.equal(f.path, 'kitchens/mine/orders')
  assert.equal(f.state.incomingOrders.value[0].id, 'incoming')
  assert.equal(f.state.queueOrders.value[0].id, 'queue')
  assert.equal(f.state.passOrders.value[0].id, 'pass')
  f.workspace.data.value = { id: 'wrong' }
  assert.equal(f.path, '')
  assert.equal(f.state.outcome.value, 'pending')
  assert.equal(f.state.pending.value, true)
  assert.deepEqual(f.state.orders.value, [])
  assert.equal(f.state.canWrite.value, false)
  f.workspace.data.value = { id: 'mine' }
  f.settle([fixtureOrder('fresh')])
  assert.equal(f.state.incomingOrders.value[0].id, 'fresh')
  f.access.ids.value = []
  assert.equal(f.state.canWrite.value, false)
  assert.equal(f.state.readOnly.value, true)
  await assert.rejects(f.state.acceptOrder('fresh'), /read-only/)
  assert.deepEqual(f.calls, [])
  f.scope.stop()
})
test('Orders parent loading/error propagates without saved selection; inactive masks obsolete child failure', () => {
  const f = workspaceFixture()
  f.workspace.id.value = ''
  f.workspace.data.value = null
  f.workspace.outcome.value = 'pending'
  assert.equal(f.state.outcome.value, 'pending')
  assert.equal(f.state.pending.value, true)
  f.workspace.outcome.value = 'error'
  f.access.error.value = new Error('Kitchen access denied')
  assert.equal(f.state.readError.value.message, 'Kitchen access denied')
  assert.equal(f.state.pending.value, false)
  f.workspace.outcome.value = 'idle'
  f.raw.error.value = new Error('Obsolete orders failure')
  assert.equal(f.state.readError.value, undefined)
  assert.equal(f.state.outcome.value, 'idle')
  assert.deepEqual(f.state.ticketOrders.value, [])
  f.scope.stop()
})
test('Orders source loading/error/empty use actual Core outcomes and never expose retained board rows', () => {
  const f = workspaceFixture()
  f.raw.pending.value = true
  assert.equal(f.state.pending.value, true)
  assert.deepEqual(f.state.incomingOrders.value, [])
  f.raw.error.value = new Error('Orders denied')
  assert.equal(f.state.outcome.value, 'error')
  assert.equal(f.state.pending.value, false)
  assert.equal(f.state.readError.value.message, 'Orders denied')
  f.settle([])
  assert.equal(f.state.outcome.value, 'empty')
  assert.equal(f.state.canWrite.value, true)
  assert.deepEqual(f.state.orders.value, [])
  f.scope.stop()
})
function template(path) {
  const source = readFileSync(new URL(path, runtime), 'utf8'),
    body = source.slice(
      source.indexOf('<template>') + 10,
      source.lastIndexOf('</template>')
    )
  return {
    body,
    render: compile(body, {
      onWarn: (e) => {
        throw e
      },
      onError: (e) => {
        throw e
      },
    }),
  }
}
function register(app, body, overrides = {}) {
  const names = new Set(
    [...body.matchAll(/<([A-Z][A-Za-z0-9]+)/g)].map((m) => m[1])
  )
  for (const name of names) {
    if (name in overrides) {
      app.component(name, overrides[name])
      continue
    }
    app.component(name, {
      props: ['title', 'description', 'label', 'message'],
      setup:
        (props, { slots }) =>
        () =>
          h('div', { 'data-component': name }, [
            props.title,
            props.description,
            props.label,
            props.message,
            slots.header?.(),
            slots.body?.(),
            slots.default?.(),
            slots.actions?.(),
          ]),
    })
  }
}
async function render(path, state, overrides = {}, nestedTemplates = []) {
  const t = template(path),
    warnings = [],
    app = createSSRApp({ setup: () => state, render: t.render })
  app.config.warnHandler = (warning) => warnings.push(warning)
  register(app, [t.body, ...nestedTemplates].join('\n'), overrides)
  const html = await renderToString(app)
  assert.deepEqual(warnings, [])
  return html
}
test('actual Orders Page mounts owner-aware board even with no saved Kitchen, so failure is visible', async () => {
  const f = workspaceFixture(),
    board = template('kitchen/components/Workspace/Orders/Index.vue')
  f.workspace.id.value = ''
  f.workspace.data.value = null
  f.workspace.outcome.value = 'error'
  f.access.error.value = new Error('Denied')
  const boardComponent = {
    props: ['view'],
    setup: () => ({
      ...f.state,
      isDev: false,
      view: 'all',
      filters: { type: 'all', timing: 'all' },
      views: [],
      types: [],
      timings: [],
      visibleOrderCount: 0,
      fullscreen: false,
      fullscreenPending: false,
      toggleFullscreen() {},
    }),
    render: board.render,
  }
  const html = await render(
    'kitchen/components/Workspace/Orders/Page.vue',
    {
      title: 'All orders',
      view: 'all',
      hasKitchen: false,
      workspaceEntryPath: '/workspace/kitchen',
    },
    { WorkspaceKitchenOrders: boardComponent },
    [board.body]
  )
  assert.match(html, /Orders could not be loaded/)
  assert.doesNotMatch(
    html,
    /Choose a kitchen to see orders|Select an available Kitchen to view orders/
  )
  f.scope.stop()
})
function preOrderView(overrides = {}) {
  return {
    transitionError: '',
    outcome: 'empty',
    pending: false,
    storageKitchenId: 'mine',
    preOrders: [],
    currentTimeMs: 0,
    acceptingOrderId: '',
    rejectingOrderId: '',
    waitingLabel: '0 waiting',
    normalizeId: String,
    canInteract: () => false,
    confirmPreOrder: () => {},
    sendBackPreOrder: () => {},
    ...overrides,
  }
}
test('actual Pre-orders distinguishes failure/loading/inactive from settled empty and hides premature counts', async () => {
  for (const [outcome, expected] of [
    ['error', 'Pre-orders unavailable'],
    ['pending', 'Loading incoming pre-orders'],
  ]) {
    const html = await render(
      'kitchen/components/Workspace/Orders/PreOrders.vue',
      preOrderView({ outcome, pending: outcome === 'pending' })
    )
    assert.match(html, new RegExp(expected))
    assert.doesNotMatch(
      html,
      /No pre-orders waiting|0 waiting|Awaiting confirmation/
    )
  }
  const inactive = await render(
    'kitchen/components/Workspace/Orders/PreOrders.vue',
    preOrderView({ outcome: 'idle', storageKitchenId: '' })
  )
  assert.match(inactive, /Select an available Kitchen/)
  assert.doesNotMatch(inactive, /No pre-orders waiting/)
  assert.match(
    await render(
      'kitchen/components/Workspace/Orders/PreOrders.vue',
      preOrderView()
    ),
    /No pre-orders waiting/
  )
})
function actorFixture() {
  const scope = effectScope(),
    currentUser = ref({ uid: 'actor' }),
    config = reactive({ appId: 'app' }),
    appUser = ref({ created: { at: 1 } }),
    access = { ids: ref(['mine']), outcome: ref('ready') },
    kitchenId = ref('mine')
  const captureIntent = scope.run(() =>
    useCommandScope([
      () => currentUser.value?.uid,
      () => config.appId,
      kitchenId,
      () => JSON.stringify(appUser.value),
      () => JSON.stringify(access.ids.value),
      access.outcome,
    ])
  )
  return {
    scope,
    currentUser,
    config,
    appUser,
    access,
    kitchenId,
    captureIntent,
    deps: {
      computed,
      ref,
      watch,
      defineOptions: () => {},
      defineProps: () => ({}),
      withDefaults: (props, defaults) => ({ ...defaults, ...props }),
      onMounted: () => {},
      onBeforeUnmount: () => {},
      useAuth: () => ({ currentUser }),
      useFireUXConfig: () => config,
      useUserSession: () => ({ appUser }),
      useKitchenAccess: () => access,
    },
  }
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
test('Pre-order pending UI resets on association roundtrip and old completion cannot release a newer same-order request', async () => {
  const f = actorFixture(),
    first = deferred(),
    second = deferred(),
    calls = [],
    source = {
      captureIntent: f.captureIntent,
      kitchenId: f.kitchenId,
      storageKitchenId: f.kitchenId,
      outcome: ref('ready'),
      canWrite: ref(true),
      readOnly: ref(false),
      pending: ref(false),
      incomingOrders: ref([
        { ...fixtureOrder('pre'), order_type: 'pre_order' },
      ]),
      isOrderTransitioning: () => false,
      transitionError: ref(''),
      acceptOrder: (id) => {
        calls.push(id)
        return calls.length === 1 ? first.promise : second.promise
      },
      rejectOrder: async () => {},
    }
  const state = f.scope.run(() =>
    load(
      'kitchen/components/Workspace/Orders/PreOrders.vue',
      '({confirmPreOrder, acceptingOrderId})',
      {
        ...f.deps,
        useKitchenOrdersContext: () => ({ ...source, canOperate: ref(true) }),
      }
    )
  )
  const old = state.confirmPreOrder({ id: 'pre', estimatedMinutes: null })
  f.access.outcome.value = 'pending'
  f.access.outcome.value = 'ready'
  assert.equal(state.acceptingOrderId.value, '')
  const newer = state.confirmPreOrder({ id: 'pre', estimatedMinutes: null })
  assert.equal(calls.length, 2)
  first.resolve()
  await old
  assert.equal(state.acceptingOrderId.value, 'pre')
  second.resolve()
  await newer
  assert.equal(state.acceptingOrderId.value, '')
  f.scope.stop()
})
test('Pass selection clears unavailable rows synchronously across same-tick board/owner roundtrip', () => {
  const scope = effectScope(),
    rows = ref([fixtureOrder('pass', 'ready')]),
    canOperate = ref(true)
  const use = load(
    'kitchen/composables/workspace/orders/useKitchenOrderPassSelection.ts',
    'useKitchenOrderPassSelection',
    { computed, ref, toValue, watch, useCommandScope }
  )
  const state = scope.run(() =>
    use({
      orders: rows,
      canOperate,
      isTransitioning: () => false,
      completeOrder: async () => {},
    })
  )
  state.toggle('pass')
  assert.equal(state.canSend.value, true)
  rows.value = []
  rows.value = [fixtureOrder('pass', 'ready')]
  assert.equal(state.isSelected('pass'), false)
  assert.equal(state.canSend.value, false)
  scope.stop()
})
function incomingFixture(accept) {
  const f = actorFixture(),
    events = [],
    orders = ref([fixtureOrder('one'), fixtureOrder('two')]),
    surfaceScope = f.scope.run(() => effectScope())
  const state = surfaceScope.run(() =>
    load(
      'kitchen/components/Workspace/Orders/Incoming.vue',
      '({acceptIncomingOrder,acceptIncomingOrders,acceptingOrderId,printWarnings})',
      {
        ...f.deps,
        useCommandScope,
        useKitchenOrdersContext: () => ({
          captureIntent: f.captureIntent,
          kitchenId: f.kitchenId,
          incomingOrders: orders,
          canOperate: ref(true),
          canInteract: () => true,
          normalizeId: String,
          acceptOrder: accept,
          rejectOrder: async () => {},
        }),
        openKitchenOrderPrintWindow: () => ({
          close: () => events.push('close'),
        }),
        printKitchenOrderTicket: (ticket) => {
          events.push(JSON.parse(JSON.stringify(ticket)))
          return true
        },
      }
    )
  )
  return { ...f, state, orders, events, surfaceScope }
}
test('Incoming bulk snapshots later payloads and each delayed receipt before asynchronous acceptance', async () => {
  const wait = deferred(),
    accepted = []
  const f = incomingFixture((id, estimate) => {
    accepted.push({ id, estimate })
    return accepted.length === 1 ? wait.promise : Promise.resolve()
  })
  const payloads = [
    { id: 'one', estimatedMinutes: 15 },
    { id: 'two', estimatedMinutes: 20 },
  ]
  const result = f.state.acceptIncomingOrders(payloads)
  payloads[1].estimatedMinutes = 90
  f.orders.value[0].items[0].label = 'Changed after accept'
  wait.resolve()
  await result
  assert.deepEqual(accepted, [
    { id: 'one', estimate: 15 },
    { id: 'two', estimate: 20 },
  ])
  assert.equal(f.events[0].items[0].label, 'Original soup')
  f.scope.stop()
})
test('Incoming association invalidation resets busy state, cancels obsolete printing and guards newer pending intent', async () => {
  const first = deferred(),
    second = deferred()
  let calls = 0
  const f = incomingFixture(() =>
    ++calls === 1 ? first.promise : second.promise
  )
  const old = f.state.acceptIncomingOrder({ id: 'one', estimatedMinutes: 15 })
  f.access.ids.value = []
  f.access.ids.value = ['mine']
  assert.equal(f.state.acceptingOrderId.value, '')
  const newer = f.state.acceptIncomingOrder({ id: 'one', estimatedMinutes: 25 })
  assert.equal(calls, 2)
  first.resolve()
  await old
  assert.equal(f.state.acceptingOrderId.value, 'one')
  assert.deepEqual(f.events, ['close'])
  second.resolve()
  await newer
  assert.equal(f.state.acceptingOrderId.value, '')
  assert.equal(f.events[1].id, 'one')
  assert.deepEqual(f.state.printWarnings.value, [])
  f.scope.stop()
})

test('Incoming disposal cancels delayed single/bulk printing while its parent Orders intent remains current', async () => {
  for (const bulk of [false, true]) {
    const wait = deferred(),
      accepted = []
    const f = incomingFixture((id) => {
      accepted.push(id)
      return wait.promise
    })
    const parentIsCurrent = f.captureIntent()
    const work = bulk
      ? f.state.acceptIncomingOrders([
          { id: 'one', estimatedMinutes: 15 },
          { id: 'two', estimatedMinutes: 20 },
        ])
      : f.state.acceptIncomingOrder({ id: 'one', estimatedMinutes: 15 })
    f.surfaceScope.stop()
    assert.equal(parentIsCurrent(), true, 'the parent remains mounted')
    wait.resolve()
    await work
    assert.deepEqual(accepted, ['one'])
    assert.deepEqual(f.events, bulk ? ['close', 'close'] : ['close'])
    assert.deepEqual(f.state.printWarnings.value, [])
    f.scope.stop()
  }
})
