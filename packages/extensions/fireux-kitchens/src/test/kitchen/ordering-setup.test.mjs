import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  computed,
  ref,
  reactive,
  watch,
  onScopeDispose,
  effectScope,
  toValue,
  nextTick,
} from 'vue'
function load(path, deps, names, sfc = false) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (sfc)
    source = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const deferred = () => {
  let resolve
  const promise = new Promise((r) => (resolve = r))
  return { promise, resolve }
}
const base = '../../runtime/kitchen/'
const { useCommandScope } = load(
  '../../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  { watch, onScopeDispose },
  'useCommandScope'
)

test('explicit Kitchen identity gates local reads by access without initializing Workspace selection', () => {
  const ids = ref(['a']),
    accessOutcome = ref('ready'),
    currentUser = ref({ uid: 'actor' }),
    requested = ref('a')
  let workspaceCalls = 0
  const { useKitchenWorkspaceIdentity } = load(
    base + 'composables/workspace/identity/useKitchenWorkspaceIdentity.ts',
    {
      computed,
      toValue,
      normalizeString: (x) => String(x || ''),
      useKitchenAccess: () => ({ ids, outcome: accessOutcome }),
      useAuth: () => ({ currentUser }),
      useKitchenWorkspace: () => {
        workspaceCalls++
        return {
          id: ref('workspace'),
          data: ref({}),
          outcome: ref('ready'),
          crud: { update() {} },
        }
      },
      useKitchenRead: (id) => ({
        kitchen: computed(() => (id.value ? { id: id.value } : null)),
        place: ref(null),
        outcome: computed(() => (id.value ? 'ready' : 'idle')),
      }),
      useKitchenInterface: () => ({ surface: ({ kitchen }) => kitchen }),
      useKitchenUpdate: () => ({ updateKitchen() {} }),
    },
    'useKitchenWorkspaceIdentity'
  )
  const local = useKitchenWorkspaceIdentity(requested)
  assert.equal(local.kitchenId.value, 'a')
  assert.equal(local.canWrite.value, true)
  assert.equal(workspaceCalls, 0)
  accessOutcome.value = 'idle'
  assert.equal(local.kitchenId.value, '')
  assert.equal(local.outcome.value, 'pending')
  accessOutcome.value = 'ready'
  requested.value = 'forged'
  assert.equal(local.kitchenId.value, '')
  assert.equal(local.selectedKitchen.value, null)
  accessOutcome.value = 'error'
  assert.equal(local.outcome.value, 'error')
  assert.equal(local.canWrite.value, false)
  requested.value = 'a'
  ids.value = []
  currentUser.value = null
  assert.equal(local.canWrite.value, false)
  useKitchenWorkspaceIdentity()
  assert.equal(workspaceCalls, 1)
})
function commandHarness() {
  const scope = effectScope(),
    token = deferred(),
    response = deferred(),
    calls = []
  const actor = { uid: 'a', getIdToken: () => token.promise },
    currentUser = ref(actor),
    kitchenId = ref('local'),
    canWrite = ref(true)
  const config = reactive({ appId: 'app' })
  const { useKitchenOfferings } = load(
    base + 'composables/offerings/useKitchenOfferings.ts',
    {
      computed,
      ref,
      toValue,
      watch,
      onScopeDispose,
      useCommandScope,
      useUserSession: () => ({
        appUser: ref({ id: 'a', created: { at: 'one' } }),
        appPending: ref(false),
        appError: ref(null),
        appOutcome: ref('ready'),
      }),
      useKitchenAccess: () => ({
        ids: ref(['local']),
        pending: ref(false),
        error: ref(null),
        outcome: ref('ready'),
      }),
      isFirestoreDocumentId: (value) =>
        typeof value === 'string' && Boolean(value) && !value.includes('/'),
      useFireUXConfig: () => config,
      useAuth: () => ({ currentUser }),
      useKitchenWorkspaceIdentity: (explicit) => {
        assert.equal(toValue(explicit), 'local')
        return {
          kitchenId,
          canWrite,
          selectedKitchen: ref({ id: 'local' }),
          outcome: ref('ready'),
        }
      },
      useKitchenWorkspacePlace: () => ({
        place: ref({ timezone: 'Europe/Zurich' }),
        placeOutcome: ref('ready'),
      }),
      useKitchenMenuCollection: () => ({
        menus: ref([]),
        pending: ref(false),
        outcome: ref('empty'),
      }),
      useKitchenOfferingCollection: () => ({
        offerings: ref([]),
        outcome: ref('empty'),
        error: ref(null),
      }),
      $fetch: (...args) => {
        calls.push(args)
        return response.promise
      },
    },
    'useKitchenOfferings'
  )
  const api = scope.run(() => useKitchenOfferings(ref('local')))
  return {
    api,
    scope,
    token,
    response,
    calls,
    actor,
    currentUser,
    kitchenId,
    canWrite,
    config,
  }
}
test('service saves capture input and use explicit Kitchen rather than Workspace context', async () => {
  const h = commandHarness(),
    draft = { menu_ids: ['food'] },
    save = h.api.configure(draft)
  draft.menu_ids.push('other')
  h.token.resolve('token')
  await Promise.resolve()
  assert.equal(h.calls[0][0], '/api/workspace/kitchen/services/configure')
  assert.deepEqual(h.calls[0][1].body, {
    kitchenId: 'local',
    menu_ids: ['food'],
  })
  h.response.resolve({
    ok: true,
    kitchen_id: 'local',
    offering: { id: 'saved' },
  })
  assert.equal((await save).offering.id, 'saved')
  h.scope.stop()
})
test('account, Kitchen, App round trips and disposal invalidate delayed credentials', async () => {
  for (const change of [
    'account',
    'logout',
    'kitchen',
    'app',
    'access',
    'dispose',
  ]) {
    const h = commandHarness(),
      save = h.api.configure({}),
      rejected = assert.rejects(save, /changed/)
    if (change === 'account' || change === 'logout') {
      h.currentUser.value = change === 'logout' ? null : { uid: 'b' }
      h.currentUser.value = h.actor
    }
    if (change === 'kitchen') {
      h.kitchenId.value = 'b'
      h.kitchenId.value = 'local'
    }
    if (change === 'app') {
      h.config.appId = 'b'
      h.config.appId = 'app'
    }
    if (change === 'access') {
      h.canWrite.value = false
      h.canWrite.value = true
    }
    if (change === 'dispose') h.scope.stop()
    h.token.resolve('token')
    await rejected
    assert.equal(h.calls.length, 0)
    h.scope.stop()
  }
})
test('proved server success remains truthful after the setup scope changes', async () => {
  const h = commandHarness(),
    save = h.api.configure({})
  h.token.resolve('token')
  await Promise.resolve()
  assert.equal(h.calls.length, 1)
  h.kitchenId.value = 'b'
  h.kitchenId.value = 'local'
  h.response.resolve({
    ok: true,
    kitchen_id: 'local',
    offering: { id: 'saved' },
  })
  assert.equal((await save).offering.id, 'saved')
  h.scope.stop()
})
test('existing Offering form cancellation writes nothing and an unmounted save cannot emit completion', async () => {
  for (const submitFirst of [false, true]) {
    const response = deferred(),
      scope = effectScope(),
      events = [],
      calls = []
    const state = scope.run(() =>
      load(
        base + 'components/Workspace/Offerings/Setup.vue',
        {
          computed,
          ref,
          watch,
          useCommandScope,
          defineProps: () => ({
            kitchenId: 'local',
            option: {
              key: 'collection',
              label: 'Collection',
              types: ['collection'],
            },
            offering: {
              id: 's',
              name: 'Pickup',
              enabled: true,
              menu_ids: ['m'],
              hours: { timezone: 'Europe/Zurich' },
              interactions: [{ type: 'collection', enabled: true }],
            },
            menus: [{ id: 'm', name: 'Food', status: 'published' }],
            menusOutcome: 'ready',
            timezone: 'Europe/Zurich',
            save: (input) => {
              calls.push(input)
              return response.promise
            },
          }),
          defineEmits: () => (event) => events.push(event),
          offeringOptionEnabled: () => true,
          formatWeekdayTimeText: () => 'Tuesday 12:00 - 20:00',
          parseWeekdayTimeText: () => ({
            timezone: 'Europe/Zurich',
            windows: [{}],
          }),
          kitchenOrderTypeLabel: (type) => type,
        },
        'submit',
        true
      )
    )
    const save = submitFirst ? state.submit() : undefined
    scope.stop()
    response.resolve({ ok: true })
    await save
    assert.equal(calls.length, submitFirst ? 1 : 0)
    assert.deepEqual(events, [])
  }
})

