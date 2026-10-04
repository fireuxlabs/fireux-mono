import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import * as crypto from 'node:crypto'
function load(path, result, deps = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', 'true')
  return compileFunction(
    `${stripTypeScriptTypes(source, { mode: 'transform' })};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const core = '../../../../packages/core/fireux-core/src/runtime/'
const protocol = load(
  core + 'user/server/connections/protocol.ts',
  '{ConnectionError,connectionOrigin,requirePeerSecret,opaque,digest,requireOpaque,requireRecentAuth,sealHandoff,openHandoff}',
  crypto
)
const redirects = load(
  core + 'utils/onboarding-route.ts',
  '{resolvePostAuthDestination,resolveInternalRedirect}'
)
function harness({
  enabled = true,
  project = 'misebox-78f9c',
  disabled = false,
  profile = true,
  tenant = false,
  authTime = Date.now() / 1000,
  hubTenant = false,
} = {}) {
  const calls = [],
    cookies = new Map(),
    event = { body: {}, query: {} }
  const secret = 'test-only'.repeat(5)
  const handlers = load(
    '../server/user/connections/fireux.ts',
    '{fireuxConnectionCommand,inspectFireuxConnection}',
    {
      ...protocol,
      ...redirects,
      useRuntimeConfig: () => ({
        public: { sharedSignIn: { enabled } },
        accountConnections: {
          origin: 'http://localhost:3001',
          hubOrigin: 'http://localhost:3000',
          peerSecret: secret,
        },
      }),
      getAdminApp: () => ({ options: { projectId: project } }),
      getAuth: () => ({
        getUser: async (uid) => {
          calls.push('get-user')
          return { uid, disabled, tenantId: tenant ? 'tenant' : undefined }
        },
        createCustomToken: async (uid) => {
          calls.push('mint')
          return `token-for-${uid}`
        },
      }),
      requireFirebaseBearerUser: async () => ({
        uid: 'local-A',
        decoded: {
          auth_time: authTime,
          email: 'A@misebox.app',
          firebase: hubTenant ? { tenant: 'realm' } : {},
        },
      }),
      getRuntimeIdentityFirestore: () => ({
        doc: () => ({
          get: async () => {
            calls.push('profile')
            return { exists: profile }
          },
        }),
      }),
      readBody: async (e) => e.body,
      getQuery: (e) => e.query,
      getCookie: (_, name) => cookies.get(name),
      setCookie: (_, name, value, options) => {
        calls.push({ cookie: name, options })
        cookies.set(name, value)
      },
      deleteCookie: (_, name) => cookies.delete(name),
      callConnectionPeer: async (_, __, body) => {
        calls.push(body)
        return body.action === 'inspect'
          ? { hubLabel: 'A@fireux.app' }
          : { localUid: 'local-A' }
      },
      protectConnectionResponse: () => {},
      requireConnectionOrigin: () => {},
    }
  )
  return {
    calls,
    cookies,
    event,
    handlers,
    async prepare(returnTo = '/workspace/kitchen') {
      event.body = { action: 'prepare', returnTo }
      const result = await handlers.fireuxConnectionCommand(event)
      const state = new URL(result.destination).searchParams.get('state')
      return state
    },
  }
}
test('shared sign-in preserves the internal destination and keeps browser proof HttpOnly', async () => {
  const h = harness()
  const state = await h.prepare('/workspace/kitchen?menu=A')
  h.event.body = { action: 'signin', state, code: protocol.opaque() }
  const result = await h.handlers.fireuxConnectionCommand(h.event)
  assert.equal(result.uid, 'local-A')
  assert.equal(result.customToken, 'token-for-local-A')
  assert.equal(result.returnTo, '/workspace/kitchen?menu=A')
  assert.deepEqual(
    h.calls.filter((c) => typeof c === 'string'),
    ['get-user', 'profile', 'mint']
  )
  const cookie = h.calls.find((c) => c.cookie)
  assert.equal(cookie.options.httpOnly, true)
  assert.equal(cookie.options.sameSite, 'lax')
  assert.equal(h.cookies.size, 0)
})
for (const returnTo of [
  'https://evil.example',
  '//evil.example',
  '/account/fireux/callback',
  '/api/account/fireux',
])
  test(`return destination ${returnTo} cannot become an external redirect or auth loop`, async () => {
    const h = harness()
    const state = await h.prepare(returnTo)
    h.event.body = { action: 'signin', state, code: protocol.opaque() }
    assert.equal(
      (await h.handlers.fireuxConnectionCommand(h.event)).returnTo,
      '/dashboard'
    )
  })
for (const options of [
  { disabled: true },
  { profile: false },
  { tenant: true },
])
  test(`unavailable existing account ${JSON.stringify(options)} cannot mint a custom token`, async () => {
    const h = harness(options)
    const state = await h.prepare()
    h.event.body = { action: 'signin', state, code: protocol.opaque() }
    await assert.rejects(h.handlers.fireuxConnectionCommand(h.event))
    assert.equal(h.calls.includes('mint'), false)
  })
test('missing browser handoff cannot redeem a code or mint a session', async () => {
  const h = harness()
  h.event.body = {
    action: 'signin',
    state: protocol.opaque(),
    code: protocol.opaque(),
  }
  await assert.rejects(h.handlers.fireuxConnectionCommand(h.event))
  assert.equal(h.calls.length, 0)
})
for (const options of [
  { enabled: false },
  { enabled: 'false' },
  { project: 'another-project' },
])
  test(`disabled or wrongly bound participant ${JSON.stringify(options)} fails closed`, async () => {
    const h = harness(options)
    await assert.rejects(h.prepare())
    assert.equal(h.calls.length, 0)
  })
for (const options of [
  { authTime: 1 },
  { profile: false },
  { hubTenant: true },
])
  test(`unproved ownership ${JSON.stringify(options)} cannot submit a link assertion`, async () => {
    const h = harness(options)
    h.event.body = { action: 'prove', request: protocol.opaque() }
    await assert.rejects(h.handlers.fireuxConnectionCommand(h.event))
    assert.equal(
      h.calls.some((c) => c.action === 'prove'),
      false
    )
  })
test('successful ownership proof uses the verified local UID, never caller-supplied authority', async () => {
  const h = harness()
  h.event.body = {
    action: 'prove',
    request: protocol.opaque(),
    localUid: 'attacker',
    hubUid: 'attacker',
    role: 'admin',
  }
  const result = await h.handlers.fireuxConnectionCommand(h.event)
  assert.equal(h.calls.find((c) => c.action === 'prove').localUid, 'local-A')
  assert.equal(result.uid, 'local-A')
  assert.ok(
    result.destination.startsWith(
      'http://localhost:3000/account/connect/complete?'
    )
  )
})

test('consent preview reveals only the browser-bound local identity and never mints a token', async () => {
  const h = harness()
  const state = await h.prepare()
  h.event.query = { state, code: protocol.opaque() }
  assert.deepEqual(await h.handlers.inspectFireuxConnection(h.event), {
    localUid: 'local-A',
    localLabel: 'Your connected Misebox account',
    returnTo: '/workspace/kitchen',
  })
  assert.equal(h.calls.includes('mint'), false)
  const empty = harness()
  empty.event.query = { state, code: protocol.opaque() }
  await assert.rejects(empty.handlers.inspectFireuxConnection(empty.event))
  assert.equal(empty.calls.length, 0)
})

test('arrival context survives prepare, preview and ownership-proof detours', async () => {
  const h = harness()
  const destination = '/workspace/kitchen/menus/A?view=preview#details'
  h.event.body = { action: 'prepare', returnTo: destination }
  const prepared = await h.handlers.fireuxConnectionCommand(h.event)
  const hub = new URL(prepared.destination)
  assert.equal(hub.searchParams.get('redirect'), destination)
  const resume = hub.pathname + hub.search
  h.event.body = { action: 'prove', request: protocol.opaque(), resume }
  const proved = await h.handlers.fireuxConnectionCommand(h.event)
  assert.equal(new URL(proved.destination).searchParams.get('resume'), resume)
  h.event.query = {
    state: hub.searchParams.get('state'),
    code: protocol.opaque(),
  }
  assert.equal(
    (await h.handlers.inspectFireuxConnection(h.event)).returnTo,
    destination
  )
})

test('ownership-proof resume cannot redirect outside the fixed hub or to another route', async () => {
  for (const resume of [
    'https://attacker.example/account/continue',
    '//attacker.example',
    '/dashboard',
    '/\\attacker.example',
  ]) {
    const h = harness()
    h.event.body = { action: 'prove', request: protocol.opaque(), resume }
    const result = await h.handlers.fireuxConnectionCommand(h.event)
    assert.equal(new URL(result.destination).origin, 'http://localhost:3000')
    assert.equal(new URL(result.destination).searchParams.has('resume'), false)
  }
})
