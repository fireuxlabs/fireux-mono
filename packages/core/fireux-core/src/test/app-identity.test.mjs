import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { APP_STATUSES } from '../runtime/app/models/app.model.ts'

function loadCommand(path, result, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

const normalizeAppIdentity = loadCommand(
  '../runtime/app/server/identity/normalize.ts',
  'normalizeAppIdentity',
  {
    APP_STATUSES,
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
  }
)

function harness(id = 'runtime') {
  const calls = [],
    refreshed = []
  const source = readFileSync(
    new URL(
      '../runtime/app/composables/identity/useAppIdentityUpdate.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import .*\n/gm, '')
    .replace('export function', 'function')
  const make = compileFunction(
    `${stripTypeScriptTypes(source)}; return useAppIdentityUpdate`,
    [
      'useRequireUser',
      'useFireUXConfig',
      'fetch',
      'useAuth',
      'useCommandScope',
      'refreshNuxtData',
    ]
  )(
    async () => ({ uid: 'actor', getIdToken: async () => 'test-token' }),
    () => ({ appId: 'runtime' }),
    async (...args) => {
      calls.push(args)
      return { ok: true, json: async () => ({ ok: true, appId: 'runtime' }) }
    },
    () => ({ currentUser: { value: { uid: 'actor' } } }),
    () => () => () => true,
    async (key) => refreshed.push(key)
  )
  return { identity: make({ value: { id } }), calls, refreshed }
}

test('App identity sends authenticated raw input to the single server validator', async () => {
  const { identity, calls, refreshed } = harness()
  await identity.updateDescription('  Saved description  ')
  assert.deepEqual(refreshed, [
    JSON.stringify(['app-read', 'runtime', 'actor']),
  ])
  assert.equal(calls[0][0], '/api/internal/app/settings')
  assert.equal(calls[0][1].headers.authorization, 'Bearer test-token')
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    description: '  Saved description  ',
  })
})

test('Managing another App cannot accidentally edit the runtime App', async () => {
  const { identity, calls } = harness('other')
  await assert.rejects(
    identity.updateAppName('Wrong target'),
    /current runtime App/
  )
  assert.equal(calls.length, 0)
})

test('App address changes update only the website field', async () => {
  const { identity, calls } = harness()
  await identity.updateWebsite('https://example.test/app')
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    'social_links.website': 'https://example.test/app',
  })
})

test('App status changes use the authenticated identity command', async () => {
  const { identity, calls, refreshed } = harness()
  await identity.updateStatus('active')
  await identity.updateStatus('inactive')
  assert.deepEqual(
    calls.map(([, request]) => JSON.parse(request.body)),
    [{ status: 'active' }, { status: 'inactive' }]
  )
  assert.equal(refreshed.length, 2)
  const other = harness('other')
  await assert.rejects(
    other.identity.updateStatus('active'),
    /current runtime App/
  )
  assert.equal(other.calls.length, 0)
})

test('App status accepts only the two model values', () => {
  for (const status of APP_STATUSES) {
    assert.deepEqual(normalizeAppIdentity({ status }), { status })
  }
  for (const status of [
    'archived',
    'ACTIVE',
    ' active ',
    '',
    null,
    true,
    1,
    {},
  ]) {
    assert.throws(
      () => normalizeAppIdentity({ status }),
      /App status must be active or inactive/
    )
  }
})

test('App activation rechecks current admin authority and updates only status and its stamp', async () => {
  for (const role of ['admin', 'dev', 'user']) {
    const writes = []
    const apps = { database: { kind: 'runtime' }, collectionPath: 'apps' }
    const memberships = { collectionPath: 'apps/runtime/users' }
    let status = 'active'
    const command = loadCommand(
      '../runtime/app/server/identity/update.ts',
      'updateAppIdentity',
      {
        createError: (value) =>
          Object.assign(new Error(value.statusMessage), value),
        readBody: async () => ({ status }),
        requireFirebaseBearerUser: async () => ({ uid: 'actor' }),
        useFireUXConfig: () => ({ appId: 'runtime' }),
        normalizeAppIdentity,
        APP_MUTATION_TARGETS: { runtimeApps: apps },
        serverAppUsersTarget: (id) => {
          assert.equal(id, 'runtime')
          return memberships
        },
        FieldValue: { serverTimestamp: () => 'now' },
        runGuardedServerTransaction: async (database, action) => {
          assert.deepEqual(database, apps.database)
          return action({
            read: async (target, id) => {
              if (target === apps) {
                assert.equal(id, 'runtime')
                return { exists: true, data: { status: 'inactive' } }
              }
              assert.equal(target, memberships)
              assert.equal(id, 'actor')
              return { exists: true, data: { role } }
            },
            update: (target, id, patch) => writes.push({ target, id, patch }),
          })
        },
      }
    )
    if (role === 'user') {
      await assert.rejects(command({}), /App admin access is required/)
      assert.equal(writes.length, 0)
      continue
    }
    assert.deepEqual(await command({}), { ok: true, appId: 'runtime' })
    assert.deepEqual(writes, [
      {
        target: apps,
        id: 'runtime',
        patch: { status: 'active', updated: { at: 'now', by: 'actor' } },
      },
    ])
    status = 'inactive'
    await command({})
    assert.equal(writes[1].patch.status, 'inactive')
  }
})

test('App address validator accepts HTTPS, allows removal and rejects unsafe schemes', () => {
  const source = readFileSync(
    new URL('../runtime/app/server/identity/normalize.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const normalize = compileFunction(
    `${stripTypeScriptTypes(source)}; return normalizeAppIdentity`,
    ['createError', 'APP_STATUSES']
  )(({ statusMessage }) => new Error(statusMessage), APP_STATUSES)
  assert.deepEqual(
    normalize({ 'social_links.website': ' https://example.test ' }),
    {
      'social_links.website': 'https://example.test/',
    }
  )
  assert.deepEqual(normalize({ 'social_links.website': '' }), {
    'social_links.website': '',
  })
  assert.throws(
    () => normalize({ 'social_links.website': 'javascript:alert(1)' }),
    /App address must use HTTPS/
  )
  assert.throws(
    () => normalize({ 'social_links.website': 'not a url' }),
    /valid HTTPS URL/
  )
})

test('App identity rejects inherited JavaScript names and unsupported fields', () => {
  const source = readFileSync(
    new URL('../runtime/app/server/identity/normalize.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const normalize = compileFunction(
    `${stripTypeScriptTypes(source)}; return normalizeAppIdentity`,
    ['createError', 'APP_STATUSES']
  )(({ statusMessage }) => new Error(statusMessage), APP_STATUSES)
  for (const field of ['constructor', 'toString', '__proto__', 'role']) {
    const payload = JSON.parse(`{"${field}": "changed"}`)
    assert.throws(() => normalize(payload), /not editable/)
  }
  assert.deepEqual(normalize({ name: '  Kitchen  ', tagline: ' Fine food ' }), {
    name: 'Kitchen',
    tagline: 'Fine food',
  })
})
