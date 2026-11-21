import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { compileScript, parse } from 'vue/compiler-sfc'
import { renderToString } from 'vue/server-renderer'
import { transpileModule, ModuleKind } from 'typescript'
import {
  computed,
  ref,
  reactive,
  watch,
  onScopeDispose,
  effectScope,
} from 'vue'

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replaceAll('import.meta.client', 'true')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const useCommandScope = load(
  '../runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
const deferred = () => Promise.withResolvers()
const initialized = {
  ok: true,
  appId: 'app',
  userId: 'a',
  appCreated: true,
  ecosystemCreated: false,
  membershipCreated: false,
  membershipUpdated: false,
}
function initializationHarness(options = {}) {
  const owner = effectScope(),
    calls = [],
    notices = []
  const currentUser = ref({ uid: 'a' }),
    user = ref({ id: 'a' })
  const config = reactive({ appId: 'app' })
  const env = ref({ isValid: true }),
    pending = ref(false),
    error = ref(null),
    userPending = ref(false)
  const userError = ref(null)
  const dependencies = {
    computed,
    ref,
    watch,
    useCommandScope,
    useAuth: () => ({
      currentUser,
      hasAuthState: ref(true),
      isAuthenticated: computed(() => Boolean(currentUser.value)),
    }),
    useFireUXConfig: () => config,
    useUserRead: (uid) => ({
      user: computed(() => (uid.value ? user.value : null)),
      pending: userPending,
      error: userError,
      outcome: computed(() => {
        if (!uid.value) return 'idle'
        if (userError.value) return 'error'
        if (userPending.value) return 'pending'
        return user.value ? 'ready' : 'empty'
      }),
    }),
    useToastify: () => ({
      success: (message) => notices.push(['success', message]),
      error: (message) => notices.push(['error', message]),
    }),
    useAppEnvCheck: () => ({
      data: env,
      pending,
      error,
      refresh: async () => {
        calls.push('refresh')
        await options.refresh?.()
      },
    }),
    initializeConfiguredApp: async () => {
      calls.push('initialize')
      return (await options.initialize?.()) ?? initialized
    },
    syncAppMediaToStorage: async () => {
      calls.push('sync')
      return (await options.sync?.()) ?? { failed: [] }
    },
    console: { error() {} },
  }
  const useAppInitializationAction = load(
    '../runtime/app/composables/initialization/internal/useAppInitializationAction.ts',
    'useAppInitializationAction',
    dependencies
  )
  const state = owner.run(() =>
    load(
      '../runtime/app/composables/initialization/useAppInitialization.ts',
      'useAppInitialization',
      { ...dependencies, useAppInitializationAction }
    )()
  )
  return {
    owner,
    state,
    currentUser,
    user,
    config,
    env,
    pending,
    error,
    userPending,
    userError,
    calls,
    notices,
  }
}

test('App setup renders canonical User outcomes and only one initialize action', async () => {
  const h = initializationHarness()
  let retry
  let reloads = 0
  function component(path, imports = {}) {
    const { descriptor } = parse(
      readFileSync(new URL(path, import.meta.url), 'utf8')
    )
    const { content } = compileScript(descriptor, {
      id: path,
      inlineTemplate: true,
    })
    const { outputText } = transpileModule(
      content.replaceAll('import.meta.client', 'false'),
      { compilerOptions: { module: ModuleKind.CommonJS } }
    )
    const exports = {}
    compileFunction(outputText, ['require', 'exports', 'window'])(
      (id) => {
        if (id === 'vue') return Vue
        assert.ok(Object.hasOwn(imports, id), id)
        return imports[id]
      },
      exports,
      { location: { reload: () => reloads++ } }
    )
    return exports.default
  }
  const screen = component('../runtime/app/components/Initialize/System.vue', {
    '../../composables/initialization/useAppInitialization': {
      useAppInitialization: () => h.state,
    },
    '../../../user/components/Create/System.vue': {
      default: { render: () => Vue.h('form', 'Create User') },
    },
    '../../../composables/fireux/firebase/useAuth': {
      useAuth: () => ({ hasAuthState: ref(true), isAuthenticated: ref(true) }),
    },
  })
  const diagnostics = component(
    '../runtime/app/components/Create/OnboardingVariables.vue'
  )
  const feedback = component('../runtime/components/molecules/State.vue')
  const container = {
    render() {
      return Vue.h('div', [this.$slots.header?.(), this.$slots.default?.()])
    },
  }
  const render = async () => {
    const app = Vue.createSSRApp(screen)
    for (const name of [
      'ClientOnly',
      'UContainer',
      'UBadge',
      'UCard',
      'UAlert',
      'UIcon',
      'FireCopyError',
    ])
      app.component(name, container)
    app.component('AppCreateOnboardingVariables', diagnostics)
    app.component('FireState', feedback)
    app.component('FireAuthSystem', container)
    app.component('UButton', {
      props: ['label'],
      setup(props, { attrs, slots }) {
        if (props.label === 'Try again') retry = attrs.onClick
        return () => Vue.h('button', slots.default?.() ?? props.label)
      },
    })
    return renderToString(app)
  }
  h.user.value = null
  h.userPending.value = true
  assert.match(await render(), /Loading account…/)
  h.userPending.value = false
  h.userError.value = new Error('User read failed')
  const failure = await render()
  assert.match(failure, /role="alert".*Unable to load account\./s)
  assert.match(failure, /Try again/)
  assert.doesNotMatch(failure, /Create User|Initialize App/)
  retry()
  assert.equal(reloads, 1)

  h.userError.value = null
  const empty = await render()
  assert.match(empty, /<form>Create User<\/form>/)
  assert.doesNotMatch(empty, /Initialize App/)

  h.user.value = { id: 'a' }
  h.env.value = {
    isValid: true,
    required: [{ key: 'Fixture variable', present: true }],
    server: { storage: { reachable: true } },
  }
  const ready = await render()
  assert.match(ready, /Environment Check/)
  assert.equal(
    (ready.match(/>\s*Initialize App\s*<\/button>/g) ?? []).length,
    1
  )
  assert.doesNotMatch(ready, /Create User|Continue\s*<\/button>/)
  h.owner.stop()
})
test('App initialization composes one initialization, media sync and refresh, with duplicate submission blocked', async () => {
  const reply = deferred(),
    h = initializationHarness({ initialize: () => reply.promise })
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
    const reply = deferred(),
      h = initializationHarness({ initialize: () => reply.promise })
    const flight = h.state.onProceed()
    if (context === 'account') {
      h.currentUser.value = { uid: 'b' }
      h.currentUser.value = { uid: 'a' }
    }
    if (context === 'app') {
      h.config.appId = 'other'
      h.config.appId = 'app'
    }
    if (context === 'profile') {
      h.user.value = { id: 'b' }
      h.user.value = { id: 'a' }
    }
    if (context === 'disposal') h.owner.stop()
    reply.resolve(initialized)
    await flight
    assert.deepEqual(h.calls, ['initialize'])
    assert.deepEqual(h.notices, [])
    h.owner.stop()
  })
}
test('An obsolete App initialization cannot clear a newer pending workflow', async () => {
  const first = deferred(),
    second = deferred()
  let run = 0
  const h = initializationHarness({
    initialize: () => (++run === 1 ? first.promise : initialized),
    sync: () => second.promise,
  })
  const oldFlight = h.state.onProceed()
  h.currentUser.value = { uid: 'b' }
  h.user.value = { id: 'b' }
  const newFlight = h.state.onProceed()
  await Promise.resolve()
  await Promise.resolve()
  first.resolve(initialized)
  await oldFlight
  assert.equal(h.state.actionPending.value, true)
  second.resolve({ failed: [] })
  await newFlight
  assert.equal(h.state.actionPending.value, false)
  assert.equal(h.notices.length, 1)
  h.owner.stop()
})
for (const stage of ['sync', 'refresh']) {
  test(`App initialization suppresses completion after an account changes during ${stage}`, async () => {
    const reply = deferred(),
      entered = deferred()
    const h = initializationHarness({
      [stage]: () => {
        entered.resolve()
        return reply.promise
      },
    })
    const flight = h.state.onProceed()
    await entered.promise
    h.currentUser.value = { uid: 'b' }
    reply.resolve(
      stage === 'sync'
        ? { failed: [{ kind: 'logo', message: 'Failed' }] }
        : undefined
    )
    await flight
    assert.deepEqual(h.notices, [])
    assert.equal(h.state.proceedError.value, null)
    h.owner.stop()
  })
}
for (const blocked of [
  'invalid',
  'pending',
  'error',
  'user-pending',
  'signed-out',
]) {
  test(`App initialization waits for a ready signed-in environment: ${blocked}`, async () => {
    const h = initializationHarness()
    if (blocked === 'invalid') h.env.value = { isValid: false }
    if (blocked === 'pending') h.pending.value = true
    if (blocked === 'error') h.error.value = Error('Diagnostics unavailable')
    if (blocked === 'user-pending') h.userPending.value = true
    if (blocked === 'signed-out') h.currentUser.value = null
    assert.equal(h.state.canProceed.value, false)
    await h.state.onProceed()
    assert.deepEqual(h.calls, [])
    h.owner.stop()
  })
}
test('Current App setup failures remain actionable', async () => {
  const h = initializationHarness({
    sync: async () => ({
      failed: [{ kind: 'logo', message: 'Missing image' }],
    }),
  })
  await h.state.onProceed()
  assert.match(h.state.proceedError.value, /logo: Missing image/)
  assert.equal(h.notices[0][0], 'error')
  assert.equal(h.state.actionPending.value, false)
  h.owner.stop()
})
function environmentHarness(options = {}) {
  const owner = effectScope(),
    currentUser = ref({
      uid: 'a',
      getIdToken: () => options.token?.() ?? Promise.resolve('token'),
    })
  const config = reactive({ appId: 'app' }),
    isDeveloper = ref(true),
    hasAuthState = ref(true)
  const data = ref(null),
    pending = ref(false),
    error = ref(null),
    calls = []
  let handler, key
  const state = owner.run(() =>
    load(
      '../runtime/app/composables/initialization/useAppEnvCheck.ts',
      'useAppEnvCheck',
      {
        computed,
        useCommandScope,
        useAuth: () => ({ currentUser, hasAuthState }),
        useDeveloperAccess: () => ({ isDeveloper }),
        useFireUXConfig: () => config,
        useAsyncData: (requestKey, requestHandler) => {
          key = requestKey
          handler = requestHandler
          return { data, pending, error }
        },
        $fetch: async (url, input) => {
          calls.push({ url, input })
          return (await options.fetch?.()) ?? { isValid: true }
        },
      }
    )()
  )
  const execute = () => handler({}, { signal: new AbortController().signal })
  return {
    owner,
    state,
    currentUser,
    config,
    isDeveloper,
    hasAuthState,
    data,
    pending,
    error,
    calls,
    execute,
    key: () => key(),
  }
}
test('Environment diagnostics are keyed by App and account, pass cancellation, and hide pending or failed data', async () => {
  const h = environmentHarness()
  assert.equal(h.key(), 'fireux-app-env-check:app:a')
  h.data.value = await h.execute()
  assert.equal(h.state.data.value.isValid, true)
  assert.ok(h.calls[0].input.signal instanceof AbortSignal)
  h.pending.value = true
  assert.equal(h.state.data.value, null)
  h.pending.value = false
  h.error.value = Error('Failed')
  assert.equal(h.state.data.value, null)
  h.error.value = null
  h.hasAuthState.value = false
  assert.equal(h.state.data.value, null)
  h.hasAuthState.value = true
  h.isDeveloper.value = false
  assert.equal(h.state.data.value, null)
  h.isDeveloper.value = true
  h.config.appId = 'other'
  assert.equal(h.state.data.value, null)
  h.owner.stop()
})
for (const changed of ['account', 'app', 'authority', 'disposal']) {
  test(`Environment credentials cannot dispatch after ${changed} changes`, async () => {
    const token = deferred(),
      h = environmentHarness({ token: () => token.promise })
    const flight = h.execute()
    if (changed === 'account') {
      h.currentUser.value = { uid: 'b' }
      h.currentUser.value = { uid: 'a' }
    }
    if (changed === 'app') {
      h.config.appId = 'other'
      h.config.appId = 'app'
    }
    if (changed === 'authority') {
      h.isDeveloper.value = false
      h.isDeveloper.value = true
    }
    if (changed === 'disposal') h.owner.stop()
    token.resolve('token')
    assert.equal(await flight, null)
    assert.equal(h.calls.length, 0)
    h.owner.stop()
  })
}
test('Late environment responses cannot reappear after account change-away-and-back', async () => {
  const response = deferred(),
    h = environmentHarness({ fetch: () => response.promise })
  const flight = h.execute()
  await Promise.resolve()
  h.currentUser.value = { uid: 'b' }
  h.currentUser.value = { uid: 'a' }
  response.resolve({ isValid: true })
  assert.equal(await flight, null)
  h.owner.stop()
})
