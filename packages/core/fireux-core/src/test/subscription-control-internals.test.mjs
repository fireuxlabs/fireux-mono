import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import {
  computed,
  createSSRApp,
  effectScope,
  h,
  reactive,
  ref,
  toValue,
} from 'vue'
import { transpileModule, ModuleKind } from 'typescript'
import {
  captureCommandScope,
  useCommandScope,
} from '../runtime/composables/fireux/commands/useCommandScope.ts'
import { resolveAppUserAccess } from '../runtime/app/utils/app-user-access.ts'
import {
  isAppUserRole,
  isAppUserSubscription,
} from '../runtime/app/models/app-user.model.ts'

const require = createRequire(import.meta.url)
const vueRequire = createRequire(require.resolve('vue'))
const { parse, compileScript } = vueRequire('@vue/compiler-sfc')
const { renderToString } = vueRequire('@vue/server-renderer')
const componentPath = '../runtime/user/components/SubscriptionControl.vue'

function load(path, name, dependencies, development = false) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^[\s\S]*<script setup[^>]*>([\s\S]*?)<\/script>[\s\S]*$/, '$1')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', String(development))
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function fixture({ role = 'dev', subscription = 'free', guest = false } = {}) {
  const token = deferred(),
    tokenReached = deferred(),
    response = deferred()
  const actor = {
    uid: 'operator',
    isAnonymous: false,
    getIdToken: async () => {
      tokenReached.resolve()
      await token.promise
      return 'captured-token'
    },
  }
  const auth = {
    currentUser: ref(guest ? { uid: 'guest', isAnonymous: true } : actor),
    hasAuthState: ref(true),
  }
  const config = reactive({ appId: 'app' })
  const session = {
    uid: ref('operator'),
    app: ref({ id: 'app' }),
    appUser: ref({
      id: 'operator',
      role,
      subscription,
      created: { at: { seconds: 1, nanoseconds: 2 }, by: 'operator' },
    }),
    pending: ref(false),
    error: ref(null),
  }
  const notices = [],
    calls = []
  const runAppUserCommand = load(
    '../runtime/app/utils/runAppUserCommand.ts',
    'runAppUserCommand',
    {
      useAuth: () => auth,
      useFireUXConfig: () => config,
      captureCommandScope,
      useRequireUser: async () => auth.currentUser.value,
      fetch: async (url, options) => {
        calls.push({ url, options, body: JSON.parse(options.body) })
        await response.promise
        return {
          ok: true,
          json: async () => ({
            ok: true,
            action: 'set-subscription',
            appId: 'app',
            userId: 'operator',
            subscription: calls.at(-1).body.subscription,
          }),
        }
      },
    }
  )
  const useAppUserSubscriptions = load(
    '../runtime/app/composables/membership/useAppUserSubscriptions.ts',
    'useAppUserSubscriptions',
    { computed, toValue, runAppUserCommand }
  )
  const dependencies = {
    computed,
    ref,
    onMounted: (fn) => fn(),
    useToast: () => ({ add: (value) => notices.push(value) }),
    defineProps: () => ({ alwaysVisible: true }),
    withDefaults: (props) => props,
    useAuth: () => auth,
    useAppSession: () => session,
    useFireUXConfig: () => config,
    useWorkspaceEntryState: () => ({
      isGuest: computed(
        () =>
          auth.hasAuthState.value &&
          (!auth.currentUser.value || auth.currentUser.value.isAnonymous)
      ),
    }),
    useAppUserSubscriptions,
    resolveAppUserAccess,
    useCommandScope,
  }
  const owner = effectScope()
  const api = owner.run(() =>
    load(
      componentPath,
      '{toggle, saving, canToggle, hasSubscription, showSubscription, subscription, next}',
      dependencies
    )
  )
  return {
    owner,
    api,
    auth,
    config,
    session,
    calls,
    notices,
    token,
    tokenReached,
    response,
    dependencies,
  }
}
async function renderBadge(f) {
  const path = new URL(componentPath, import.meta.url)
  const { descriptor, errors } = parse(readFileSync(path, 'utf8'), {
    filename: path.pathname,
  })
  assert.deepEqual(errors, [])
  const script = compileScript(descriptor, {
    id: 'subscription-native',
    inlineTemplate: true,
  })
  const code = transpileModule(
    script.content.replaceAll('import.meta.dev', 'false'),
    { compilerOptions: { module: ModuleKind.CommonJS, target: 9 } }
  ).outputText
  const mod = { exports: {} }
  compileFunction(code, ['require', 'module', 'exports'])(
    (id) => {
      if (id === '#imports')
        return {
          ...require('vue'),
          onMounted: f.dependencies.onMounted,
          useToast: f.dependencies.useToast,
        }
      if (id.endsWith('/useAuth')) return { useAuth: f.dependencies.useAuth }
      if (id.endsWith('/useAppSession'))
        return { useAppSession: f.dependencies.useAppSession }
      if (id.endsWith('/FireUXConfig'))
        return { useFireUXConfig: f.dependencies.useFireUXConfig }
      if (id.endsWith('/useWorkspaceEntryState'))
        return {
          useWorkspaceEntryState: f.dependencies.useWorkspaceEntryState,
        }
      if (id.endsWith('/useAppUserSubscriptions'))
        return {
          useAppUserSubscriptions: f.dependencies.useAppUserSubscriptions,
        }
      if (id.endsWith('/app-user-access')) return { resolveAppUserAccess }
      if (id.endsWith('/useCommandScope')) return { useCommandScope }
      return require(id)
    },
    mod,
    mod.exports
  )
  const warnings = []
  const app = createSSRApp(mod.exports.default, { alwaysVisible: true })
  app.config.warnHandler = (value) => warnings.push(value)
  app.component('UButton', {
    props: ['to', 'label', 'disabled', 'loading'],
    setup: (p) => () =>
      h('a', { href: p.to, 'aria-disabled': p.disabled }, p.label),
  })
  const html = await renderToString(app)
  assert.deepEqual(warnings, [])
  return html
}

