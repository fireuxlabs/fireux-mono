import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
function load(path, returned, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${returned}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function fixture() {
  const records = new Map([['users/operator', {}]])
  const writes = []
  const target = (collectionPath) => ({ collectionPath })
  const run = load(
    '../runtime/app/server/initialization/initialize.ts',
    'initializeRuntimeApp',
    {
      createError: (value) =>
        Object.assign(new Error(value.statusMessage), value),
      FieldValue: { serverTimestamp: () => 'now' },
      APP_MUTATION_TARGETS: { runtimeApps: target('apps') },
USER_MUTATION_TARGETS: { runtimeUsers: target('users') },
      serverAppUsersTarget: (id) => target(`apps/${id}/users`),
      getRuntimeIdentityFirestore: () => {
        throw new Error('Unexpected identity read')
      },
      runGuardedServerTransaction: async (_, action) =>
        action({
          read: async (owner, id) => ({
            exists: records.has(`${owner.collectionPath}/${id}`),
            data: records.get(`${owner.collectionPath}/${id}`),
          }),
          create: (owner, id, fields) => {
            const path = `${owner.collectionPath}/${id}`
            writes.push({ path, fields })
            records.set(path, fields)
          },
          update: (owner, id, fields) => {
            throw new Error('Unexpected overwrite')
          },
        }),
      countTransactionAdmins: async () => 0,
      initialMembership: () => ({ role: 'admin' }),
      isAdminMembership: (value) => value?.role === 'admin',
      requireCanonicalMembership: () => {},
      stamp: () => ({ by: 'operator' }),
      reconcileUserAppReference: async () => {},
      reconcileAppEcosystemReference: async () => {},
    }
  )
  const input = {
    uid: 'operator',
    config: {
      appId: 'example',
      ecosystemId: 'fireux',
      role: 'tenant',
      appName: 'Example',
      appShortName: 'Example',
      selfJoinEnabled: false,
    },
    appDatabaseId: 'fireux',
    identityDatabaseId: 'fireux',
    context: '  Reviewed App background  ',
  }
  return { run, input, records, writes }
}
test('configured App creation persists reviewed context; reinitialization preserves operator edits', async () => {
  const f = fixture()
  assert.equal((await f.run(f.input)).appCreated, true)
  assert.equal(f.records.get('apps/example').context, 'Reviewed App background')
  f.records.get('apps/example').context = 'Operator revision'
  assert.equal((await f.run(f.input)).appCreated, false)
  assert.equal(f.records.get('apps/example').context, 'Operator revision')
  assert.equal(f.writes.length, 2)
})
test('configured creation rejects structured or oversized context before writing', async () => {
  const f = fixture()
  for (const context of [{ notes: 'x' }, 'x'.repeat(32001)])
    await assert.rejects(f.run({ ...f.input, context }), /must be text/)
  assert.equal(f.writes.length, 0)
})
test('App context seed uses the private runtime branch', () => {
  const { setRuntime } = load('../config/app/runtime.ts', '({ setRuntime })')
  const nuxt = {}
  setRuntime(nuxt, {
    app: { id: 'example' },
    private: { initialAppContext: 'Internal background' },
  })
  assert.equal(
    nuxt.runtimeConfig.fireux.initialAppContext,
    'Internal background'
  )
  assert.equal(
    JSON.stringify(nuxt.runtimeConfig.public).includes('Internal background'),
    false
  )
})
