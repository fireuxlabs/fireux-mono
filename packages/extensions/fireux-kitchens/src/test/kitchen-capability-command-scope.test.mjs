import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  ref,
  reactive,
  computed,
  watch,
  onScopeDispose,
  effectScope,
} from 'vue'

function load(path, expression, deps = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^[\s\S]*<script setup[^>]*>([\s\S]*?)<\/script>[\s\S]*$/, '$1')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${expression}`,
    Object.keys(deps)
  )(...Object.values(deps))
}

const base = '../runtime/kitchen/'
const useCommandScope = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
const OrderChannels = load(base + 'models/order.model.ts', 'OrderChannels')
const readOrder = load(base + 'utils/ordering.ts', 'readOrder', {
  OrderChannels,
})
const OrderSubmissionStates = load(
  base + 'models/order-submission.model.ts',
  'OrderSubmissionStates'
)
const readOrderSubmission = load(
  base + 'utils/order-submission.ts',
  'readOrderSubmission',
  { readOrder, OrderSubmissionStates }
)
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
const settle = () => new Promise((resolve) => setImmediate(resolve))
const submission = (state = 'received', revision = 1) => ({
  order: {
    id: 'order-a',
    number: '1',
    channel: 'website',
    fulfilment: 'collection',
    lines: [
      { id: 'line-a', item: { name: 'Soup' }, quantity: 1, unit_code: 'C62' },
    ],
    customer: { name: 'Sam', phone: '123' },
  },
  state,
  revision,
  message: '',
  estimate_minutes: null,
})
const result = () => ({
  ok: true,
  kitchen_id: 'kitchen-a',
  submission: submission('accepted', 2),
})

// Exercise the routed Board's scope construction and actual authenticated
// transport. Removed numbering-reset and WhatsApp send-test commands have no
// current operator entrypoint; they are intentionally not recreated here.
function harness(t, delayed = false) {
  const scope = effectScope()
  const credentials = deferred()
  const calls = []
  const responses = []
  const currentUser = ref({
    uid: 'alice',
    getIdToken: () => credentials.promise,
  })
  const selectedId = ref('kitchen-a')
  const config = reactive({ appId: 'app-a' })
  const session = {
    appUser: ref({ id: 'member-a', role: 'user' }),
    pending: ref(false),
    error: ref(null),
  }
  const access = {
    ids: ref(['kitchen-a', 'kitchen-b']),
    outcome: ref('ready'),
    error: ref(null),
  }
  const transports = []
  const useOrderExchange = load(
    base + 'composables/useOrderExchange.ts',
    'useOrderExchange',
    {
      ref,
      watch,
      useCommandScope,
      readOrderSubmission,
      useAuth: () => ({ currentUser }),
      useFireUXConfig: () => config,
      refreshNuxtData: async () => {},
      $fetch: async (url, options) => {
        if (options.method === 'GET') {
          return {
            ok: true,
            kitchen_id: options.query.kitchenId,
            submissions: [],
          }
        }
        calls.push({ url, options })
        const response = deferred()
        responses.push(response)
        return delayed ? response.promise : result()
      },
    }
  )
  const board = scope.run(() =>
    load(
      base + 'components/Orders/Board.vue',
      '({orders,kitchenId,pending,error,estimates,messages,respond,refresh})',
      {
        ref,
        computed,
        watch,
        // Mounting owns polling/fullscreen; invoke the normal action and its
        // reactive authority lifetime without starting those browser effects.
        onMounted: () => {},
        onUnmounted: () => {},
        useKitchenWorkspace: () => ({ id: selectedId }),
        useKitchenAccess: () => access,
        useAppSession: () => session,
        useKitchenOrderDraftCollection: () => ({
          drafts: ref([]),
          error: ref(null),
        }),
        useOrderExchange: (...args) => {
          const api = useOrderExchange(...args)
          transports.push(api)
          return api
        },
      }
    )
  )
  board.orders.value = [submission()]
  const invoke = () =>
    board.respond(board.orders.value[0] || submission(), 'accepted')
  t.after(() => {
    credentials.resolve('cleanup-token')
    responses.forEach((response) => response.resolve(result()))
    scope.stop()
  })
  return {
    scope,
    credentials,
    calls,
    responses,
    currentUser,
    selectedId,
    config,
    session,
    access,
    board,
    api: transports[0],
    invoke,
  }
}

const changes = {
  'account ABA': (w) => {
    const before = w.currentUser.value
    w.currentUser.value = { ...before, uid: 'bob' }
    w.currentUser.value = before
  },
  'App ABA': (w) => {
    w.config.appId = 'app-b'
    w.config.appId = 'app-a'
  },
  'Kitchen ABA': (w) => {
    w.selectedId.value = 'kitchen-b'
    w.selectedId.value = 'kitchen-a'
  },
  'membership ABA': (w) => {
    const before = w.session.appUser.value
    w.session.appUser.value = { ...before, id: 'member-b' }
    w.session.appUser.value = before
  },
  'access ABA': (w) => {
    const before = w.access.ids.value
    w.access.ids.value = []
    w.access.ids.value = before
  },
  disposal: (w) => w.scope.stop(),
}

for (const [name, change] of Object.entries(changes)) {
  test(`Board cannot dispatch a credential continuation after ${name}`, async (t) => {
    const w = harness(t)
    const pending = w.invoke()
    change(w)
    w.credentials.resolve('old-token')
    await pending
    assert.equal(w.calls.length, 0)
    assert.equal(w.board.error.value, '')
  })

  test(`Board cannot apply an old response after ${name}`, async (t) => {
    const w = harness(t, true)
    const pending = w.invoke()
    w.credentials.resolve('token')
    await settle()
    assert.equal(w.calls.length, 1)
    change(w)
    await settle()
    const current = submission('preparing', 5)
    w.board.orders.value = [current]
    w.responses[0].resolve(result())
    await pending
    assert.deepEqual(w.board.orders.value, [current])
    assert.equal(w.board.error.value, '')
  })
}

for (const [name, revoke] of Object.entries({
  'missing account': (w) => {
    w.currentUser.value = null
  },
  'missing App membership': (w) => {
    w.session.appUser.value = null
  },
  'pending App membership': (w) => {
    w.session.pending.value = true
  },
  'failed App membership': (w) => {
    w.session.error.value = new Error('Unavailable')
  },
  'missing Kitchen access': (w) => {
    w.access.ids.value = []
  },
  'unready Kitchen access': (w) => {
    w.access.outcome.value = 'pending'
  },
})) {
  test(`Board does not dispatch with ${name}`, async (t) => {
    const w = harness(t)
    revoke(w)
    w.credentials.resolve('token')
    await w.invoke()
    assert.equal(w.calls.length, 0)
  })
}

test('Board responds through the current protected endpoint and applies its canonical submission', async (t) => {
  const w = harness(t)
  const pending = w.invoke()
  w.credentials.resolve('token')
  await pending
  assert.equal(w.calls.length, 1)
  assert.equal(
    w.calls[0].url,
    '/api/workspace/kitchen/submitted-orders/respond'
  )
  assert.equal(w.calls[0].options.headers.Authorization, 'Bearer token')
  assert.deepEqual(w.calls[0].options.body, {
    kitchenId: 'kitchen-a',
    orderId: 'order-a',
    expectedRevision: 1,
    state: 'accepted',
    message: '',
    estimate_minutes: null,
  })
  assert.deepEqual(w.board.orders.value, [submission('accepted', 2)])
  assert.equal(w.board.pending.value, false)
})

test('Board snapshots message, estimate and revision before credentials resolve', async (t) => {
  const w = harness(t)
  w.board.messages.value['order-a'] = 'Original'
  w.board.estimates.value['order-a'] = '15'
  const pending = w.invoke()
  w.board.messages.value['order-a'] = 'Changed'
  w.board.estimates.value['order-a'] = '99'
  w.board.orders.value[0].revision = 8
  w.credentials.resolve('token')
  await pending
  assert.equal(w.calls[0].options.body.message, 'Original')
  assert.equal(w.calls[0].options.body.estimate_minutes, 15)
  assert.equal(w.calls[0].options.body.expectedRevision, 1)
})

test('a duplicate pending Board command returns no success and sends no second request', async (t) => {
  const w = harness(t)
  const pending = w.invoke()
  const duplicate = await w.api.request(
    '/api/workspace/kitchen/submitted-orders/respond',
    {
      orderId: 'order-a',
      state: 'accepted',
      expectedRevision: 1,
    }
  )
  assert.equal(duplicate, null)
  assert.equal(w.board.pending.value, true)
  w.credentials.resolve('token')
  await pending
  assert.equal(w.calls.length, 1)
})

for (const [name, invalid] of Object.entries({
  'another Kitchen': () => ({ ...result(), kitchen_id: 'kitchen-b' }),
  'another Order': () => {
    const response = result()
    response.submission.order.id = 'order-b'
    return response
  },
})) {
  test(`Board rejects a successful response for ${name}`, async (t) => {
    const w = harness(t, true)
    const pending = w.invoke()
    w.credentials.resolve('token')
    await settle()
    w.responses[0].resolve(invalid())
    await pending
    assert.deepEqual(w.board.orders.value, [submission()])
    assert.match(w.board.error.value, /invalid|another order/i)
    assert.equal(w.board.pending.value, false)
  })
}

test('an old Board action cannot release a new context action or expose its old error', async (t) => {
  const w = harness(t, true)
  const first = w.invoke()
  w.credentials.resolve('token')
  await settle()
  changes['Kitchen ABA'](w)
  await settle()
  w.board.orders.value = [submission()]
  const second = w.invoke()
  await settle()
  assert.equal(w.calls.length, 2)
  w.responses[0].resolve({ ok: false })
  await first
  assert.equal(w.board.pending.value, true)
  assert.equal(w.board.error.value, '')
  w.responses[1].resolve(result())
  await second
  assert.equal(w.board.pending.value, false)
  assert.deepEqual(w.board.orders.value, [submission('accepted', 2)])
})
