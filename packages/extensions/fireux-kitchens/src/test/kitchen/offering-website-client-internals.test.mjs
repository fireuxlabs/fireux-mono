import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  computed,
  createRenderer,
  h,
  onScopeDispose,
  reactive,
  ref,
  toValue,
  watch,
} from 'vue'
import { resolveReadOutcome } from '../../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'
import { isFirestoreDocumentId } from '../../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts'

const runtime = new URL('../../runtime/', import.meta.url)
function load(path, names, deps) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replace(/import\.meta\.dev/g, 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const { useCommandScope } = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
const websites = load(
  'kitchen/utils/allowed-websites.ts',
  'normalizeAllowedWebsites,readAllowedWebsites',
  {}
)
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const renderer = createRenderer({
  createElement: (type) => ({ type, children: [], props: {} }),
  createText: (text) => ({ text }),
  createComment: (text) => ({ text }),
  insert: (node, parent) => {
    parent.children.push(node)
    node.parent = parent
  },
  remove: (node) => {
    if (node.parent)
      node.parent.children = node.parent.children.filter(
        (child) => child !== node
      )
  },
  parentNode: (node) => node.parent,
  nextSibling: () => null,
  patchProp: (node, key, old, value) => {
    node.props[key] = value
  },
  setText: (node, text) => {
    node.text = text
  },
  setElementText: (node, text) => {
    node.text = text
  },
})
function fixture(kind, explicit = ref('local')) {
  const config = reactive({ appId: 'app' })
  let token = async () => 'token',
    response,
    readResponse = {
      kitchenId: 'local',
      allowed_origins: ['https://saved.test'],
    }
  const currentUser = ref({ uid: 'actor', getIdToken: () => token() })
  const session = {
    appUser: ref({ id: 'actor', created: { at: 1 } }),
    appPending: ref(false),
    appError: ref(null),
    appOutcome: ref('ready'),
  }
  const access = {
    ids: ref(['local', 'other']),
    pending: ref(false),
    error: ref(null),
    outcome: ref('ready'),
  }
  const identity = {
    kitchenId: ref('local'),
    selectedKitchen: ref({ id: 'local' }),
    canWrite: ref(true),
    outcome: ref('ready'),
  }
  const menus = {
    menus: ref([{ id: 'food', name: 'Food' }]),
    pending: ref(false),
    outcome: ref('ready'),
  }
  const offerings = {
    offerings: ref([{ id: 'service' }]),
    error: ref(null),
    outcome: ref('ready'),
  }
  const live = {
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    status: ref('idle'),
  }
  const events = { reads: [], commands: [], explicit: [], warnings: [] }
  let menuTarget, offeringTarget, key, handler, options, api
  const deps = {
    computed,
    onScopeDispose,
    ref,
    watch,
    toValue,
    useCommandScope,
    resolveReadOutcome,
    isFirestoreDocumentId,
    ...websites,
    useFireUXConfig: () => config,
    useAuth: () => ({ currentUser }),
    useUserSession: () => session,
    useKitchenAccess: () => access,
    useKitchenWorkspaceIdentity: (id) => {
      events.explicit.push(id)
      return identity
    },
    useKitchenWorkspacePlace: () => ({
      place: ref({ timezone: 'Europe/Zurich' }),
      placeOutcome: ref('ready'),
    }),
    useKitchenMenuCollection: (id) => {
      menuTarget = id
      return menus
    },
    useKitchenOfferingCollection: (id) => {
      offeringTarget = id
      return offerings
    },
    useLiveAsyncData: (k, read, opts) => {
      key = k
      handler = read
      options = opts
      return live
    },
    $fetch: async (request, input) => {
      events.commands.push({ request, ...input })
      return response
        ? response(request, input)
        : kind === 'website'
          ? { ok: true, kitchenId: input.body.kitchenId }
          : {
              ok: true,
              kitchen_id: input.body.kitchenId,
              offering: { id: input.body.offeringId || 'saved' },
            }
    },
  }
  const app = renderer.createApp({
    setup() {
      const path =
        kind === 'website'
          ? 'kitchen/composables/workspace/integrations/useKitchenWebsiteOrdering.ts'
          : 'kitchen/composables/offerings/useKitchenOfferings.ts'
      const name =
        kind === 'website' ? 'useKitchenWebsiteOrdering' : 'useKitchenOfferings'
      api = load(path, name, deps)[name](
        kind === 'website' ? undefined : explicit
      )
      return () => h('div')
    },
  })
  app.config.warnHandler = (warning) => events.warnings.push(warning)
  app.mount({ children: [] })
  const read = async () => {
    const originalKey = key.value
    live.pending.value = true
    live.status.value = 'pending'
    live.error.value = null
    try {
      const value = await handler(async (request, input) => {
        events.reads.push({ request, ...input })
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
      return null
    } finally {
      if (key.value === originalKey) live.pending.value = false
    }
  }
  return {
    api,
    config,
    currentUser,
    session,
    access,
    identity,
    menus,
    offerings,
    live,
    events,
    explicit,
    read,
    get menuTarget() {
      return toValue(menuTarget)
    },
    get offeringTarget() {
      return toValue(offeringTarget)
    },
    get key() {
      return key?.value
    },
    get options() {
      return options
    },
    token(fn) {
      token = fn
    },
    reply(fn) {
      response = fn
    },
    readReply(value) {
      readResponse = value
    },
    stop() {
      app.unmount()
      assert.deepEqual(events.warnings, [])
    },
  }
}
const changes = [
  [
    'same UID Auth object',
    (f) => {
      const old = f.currentUser.value
      f.currentUser.value = { uid: 'actor', getIdToken: async () => 'other' }
      f.currentUser.value = old
    },
  ],
  [
    'account',
    (f) => {
      const old = f.currentUser.value
      f.currentUser.value = null
      f.currentUser.value = old
    },
  ],
  [
    'App',
    (f) => {
      f.config.appId = 'other'
      f.config.appId = 'app'
    },
  ],
  [
    'member document',
    (f) => {
      const old = f.session.appUser.value
      f.session.appUser.value = { id: 'actor', created: { at: 2 } }
      f.session.appUser.value = old
    },
  ],
  [
    'member pending',
    (f) => {
      f.session.appPending.value = true
      f.session.appPending.value = false
    },
  ],
  [
    'member error',
    (f) => {
      f.session.appError.value = new Error('Member failed')
      f.session.appError.value = null
    },
  ],
  [
    'member outcome',
    (f) => {
      f.session.appOutcome.value = 'pending'
      f.session.appOutcome.value = 'ready'
    },
  ],
  [
    'access IDs',
    (f) => {
      f.access.ids.value = []
      f.access.ids.value = ['local', 'other']
    },
  ],
  [
    'access pending',
    (f) => {
      f.access.pending.value = true
      f.access.pending.value = false
    },
  ],
  [
    'access error',
    (f) => {
      f.access.error.value = new Error('Access failed')
      f.access.error.value = null
    },
  ],
  [
    'access outcome',
    (f) => {
      f.access.outcome.value = 'pending'
      f.access.outcome.value = 'ready'
    },
  ],
  [
    'Kitchen',
    (f) => {
      f.identity.kitchenId.value = 'other'
      f.identity.kitchenId.value = 'local'
    },
  ],
  [
    'Kitchen read',
    (f) => {
      f.identity.outcome.value = 'pending'
      f.identity.outcome.value = 'ready'
    },
  ],
  [
    'Kitchen record ID',
    (f) => {
      f.identity.selectedKitchen.value = { id: 'other' }
      f.identity.selectedKitchen.value = { id: 'local' }
    },
  ],
  [
    'write access',
    (f) => {
      f.identity.canWrite.value = false
      f.identity.canWrite.value = true
    },
  ],
  ['disposal', (f) => f.stop()],
]
const invoke = (f, guard) => f.api.update(['https://draft.test'], guard)

test('Offering reads use one exact settled local Kitchen without initializing Workspace selection and mask stale child data', () => {
  const requested = ref('local'),
    f = fixture('offering', requested)
  assert.equal(f.events.explicit[0], requested)
  assert.equal(f.menuTarget, 'local')
  assert.equal(f.offeringTarget, 'local')
  for (const [name, set, outcome] of [
    [
      'Kitchen pending',
      () => {
        f.identity.outcome.value = 'pending'
      },
      'pending',
    ],
    [
      'Kitchen failed',
      () => {
        f.identity.outcome.value = 'error'
      },
      'error',
    ],
    [
      'member pending',
      () => {
        f.identity.outcome.value = 'ready'
        f.session.appPending.value = true
      },
      'pending',
    ],
    [
      'member failed',
      () => {
        f.session.appPending.value = false
        f.session.appError.value = new Error('Failed')
      },
      'error',
    ],
    [
      'wrong member',
      () => {
        f.session.appError.value = null
        f.session.appUser.value = { id: 'other' }
      },
      'idle',
    ],
  ]) {
    set()
    assert.equal(f.menuTarget, '', name)
    assert.equal(f.offeringTarget, '', name)
    assert.equal(f.api.outcome.value, outcome, name)
    assert.equal(f.api.menusOutcome.value, outcome, name)
    assert.deepEqual(f.api.menus.value, [], name)
    assert.deepEqual(f.api.offerings.value, [], name)
    assert.equal(f.api.canWrite.value, false, name)
  }
  f.session.appUser.value = { id: 'actor' }
  assert.equal(f.menuTarget, 'local')
  f.identity.selectedKitchen.value = { id: 'other' }
  assert.equal(f.menuTarget, '')
  assert.equal(f.api.outcome.value, 'pending')
  f.identity.selectedKitchen.value = { id: 'local' }
  f.menus.outcome.value = 'error'
  f.offerings.outcome.value = 'pending'
  assert.deepEqual(f.api.menus.value, [])
  assert.deepEqual(f.api.offerings.value, [])
  f.stop()
})

test('controller owner scopes stay current through child live refresh but invalidate same-owner ABA and disposal', async () => {
  for (const kind of ['offering', 'website']) {
    const f = fixture(kind)
    if (kind === 'website') await f.read()
    const original = f.api.ownerScope.value,
      current = f.api.captureIntent()
    if (kind === 'website') {
      f.live.pending.value = true
      f.live.error.value = new Error('Refresh failed')
    } else {
      f.menus.outcome.value = 'pending'
      f.offerings.outcome.value = 'error'
    }
    assert.equal(f.api.ownerScope.value, original)
    assert.equal(current(), true)
    f.config.appId = 'other'
    f.config.appId = 'app'
    assert.notEqual(f.api.ownerScope.value, original)
    assert.equal(current(), false)
    f.stop()
    assert.equal(f.api.captureIntent()(), false)
  }
})

test('all Offering commands snapshot input and cancel delayed credentials for every actor/member/access/owner lifetime change', async () => {
  const actions = [
    ['configure', (f, guard) => f.api.configure({ menu_ids: ['food'] }, guard)],
    [
      'update',
      (f, guard) => f.api.update('service', { menu_ids: ['food'] }, guard),
    ],
    [
      'interaction',
      (f, guard) =>
        f.api.updateInteraction(
          'service',
          'collection',
          { payment: { allow_cash: true } },
          guard
        ),
    ],
  ]
  for (const [action, invoke] of actions)
    for (const [name, change] of changes) {
      const f = fixture('offering'),
        wait = deferred()
      f.token(() => wait.promise)
      const work = invoke(f),
        rejected = assert.rejects(work, /changed/)
      change(f)
      wait.resolve('original-token')
      await rejected
      assert.deepEqual(f.events.commands, [], `${action}: ${name}`)
      if (name !== 'disposal') f.stop()
    }
  const f = fixture('offering'),
    wait = deferred(),
    draft = {
      menu_ids: ['food'],
      hours: { timezone: 'Europe/Zurich', windows: [{ day: 1 }] },
    }
  f.token(() => wait.promise)
  const work = f.api.configure(draft)
  draft.menu_ids.push('other')
  draft.hours.windows[0].day = 2
  wait.resolve('token')
  await work
  assert.deepEqual(f.events.commands[0].body, {
    kitchenId: 'local',
    menu_ids: ['food'],
    hours: { timezone: 'Europe/Zurich', windows: [{ day: 1 }] },
  })
  assert.equal(f.events.commands[0].retry, 0)
  f.stop()
})

test('Offering final surface guards stop changed drafts before dispatch while committed responses remain truthful', async () => {
  for (const method of [
    (f, guard) => f.api.configure({}, guard),
    (f, guard) => f.api.update('service', { name: 'Name' }, guard),
    (f, guard) =>
      f.api.updateInteraction(
        'service',
        'collection',
        { enabled: true },
        guard
      ),
  ]) {
    const f = fixture('offering'),
      wait = deferred()
    let current = true
    f.token(() => wait.promise)
    const work = method(f, () => current),
      rejected = assert.rejects(work, /changed/)
    current = false
    wait.resolve('token')
    await rejected
    assert.deepEqual(f.events.commands, [])
    f.stop()
    const committed = fixture('offering'),
      response = deferred()
    current = true
    committed.reply(() => response.promise)
    const save = method(committed, () => current)
    await new Promise(setImmediate)
    assert.equal(committed.events.commands.length, 1)
    current = false
    committed.session.appPending.value = true
    committed.stop()
    const result = {
      ok: true,
      kitchen_id: 'local',
      offering: { id: committed.events.commands[0].body.offeringId || 'saved' },
    }
    response.resolve(result)
    assert.deepEqual(await save, result)
  }
})

test('Offering completion requires a real exact document ID and exact update target', async () => {
  for (const id of ['', ' bad ', 1, '../other', '__reserved__']) {
    const f = fixture('offering')
    f.reply(async () => ({ ok: true, kitchen_id: 'local', offering: { id } }))
    await assert.rejects(f.api.configure({}), /response did not match/)
    f.stop()
  }
  for (const method of [
    (f) => f.api.update('service', {}),
    (f) => f.api.updateInteraction('service', 'collection', {}),
    (f) => f.api.configure({ offeringId: 'service' }),
  ]) {
    const f = fixture('offering')
    f.reply(async () => ({
      ok: true,
      kitchen_id: 'local',
      offering: { id: 'other' },
    }))
    await assert.rejects(method(f), /response did not match/)
    f.stop()
  }
})

test('website live reads invalidate delayed credentials after owner/member/access ABA and disposal', async () => {
  for (const [name, change] of changes) {
    const f = fixture('website'),
      wait = deferred(),
      originalKey = f.key
    f.token(() => wait.promise)
    const work = f.read()
    change(f)
    wait.resolve('original-token')
    assert.equal(await work, null, name)
    assert.deepEqual(f.events.reads, [], name)
    assert.deepEqual(f.api.origins.value, [], name)
    assert.notEqual(f.key, originalKey, name)
    if (name !== 'disposal') f.stop()
  }
})

test('website reads mask retained origins for pending/failure/owner ABA and reject target or stored-policy mismatch', async () => {
  const f = fixture('website')
  assert.equal(f.options.server, false)
  await f.read()
  assert.deepEqual(f.api.origins.value, ['https://saved.test'])
  assert.equal(f.events.reads[0].query.kitchenId, 'local')
  f.live.pending.value = true
  assert.equal(f.api.outcome.value, 'pending')
  assert.deepEqual(f.api.origins.value, [])
  f.live.pending.value = false
  f.live.error.value = new Error('Read failed')
  f.live.status.value = 'error'
  assert.equal(f.api.outcome.value, 'error')
  assert.deepEqual(f.api.origins.value, [])
  const originalKey = f.key
  f.config.appId = 'other'
  f.config.appId = 'app'
  assert.notEqual(f.key, originalKey)
  assert.equal(f.api.outcome.value, 'pending')
  assert.deepEqual(f.api.origins.value, [])
  await f.read()
  assert.deepEqual(f.api.origins.value, ['https://saved.test'])
  for (const response of [
    { kitchenId: 'other', allowed_origins: [] },
    { kitchenId: 'local', allowed_origins: ['https://saved.test/page'] },
    null,
  ]) {
    f.readReply(response)
    await f.read()
    assert.equal(f.api.outcome.value, 'error')
    assert.deepEqual(f.api.origins.value, [])
    assert.match(f.api.error.value, /could not be loaded/)
  }
  f.stop()
})

test('website dispatched reads suppress obsolete late success and failure without publishing retained settings', async () => {
  for (const reject of [false, true]) {
    const f = fixture('website'),
      wait = deferred()
    f.readReply(() => wait.promise)
    const work = f.read()
    await new Promise(setImmediate)
    assert.equal(f.events.reads.length, 1)
    f.session.appPending.value = true
    f.session.appPending.value = false
    if (reject) wait.reject(new Error('Historical failure'))
    else
      wait.resolve({
        kitchenId: 'local',
        allowed_origins: ['https://old.test'],
      })
    assert.equal(await work, null)
    assert.deepEqual(f.api.origins.value, [])
    assert.equal(f.api.outcome.value, 'pending')
    f.stop()
  }
})

test('website command cancels owner and local intent before dispatch, validates detached origins and returns truthful committed results', async () => {
  for (const [name, change] of changes) {
    const f = fixture('website')
    await f.read()
    const wait = deferred()
    f.token(() => wait.promise)
    const work = invoke(f),
      rejected = assert.rejects(work, /changed/)
    change(f)
    wait.resolve('original-token')
    await rejected
    assert.deepEqual(f.events.commands, [], name)
    if (name !== 'disposal') f.stop()
  }
  const f = fixture('website')
  await f.read()
  const token = deferred()
  f.token(() => token.promise)
  let current = true
  const work = invoke(f, () => current),
    rejected = assert.rejects(work, /changed/)
  current = false
  token.resolve('token')
  await rejected
  assert.deepEqual(f.events.commands, [])
  f.token(async () => 'token')
  await assert.rejects(f.api.update(['https://draft.test/page']))
  assert.deepEqual(f.events.commands, [])
  const response = deferred(),
    origins = ['https://draft.test/']
  f.reply(() => response.promise)
  const committed = f.api.update(origins)
  origins[0] = 'https://changed.test'
  await new Promise(setImmediate)
  assert.deepEqual(f.events.commands[0].body, {
    kitchenId: 'local',
    allowed_origins: ['https://draft.test'],
  })
  assert.equal(f.events.commands[0].retry, 0)
  f.live.pending.value = true
  f.stop()
  const result = { ok: true, kitchenId: 'local' }
  response.resolve(result)
  assert.deepEqual(await committed, result)
  const invalid = fixture('website')
  await invalid.read()
  invalid.reply(async () => ({ ok: true, kitchenId: 'other' }))
  await assert.rejects(invoke(invalid), /response did not match/)
  invalid.stop()
})
