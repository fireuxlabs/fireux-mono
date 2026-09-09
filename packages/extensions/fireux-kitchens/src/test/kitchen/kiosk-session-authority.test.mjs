import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import {
  createKitchenKioskSessionCookie,
  createKitchenKioskSessionToken,
  matchesKitchenKioskSessionToken,
  readKitchenKioskSessionCookie,
} from '../../runtime/kitchen/server/operations/kiosks/session-token.ts'

function load(relative, deps, names) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return {${names.join(',')}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const expected = {
  appId: 'misebox-app',
  kitchenId: 'venue-one',
  menuId: 'food',
}
function harness(patch = {}, cookieOverride, exists = true) {
  const token = createKitchenKioskSessionToken()
  const cookie = createKitchenKioskSessionCookie(
    { kitchenId: expected.kitchenId, kioskId: 'counter' },
    token.token
  )
  const record = {
    app_id: expected.appId,
    kitchen_id: expected.kitchenId,
    menu_id: expected.menuId,
    status: 'active',
    expires_at: { toMillis: () => Date.now() + 60_000 },
    session_hash: token.hash,
    ...patch,
  }
  const reads = []
  const chain = (parts = []) => ({
    collection: (value) => chain([...parts, value]),
    doc: (value) => chain([...parts, value]),
    get: async () => {
      reads.push(parts.join('/'))
      return { exists, data: () => record }
    },
  })
  const api = load(
    '../../runtime/kitchen/server/operations/kiosks/session.ts',
    {
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
      getCookie: () => (cookieOverride === undefined ? cookie : cookieOverride),
      getRuntimeFirestore: () => chain(),
      KitchenKioskDeviceStorage: { collection: 'kiosks' },
      createKitchenKioskSessionCookie,
      matchesKitchenKioskSessionToken,
      readKitchenKioskSessionCookie,
    },
    ['requireKitchenKioskSession', 'kitchenKioskSessionMatchesRecord']
  )
  return {
    ...api,
    record,
    session: readKitchenKioskSessionCookie(cookie),
    reads,
  }
}

test('active matching App/Kitchen/Menu device reads one Kitchen-scoped record and is authorized', async () => {
  const h = harness()
  assert.deepEqual(await h.requireKitchenKioskSession({}, expected), {
    kioskId: 'counter',
    kitchenId: 'venue-one',
    menuId: 'food',
  })
  assert.deepEqual(h.reads, ['kitchens/venue-one/kiosks/counter'])
})
test('revoked, expired, missing expiry, rotated token and missing device fail closed', async () => {
  for (const patch of [
    { status: 'revoked' },
    { expires_at: { toMillis: () => 0 } },
    { expires_at: null },
    { session_hash: '' },
    { session_hash: createKitchenKioskSessionToken().hash },
  ]) {
    const h = harness(patch)
    await assert.rejects(h.requireKitchenKioskSession({}, expected), {
      statusCode: 404,
    })
  }
  await assert.rejects(
    harness({}, undefined, false).requireKitchenKioskSession({}, expected),
    { statusCode: 404 }
  )
})
test('expiry is exclusive at the exact expiry instant', () => {
  const h = harness({ expires_at: { toMillis: () => 1000 } })
  assert.equal(
    h.kitchenKioskSessionMatchesRecord(h.session, 'counter', h.record, 999),
    true
  )
  assert.equal(
    h.kitchenKioskSessionMatchesRecord(h.session, 'counter', h.record, 1000),
    false
  )
})
test('wrong App or Menu and altered stored Kitchen cannot authorize another target', async () => {
  for (const override of [{ appId: 'other-app' }, { menuId: 'drinks' }])
    await assert.rejects(
      harness().requireKitchenKioskSession({}, { ...expected, ...override }),
      { statusCode: 404 }
    )
  await assert.rejects(
    harness({ kitchen_id: 'venue-two' }).requireKitchenKioskSession(
      {},
      expected
    ),
    { statusCode: 404 }
  )
})
test('wrong expected Kitchen and absent credential reject before database lookup', async () => {
  const h = harness()
  await assert.rejects(
    h.requireKitchenKioskSession({}, { ...expected, kitchenId: 'venue-two' }),
    { statusCode: 404 }
  )
  assert.deepEqual(h.reads, [])
  const absent = harness({}, '')
  await assert.rejects(absent.requireKitchenKioskSession({}, expected), {
    statusCode: 404,
  })
  assert.deepEqual(absent.reads, [])
})