test('actual onboarding and collection path never reconcile local setup; the actual Workspace index still does', async () => {
  for (const initial of ['', 'previous']) {
    const scope = effectScope(),
      cookieWrites = [],
      states = new Map(),
      cookies = new Map()
    const useState = (key, init) => {
      if (!states.has(key)) states.set(key, ref(init()))
      return states.get(key)
    }
    const useCookie = (key, options) => {
      if (!cookies.has(key)) {
        const value = ref(initial || options.default())
        cookies.set(
          key,
          computed({
            get: () => value.value,
            set: (next) => {
              cookieWrites.push(next)
              value.value = next
            },
          })
        )
      }
      return cookies.get(key)
    }
    const useFireUXConfig = () => ({ appId: 'app' })
    const { useWorkspace } = load(
      '../../../../../core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspace.ts',
      {
        computed,
        useState,
        useCookie,
        useFireUXConfig,
        normalizeString: (x) => String(x || '').trim(),
      },
      'useWorkspace'
    )
    const ids = ref(['a']),
      records = ref([{ id: 'a' }]),
      app = {
        uid: ref('actor'),
        pending: ref(false),
        error: ref(null),
        appUser: ref({}),
      }
    const { useKitchenWorkspaceKitchens } = load(
      base + 'composables/workspace/useKitchenWorkspaceKitchens.ts',
      {
        computed,
        toValue,
        useKitchenAccess: () => ({
          ids,
          pending: ref(false),
          error: ref(null),
        }),
        useKitchenInterface: () => ({ surface: ({ kitchen }) => kitchen }),
        useFirestoreRead: () => ({
          firestoreLoadDocsByIds: (input) => ({
            docs: computed(() =>
              input.collectionPath === 'kitchens'
                ? records.value.filter((row) =>
                    input.ids.value.includes(row.id)
                  )
                : []
            ),
            outcome: ref('ready'),
            error: ref(null),
          }),
        }),
      },
      'useKitchenWorkspaceKitchens'
    )
    const route = {
        path: '/services/ordering/setup',
        meta: {},
        query: {},
        matched: [],
      },
      events = []
    const router = {
      getRoutes: () => [],
      push: async (path) => events.push(['route', path]),
    }
    const { useKitchenWorkspaceIndex } = load(
      base + 'composables/workspace/useKitchenWorkspaceIndex.ts',
      {
        useCommandScope,
        computed,
        watch,
        useWorkspaceEntryCta: () => ({
          workspaceEntryPath: ref('/workspace/kitchen'),
        }),
        useState,
        useRoute: () => route,
        useRouter: () => router,
        navigateTo() {},
        useFireUXConfig,
        useWorkspace,
        useKitchenWorkspaceKitchens,
        useAppSession: () => app,
        resolveAppUserAccess: () => ({}),
        kitchenWorkspaceSwitchPath: () => undefined,
      },
      'useKitchenWorkspaceIndex'
    )
    const { useKitchenOnboarding } = load(
      base + 'composables/useKitchenOnboarding.ts',
      {
        computed,
        ref,
        watch,
        onScopeDispose,
        useCommandScope,
        useFireUXConfig,
        useWorkspace,
        useKitchenWorkspaceKitchens,
        useKitchenCreate: () => ({}),
        useOnboarding: () => ({ reset() {} }),
        useAppSession: () => app,
        useRoute: () => route,
        useRouter: () => router,
      },
      'useKitchenOnboarding'
    )
    const flow = scope.run(() =>
      useKitchenOnboarding({
        selectWorkspace: () => false,
        returnTo: () => route.path,
        onCreated: (result) => events.push(['created', result]),
        onError: (message) => {
          throw new Error(message)
        },
      })
    )
    assert.equal(useWorkspace('kitchen').selectedId.value, initial)
    assert.deepEqual(cookieWrites, [])
    ids.value = ['c']
    records.value = [{ id: 'c' }]
    await nextTick()
    assert.equal(useWorkspace('kitchen').selectedId.value, initial)
    await flow.finishSelection({ kitchen_id: 'c', owner_user_id: 'actor' })
    assert.equal(useWorkspace('kitchen').selectedId.value, initial)
    assert.deepEqual(cookieWrites, [])
    assert.equal(events.length, 1)
    scope.run(() => useKitchenWorkspaceIndex())
    assert.equal(useWorkspace('kitchen').selectedId.value, 'c')
    assert.deepEqual(cookieWrites, ['c'])
    scope.stop()
  }
})

