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
  watch,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { resolveReadOutcome } from '../../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'
import { isFirestoreDocumentId } from '../../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts'
const runtime = new URL('../../runtime/', import.meta.url)
const componentPath = 'kitchen/components/Workspace/Orders/Kiosks/Index.vue'
function load(path, result, deps) {
  let source = readFileSync(new URL(path, runtime), 'utf8')
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type \{[\s\S]*?\} from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
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
const utility = load(
  'kitchen/utils/kiosk-device.ts',
  '({kitchenOfferingSupportsKiosk,readKitchenKioskActivationPath})',
  { isFirestoreDocumentId }
)
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const offering = (id, menuIds = ['food', 'drinks']) => ({
  id,
  name: id,
  enabled: true,
  menu_ids: menuIds,
  hours: {
    timezone: 'Europe/Zurich',
    windows: [{ day: 1, start: '09:00', end: '22:00' }],
  },
  interactions: [{ type: 'eat_in', enabled: true }],
})
const device = (patch = {}) => ({
  id: 'counter',
  label: 'Counter tablet',
  kitchenOfferingId: 'lunch',
  serviceName: 'Lunch',
  menuId: 'food',
  status: 'active',
  expiresAt: '2026-12-01T12:00:00Z',
  current: true,
  livePath: '/kitchens/venue/menus/food-menu.kiosk?offering=lunch',
  ...patch,
})
function fixture(appState = new Map()) {
  const scope = effectScope(),
    config = reactive({ appId: 'app' }),
    events = {
      get: [],
      post: [],
      toast: [],
      navigate: [],
      select: [],
      refresh: 0,
    }
  let token = async () => 'actor-token',
    fetchResponse,
    readResponse = { ok: true, devices: [device()] },
    refreshResponse
  const currentUser = ref({ uid: 'actor', getIdToken: () => token() })
  const session = {
    appUser: ref({ id: 'actor', role: 'user', subscription: 'free' }),
    pending: ref(false),
    error: ref(undefined),
  }
  const access = {
    ids: ref(['venue', 'other']),
    outcome: ref('ready'),
    error: ref(undefined),
  }
  const menusState = {
    availableKitchens: ref([
      { id: 'venue', presentation: { display_name: 'Venue' } },
      { id: 'other' },
    ]),
    kitchensPending: ref(false),
    kitchenId: ref('venue'),
    storageKitchenId: ref('venue'),
    selectedKitchen: ref({ id: 'venue', slug: 'venue' }),
    canWrite: ref(true),
    menus: ref([
      { id: 'food', name: 'Food', slug: 'food-menu', status: 'published' },
      {
        id: 'drinks',
        name: 'Drinks',
        slug: 'drinks-menu',
        status: 'published',
      },
    ]),
    pending: ref(false),
    outcome: ref('ready'),
    offerings: ref([offering('lunch'), offering('dinner')]),
    offeringsOutcome: ref('ready'),
    selectKitchen: async (id) => {
      events.select.push(id)
    },
  }
  const live = {
    data: ref(null),
    error: ref(undefined),
    pending: ref(false),
    status: ref('idle'),
  }
  let handler, key, options
  const read = async () => {
    const originalKey = key.value
    live.pending.value = true
    live.status.value = 'pending'
    live.error.value = undefined
    try {
      const value = await handler(async (request, input) => {
        events.get.push({ request, ...input })
        return typeof readResponse === 'function'
          ? readResponse()
          : readResponse
      })
      if (key.value === originalKey) {
        live.data.value = value
        live.status.value = 'success'
      }
      return value
    } catch (error) {
      if (key.value === originalKey) {
        live.error.value = error
        live.status.value = 'error'
      }
      return undefined
    } finally {
      if (key.value === originalKey) live.pending.value = false
    }
  }
  live.refresh = async () => {
    events.refresh++
    return refreshResponse ? refreshResponse() : read()
  }
  const state = scope.run(() =>
    load(
      componentPath,
      `({activate,revoke,refresh,chooseKitchen,devices,devicesOutcome,devicesPending,ownerOutcome,canManage,canActivate,
    selectedMenuId,selectedOfferingId,activationPath,activating,revokingId,cookieCommandPending,refreshing,kitchenOptions,serviceOptions,menuOptions,kitchenId,kitchensPending,
    pendingMenus,menusOutcome,offeringsOutcome,menuLabel,statusLabel,expiryLabel})`,
      {
        computed,
        ref,
        watch,
        onScopeDispose,
        useCommandScope,
        resolveReadOutcome,
        ...utility,
        defineOptions: () => {},
        useState: (key, create) => {
          if (!appState.has(key)) appState.set(key, ref(create()))
          return appState.get(key)
        },
        useAuth: () => ({ currentUser }),
        useAppSession: () => session,
        useFireUXConfig: () => config,
        useKitchenAccess: () => access,
        useToastify: () => ({
          success: (text) => events.toast.push(['success', text]),
          error: (text) => events.toast.push(['error', text]),
        }),
        useKitchenWorkspaceMenus: () => menusState,
        useLiveAsyncData: (k, h, o) => {
          key = k
          handler = h
          options = o
          return live
        },
        $fetch: async (request, input) => {
          events.post.push({ request, ...input })
          return fetchResponse
            ? fetchResponse(request, input)
            : input.method === 'DELETE'
              ? { ok: true, kioskId: 'counter' }
              : { ok: true, device: device() }
        },
        navigateTo: async (path) => events.navigate.push(path),
      }
    )
  )
  const select = () => {
    state.selectedOfferingId.value = 'lunch'
    state.selectedMenuId.value = 'food'
  }
  select()
  return {
    scope,
    config,
    currentUser,
    session,
    access,
    menusState,
    live,
    state,
    events,
    read,
    select,
    get key() {
      return key.value
    },
    get options() {
      return options
    },
    get handler() {
      return handler
    },
    token: (fn) => {
      token = fn
    },
    reply: (fn) => {
      fetchResponse = fn
    },
    readReply: (value) => {
      readResponse = value
    },
    refreshReply: (fn) => {
      refreshResponse = fn
    },
  }
}
const ownerRoundTrips = [
  [
    'account',
    (f) => {
      const old = f.currentUser.value
      f.currentUser.value = {
        uid: 'other',
        getIdToken: async () => 'other-token',
      }
      f.currentUser.value = old
    },
  ],
  [
    'App',
    (f) => {
      f.config.appId = 'other-app'
      f.config.appId = 'app'
    },
  ],
  [
    'membership',
    (f) => {
      f.session.appUser.value = { id: 'actor', role: 'guest' }
      f.session.appUser.value = {
        id: 'actor',
        role: 'user',
        subscription: 'free',
      }
    },
  ],
  [
    'membership pending',
    (f) => {
      f.session.pending.value = true
      f.session.pending.value = false
    },
  ],
  [
    'membership error',
    (f) => {
      f.session.error.value = new Error('unavailable')
      f.session.error.value = undefined
    },
  ],
  [
    'access',
    (f) => {
      f.access.ids.value = []
      f.access.ids.value = ['venue', 'other']
    },
  ],
  [
    'access pending',
    (f) => {
      f.access.outcome.value = 'pending'
      f.access.outcome.value = 'ready'
    },
  ],
  [
    'Kitchen',
    (f) => {
      f.menusState.kitchenId.value = 'other'
      f.menusState.kitchenId.value = 'venue'
    },
  ],
  [
    'ready storage owner',
    (f) => {
      f.menusState.storageKitchenId.value = ''
      f.menusState.storageKitchenId.value = 'venue'
    },
  ],
  [
    'write readiness',
    (f) => {
      f.menusState.canWrite.value = false
      f.menusState.canWrite.value = true
    },
  ],
  ['disposal', (f) => f.scope.stop()],
]
const localRoundTrips = [
  [
    'Offering',
    (f) => {
      f.state.selectedOfferingId.value = 'dinner'
      f.select()
    },
  ],
  [
    'Menu',
    (f) => {
      f.state.selectedMenuId.value = 'drinks'
      f.state.selectedMenuId.value = 'food'
    },
  ],
  [
    'Menu slug',
    (f) => {
      f.menusState.menus.value[0].slug = 'new-name'
      f.menusState.menus.value[0].slug = 'food-menu'
    },
  ],
  ['local Kitchen choice', (f) => f.state.chooseKitchen('venue')],
]
test('Kiosk device reads require the exact ready Kitchen, preserve owner failures and capture original query', async () => {
  const f = fixture()
  assert.equal(f.options.server, false)
  f.menusState.storageKitchenId.value = ''
  f.menusState.outcome.value = 'pending'
  await f.read()
  assert.equal(f.events.get.length, 0)
  assert.equal(f.state.devicesOutcome.value, 'pending')
  f.menusState.kitchenId.value = ''
  f.session.error.value = new Error('App failed')
  assert.equal(f.state.devicesOutcome.value, 'error')
  f.session.error.value = undefined
  f.access.outcome.value = 'error'
  assert.equal(f.state.ownerOutcome.value, 'error')
  f.access.outcome.value = 'ready'
  f.menusState.kitchenId.value = 'venue'
  f.menusState.storageKitchenId.value = 'venue'
  f.menusState.outcome.value = 'ready'
  await f.read()
  assert.equal(f.state.devices.value[0].id, 'counter')
  assert.deepEqual(f.events.get[0], {
    request: '/api/workspace/kitchen/kiosks',
    headers: { Authorization: 'Bearer actor-token' },
    query: { kitchen_id: 'venue' },
  })
  f.scope.stop()
})
test('Kiosk rows are derived from the one live source and mask retained data on refresh/failure/ABA/inactivity', async () => {
  const f = fixture()
  await f.read()
  assert.equal(f.state.devices.value.length, 1)
  f.live.pending.value = true
  assert.equal(f.state.devicesOutcome.value, 'pending')
  assert.deepEqual(f.state.devices.value, [])
  f.live.error.value = new Error('Read failed')
  assert.equal(f.state.devicesOutcome.value, 'error')
  assert.deepEqual(f.state.devices.value, [])
  f.live.pending.value = false
  f.live.error.value = undefined
  const oldKey = f.key
  f.access.ids.value = []
  f.access.ids.value = ['venue', 'other']
  assert.notEqual(f.key, oldKey)
  assert.equal(f.state.devicesOutcome.value, 'pending')
  assert.deepEqual(f.state.devices.value, [])
  await f.read()
  f.live.data.value.devices.push(device({ id: 'second' }))
  assert.equal(f.state.devices.value.length, 2)
  f.currentUser.value = null
  assert.equal(f.state.devicesOutcome.value, 'idle')
  assert.deepEqual(f.state.devices.value, [])
  f.scope.stop()
})
test('obsolete Kiosk credential reads never dispatch after actor/App/member/access/Kitchen/disposal changes', async () => {
  for (const [name, change] of ownerRoundTrips) {
    const f = fixture(),
      wait = deferred()
    f.token(() => wait.promise)
    const read = f.handler(async () => {
      f.events.get.push('dispatched')
      return { ok: true, devices: [] }
    })
    change(f)
    wait.resolve('original-token')
    assert.equal(await read, null, name)
    assert.deepEqual(f.events.get, [], name)
    f.scope.stop()
  }
})
test('Kiosk activation snapshots its selection and cancels credential continuations after owner/local intent roundtrips', async () => {
  for (const [name, change] of [...ownerRoundTrips, ...localRoundTrips]) {
    const f = fixture(),
      wait = deferred()
    f.token(() => wait.promise)
    const work = f.state.activate()
    assert.equal(f.state.activating.value, true)
    change(f)
    wait.resolve('original-token')
    await work
    assert.deepEqual(f.events.post, [], name)
    assert.equal(f.state.cookieCommandPending.value, false, name)
    assert.deepEqual(f.events.toast, [], name)
    assert.deepEqual(f.events.navigate, [], name)
    f.scope.stop()
  }
  const f = fixture()
  await f.state.activate()
  assert.deepEqual(f.events.post[0].body, {
    kitchen_id: 'venue',
    kitchen_offering_id: 'lunch',
    menu_id: 'food',
  })
  assert.equal(f.events.post[0].retry, 0)
  assert.deepEqual(f.events.navigate, [
    '/kitchens/venue/menus/food-menu.kiosk?offering=lunch',
  ])
  assert.equal(f.state.activating.value, false)
  f.scope.stop()
})
test('Kiosk pending activation blocks a newer POST across owner and selection recovery without stale feedback', async () => {
  for (const [name, change] of [...ownerRoundTrips, ...localRoundTrips].filter(
    ([name]) => name !== 'disposal'
  )) {
    const f = fixture(),
      first = deferred(),
      second = deferred()
    let calls = 0
    f.reply(() => (++calls === 1 ? first.promise : second.promise))
    const old = f.state.activate()
    await new Promise(setImmediate)
    assert.equal(f.events.post.length, 1, name)
    assert.equal(f.state.cookieCommandPending.value, true, name)
    change(f)
    f.select()
    assert.equal(f.state.activating.value, false, name)
    await f.state.activate()
    assert.equal(f.events.post.length, 1, name)
    assert.equal(f.state.cookieCommandPending.value, true, name)
    first.resolve({ ok: true, device: device() })
    await old
    assert.equal(f.state.cookieCommandPending.value, false, name)
    assert.deepEqual(f.events.toast, [], name)
    assert.deepEqual(f.events.navigate, [], name)
    const newer = f.state.activate()
    await new Promise(setImmediate)
    assert.equal(f.events.post.length, 2, name)
    assert.equal(f.state.activating.value, true, name)
    assert.equal(f.state.cookieCommandPending.value, true, name)
    second.resolve({ ok: true, device: device() })
    await newer
    assert.equal(f.state.activating.value, false, name)
    assert.equal(f.state.cookieCommandPending.value, false, name)
    assert.equal(f.events.navigate.length, 1, name)
    f.scope.stop()
  }
})
test('activation response must match canonical device/Menu/Offering/current/active and exact local path', async () => {
  const invalid = [
    null,
    { ok: false, device: device() },
    { ok: true },
    ...[
      { id: '../device' },
      { id: ' device ' },
      { menuId: 'drinks' },
      { kitchenOfferingId: 'dinner' },
      { current: false },
      { current: 'true' },
      { status: 'revoked' },
      { livePath: 'https://example.com/kiosk' },
      { livePath: '//example.com/kiosk' },
      { livePath: '/kitchens/other/menus/food-menu.kiosk?offering=lunch' },
      { livePath: '/kitchens/venue/menus/food-menu.kiosk?offering=dinner' },
      {
        livePath:
          '/kitchens/venue/menus/food-menu.kiosk?offering=lunch&unexpected=1',
      },
    ].map((patch) => ({ ok: true, device: device(patch) })),
  ]
  for (const response of invalid) {
    const f = fixture()
    f.reply(async () => response)
    await f.state.activate()
    assert.deepEqual(f.events.navigate, [])
    assert.equal(f.events.toast.length, 1)
    assert.equal(f.events.toast[0][0], 'error')
    f.scope.stop()
  }
})
test('Kiosk revocation requires a current device and suppresses obsolete credentials across owner/local lifetime', async () => {
  for (const [name, change] of [...ownerRoundTrips, ...localRoundTrips]) {
    const f = fixture()
    await f.read()
    const wait = deferred()
    f.token(() => wait.promise)
    const work = f.state.revoke('counter')
    assert.equal(f.state.revokingId.value, 'counter')
    change(f)
    wait.resolve('original-token')
    await work
    assert.deepEqual(f.events.post, [], name)
    assert.equal(f.state.cookieCommandPending.value, false, name)
    assert.deepEqual(f.events.toast, [], name)
    assert.equal(f.events.refresh, 0, name)
    f.scope.stop()
  }
  const f = fixture()
  await f.read()
  await f.state.revoke('unknown')
  assert.deepEqual(f.events.post, [])
  f.live.data.value.devices[0].status = 'revoked'
  await f.state.revoke('counter')
  assert.deepEqual(f.events.post, [])
  f.scope.stop()
})
test('Kiosk pending revocation blocks a newer DELETE across owner recovery and validates its completion', async () => {
  const f = fixture()
  await f.read()
  const first = deferred(),
    second = deferred()
  let calls = 0
  f.reply(() => (++calls === 1 ? first.promise : second.promise))
  const old = f.state.revoke('counter')
  await new Promise(setImmediate)
  assert.equal(f.events.post.length, 1)
  f.access.outcome.value = 'pending'
  f.access.outcome.value = 'ready'
  f.select()
  await f.read()
  assert.equal(f.state.revokingId.value, '')
  await f.state.revoke('counter')
  assert.equal(f.events.post.length, 1)
  assert.equal(f.state.cookieCommandPending.value, true)
  first.resolve({ ok: true, kioskId: 'counter' })
  await old
  assert.equal(f.state.cookieCommandPending.value, false)
  assert.deepEqual(f.events.toast, [])
  assert.equal(f.events.refresh, 0)
  const newer = f.state.revoke('counter')
  await new Promise(setImmediate)
  assert.equal(f.events.post.length, 2)
  assert.equal(f.state.revokingId.value, 'counter')
  second.resolve({ ok: true, kioskId: 'counter' })
  await newer
  assert.equal(f.state.revokingId.value, '')
  assert.equal(f.state.cookieCommandPending.value, false)
  assert.equal(f.events.refresh, 1)
  assert.equal(f.events.toast[0][0], 'success')
  f.scope.stop()
  const invalid = fixture()
  await invalid.read()
  invalid.reply(async () => ({ ok: true, kioskId: 'wrong' }))
  await invalid.state.revoke('counter')
  assert.equal(invalid.events.refresh, 0)
  assert.equal(invalid.events.toast[0][0], 'error')
  assert.equal(invalid.state.cookieCommandPending.value, false)
  invalid.scope.stop()
})
test('Kiosk manual refresh guards failure feedback and pending cleanup across newer intent and disposal', async () => {
  const f = fixture()
  await f.read()
  const first = deferred(),
    second = deferred()
  let calls = 0
  f.refreshReply(() => (++calls === 1 ? first.promise : second.promise))
  const old = f.state.refresh()
  f.config.appId = 'other'
  f.config.appId = 'app'
  f.select()
  const newer = f.state.refresh()
  assert.equal(f.events.refresh, 2)
  first.reject(new Error('Obsolete failure'))
  await old
  assert.equal(f.state.refreshing.value, true)
  assert.deepEqual(f.events.toast, [])
  second.resolve()
  await newer
  assert.equal(f.state.refreshing.value, false)
  f.scope.stop()
  const disposed = fixture(),
    wait = deferred()
  disposed.refreshReply(() => wait.promise)
  const work = disposed.state.refresh()
  disposed.scope.stop()
  wait.reject(new Error('Disposed'))
  await work
  assert.deepEqual(disposed.events.toast, [])
})
const templateSource = readFileSync(new URL(componentPath, runtime), 'utf8')
const body = templateSource.slice(
  templateSource.indexOf('<template>') + 10,
  templateSource.lastIndexOf('</template>')
)
const warnings = [],
  renderTemplate = compile(body, {
    onError: (error) => {
      throw error
    },
    onWarn: (warning) => warnings.push(warning),
  })
async function render(state) {
  const app = createSSRApp({ setup: () => state, render: renderTemplate }),
    renderWarnings = []
  app.config.warnHandler = (warning) => renderWarnings.push(warning)
  const names = new Set(
    [...body.matchAll(/<([A-Z][A-Za-z0-9]+)[\s/>]/g)].map((match) => match[1])
  )
  for (const name of names)
    app.component(name, {
      props: [
        'title',
        'label',
        'description',
        'disabled',
        'loading',
        'modelValue',
        'items',
        'state',
      ],
      setup:
        (props, { slots }) =>
        () =>
          h(
            'section',
            {
              'data-component': name,
              'data-disabled': props.disabled ? 'true' : undefined,
              'data-state': props.state,
            },
            [
              props.title,
              props.label,
              props.description,
              ...['default', 'header', 'actions'].flatMap(
                (slot) => slots[slot]?.() || []
              ),
            ]
          ),
    })
  const html = await renderToString(app)
  assert.deepEqual(warnings, [])
  assert.deepEqual(renderWarnings, [])
  return html
}
test('actual Kiosk template distinguishes pending/failure/empty/current rows and preserves configuration failure states', async () => {
  const f = fixture()
  await f.read()
  assert.match(await render(f.state), /Counter tablet/)
  f.live.pending.value = true
  const pending = await render(f.state)
  assert.match(pending, /Loading Kiosks/)
  assert.doesNotMatch(pending, /Counter tablet|No kiosks activated/)
  f.live.error.value = new Error('failure')
  const failed = await render(f.state)
  assert.match(failed, /Kiosks unavailable/)
  assert.doesNotMatch(
    failed,
    /Counter tablet|Loading Kiosks|No kiosks activated/
  )
  f.readReply({ ok: true, devices: [] })
  await f.read()
  assert.match(await render(f.state), /No kiosks activated/)
  f.menusState.offeringsOutcome.value = 'error'
  assert.match(await render(f.state), /Kiosk offerings unavailable/)
  assert.equal(f.state.canActivate.value, false)
  f.menusState.offeringsOutcome.value = 'ready'
  f.menusState.outcome.value = 'error'
  const menus = await render(f.state)
  assert.match(menus, /Menus unavailable/)
  assert.doesNotMatch(menus, /No published Menu/)
  f.menusState.kitchenId.value = ''
  f.menusState.storageKitchenId.value = ''
  f.menusState.outcome.value = 'idle'
  f.access.outcome.value = 'error'
  const owner = await render(f.state)
  assert.match(owner, /Kiosk setup unavailable/)
  assert.doesNotMatch(
    owner,
    /Set up a kiosk service|Select an available Kitchen/
  )
  f.scope.stop()
})
test('malformed current Kiosk read is a failure and cannot masquerade as an empty device list', async () => {
  for (const response of [
    { ok: false, devices: [] },
    { ok: true, devices: null },
    null,
  ]) {
    const f = fixture()
    f.readReply(response)
    await f.read()
    assert.equal(f.state.devicesOutcome.value, 'error')
    assert.deepEqual(f.state.devices.value, [])
    assert.match(await render(f.state), /Kiosks unavailable/)
    f.scope.stop()
  }
})

test('Kiosk post-dispatch success and failure stay quiet after disposal or changed account/local selection', async () => {
  for (const action of ['activate', 'revoke']) {
    for (const reject of [false, true]) {
      for (const change of [
        (f) => f.scope.stop(),
        (f) => {
          f.currentUser.value = {
            uid: 'new-actor',
            getIdToken: async () => 'new-token',
          }
        },
        (f) => {
          f.state.selectedMenuId.value = 'drinks'
        },
      ]) {
        const f = fixture(),
          wait = deferred()
        await f.read()
        f.reply(() => wait.promise)
        const work =
          action === 'activate' ? f.state.activate() : f.state.revoke('counter')
        await new Promise(setImmediate)
        assert.equal(f.events.post.length, 1)
        change(f)
        if (reject) wait.reject(new Error('historical failed request'))
        else
          wait.resolve(
            action === 'activate'
              ? { ok: true, device: device() }
              : { ok: true, kioskId: 'counter' }
          )
        await work
        assert.equal(f.state.cookieCommandPending.value, false)
        assert.deepEqual(f.events.toast, [])
        assert.deepEqual(f.events.navigate, [])
        assert.equal(f.events.refresh, 0)
        f.scope.stop()
      }
    }
  }
})

test('current-device DELETE blocks POST and both command controls until cookie mutation settles', async () => {
  const f = fixture(),
    wait = deferred()
  await f.read()
  assert.equal(f.state.devices.value[0].current, true)
  f.reply(() => wait.promise)
  const work = f.state.revoke('counter')
  await new Promise(setImmediate)
  assert.equal(f.state.cookieCommandPending.value, true)
  assert.equal(f.state.canManage.value, true)
  assert.equal(f.state.canActivate.value, true)
  const html = await render(f.state)
  assert.match(
    html,
    /data-component="UButton"[^>]*data-disabled="true"[^>]*>(?:<!---->)*Open kiosk/
  )
  assert.match(
    html,
    /data-component="UButton"[^>]*data-disabled="true"[^>]*>(?:<!---->)*Revoke/
  )
  await f.state.activate()
  assert.deepEqual(
    f.events.post.map((request) => request.method),
    ['DELETE']
  )
  wait.resolve({ ok: true, kioskId: 'counter' })
  await work
  assert.equal(f.state.cookieCommandPending.value, false)
  f.reply(async () => ({ ok: true, device: device() }))
  await f.state.activate()
  assert.deepEqual(
    f.events.post.map((request) => request.method),
    ['DELETE', 'POST']
  )
  assert.equal(f.events.navigate.length, 1)
  f.scope.stop()
})

test('multiple mounted Kiosk controls serialize POST and DELETE before credential preparation', async () => {
  for (const action of ['activate', 'revoke']) {
    const appState = new Map(),
      first = fixture(appState),
      second = fixture(appState),
      wait = deferred()
    await first.read()
    await second.read()
    assert.equal(
      first.state.cookieCommandPending,
      second.state.cookieCommandPending
    )
    let firstTokens = 0,
      secondTokens = 0
    first.token(() => {
      firstTokens++
      return wait.promise
    })
    second.token(async () => {
      secondTokens++
      return 'second-token'
    })
    const old =
      action === 'activate'
        ? first.state.activate()
        : first.state.revoke('counter')
    assert.equal(firstTokens, 1)
    assert.equal(second.state.cookieCommandPending.value, true)
    await second.state.activate()
    await second.state.revoke('counter')
    assert.equal(secondTokens, 0)
    assert.deepEqual(second.events.post, [])
    first.scope.stop()
    assert.equal(second.state.cookieCommandPending.value, true)
    wait.resolve('first-token')
    await old
    assert.equal(second.state.cookieCommandPending.value, false)
    assert.deepEqual(first.events.post, [])
    assert.deepEqual(first.events.toast, [])
    assert.deepEqual(first.events.navigate, [])
    await second.state.activate()
    assert.equal(secondTokens, 1)
    assert.equal(second.events.post.length, 1)
    assert.equal(second.events.navigate.length, 1)
    second.scope.stop()
  }
})

test('Kiosk disposal and remount retain the app cookie guard through success and failure, then permit a new command', async () => {
  for (const action of ['activate', 'revoke']) {
    for (const reject of [false, true]) {
      const appState = new Map(),
        old = fixture(appState),
        wait = deferred()
      await old.read()
      old.reply(() => wait.promise)
      const work =
        action === 'activate'
          ? old.state.activate()
          : old.state.revoke('counter')
      await new Promise(setImmediate)
      assert.equal(old.events.post.length, 1)
      old.scope.stop()
      const remounted = fixture(appState)
      await remounted.read()
      assert.equal(remounted.state.cookieCommandPending.value, true)
      assert.equal(remounted.state.activating.value, false)
      assert.equal(remounted.state.revokingId.value, '')
      const html = await render(remounted.state)
      assert.match(
        html,
        /data-component="UButton"[^>]*data-disabled="true"[^>]*>(?:<!---->)*Open kiosk/
      )
      assert.match(
        html,
        /data-component="UButton"[^>]*data-disabled="true"[^>]*>(?:<!---->)*Revoke/
      )
      await remounted.state.activate()
      await remounted.state.revoke('counter')
      assert.deepEqual(remounted.events.post, [])
      if (reject) wait.reject(new Error('Disposed request failed'))
      else
        wait.resolve(
          action === 'activate'
            ? { ok: true, device: device() }
            : { ok: true, kioskId: 'counter' }
        )
      await work
      assert.equal(remounted.state.cookieCommandPending.value, false)
      assert.deepEqual(old.events.toast, [])
      assert.deepEqual(old.events.navigate, [])
      assert.equal(old.events.refresh, 0)
      await remounted.state.activate()
      assert.equal(remounted.events.post.length, 1)
      assert.equal(remounted.events.navigate.length, 1)
      remounted.scope.stop()
    }
  }
})

test('separate Nuxt app instances do not share Kiosk command pending state', async () => {
  const first = fixture(),
    second = fixture(),
    wait = deferred()
  first.reply(() => wait.promise)
  const work = first.state.activate()
  await new Promise(setImmediate)
  assert.equal(first.state.cookieCommandPending.value, true)
  assert.equal(second.state.cookieCommandPending.value, false)
  await second.state.activate()
  assert.equal(second.events.post.length, 1)
  assert.equal(second.events.navigate.length, 1)
  assert.equal(first.state.cookieCommandPending.value, true)
  first.scope.stop()
  wait.resolve({ ok: true, device: device() })
  await work
  assert.equal(first.state.cookieCommandPending.value, false)
  second.scope.stop()
})
