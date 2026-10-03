import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref, reactive, watch, onScopeDispose, effectScope, toValue, nextTick } from 'vue'
function load(path, deps, names, sfc = false) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (sfc) source = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  source = source.replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '').replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return {${names}}`, Object.keys(deps))(...Object.values(deps))
}
const deferred = () => { let resolve; const promise = new Promise(r => resolve = r); return { promise, resolve } }
const base = '../../runtime/kitchen/'

test('explicit Kitchen identity gates local reads by access without initializing Workspace selection', () => {
  const ids = ref(['a']), accessOutcome = ref('ready'), currentUser = ref({ uid: 'actor' }), requested = ref('a')
  let workspaceCalls = 0
  const { useKitchenWorkspaceIdentity } = load(base + 'composables/workspace/identity/useKitchenWorkspaceIdentity.ts', {
    computed, toValue, normalizeString: x => String(x || ''),
    useKitchenAccess: () => ({ ids, outcome: accessOutcome }), useAuth: () => ({ currentUser }),
    useKitchenWorkspace: () => { workspaceCalls++; return { id: ref('workspace'), data: ref({}), outcome: ref('ready'), crud: { update() {} } } },
    useKitchenRead: id => ({ kitchen: computed(() => id.value ? { id: id.value } : null), place: ref(null), outcome: computed(() => id.value ? 'ready' : 'idle') }),
    useKitchenInterface: () => ({ surface: ({ kitchen }) => kitchen }), useKitchenUpdate: () => ({ updateKitchen() {} }),
  }, 'useKitchenWorkspaceIdentity')
  const local = useKitchenWorkspaceIdentity(requested)
  assert.equal(local.kitchenId.value, 'a'); assert.equal(local.canWrite.value, true); assert.equal(workspaceCalls, 0)
  accessOutcome.value = 'idle'; assert.equal(local.kitchenId.value, ''); assert.equal(local.outcome.value, 'pending'); accessOutcome.value = 'ready'
  requested.value = 'forged'; assert.equal(local.kitchenId.value, ''); assert.equal(local.selectedKitchen.value, null)
  accessOutcome.value = 'error'; assert.equal(local.outcome.value, 'error'); assert.equal(local.canWrite.value, false)
  requested.value = 'a'; ids.value = []; currentUser.value = null; assert.equal(local.canWrite.value, false)
  useKitchenWorkspaceIdentity(); assert.equal(workspaceCalls, 1)
})
function commandHarness() {
  const scope = effectScope(), token = deferred(), response = deferred(), calls = []
  const actor = { uid: 'a', getIdToken: () => token.promise }, currentUser = ref(actor), kitchenId = ref('local'), canWrite = ref(true)
  const config = reactive({ appId: 'app' })
  const { useKitchenServices } = load(base + 'composables/services/useKitchenServices.ts', {
    computed, watch, onScopeDispose, useFireUXConfig: () => config, useAuth: () => ({ currentUser }),
    useKitchenWorkspaceIdentity: explicit => { assert.equal(toValue(explicit), 'local'); return { kitchenId, canWrite, selectedKitchen: ref({ services: [] }) } },
    useKitchenWorkspacePlace: () => ({ place: ref({ timezone: 'Europe/Zurich' }), placeOutcome: ref('ready') }),
    useKitchenMenuCollection: () => ({ menus: ref([]), pending: ref(false), outcome: ref('empty') }),
    readKitchenServices: x => x, $fetch: (...args) => { calls.push(args); return response.promise },
  }, 'useKitchenServices')
  const api = scope.run(() => useKitchenServices(ref('local')))
  return { api, scope, token, response, calls, actor, currentUser, kitchenId, canWrite, config }
}
test('service saves capture input and use explicit Kitchen rather than Workspace context', async () => {
  const h = commandHarness(), draft = { menu_ids: ['food'] }, save = h.api.configure(draft)
  draft.menu_ids.push('other')
  h.token.resolve('token'); await Promise.resolve()
  assert.equal(h.calls[0][0], '/api/workspace/kitchen/services/configure')
  assert.deepEqual(h.calls[0][1].body, { kitchenId: 'local', menu_ids: ['food'] })
  h.response.resolve({ ok: true, service: { id: 'saved' } }); assert.equal((await save).service.id, 'saved'); h.scope.stop()
})
test('account, Kitchen, App round trips and disposal invalidate delayed credentials', async () => {
  for (const change of ['account', 'logout', 'kitchen', 'app', 'access', 'dispose']) {
    const h = commandHarness(), save = h.api.configure({}), rejected = assert.rejects(save, /changed/)
    if (change === 'account' || change === 'logout') { h.currentUser.value = change === 'logout' ? null : { uid: 'b' }; h.currentUser.value = h.actor }
    if (change === 'kitchen') { h.kitchenId.value = 'b'; h.kitchenId.value = 'local' }
    if (change === 'app') { h.config.appId = 'b'; h.config.appId = 'app' }
    if (change === 'access') { h.canWrite.value = false; h.canWrite.value = true }
    if (change === 'dispose') h.scope.stop()
    h.token.resolve('token'); await rejected; assert.equal(h.calls.length, 0); h.scope.stop()
  }
})
test('obsolete server success cannot complete a different setup scope', async () => {
  const h = commandHarness(), save = h.api.configure({}), rejected = assert.rejects(save, /changed/)
  h.token.resolve('token'); await Promise.resolve(); assert.equal(h.calls.length, 1)
  h.kitchenId.value = 'b'; h.kitchenId.value = 'local'
  h.response.resolve({ ok: true, service: {} }); await rejected; h.scope.stop()
})
test('shared setup changes Workspace selection only on an authorized explicit handoff and closes drafts on scope changes', () => {
  const scope = effectScope(), kitchenId = ref('local'), canWrite = ref(true), currentUser = ref({ uid: 'a' }), calls = []
  const state = scope.run(() => load(base + 'components/Ordering/Setup.vue', {
    computed, ref, watch, defineProps: () => ({ kitchenId: 'local' }),
    useKitchenServices: () => ({ kitchenId, canWrite, services: ref([]), menus: ref([]), menusOutcome: ref('ready'), selectedKitchen: ref({}), outcome: ref('ready'), name: ref('Local'), timezone: ref('Europe/Zurich'), configure() {} }),
    useAuth: () => ({ currentUser }), useWorkspace: () => ({ select: id => calls.push(['select', id]) }),
    useWorkspaceEntryCta: () => ({ workspaceEntryPath: ref('/workspace/kitchen') }),
    kitchenServiceOptions: [], servicesForOption: () => [], serviceSetupSummary: () => ({}),
    navigateTo: path => calls.push(['route', path]),
  }, 'openSetup,openWorkspace,setupOpen', true))
  assert.deepEqual(calls, [])
  state.openSetup({ key: 'collection' }); assert.equal(state.setupOpen.value, true)
  currentUser.value = { uid: 'b' }; assert.equal(state.setupOpen.value, false)
  state.openWorkspace('/workspace/kitchen/orders'); assert.deepEqual(calls, [['select', 'local'], ['route', '/workspace/kitchen/orders']])
  const child = readFileSync(new URL(base + 'components/Workspace/Services/CustomerLinks.vue', import.meta.url), 'utf8')
  const parent = readFileSync(new URL(base + 'components/Ordering/Setup.vue', import.meta.url), 'utf8')
  assert.match(parent, /:open-workspace="openWorkspace"/)
  // Exercise each actual child click expression with a different saved Workspace Kitchen.
  let globalKitchen = 'baren'
  for (const label of ['Add a website button', 'Delivery & payment settings']) {
    const button = child.match(new RegExp('<UButton\\s+([^>]*label="' + label + '"[^>]*)/>'))?.[1]
    assert.ok(button, label)
    assert.match(button, /:to="openWorkspace \? undefined/)
    const expression = button.match(/@click="([^"]+)"/)[1]
    const before = calls.length
    compileFunction(expression, ['openWorkspace'])(state.openWorkspace)
    assert.equal(calls[before][0], 'select')
    globalKitchen = calls[before][1]
    assert.equal(globalKitchen, 'local')
    assert.equal(calls[before + 1][0], 'route')
  }
  const beforeDenied = calls.length
  canWrite.value = false; state.openWorkspace('/workspace/kitchen/orders'); assert.equal(calls.length, beforeDenied)
  scope.stop()
})
test('both entrances consume the same Kitchen workflow; verification remains explicit and cancel is local', () => {
  const app = readFileSync(new URL('../../../../../../projects/misebox/misebox-app/app/components/OrderingSetup/Index.vue', import.meta.url), 'utf8').split('<!-- Temporarily parked:')[0]
  const workspace = readFileSync(new URL(base + 'components/Workspace/Integrations/Index.vue', import.meta.url), 'utf8')
  const setup = readFileSync(new URL(base + 'components/Ordering/Setup.vue', import.meta.url), 'utf8')
  assert.match(app, /KitchenOrderingSetup/); assert.match(workspace, /KitchenOrderingSetup/)
  assert.match(setup, />Unverified</); assert.match(setup, /@click="setupOpen = false"/)
  assert.doesNotMatch(app, /selectedMenuId|Service and ordering configuration\s+come next/)
})

test('existing Service form cancellation writes nothing and an unmounted save cannot emit completion', async () => {
  for (const submitFirst of [false, true]) {
    const response = deferred(), disposals = [], events = [], calls = []
    const state = load(base + 'components/Workspace/Services/Setup.vue', {
      computed, ref, onBeforeUnmount: callback => disposals.push(callback),
      defineProps: () => ({ option: { key: 'collection', label: 'Collection', types: ['collection'] }, service: { id: 's', name: 'Pickup', enabled: true, menu_ids: ['m'], hours: { timezone: 'Europe/Zurich' }, interactions: [{ type: 'collection', enabled: true }] }, menus: [{ id: 'm', name: 'Food', status: 'published' }], menusOutcome: 'ready', timezone: 'Europe/Zurich', save: input => { calls.push(input); return response.promise } }),
      defineEmits: () => event => events.push(event),
      serviceOptionEnabled: () => true, formatWeekdayTimeText: () => 'Tuesday 12:00 - 20:00',
      parseWeekdayTimeText: () => ({ timezone: 'Europe/Zurich', windows: [{}] }),
      kitchenOrderTypeLabel: type => type,
    }, 'submit', true)
    const save = submitFirst ? state.submit() : undefined
    disposals.forEach(callback => callback())
    response.resolve({ ok: true }); await save
    assert.equal(calls.length, submitFirst ? 1 : 0)
    assert.deepEqual(events, [])
  }
})


test('actual onboarding and collection path never reconcile local setup; the actual Workspace index still does', async () => {
  for (const initial of ['', 'previous']) {
    const scope = effectScope(), cookieWrites = [], states = new Map(), cookies = new Map()
    const useState = (key, init) => { if (!states.has(key)) states.set(key, ref(init())); return states.get(key) }
    const useCookie = (key, options) => {
      if (!cookies.has(key)) {
        const value = ref(initial || options.default())
        cookies.set(key, computed({ get: () => value.value, set: next => { cookieWrites.push(next); value.value = next } }))
      }
      return cookies.get(key)
    }
    const useFireUXConfig = () => ({ appId: 'app' })
    const { useWorkspace } = load('../../../../../core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspace.ts', { computed, useState, useCookie, useFireUXConfig, normalizeString: x => String(x || '').trim() }, 'useWorkspace')
    const ids = ref(['a']), records = ref([{ id: 'a' }]), app = { uid: ref('actor'), pending: ref(false), error: ref(null), appUser: ref({}) }
    const { useKitchenWorkspaceKitchens } = load(base + 'composables/workspace/useKitchenWorkspaceKitchens.ts', {
      computed, toValue,
      useKitchenAccess: () => ({ ids, pending: ref(false), error: ref(null) }),
      useKitchenInterface: () => ({ surface: ({ kitchen }) => kitchen }),
      useFirestoreRead: () => ({ firestoreLoadDocsByIds: input => ({ docs: computed(() => input.collectionPath === 'kitchens' ? records.value.filter(row => input.ids.value.includes(row.id)) : []), outcome: ref('ready'), error: ref(null) }) }),
    }, 'useKitchenWorkspaceKitchens')
    const route = { path: '/services/ordering/setup', query: {}, matched: [] }, events = []
    const router = { getRoutes: () => [], push: async path => events.push(['route', path]) }
    const { useKitchenWorkspaceIndex } = load(base + 'composables/workspace/useKitchenWorkspaceIndex.ts', { computed, watch, useState, useRoute: () => route, useRouter: () => router, navigateTo() {}, useFireUXConfig, useWorkspace, useKitchenWorkspaceKitchens, useAppSession: () => app, resolveAppUserAccess: () => ({}), kitchenWorkspaceSwitchPath: () => undefined }, 'useKitchenWorkspaceIndex')
    const { useKitchenOnboarding } = load(base + 'composables/useKitchenOnboarding.ts', { computed, ref, watch, useWorkspace, useKitchenWorkspaceKitchens, useKitchenCreate: () => ({}), useOnboarding: () => ({ reset() {} }), useAppSession: () => app, useRoute: () => route, useRouter: () => router }, 'useKitchenOnboarding')
    const flow = scope.run(() => useKitchenOnboarding({ selectWorkspace: () => false, returnTo: () => route.path, onCreated: result => events.push(['created', result]), onError: message => { throw new Error(message) } }))
    assert.equal(useWorkspace('kitchen').selectedId.value, initial)
    assert.deepEqual(cookieWrites, [])
    ids.value = ['c']; records.value = [{ id: 'c' }]; await nextTick()
    assert.equal(useWorkspace('kitchen').selectedId.value, initial)
    await flow.finishSelection({ kitchen_id: 'c', owner_user_id: 'actor' })
    assert.equal(useWorkspace('kitchen').selectedId.value, initial); assert.deepEqual(cookieWrites, [])
    assert.equal(events.length, 1)
    scope.run(() => useKitchenWorkspaceIndex())
    assert.equal(useWorkspace('kitchen').selectedId.value, 'c')
    assert.deepEqual(cookieWrites, ['c'])
    scope.stop()
  }
})

test('App completion event waits for live access locally and rejects obsolete actor/membership callbacks', () => {
  const currentUser = ref({ uid: 'a' }), appUser = ref({ created: { at: 1 } }), config = reactive({ appId: 'app' })
  const access = { ids: ref([]), outcome: ref('ready') }
  const kitchens = { kitchens: ref([]), outcome: ref('ready') }
  const scope = effectScope()
  const app = scope.run(() => load('../../../../../../projects/misebox/misebox-app/app/components/OrderingSetup/Index.vue', {
    computed, ref, watch, useAuth: () => ({ currentUser }), useKitchenAccess: () => access,
    useKitchenWorkspaceKitchens: () => kitchens, useAppSession: () => ({ appUser }), useFireUXConfig: () => config,
  }, 'onKitchenCreated, pendingKitchenId, selectedKitchenId, onboardingKey, chooseKitchen', true))
  const result = { ok: true, kitchen_id: 'k', owner_user_id: 'a' }
  app.onKitchenCreated.value(result)
  assert.equal(app.pendingKitchenId.value, 'k'); assert.equal(app.selectedKitchenId.value, '')
  kitchens.kitchens.value = [{ id: 'k' }]
  assert.equal(app.selectedKitchenId.value, '')
  access.ids.value = ['k']
  assert.equal(app.selectedKitchenId.value, 'k'); assert.equal(app.pendingKitchenId.value, '')
  const old = app.onKitchenCreated.value
  currentUser.value = null; currentUser.value = { uid: 'a' }
  old(result); assert.equal(app.pendingKitchenId.value, ''); assert.equal(app.selectedKitchenId.value, '')
  const priorMembership = app.onKitchenCreated.value
  appUser.value = { created: { at: 2 } }
  priorMembership(result); assert.equal(app.pendingKitchenId.value, '')
  app.onKitchenCreated.value({ ...result, owner_user_id: 'other' }); assert.equal(app.pendingKitchenId.value, '')
  access.ids.value = []; app.onKitchenCreated.value(result)
  config.appId = 'other'; config.appId = 'app'
  access.ids.value = ['k']; assert.equal(app.selectedKitchenId.value, '')
  // A pending completion cannot supersede a later explicit choice of B.
  access.ids.value = ['b']; kitchens.kitchens.value = [{ id: 'b' }]
  app.onKitchenCreated.value(result)
  app.chooseKitchen('b')
  access.ids.value = ['b', 'k']; kitchens.kitchens.value = [{ id: 'b' }, { id: 'k' }]
  assert.equal(app.selectedKitchenId.value, 'b'); assert.equal(app.pendingKitchenId.value, '')
  // Dismissal invalidates an already-captured completion callback too.
  const dismissedCompletion = app.onKitchenCreated.value
  app.chooseKitchen()
  dismissedCompletion(result)
  assert.equal(app.selectedKitchenId.value, ''); assert.equal(app.pendingKitchenId.value, '')
  scope.stop()
})

test('contribution management preview keeps its result on failure, retries, and respects dismissal', async () => {
  const source = readFileSync(new URL(base + 'components/Onboarding.vue', import.meta.url), 'utf8')
  assert.match(source, /:error="selectionError"/)
  const body = source.match(/async function associateContribution\(\) \{([\s\S]*?)\n\}\n\nasync function loadRouteSelection/)[1]
  const saved = { kitchen_id: 'k', created_root: true }
  const directoryResult = ref(saved), associating = ref(false), selectionPending = ref(false)
  let response = deferred()
  const call = compileFunction(`return async function(){${body}}`, ['directoryResult', 'associating', 'selectionPending', 'selectKitchen'])(directoryResult, associating, selectionPending, () => response.promise)
  let waiting = call(); assert.equal(directoryResult.value.kitchen_id, 'k')
  response.resolve(false); await waiting
  assert.equal(directoryResult.value.kitchen_id, 'k'); assert.equal(associating.value, false)
  response = deferred(); waiting = call(); response.resolve(true); await waiting
  assert.equal(directoryResult.value, null)
  directoryResult.value = saved; response = deferred(); waiting = call()
  directoryResult.value = null; associating.value = false
  response.resolve(false); await waiting
  assert.equal(directoryResult.value, null); assert.equal(associating.value, false)
})