test('contribution management preview keeps its result on failure, retries, and respects dismissal', async () => {
  const source = readFileSync(
    new URL(base + 'components/Onboarding/Index.vue', import.meta.url),
    'utf8'
  )
  assert.match(source, /:error="selectionError"/)
  const body = source.match(
    /async function associateContribution\(\) \{([\s\S]*?)\n\}\n\nasync function loadRouteSelection/
  )[1]
  const saved = { kitchen_id: 'k', created_root: true }
  const directoryResult = ref(saved),
    associating = ref(false),
    selectionPending = ref(false)
  let response = deferred()
  const call = compileFunction(`return async function(){${body}}`, [
    'directoryResult',
    'associating',
    'selectionPending',
    'selectKitchen',
  ])(directoryResult, associating, selectionPending, () => response.promise)
  let waiting = call()
  assert.equal(directoryResult.value.kitchen_id, 'k')
  response.resolve(false)
  await waiting
  assert.equal(directoryResult.value.kitchen_id, 'k')
  assert.equal(associating.value, false)
  response = deferred()
  waiting = call()
  response.resolve(true)
  await waiting
  assert.equal(directoryResult.value, null)
  directoryResult.value = saved
  response = deferred()
  waiting = call()
  directoryResult.value = null
  associating.value = false
  response.resolve(false)
  await waiting
  assert.equal(directoryResult.value, null)
  assert.equal(associating.value, false)
})

