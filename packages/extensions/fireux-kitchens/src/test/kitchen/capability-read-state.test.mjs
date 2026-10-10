import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
const {
  computed,
  ref,
  reactive,
  watch,
  onScopeDispose,
  effectScope,
  unref,
  h,
} = Vue
const runtime = new URL('../../runtime/kitchen/', import.meta.url)
function load(path, deps, result) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const tick = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}
function resolveReadOutcome({ active, current, error, pending, present }) {
  if (!active) return 'idle'
  if (current === false) return 'pending'
  if (error) return 'error'
  if (pending) return 'pending'
  return present ? 'ready' : 'empty'
}
function finance() {
  const scope = effectScope(),
    tokens = []
  const user = (uid) => ({
    uid,
    getIdToken: () => {
      const token = deferred()
      tokens.push(token)
      return token.promise
    },
  })
  const currentUser = ref(user('one'))
  const config = reactive({ appId: 'app-a' })
  const session = {
    appUser: ref({ created: { at: 'membership-a' } }),
    pending: ref(false),
    error: ref(null),
  }
  const workspace = {
    id: ref('a'),
    data: ref({ name: 'A' }),
    outcome: ref('ready'),
  }
  const source = {
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: () => {},
  }
  let handler, key
  const state = scope.run(() =>
    load(
      'composables/workspace/overview/useKitchenWorkspaceFinance.ts',
      {
        computed,
        ref,
        watch,
        onScopeDispose,
        resolveReadOutcome,
        useAuth: () => ({ currentUser }),
        useAppSession: () => session,
        useFireUXConfig: () => config,
        useKitchenWorkspace: () => workspace,
        useLiveAsyncData: (k, fn) => {
          key = k
          handler = fn
          return source
        },
      },
      'useKitchenWorkspaceFinance()'
    )
  )
  async function start() {
    source.pending.value = true
    source.error.value = null
    const requests = []
    const promise = handler((...args) => {
      const response = deferred()
      requests.push({ args, ...response })
      return response.promise
    })
    return { requests, promise }
  }
  async function accept(run, result = report()) {
    tokens.at(-1).resolve('token')
    await tick()
    run.requests[0].resolve(result)
    source.data.value = await run.promise
    source.pending.value = false
  }
  return {
    scope,
    state,
    currentUser,
    user,
    config,
    session,
    workspace,
    source,
    tokens,
    start,
    accept,
    key,
  }
}
function report() {
  return {
    app_id: 'app-a',
    kitchen_id: 'a',
    complete: true,
    sale_count: 1,
    currencies: [
      {
        currency_code: 'CHF',
        sale_count: 1,
        gross_sales: { amount_minor: 1500 },
        average_sale: { amount_minor: 1500 },
        item_quantity: 1,
        items: [],
      },
    ],
    transactions: [
      {
        source: { id: 'one' },
        order_type: 'takeaway',
        signed_amount: { amount_minor: 1500 },
        gross_sale: { amount_minor: 1500 },
        occurred_at: '2026-10-06T12:00:00Z',
      },
    ],
    daily: [],
    timezone: 'UTC',
  }
}
test('Sales exposes pending, error, empty, ready and unavailable separately and masks retained totals', async () => {
  const x = finance()
  assert.equal(x.state.outcome.value, 'pending')
  const run = await x.start()
  await x.accept(run)
  assert.equal(x.state.outcome.value, 'ready')
  assert.equal(x.state.report.value.sale_count, 1)
  x.source.pending.value = true
  assert.equal(x.state.outcome.value, 'pending')
  assert.equal(x.state.report.value, null)
  x.source.error.value = new Error('private diagnostics')
  assert.equal(x.state.outcome.value, 'error')
  assert.equal(x.state.report.value, null)
  assert.doesNotMatch(x.state.error.value, /private diagnostics/)
  x.source.error.value = null
  x.source.pending.value = false
  x.source.data.value = {
    ...report(),
    sale_count: 0,
    currencies: [],
    transactions: [],
  }
  assert.equal(x.state.outcome.value, 'empty')
  x.workspace.outcome.value = 'pending'
  assert.equal(x.state.report.value, null)
  assert.equal(x.state.canLoad.value, false)
  for (const outcome of ['error', 'missing', 'idle']) {
    x.workspace.outcome.value = outcome
    assert.equal(x.state.outcome.value, outcome)
    assert.equal(x.state.report.value, null)
  }
  x.workspace.outcome.value = 'ready'
  x.session.error.value = new Error('account read failed')
  assert.equal(x.state.outcome.value, 'error')
  assert.equal(x.state.report.value, null)
  x.session.error.value = null
  x.session.pending.value = true
  assert.equal(x.state.outcome.value, 'pending')
  x.scope.stop()
})
test('Sales never dispatches after obsolete credential waits, including away-and-back scope changes', async () => {
  for (const change of [
    'kitchen',
    'account',
    'app',
    'membership',
    'access',
    'range',
    'dispose',
  ]) {
    const x = finance(),
      run = await x.start(),
      before = x.key.value
    if (change === 'kitchen') {
      x.workspace.id.value = 'b'
      x.workspace.id.value = 'a'
    }
    if (change === 'account') {
      x.currentUser.value = x.user('two')
      x.currentUser.value = x.user('one')
    }
    if (change === 'app') {
      x.config.appId = 'app-b'
      x.config.appId = 'app-a'
    }
    if (change === 'membership') {
      const old = x.session.appUser.value
      x.session.appUser.value = null
      x.session.appUser.value = old
    }
    if (change === 'access') {
      x.workspace.outcome.value = 'pending'
      x.workspace.outcome.value = 'ready'
    }
    if (change === 'range') {
      x.state.customFrom.value = '2026-10-01'
      x.state.customFrom.value = ''
    }
    if (change === 'dispose') x.scope.stop()
    x.tokens[0].resolve('old')
    await run.promise
    assert.equal(run.requests.length, 0, change)
    assert.notEqual(x.key.value, before, change)
    x.scope.stop()
  }
})
test('Sales ignores late responses and rejects mismatched report identity', async () => {
  const x = finance(),
    old = await x.start()
  x.tokens[0].resolve('old')
  await tick()
  x.workspace.id.value = 'b'
  x.workspace.id.value = 'a'
  old.requests[0].resolve(report())
  assert.equal(await old.promise, null)
  assert.equal(x.state.outcome.value, 'pending')
  assert.equal(x.state.report.value, null)
  const current = await x.start()
  x.tokens.at(-1).resolve('current')
  await tick()
  current.requests[0].resolve({ ...report(), kitchen_id: 'wrong' })
  await assert.rejects(current.promise, /did not match/)
  x.scope.stop()
})
test('Sales closes inspected details synchronously when its source becomes unavailable', () => {
  const scope = effectScope(),
    reportRef = ref(report()),
    outcome = ref('ready')
  const state = scope.run(() =>
    load(
      'composables/workspace/overview/useKitchenFinanceOverview.ts',
      {
        computed,
        ref,
        watch,
        useKitchenWorkspaceFinance: () => ({
          chooseRange: () => {},
          customFrom: ref(''),
          customTo: ref(''),
          report: reportRef,
          pending: ref(false),
          error: ref(''),
          outcome,
        }),
      },
      "useKitchenFinanceOverview({ fromDate: '2026-10-06', toDate: '2026-10-06' })"
    )
  )
  state.inspectTransaction(state.transactions.value[0])
  assert.equal(state.transactionOpen.value, true)
  outcome.value = 'pending'
  reportRef.value = null
  assert.equal(state.transactionOpen.value, false)
  assert.equal(state.selectedTransaction.value, null)
  scope.stop()
})
test('Orders hides retained rows while the source or selected Kitchen is not ready', () => {
  const scope = effectScope(),
    sourceOutcome = ref('ready'),
    rows = ref([])
  const workspace = {
    id: ref('a'),
    data: ref({ id: 'a', name: 'A' }),
    accountReady: ref(true),
    hasAccount: ref(true),
    outcome: ref('ready'),
  }
  let requestedId
  const state = scope.run(() =>
    load(
      'composables/workspace/orders/useKitchenWorkspaceOrders.ts',
      {
        computed,
        useKitchenWorkspace: () => workspace,
        useAppSession: () => ({ error: ref(null) }),
        useKitchenAccess: () => ({ ids: ref(['a']), error: ref(null) }),
        useFireUXConfig: () => ({ appId: 'app-a' }),
        readRuntimeFirestoreDatabaseId: () => 'db',
        useKitchenOrderFetch: (id) => {
          requestedId = id
          return {
            orders: rows,
            pending: computed(() => sourceOutcome.value === 'pending'),
            error: ref(new Error('failed')),
            outcome: sourceOutcome,
            ordersPath: ref('path'),
          }
        },
        useKitchenWorkspaceReadPage: (options) => ({
          collection: computed(() => ({
            items: options.items.value,
            pending: options.pending.value,
          })),
        }),
        useKitchenOrderTransition: () => ({
          captureIntent: () => () => true,
          error: ref(''),
          isTransitioning: () => false,
          pendingCount: ref(0),
          transitionKitchenOrder: () => {},
        }),
        useKitchenOrderNumbering: () => ({}),
        KitchenOrderStorage: { collection: 'orders' },
        deriveKitchenOrderBoardStage: () => 'incoming',
      },
      'useKitchenWorkspaceOrders()'
    )
  )
  rows.value = [{ id: 'order-a', created: {}, updated: {} }]
  assert.equal(state.orders.value.length, 1)
  for (const outcome of ['pending', 'error', 'empty', 'idle']) {
    sourceOutcome.value = outcome
    assert.deepEqual(state.orders.value, [])
    assert.equal(state.outcome.value, outcome)
  }
  sourceOutcome.value = 'ready'
  workspace.outcome.value = 'pending'
  assert.equal(requestedId.value, '')
  assert.deepEqual(state.orders.value, [])
  workspace.id.value = 'b'
  workspace.outcome.value = 'missing'
  assert.equal(requestedId.value, '')
  assert.deepEqual(state.orders.value, [])
  assert.equal(state.readError.value, undefined)
  scope.stop()
})
async function render(path, state) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const app = Vue.createSSRApp({
    setup: () => state,
    render: Vue.compile(template),
  })
  const names = [
    ...new Set(
      [...template.matchAll(/<([A-Z][A-Za-z0-9]+)/g)].map((x) => x[1])
    ),
  ]
  for (const name of names)
    app.component(name, {
      props: ['title', 'description', 'message'],
      setup:
        (props, { slots }) =>
        () =>
          h('div', { 'data-ui': name }, [
            props.title,
            props.description,
            props.message,
            slots.header?.(),
            slots.default?.(),
            slots.actions?.(),
            slots.footer?.(),
          ]),
    })
  return renderToString(app)
}
test('Orders never renders operating controls or false emptiness during loading/failure', async () => {
  const base = { view: 'all', transitionError: '', isDev: false, debug: {} }
  for (const [outcome, expected] of [
    ['pending', 'Loading orders'],
    ['error', 'Orders could not be loaded'],
    ['idle', 'Select an available Kitchen'],
  ]) {
    const html = await render('components/Workspace/Orders/Index.vue', {
      ...base,
      outcome,
    })
    assert.match(html, new RegExp(expected))
    assert.doesNotMatch(
      html,
      /data-ui="WorkspaceKitchenOrders(ServiceState|Pass|Queue|BoardToolbar|Confirmed)"/
    )
    if (outcome === 'error') assert.match(html, /MoleculesCopyError/)
  }
  assert.match(
    await render('components/Workspace/Orders/Index.vue', {
      ...base,
      outcome: 'empty',
    }),
    /WorkspaceKitchenOrdersOperatingState/
  )
})
test('Both Sales surfaces hide metrics, charts, transactions and empty claims until settled', async () => {
  for (const path of [
    'components/Workspace/Finance/Overview.vue',
    'components/Workspace/Overview/Finance.vue',
  ]) {
    for (const [outcome, expected] of [
      ['pending', 'Loading sales'],
      ['error', 'Sales could not be loaded'],
      ['idle', 'Select an available Kitchen'],
      ['missing', 'Select an available Kitchen'],
    ]) {
      const html = await render(path, {
        outcome,
        error: 'Sales could not be loaded.',
      })
      assert.match(html, new RegExp(expected))
      assert.doesNotMatch(
        html,
        /Gross sales|No completed sales|Best sellers|Financial insight|UModal/
      )
      if (outcome === 'error') assert.match(html, /MoleculesCopyError/)
    }
  }
})