for (const role of ['admin', 'dev'])
  test(`production-built badge cycles settled ${role} through actual administrative self target`, async () => {
    const f = fixture({ role })
    const html = await renderBadge(f)
    assert.match(html, /Change Free subscription/)
    assert.doesNotMatch(html, /href="\/pricing"/)
    for (const [stored, next] of [
      ['free', 'premium'],
      ['premium', 'business'],
      ['business', 'free'],
    ]) {
      f.session.appUser.value.subscription = stored
      const result = f.api.toggle()
      await f.tokenReached.promise
      f.token.resolve()
      await new Promise((resolve) => setImmediate(resolve))
      assert.equal(f.calls.at(-1).body.action, 'set-subscription')
      assert.equal(f.calls.at(-1).body.userId, 'operator')
      assert.equal(f.calls.at(-1).body.subscription, next)
      assert.equal(
        f.session.appUser.value.subscription,
        stored,
        'no UI-only subscription patch'
      )
      f.response.resolve()
      await result
      assert.equal(f.api.saving.value, false)
    }
    assert.equal(f.calls.length, 3)
    assert.deepEqual(f.notices, [])
    f.owner.stop()
  })

test('ordinary members and anonymous guests retain pricing instead of subscription mutations', async () => {
  for (const options of [{ role: 'user' }, { guest: true }]) {
    const f = fixture(options)
    assert.match(await renderBadge(f), /href="\/pricing"/)
    assert.equal(f.api.canToggle.value, false)
    await f.api.toggle()
    assert.deepEqual(f.calls, [])
    f.owner.stop()
  }
})

test('unsettled, failed, missing, mismatched and malformed membership never provides badge authority', async () => {
  for (const invalidate of [
    (f) => (f.auth.hasAuthState.value = false),
    (f) => (f.session.pending.value = true),
    (f) => (f.session.error.value = new Error('denied')),
    (f) => (f.session.appUser.value = null),
    (f) => (f.session.appUser.value.id = 'someone-else'),
    (f) => (f.session.app.value.id = 'other-app'),
    (f) => (f.session.appUser.value.role = 'administrator'),
    (f) => (f.session.appUser.value.subscription = 'professional'),
  ]) {
    const f = fixture()
    invalidate(f)
    assert.equal(f.api.canToggle.value, false)
    assert.equal(f.api.showSubscription.value, false)
    assert.doesNotMatch(await renderBadge(f), /<a|Change .* subscription/)
    await f.api.toggle()
    assert.deepEqual(f.calls, [])
    f.owner.stop()
  }
})
function roundTrip(f, changed) {
  if (changed === 'account') {
    const old = f.auth.currentUser.value
    f.auth.currentUser.value = { ...old, uid: 'other' }
    f.auth.currentUser.value = old
  } else if (changed === 'app') {
    f.config.appId = 'other'
    f.config.appId = 'app'
  } else if (changed === 'role') {
    f.session.appUser.value.role = 'user'
    f.session.appUser.value.role = 'dev'
  } else if (changed === 'membership stamp') {
    f.session.appUser.value.created.at.seconds = 2
    f.session.appUser.value.created.at.seconds = 1
  } else if (changed === 'loading') {
    f.session.pending.value = true
    f.session.pending.value = false
  } else if (changed === 'failure') {
    f.session.error.value = new Error('read failed')
    f.session.error.value = null
  } else if (changed === 'disposal') f.owner.stop()
}
for (const changed of [
  'account',
  'app',
  'role',
  'membership stamp',
  'loading',
  'failure',
  'disposal',
])
  test(`credential wait cannot dispatch after ${changed} round trip or disposal`, async () => {
    const f = fixture()
    const result = f.api.toggle()
    await f.tokenReached.promise
    roundTrip(f, changed)
    f.token.resolve()
    await result
    assert.deepEqual(f.calls, [])
    assert.deepEqual(f.notices, [])
    assert.equal(
      f.api.saving.value,
      false,
      'physical command busy releases after cancellation'
    )
    f.owner.stop()
  })

