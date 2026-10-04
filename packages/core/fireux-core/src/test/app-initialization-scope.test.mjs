import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, reactive, watch, onScopeDispose, effectScope } from 'vue'

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replaceAll('import.meta.client', 'true')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return ${name}`, Object.keys(dependencies))(...Object.values(dependencies))
}
const useCommandScope = load('../runtime/composables/fireux/commands/useCommandScope.ts', 'useCommandScope', { watch, onScopeDispose })
const deferred = () => Promise.withResolvers()
const initialized = { appCreated: true, membershipCreated: false, membershipUpdated: false }
function initializationHarness(options = {}) {
  const owner = effectScope(), calls = [], notices = []
  const currentUser = ref({ uid: 'a' }), coreUser = ref({ id: 'a' })
  const config = reactive({ appId: 'app' })
  const env = ref({ isValid: true }), pending = ref(false), error = ref(null), userPending = ref(false)
  const dependencies = {
    computed, ref, watch, useCommandScope,
    useAuth: () => ({ currentUser }), useFireUXConfig: () => config,
    useUserSession: () => ({ coreUser, pending: userPending }),
    useToastify: () => ({ success: message => notices.push(['success', message]), error: message => notices.push(['error', message]) }),
    useAppEnvCheck: () => ({ data: env, pending, error, refresh: async () => { calls.push('refresh'); await options.refresh?.() } }),
    initializeConfiguredApp: async () => { calls.push('initialize'); return await options.initialize?.() ?? initialized },
    syncAppMediaToStorage: async () => { calls.push('sync'); return await options.sync?.() ?? { failed: [] } },
    console: { error() {} },
  }
  const state = owner.run(() => load('../runtime/app/composables/initialization/useAppInitialization.ts', 'useAppInitialization', dependencies)())
  return { owner, state, currentUser, coreUser, config, env, pending, error, userPending, calls, notices }
}
test('App initialization composes one initialization, media sync and refresh, with duplicate submission blocked', async () => {
  const reply = deferred(), h = initializationHarness({ initialize: () => reply.promise })
  const first = h.state.onProceed()
  await h.state.onProceed()
  assert.deepEqual(h.calls, ['initialize'])
  reply.resolve(initialized)
  await first
  assert.deepEqual(h.calls, ['initialize', 'sync', 'refresh'])
  assert.deepEqual(h.notices, [['success', 'App initialized.']])
  assert.equal(h.state.actionPending.value, false)
  h.owner.stop()
})
for (const context of ['account', 'app', 'profile', 'disposal']) {
  test(`App initialization stops follow-on media after ${context} changes, including change-away-and-back`, async () => {
    const reply = deferred(), h = initializationHarness({ initialize: () => reply.promise })
    const flight = h.state.onProceed()
    if (context === 'account') { h.currentUser.value = { uid: 'b' }; h.currentUser.value = { uid: 'a' } }
    if (context === 'app') { h.config.appId = 'other'; h.config.appId = 'app' }
    if (context === 'profile') { h.coreUser.value = { id: 'b' }; h.coreUser.value = { id: 'a' } }
    if (context === 'disposal') h.owner.stop()
    reply.resolve(initialized)
    await flight
    assert.deepEqual(h.calls, ['initialize'])
    assert.deepEqual(h.notices, [])
    h.owner.stop()
  })
}
test('An obsolete App initialization cannot clear a newer pending workflow', async () => {
  const first = deferred(), second = deferred()
  let run = 0
  const h = initializationHarness({ initialize: () => ++run === 1 ? first.promise : initialized, sync: () => second.promise })
  const oldFlight = h.state.onProceed()
  h.currentUser.value = { uid: 'b' }; h.coreUser.value = { id: 'b' }
  const newFlight = h.state.onProceed()
  await Promise.resolve(); await Promise.resolve()
  first.resolve(initialized); await oldFlight
  assert.equal(h.state.actionPending.value, true)
  second.resolve({ failed: [] }); await newFlight
  assert.equal(h.state.actionPending.value, false)
  assert.equal(h.notices.length, 1)
  h.owner.stop()
})
for (const stage of ['sync', 'refresh']) {
  test(`App initialization suppresses completion after an account changes during ${stage}`, async () => {
    const reply = deferred(), entered = deferred()
    const h = initializationHarness({ [stage]: () => { entered.resolve(); return reply.promise } })
    const flight = h.state.onProceed(); await entered.promise
    h.currentUser.value = { uid: 'b' }
    reply.resolve(stage === 'sync' ? { failed: [{ kind: 'logo', message: 'Failed' }] } : undefined)
    await flight
    assert.deepEqual(h.notices, [])
    assert.equal(h.state.proceedError.value, null)
    h.owner.stop()
  })
}
for (const blocked of ['invalid', 'pending', 'error', 'user-pending', 'signed-out']) {
  test(`App initialization waits for a ready signed-in environment: ${blocked}`, async () => {
    const h = initializationHarness()
    if (blocked === 'invalid') h.env.value = { isValid: false }
    if (blocked === 'pending') h.pending.value = true
    if (blocked === 'error') h.error.value = Error('Diagnostics unavailable')
    if (blocked === 'user-pending') h.userPending.value = true
    if (blocked === 'signed-out') h.currentUser.value = null
    assert.equal(h.state.canProceed.value, false)
    await h.state.onProceed(); assert.deepEqual(h.calls, [])
    h.owner.stop()
  })
}
test('Current App setup failures remain actionable', async () => {
  const h = initializationHarness({ sync: async () => ({ failed: [{ kind: 'logo', message: 'Missing image' }] }) })
  await h.state.onProceed()
  assert.match(h.state.proceedError.value, /logo: Missing image/)
  assert.equal(h.notices[0][0], 'error')
  assert.equal(h.state.actionPending.value, false)
  h.owner.stop()
})
function environmentHarness(options = {}) {
  const owner = effectScope(), currentUser = ref({ uid: 'a', getIdToken: () => options.token?.() ?? Promise.resolve('token') })
  const config = reactive({ appId: 'app' }), isDeveloper = ref(true), hasAuthState = ref(true)
  const data = ref(null), pending = ref(false), error = ref(null), calls = []
  let handler, key
  const state = owner.run(() => load('../runtime/app/composables/initialization/useAppEnvCheck.ts', 'useAppEnvCheck', {
    computed, useCommandScope, useAuth: () => ({ currentUser, hasAuthState }), useDeveloperAccess: () => ({ isDeveloper }), useFireUXConfig: () => config,
    useAsyncData: (requestKey, requestHandler) => { key = requestKey; handler = requestHandler; return { data, pending, error } },
    $fetch: async (url, input) => { calls.push({ url, input }); return await options.fetch?.() ?? { isValid: true } },
  })())
  const execute = () => handler({}, { signal: new AbortController().signal })
  return { owner, state, currentUser, config, isDeveloper, hasAuthState, data, pending, error, calls, execute, key: () => key() }
}
test('Environment diagnostics are keyed by App and account, pass cancellation, and hide pending or failed data', async () => {
  const h = environmentHarness()
  assert.equal(h.key(), 'fireux-app-env-check:app:a')
  h.data.value = await h.execute()
  assert.equal(h.state.data.value.isValid, true)
  assert.ok(h.calls[0].input.signal instanceof AbortSignal)
  h.pending.value = true; assert.equal(h.state.data.value, null)
  h.pending.value = false; h.error.value = Error('Failed'); assert.equal(h.state.data.value, null)
  h.error.value = null; h.hasAuthState.value = false; assert.equal(h.state.data.value, null)
  h.hasAuthState.value = true; h.isDeveloper.value = false; assert.equal(h.state.data.value, null)
  h.isDeveloper.value = true; h.config.appId = 'other'; assert.equal(h.state.data.value, null)
  h.owner.stop()
})
for (const changed of ['account', 'app', 'authority', 'disposal']) {
  test(`Environment credentials cannot dispatch after ${changed} changes`, async () => {
    const token = deferred(), h = environmentHarness({ token: () => token.promise })
    const flight = h.execute()
    if (changed === 'account') { h.currentUser.value = { uid: 'b' }; h.currentUser.value = { uid: 'a' } }
    if (changed === 'app') { h.config.appId = 'other'; h.config.appId = 'app' }
    if (changed === 'authority') { h.isDeveloper.value = false; h.isDeveloper.value = true }
    if (changed === 'disposal') h.owner.stop()
    token.resolve('token')
    assert.equal(await flight, null)
    assert.equal(h.calls.length, 0)
    h.owner.stop()
  })
}
test('Late environment responses cannot reappear after account change-away-and-back', async () => {
  const response = deferred(), h = environmentHarness({ fetch: () => response.promise })
  const flight = h.execute(); await Promise.resolve()
  h.currentUser.value = { uid: 'b' }; h.currentUser.value = { uid: 'a' }
  response.resolve({ isValid: true })
  assert.equal(await flight, null)
  h.owner.stop()
})