test('Fulfilment reads follow the explicit setup Kitchen while the Workspace remains on another Kitchen', () => {
  const requested = ref('setup'),
    workspaceKitchen = ref('workspace'),
    allowed = ref(true)
  const outcome = ref('ready'),
    data = ref({ payment_methods: ['cash'], delivery_zones: [] })
  const paths = [],
    identityRequests = []
  const { useKitchenFulfilment } = load(
    base + 'composables/workspace/fulfilment/useKitchenFulfilment.ts',
    {
      computed,
      useKitchenWorkspaceIdentity: (explicit) => {
        identityRequests.push(explicit)
        const kitchenId = computed(() =>
          allowed.value
            ? String(
                explicit === undefined
                  ? workspaceKitchen.value
                  : toValue(explicit)
              )
            : ''
        )
        return {
          kitchenId,
          selectedKitchen: computed(() =>
            kitchenId.value ? { id: kitchenId.value } : null
          ),
          canWrite: allowed,
          outcome: ref('ready'),
        }
      },
      useFirestoreRead: () => ({
        firestoreFetchDoc: (path, id) => {
          paths.push({ path, id })
          const source = computed(() =>
            path.value && outcome.value === 'ready' ? data.value : undefined
          )
          source.pending = computed(() => outcome.value === 'pending')
          source.error = ref(null)
          source.outcome = computed(() => (path.value ? outcome.value : 'idle'))
          return source
        },
      }),
      readKitchenFulfilmentConfig: (value) =>
        value || { payment_methods: [], delivery_zones: [] },
    },
    'useKitchenFulfilment'
  )
  const local = useKitchenFulfilment(requested)
  assert.equal(paths[0].path.value, 'kitchens/setup/fulfilment')
  assert.equal(paths[0].id, 'policy')
  assert.deepEqual(local.fulfilment.value.payment_methods, ['cash'])
  requested.value = 'another'
  assert.equal(paths[0].path.value, 'kitchens/another/fulfilment')
  assert.equal(workspaceKitchen.value, 'workspace')
  outcome.value = 'pending'
  assert.deepEqual(local.fulfilment.value.payment_methods, [])
  assert.equal(local.pending.value, true)
  assert.equal(local.canWrite.value, false)
  outcome.value = 'missing'
  assert.deepEqual(local.fulfilment.value.payment_methods, [])
  assert.equal(local.canWrite.value, true)
  allowed.value = false
  assert.equal(paths[0].path.value, '')
  assert.equal(local.canWrite.value, false)
  allowed.value = true
  useKitchenFulfilment()
  assert.equal(paths[1].path.value, 'kitchens/workspace/fulfilment')
  assert.equal(identityRequests[1], undefined)
})