test('live subscription update does not invalidate authorized command intent or overwrite live subscription', async () => {
  const f = fixture()
  const result = f.api.toggle()
  await f.tokenReached.promise
  f.session.appUser.value.subscription = 'business'
  f.token.resolve()
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(f.calls.length, 1)
  assert.equal(
    f.calls[0].body.subscription,
    'premium',
    'authored next tier captured before credential await'
  )
  f.response.resolve()
  await result
  assert.equal(f.session.appUser.value.subscription, 'business')
  f.owner.stop()
})

test('current command failure is visible; disposed or revoked owner cannot receive stale failure feedback', async () => {
  for (const changed of [null, 'role', 'disposal']) {
    const f = fixture()
    const result = f.api.toggle()
    await f.tokenReached.promise
    f.token.resolve()
    await new Promise((resolve) => setImmediate(resolve))
    assert.equal(f.calls.length, 1)
    if (changed) roundTrip(f, changed)
    f.response.reject(new Error('server refused'))
    await result
    assert.equal(f.notices.length, changed ? 0 : 1)
    if (!changed) assert.equal(f.notices[0].description, 'server refused')
    assert.equal(f.api.saving.value, false)
    f.owner.stop()
  }
})

test('busy belongs to the single actual in-flight command and blocks repeat clicks across owner refresh', async () => {
  const f = fixture()
  const result = f.api.toggle()
  await f.tokenReached.promise
  await f.api.toggle()
  f.token.resolve()
  await new Promise((resolve) => setImmediate(resolve))
  roundTrip(f, 'loading')
  await f.api.toggle()
  assert.equal(f.calls.length, 1)
  f.response.resolve()
  await result
  assert.equal(f.api.saving.value, false)
  f.owner.stop()
})

const authority = load(
  '../runtime/app/server/app-user/subscription.ts',
  'resolveSubscriptionMutationAuthority',
  {}
)
const contract = load(
  '../runtime/app/server/app-user/command-contract.ts',
  '{roleFrom,forbidden,stamp}',
  {
    isAppUserRole,
    isAppUserSubscription,
    createError: ({ statusCode, statusMessage }) =>
      Object.assign(new Error(statusMessage), { statusCode }),
    FieldValue: { serverTimestamp: () => ({ seconds: 1, nanoseconds: 0 }) },
    USER_MUTATION_TARGETS: { runtimeUsers: 'users' },
  }
)
const handleSettings = load(
  '../runtime/app/server/app-user/settings.ts',
  'handleMembershipSettings',
  {
    ...contract,
    isAppUserSubscription,
    isAppUserRole,
    resolveSubscriptionMutationAuthority: authority,
    serverAppUsersTarget: (appId) => `apps/${appId}/users`,
    requireFirestoreDocumentId: (id) => {
      if (!id || id.includes('/')) throw new Error('invalid target')
      return id
    },
  }
)
test('existing production transactional authority permits admin/dev self target and rejects ordinary/revoked actor', async () => {
  for (const role of ['admin', 'dev', 'user', undefined]) {
    const reads = [],
      writes = []
    const state = {
      context: {
        actorUid: 'operator',
        appId: 'app',
        input: {
          action: 'set-subscription',
          userId: 'operator',
          subscription: 'business',
        },
      },
      actorMembership: role ? { role, subscription: 'free' } : undefined,
      mutations: {
        read: async (target, id) => {
          assert.equal(writes.length, 0)
          reads.push([target, id])
          return { exists: true }
        },
        update: (target, id, data) => writes.push([target, id, data]),
      },
    }
    if (role === 'admin' || role === 'dev') {
      assert.equal((await handleSettings(state)).subscription, 'business')
      assert.deepEqual(reads, [['apps/app/users', 'operator']])
      assert.equal(writes[0][1], 'operator')
      assert.equal(writes[0][2].subscription, 'business')
    } else {
      await assert.rejects(
        handleSettings(state),
        (error) => error.statusCode === 403
      )
      assert.deepEqual(writes, [])
    }
  }
  assert.equal(
    authority({
      action: 'set-self-subscription',
      actorUid: 'operator',
      actorRole: 'dev',
    }).statusCode,
    403,
    'development-only self command remains disabled in production'
  )
})
