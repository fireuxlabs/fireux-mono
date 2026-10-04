import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import * as crypto from 'node:crypto'
import { ref, reactive, watch, effectScope, onScopeDispose } from 'vue'
function load(path, result, dependencies = {}) {
  const text = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', 'true')
  return compileFunction(
    `${stripTypeScriptTypes(text, { mode: 'transform' })};return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const api = load(
  '../../../../core/fireux-core/src/runtime/user/server/connections/protocol.ts',
  '{ConnectionError,opaque,digest,equalSecret,requireOpaque,connectionOrigin,requireRecentAuth,sealHandoff,openHandoff,requirePeerSecret}',
  crypto
)
const redirects = load(
  '../../../../core/fireux-core/src/runtime/utils/onboarding-route.ts',
  '{resolveInternalRedirect,resolvePostAuthDestination}'
)
Object.assign(
  api,
  redirects,
  load(
    '../runtime/user/utils/connection-resume.ts',
    '{resolveConnectionResume}',
    redirects
  )
)
Object.assign(
  api,
  load(
    '../runtime/user/server/connections/service.ts',
    '{createConnectionService,connectionPath}',
    api
  )
)
function harness() {
  const records = new Map()
  let clock = 1000000000000
  let lock = Promise.resolve()
  const store = {
    transaction(work) {
      const run = lock.then(async () => {
        const copy = new Map(
          [...records].map(([k, v]) => [k, structuredClone(v)])
        )
        const result = await work({
          get: async (p) => copy.get(p) || null,
          set: (p, v) => copy.set(p, structuredClone(v)),
          delete: (p) => copy.delete(p),
        })
        records.clear()
        for (const entry of copy) records.set(...entry)
        return result
      })
      lock = run.catch(() => {})
      return run
    },
  }
  const service = api.createConnectionService(store, () => clock)
  const binding = api.opaque()
  async function link(hub = 'hub-A', local = 'local-A') {
    const request = await service.beginLink(hub, 'FireUX A', binding)
    await service.proveLink(request, local, 'Misebox A')
    await service.completeLink(request, hub, binding)
    return request
  }
  return {
    records,
    service,
    binding,
    link,
    advance: (ms) => {
      clock += ms
    },
  }
}
test('connects existing identities with different UIDs without writing user/profile/membership data', async () => {
  const h = harness()
  await h.link()
  assert.equal(h.records.get(api.connectionPath('hub-A')).localUid, 'local-A')
  assert.ok(
    [...h.records.keys()].every((p) =>
      /^(accounts|local_accounts|link_requests)\//.test(p)
    )
  )
})
test('link confirmation requires the original hub account and browser', async () => {
  const h = harness()
  const request = await h.service.beginLink('hub-A', 'A', h.binding)
  await h.service.proveLink(request, 'local-A', 'A')
  await assert.rejects(h.service.completeLink(request, 'hub-B', h.binding), {
    statusCode: 403,
  })
  await assert.rejects(h.service.completeLink(request, 'hub-A', api.opaque()), {
    statusCode: 403,
  })
  assert.equal(h.records.has(api.connectionPath('hub-A')), false)
})
test('link cannot complete before local ownership confirmation', async () => {
  const h = harness()
  const request = await h.service.beginLink('hub-A', 'A', h.binding)
  await assert.rejects(h.service.completeLink(request, 'hub-A', h.binding), {
    statusCode: 409,
  })
})
test('a different local account cannot replace an already confirmed request', async () => {
  const h = harness()
  const request = await h.service.beginLink('hub-A', 'A', h.binding)
  await h.service.proveLink(request, 'local-A', 'A')
  await assert.rejects(h.service.proveLink(request, 'local-B', 'B'), {
    statusCode: 409,
  })
})
test('expired links fail without creating a connection', async () => {
  const h = harness()
  const request = await h.service.beginLink('hub-A', 'A', h.binding)
  h.advance(600001)
  await assert.rejects(h.service.inspectLink(request), { statusCode: 410 })
  await assert.rejects(h.service.proveLink(request, 'local-A', 'A'), {
    statusCode: 410,
  })
  await assert.rejects(h.service.completeLink(request, 'hub-A', h.binding), {
    statusCode: 410,
  })
})
test('one local identity can belong to only one FireUX identity, including concurrent completion', async () => {
  const h = harness()
  const a = await h.service.beginLink('hub-A', 'A', h.binding),
    b = await h.service.beginLink('hub-B', 'B', h.binding)
  await h.service.proveLink(a, 'local-A', 'A')
  await h.service.proveLink(b, 'local-A', 'A')
  const results = await Promise.allSettled([
    h.service.completeLink(a, 'hub-A', h.binding),
    h.service.completeLink(b, 'hub-B', h.binding),
  ])
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1)
  assert.equal(
    results.find((r) => r.status === 'rejected').reason.statusCode,
    409
  )
})
test('a hub connection cannot be silently overwritten by another local account', async () => {
  const h = harness()
  await h.link()
  await assert.rejects(h.link('hub-A', 'local-B'), { statusCode: 409 })
  assert.equal(h.records.get(api.connectionPath('hub-A')).localUid, 'local-A')
})
test('successful link completion is idempotent while the same connection remains', async () => {
  const h = harness()
  const request = await h.link()
  assert.deepEqual(await h.service.completeLink(request, 'hub-A', h.binding), {
    ok: true,
    localLabel: 'Misebox A',
  })
})
test('an old successful completion cannot report a disconnected account as connected', async () => {
  const h = harness()
  const request = await h.link()
  await h.service.disconnect('hub-A')
  await assert.rejects(h.service.completeLink(request, 'hub-A', h.binding), {
    statusCode: 409,
  })
})
test('shared login requires an existing explicit connection', async () => {
  const h = harness()
  await assert.rejects(
    h.service.authorize(
      'hub-A',
      api.opaque(),
      api.digest(api.opaque()),
      1000000000
    ),
    { statusCode: 409 }
  )
})
test('login code is browser-bound, one-use and stores no raw code or verifier', async () => {
  const h = harness()
  await h.link()
  const state = api.opaque(),
    verifier = api.opaque()
  const code = await h.service.authorize(
    'hub-A',
    state,
    api.digest(verifier),
    1000000000
  )
  await assert.rejects(h.service.exchange(code, state, api.opaque()), {
    statusCode: 403,
  })
  await assert.rejects(h.service.exchange(code, api.opaque(), verifier), {
    statusCode: 403,
  })
  assert.deepEqual(await h.service.exchange(code, state, verifier), {
    hubUid: 'hub-A',
    localUid: 'local-A',
    authTime: 1000000000,
  })
  await assert.rejects(h.service.exchange(code, state, verifier), {
    statusCode: 403,
  })
  assert.ok(!JSON.stringify([...h.records]).includes(verifier))
  assert.ok(!JSON.stringify([...h.records]).includes(code))
})
test('concurrent exchanges cannot both redeem one login code', async () => {
  const h = harness()
  await h.link()
  const state = api.opaque(),
    v = api.opaque(),
    code = await h.service.authorize('hub-A', state, api.digest(v), 1000000000)
  const outcomes = await Promise.allSettled([
    h.service.exchange(code, state, v),
    h.service.exchange(code, state, v),
  ])
  assert.equal(outcomes.filter((r) => r.status === 'fulfilled').length, 1)
})
test('expired login codes cannot be redeemed', async () => {
  const h = harness()
  await h.link()
  const s = api.opaque(),
    v = api.opaque(),
    c = await h.service.authorize('hub-A', s, api.digest(v), 1000000000)
  h.advance(60001)
  await assert.rejects(h.service.exchange(c, s, v), { statusCode: 410 })
})
test('disconnect blocks unredeemed codes and reconnecting cannot restore them', async () => {
  const h = harness()
  await h.link()
  const s = api.opaque(),
    v = api.opaque(),
    c = await h.service.authorize('hub-A', s, api.digest(v), 1000000000)
  await h.service.disconnect('hub-A')
  await assert.rejects(h.service.exchange(c, s, v), { statusCode: 403 })
  await h.link()
  await assert.rejects(h.service.exchange(c, s, v), { statusCode: 403 })
})
test('disconnect releases the local association without altering accounts', async () => {
  const h = harness()
  await h.link()
  await h.service.disconnect('hub-A')
  await h.link('hub-B', 'local-A')
  assert.equal(h.records.has(api.connectionPath('hub-A')), false)
  assert.equal(h.records.get(api.connectionPath('hub-B')).localUid, 'local-A')
})
test('handoff cookies reject tampering, missing state and expiry', () => {
  const secret = 's'.repeat(40),
    cookie = api.sealHandoff(secret, { expires: 100, state: 'A' })
  assert.equal(api.openHandoff(secret, cookie, 99).state, 'A')
  for (const bad of [undefined, cookie + 'x', 'anything'])
    assert.throws(() => api.openHandoff(secret, bad, 99))
  assert.throws(() => api.openHandoff(secret, cookie, 100))
  assert.throws(() => api.requirePeerSecret('short'))
})
test('approved origins exclude URL credentials, paths, insecure deployment and open redirects', () => {
  assert.equal(
    api.connectionOrigin('https://fireux.app', false),
    'https://fireux.app'
  )
  assert.equal(
    api.connectionOrigin('http://localhost:3000', true),
    'http://localhost:3000'
  )
  for (const value of [
    'http://fireux.app',
    'https://fireux.app/path',
    'https://fireux.app?x=1',
    'https://x@fireux.app',
  ])
    assert.throws(() => api.connectionOrigin(value, false))
})
test('ownership confirmation rejects stale and future authentication timestamps', () => {
  api.requireRecentAuth(100, 100000)
  assert.throws(() => api.requireRecentAuth(1, 1000000))
  assert.throws(() => api.requireRecentAuth(1000000, 100000))
})
const useCommandScope = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
function deferred() {
  let resolve
  return {
    promise: new Promise((r) => {
      resolve = r
    }),
    resolve: (v) => resolve(v),
  }
}
function actionHarness(stage) {
  const wait = deferred(),
    reached = deferred(),
    calls = [],
    scope = effectScope(),
    route = reactive({ fullPath: '/account/connect' })
  const user = ref({
    uid: 'A',
    isAnonymous: false,
    getIdToken: async () => {
      if (stage === 'credentials') {
        reached.resolve()
        await wait.promise
      }
      return 'token-A'
    },
  })
  const controller = scope.run(() =>
    load(
      '../../../../core/fireux-core/src/runtime/user/composables/connections/useAccountConnectionAction.ts',
      'useAccountConnectionAction',
      {
        ref,
        watch,
        useRoute: () => route,
        useAuth: () => ({ currentUser: user }),
        useCommandScope,
        $fetch: async (path, options) => {
          calls.push({ path, options })
          if (stage === 'request') {
            reached.resolve()
            await wait.promise
          }
          return { uid: 'A', ok: true }
        },
      }
    )('/api/account/connection')
  )
  return { controller, user, route, calls, scope, wait, reached }
}
for (const stage of ['credentials', 'request'])
  for (const change of ['account', 'account-roundtrip', 'route', 'dispose'])
    test(`${stage}: ${change} suppresses obsolete connection continuation`, async () => {
      const h = actionHarness(stage)
      const pending = h.controller.run({ action: 'begin' })
      await h.reached.promise
      if (change === 'account' || change === 'account-roundtrip') {
        const original = h.user.value
        h.user.value = { uid: 'B' }
        if (change === 'account-roundtrip') h.user.value = original
      }
      if (change === 'route') h.route.fullPath = '/elsewhere'
      if (change === 'dispose') h.scope.stop()
      h.wait.resolve()
      assert.equal(await pending, null)
      assert.equal(h.controller.error.value, '')
      if (stage === 'credentials') assert.equal(h.calls.length, 0)
      h.scope.stop()
    })
test('a fresh confirmation for another account is rejected before dispatch', async () => {
  const h = actionHarness()
  assert.equal(
    await h.controller.run({ action: 'begin' }, { uid: 'B', token: 'B' }),
    null
  )
  assert.equal(h.calls.length, 0)
  h.scope.stop()
})

const resolvePostAuthDestination = load(
  '../../../../core/fireux-core/src/runtime/utils/onboarding-route.ts',
  'resolvePostAuthDestination'
)
test('Dashboard auth hydration preserves the original protected destination even if another guard already navigated', async () => {
  const route = ref({ fullPath: '/dashboard/connections?from=account' })
  const hasAuthState = ref(false),
    isReady = ref(false),
    calls = [],
    scope = effectScope()
  const source = readFileSync(
    new URL(
      '../../../../core/fireux-core/src/runtime/composables/fireux/firebase/useAuthRedirect.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
  const make = compileFunction(
    `${stripTypeScriptTypes(source)};return useAuthRedirect`,
    [
      'onNuxtReady',
      'useNuxtApp',
      'computed',
      'ref',
      'toValue',
      'watch',
      'useRouter',
      'useAuth',
      'resolvePostAuthDestination',
    ]
  )
  const vue = await import('vue')
  scope.run(() =>
    make(
      () => {},
      () => ({ isHydrating: false }),
      vue.computed,
      ref,
      vue.toValue,
      watch,
      () => ({
        currentRoute: route,
        replace: async (path) => calls.push(path),
      }),
      () => ({
        isAuthenticated: ref(false),
        isReady,
        hasAuthState,
        lastBindError: ref(null),
      }),
      resolvePostAuthDestination
    )()
  )
  assert.equal(calls.length, 0)
  route.value = { fullPath: '/auth' }
  isReady.value = true
  hasAuthState.value = true
  await vue.nextTick()
  assert.deepEqual(calls, [
    '/auth?redirect=%2Fdashboard%2Fconnections%3Ffrom%3Daccount',
  ])
  scope.stop()
})

test('browser-bound account preview does not consume the login code and follows disconnection', async () => {
  const h = harness()
  await h.link()
  const state = api.opaque(),
    v = api.opaque(),
    code = await h.service.authorize('hub-A', state, api.digest(v), 1000000000)
  assert.equal((await h.service.preview(code, state, v)).localUid, 'local-A')
  assert.equal((await h.service.preview(code, state, v)).localUid, 'local-A')
  await assert.rejects(h.service.preview(code, state, api.opaque()), {
    statusCode: 403,
  })
  await h.service.exchange(code, state, v)
  await assert.rejects(h.service.preview(code, state, v), { statusCode: 403 })
  const next = await h.service.authorize(
    'hub-A',
    state,
    api.digest(v),
    1000000000
  )
  await h.service.disconnect('hub-A')
  await assert.rejects(h.service.preview(next, state, v), { statusCode: 403 })
})
function hubPeerHarness({
  disabled = false,
  validAfter = 1000000,
  missing = false,
} = {}) {
  const handler = load(
    '../runtime/user/server/connections/handlers.ts',
    'connectionPeer',
    {
      ...api,
      useRuntimeConfig: () => ({
        accountConnections: {
          origin: 'http://localhost:3000',
          miseboxOrigin: 'http://localhost:3001',
          peerSecret: 'x'.repeat(40),
        },
      }),
      getAuth: () => ({
        getUser: async () => {
          if (missing) throw { code: 'auth/user-not-found' }
          return {
            disabled,
            tokensValidAfterTime: new Date(validAfter).toUTCString(),
          }
        },
      }),
      getAdminApp: () => ({}),
      peerBody: async () => ({
        action: 'exchange',
        code: api.opaque(),
        state: api.opaque(),
        verifier: api.opaque(),
      }),
      createConnectionService: () => ({
        exchange: async () => ({
          hubUid: 'hub-A',
          localUid: 'local-A',
          authTime: 1000,
        }),
      }),
      connectionStore: () => ({}),
    }
  )
  return () => handler({})
}
test('peer exchange rechecks hub availability and session revocation before returning local authority', async () => {
  assert.deepEqual(await hubPeerHarness()(), { localUid: 'local-A' })
  for (const options of [
    { disabled: true },
    { validAfter: 2000000 },
    { missing: true },
  ])
    await assert.rejects(hubPeerHarness(options)(), { statusCode: 403 })
})

test('connection resume keeps the approved continuation and rejects external or incomplete paths', () => {
  const query = new URLSearchParams({
    state: api.opaque(),
    challenge: 'a'.repeat(64),
    redirect: '/workspace/kitchen?menu=A#details',
  })
  const resume = `/account/continue?${query}`
  assert.equal(api.resolveConnectionResume(resume), resume)
  for (const value of [
    null,
    'https://attacker.example/account/continue',
    '//attacker.example',
    '/dashboard',
    '/account/continue',
    '/account/continue?state=bad&challenge=bad',
  ])
    assert.equal(api.resolveConnectionResume(value), '')
  query.set('redirect', 'https://attacker.example')
  query.set('extra', 'ignored')
  const cleaned = new URL(
    api.resolveConnectionResume(`/account/continue?${query}`),
    'http://localhost'
  )
  assert.equal(cleaned.searchParams.get('redirect'), '/dashboard')
  assert.equal(cleaned.searchParams.has('extra'), false)
})

test('hub begin and authorize retain validated navigation without changing connection authority', async () => {
  const h = harness(),
    cookies = new Map()
  const command = load(
    '../runtime/user/server/connections/handlers.ts',
    'connectionCommand',
    {
      ...api,
      useRuntimeConfig: () => ({
        accountConnections: {
          origin: 'http://localhost:3000',
          miseboxOrigin: 'http://localhost:3001',
          peerSecret: 'test-only'.repeat(5),
        },
      }),
      requireFirebaseBearerUser: async () => ({
        uid: 'hub-A',
        decoded: { auth_time: Date.now() / 1000, email: 'hub-A@example.com' },
      }),
      readBody: async (e) => e.body,
      requireConnectionOrigin: () => {},
      createConnectionService: () => h.service,
      connectionStore: () => ({}),
      setCookie: (_, name, value) => cookies.set(name, value),
      getCookie: (_, name) => cookies.get(name),
    }
  )
  const state = api.opaque(),
    challenge = api.digest(api.opaque()),
    destination = '/workspace/kitchen?menu=A#details'
  const resume = `/account/continue?${new URLSearchParams({ state, challenge, redirect: destination })}`
  const begun = await command({ body: { action: 'begin', resume } })
  const link = new URL(begun.destination)
  assert.equal(link.origin, 'http://localhost:3001')
  assert.equal(link.searchParams.get('resume'), resume)
  const request = link.searchParams.get('request')
  await h.service.proveLink(request, 'local-A', 'Misebox A')
  await command({ body: { action: 'complete', request } })
  const result = await command({
    body: { action: 'authorize', state, challenge, returnTo: destination },
  })
  const callback = new URL(result.destination)
  assert.equal(callback.origin, 'http://localhost:3001')
  assert.equal(callback.searchParams.get('redirect'), destination)
  assert.equal(callback.searchParams.get('state'), state)
})