function loadVueSetup(path, deps, result) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
test('Overview uses read-only canonical readers, hides obsolete counts, and excludes unmapped Orders from active work', () => {
  const scope = effectScope(),
    calls = []
  const workspace = { id: ref('a'), outcome: ref('ready') }
  const source = () => ({ count: ref(4), outcome: ref('ready') })
  const orders = {
    ...source(),
    orders: ref(
      [
        'pending_payment',
        'pending_acceptance',
        'scheduled',
        'accepted',
        'ready',
        'completed',
        'trashed',
        'unknown',
      ].map((status) => ({ status }))
    ),
  }
  const menus = {
    ...source(),
    activeMenus: ref([{}]),
    publishedMenus: ref([{}]),
  }
  const reader = (result) => (id, options) => {
    calls.push({ id, options })
    return result
  }
  const deriveKitchenOrderBoardStage = load(
    'models/order-lifecycle.model.ts',
    {},
    'deriveKitchenOrderBoardStage'
  )
  const api = scope.run(() =>
    loadVueSetup(
      'components/Workspace/Overview/Activity.vue',
      {
        computed,
        useKitchenWorkspace: () => workspace,
        useKitchenOrderFetch: reader(orders),
        deriveKitchenOrderBoardStage,
        useKitchenMenuCollection: reader(menus),
        useKitchenDishCollection: reader(source()),
        useKitchenRecipeCollection: reader(source()),
        useKitchenStationCollection: reader(source()),
        useKitchenChildCollection: (name, id, options) => {
          assert.ok(['ingredients', 'suppliers', 'waste'].includes(name))
          return reader(source())(id, options)
        },
        KitchenIngredientStorage: { collection: 'ingredients' },
        SupplierStorage: { collection: 'suppliers' },
        KitchenWasteEventStorage: { collection: 'waste' },
        useKitchenWorkspaceFinance: () => ({
          report: ref(null),
          outcome: ref('pending'),
        }),
      },
      '({value,pending,failed,activeOrders,incomingOrders})'
    )
  )
  assert.equal(api.activeOrders.value, 5)
  assert.equal(api.incomingOrders.value, 1)
  assert.equal(api.value(orders, api.activeOrders.value), 5)
  assert.equal(calls.length, 8)
  for (const call of calls) {
    assert.equal(call.id.value, 'a')
    assert.equal(call.options.kitchenCollectionPath, 'kitchens')
  }
  menus.outcome.value = 'pending'
  assert.equal(api.pending(menus), true)
  assert.equal(api.value(menus), '—')
  assert.equal(api.value(orders, api.activeOrders.value), 5)
  for (const state of ['pending', 'error', 'missing']) {
    workspace.outcome.value = state
    workspace.id.value = 'b'
    for (const call of calls) assert.equal(call.id.value, '')
    assert.equal(api.value(orders), '—')
    assert.equal(api.activeOrders.value, 0)
    assert.equal(api.failed(orders), state === 'error')
  }
  scope.stop()
})