test('Payment summary uses setup Kitchen currency and its edit action performs the supplied handoff', () => {
  const props = reactive({
    kitchenId: 'setup',
    config: {
      type: 'collection',
      fulfilment: { deposit: { type: 'fixed', amount: 10 } },
    },
  })
  const state = load(
    base + 'components/Workspace/Offerings/Payment.vue',
    {
      computed,
      defineProps: () => props,
      useKitchenFulfilment: (explicit) => ({
        selectedKitchen: computed(() => ({
          id: toValue(explicit),
          currency_code: toValue(explicit) === 'setup' ? 'GBP' : 'CHF',
        })),
        fulfilment: computed(() => ({
          payment_methods: [
            {
              method: toValue(explicit) === 'setup' ? 'cash' : 'online_card',
              order_types: ['collection'],
            },
          ],
        })),
        pending: ref(false),
        error: ref(null),
        outcome: ref('ready'),
      }),
      kitchenPaymentMethodsForOrderType: (config, type) =>
        config.payment_methods
          .filter((m) => m.order_types.includes(type))
          .map((m) => m.method),
    },
    'methodsLabel,depositLabel',
    true
  )
  assert.equal(state.methodsLabel.value, 'Cash')
  assert.match(state.depositLabel.value, /GBP|£/)
  props.kitchenId = 'other'
  assert.equal(state.methodsLabel.value, 'Online card')
  assert.match(state.depositLabel.value, /CHF/)
  const source = readFileSync(
    new URL(
      base + 'components/Workspace/Offerings/Payment.vue',
      import.meta.url
    ),
    'utf8'
  )
  const expression = source.match(/@click="([^"]+)"/)[1]
  const events = []
  let selectedWorkspace = 'other'
  compileFunction(expression, ['openWorkspace'])((path) => {
    selectedWorkspace = 'setup'
    events.push(path)
  })
  assert.equal(selectedWorkspace, 'setup')
  assert.deepEqual(events, ['/workspace/kitchen/identity/payments'])
  assert.match(source, /:to="openWorkspace \? undefined/)
  assert.match(source, /outcome === 'pending'/)
  assert.match(source, /!selectedKitchen/)
  for (const path of [
    'components/Workspace/Offerings/Index.vue',
    'components/Workspace/Offerings/Setup.vue',
    'components/Workspace/Offerings/Interaction.vue',
  ])
    assert.match(
      readFileSync(new URL(base + path, import.meta.url), 'utf8'),
      /:kitchen-id="kitchenId"/
    )
  assert.match(
    readFileSync(
      new URL(
        base + 'components/Workspace/Offerings/Setup.vue',
        import.meta.url
      ),
      'utf8'
    ),
    /:open-workspace="openWorkspace"/
  )
})
