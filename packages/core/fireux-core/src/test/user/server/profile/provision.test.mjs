import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(name, result, dependencies) {
  const source = readFileSync(
    new URL(
      `../../../../runtime/user/server/profile/${name}.ts`,
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type\s*\{[\s\S]*?\}\s*from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const contract = load(
  'provision-contract',
  `({
  assertDefinition: assertProfileProvisionDefinition, assertSeed: assertProfileProvisionSeed,
  profileData: buildProfileProvisionData, appStateData: buildProfileAppStateProvisionData,
  fail: failProfileProvision, requireAppMembership: requireProfileProvisionAppMembership,
  requireCanonicalUser: requireProfileProvisionCanonicalUser, configuredSegment: requireProfileProvisionSegment
})`,
  {
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    USER_PROFILE_KINDS: ['agent', 'professional', 'chef', 'driver', 'customer'],
    serverAuditStamp: ({ by, appId }) => ({
      at: 'trusted-time',
      by,
      ...(appId ? { app_id: appId } : {}),
    }),
  }
)
function fixture({
  split = false,
  member = true,
  user = true,
  enabled = true,
} = {}) {
  const writes = [],
    transactions = [],
    records = new Map()
  const target = (key, placement) => ({ key, database: { kind: placement } })
  const deps = {
    ...contract,
    useRuntimeConfig: () => ({
      public: {
        fireux: { id: 'app', profiles: enabled ? ['driver'] : [] },
        firebaseEcosystem: {
          firebase: {
            databaseId: 'runtime-db',
            identityDatabaseId: split ? 'identity-db' : 'runtime-db',
          },
        },
      },
    }),
    defineEventHandler: (handler) => handler,
    requireFirebaseBearerUser: async () => ({ uid: 'actor' }),
    USER_MUTATION_TARGETS: {
      runtimeUsers: target('users', 'runtime'),
      users: target('users', 'identity'),
    },
    serverAppUsersTarget: (appId) => {
      assert.equal(appId, 'app')
      return target('memberships', 'runtime')
    },
    serverUserProfileTarget: (uid, kind, placement) => {
      assert.equal(uid, 'actor')
      assert.equal(kind, 'driver')
      return target('profiles', placement)
    },
    serverUserProfileAppStateTarget: (uid, kind, appId, placement) => {
      assert.equal(uid, 'actor')
      assert.equal(kind, 'driver')
      assert.equal(appId, 'app')
      return target('app-state', placement)
    },
    runGuardedServerTransaction: async (database, work) => {
      transactions.push(database.kind)
      return work({
        read: async (t, id) => {
          if (t.key === 'users') return { exists: user }
          if (t.key === 'memberships')
            return {
              exists: member,
              data: member ? { role: 'user' } : undefined,
            }
          const data = records.get(`${t.key}:${id}`)
          return { exists: Boolean(data), data }
        },
        create: (t, id, data) => {
          writes.push({ target: t, id, data })
          records.set(`${t.key}:${id}`, data)
        },
      })
    },
  }
  const provision = load(
    'provision',
    '({ provisionRuntimeProfile, createProfileProvisionHandler })',
    deps
  )
  const definition = {
    kind: 'driver',
    label: 'Driver',
    profile: { seed: () => ({ title: 'Driver', coverage: { radius_m: 500 } }) },
    appState: { seed: () => ({ driver_phone: '' }) },
  }
  return { ...provision, definition, writes, transactions }
}
for (const split of [false, true]) {
  test(`User profile provisioning preserves ${split ? 'split' : 'shared'} database authority and idempotent seeds`, async () => {
    const f = fixture({ split })
    const handler = f.createProfileProvisionHandler(f.definition)
    assert.deepEqual(await handler({ body: { uid: 'untrusted-other' } }), {
      ok: true,
      userId: 'actor',
      profileKind: 'driver',
      createdProfile: true,
      createdAppState: true,
    })
    assert.deepEqual(
      f.transactions,
      split ? ['runtime', 'identity'] : ['runtime']
    )
    assert.equal(f.writes.length, 2)
    assert.ok(
      f.writes.every(
        (write) =>
          write.target.database.kind === (split ? 'identity' : 'runtime')
      )
    )
    assert.deepEqual(f.writes[0].data, {
      title: 'Driver',
      coverage: { radius_m: 500 },
      kind: 'driver',
      created: { at: 'trusted-time', by: 'actor' },
      updated: { at: 'trusted-time', by: 'actor' },
    })
    assert.equal(f.writes[1].data.app_id, 'app')
    assert.equal(f.writes[1].data.profile_kind, 'driver')
    assert.deepEqual(await handler({}), {
      ok: true,
      userId: 'actor',
      profileKind: 'driver',
      createdProfile: false,
      createdAppState: false,
    })
    assert.equal(f.writes.length, 2)
  })
}
test('missing User, missing membership and disabled profile reject without writes', async () => {
  for (const [options, code] of [
    [{ user: false }, 409],
    [{ member: false }, 403],
    [{ enabled: false }, 404],
  ]) {
    const f = fixture(options)
    await assert.rejects(f.provisionRuntimeProfile('actor', f.definition), {
      statusCode: code,
    })
    assert.equal(f.writes.length, 0)
  }
})
test('domain seeds cannot supply identity or audit fields', async () => {
  for (const field of [
    'id',
    'user',
    'created',
    'updated',
    'created_at',
    'updated_at',
  ]) {
    const f = fixture()
    f.definition.profile.seed = () => ({ [field]: 'untrusted' })
    await assert.rejects(f.provisionRuntimeProfile('actor', f.definition), {
      statusCode: 500,
    })
    assert.equal(f.writes.length, 0)
  }
})
